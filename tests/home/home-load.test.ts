import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadPublicHome, PublicHomeLoadError } from '../../src/lib/server/home/load';
import type { PublicHomeDto } from '../../src/lib/server/home/mapper';
import type { MediaSourceConfig } from '../../src/lib/server/media/config';

const cmsOrigin = 'http://127.0.0.1:5099';
const mediaConfig: MediaSourceConfig = {
	publicSourceOrigin: 'https://media.sgf.dev',
	cmsInternalOrigin: cmsOrigin
};

function tinyHome(overrides: Partial<PublicHomeDto> = {}): PublicHomeDto {
	return {
		nextDevNight: null,
		directory: { totalMembers: 0, dailyMembers: [] },
		sponsors: [],
		...overrides
	};
}

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' }
	});
}

describe('home server loader', () => {
	it('calls the fixed generated Home path without caller query, cookies, or auth headers', async () => {
		let seen: Request | undefined;
		const result = await loadPublicHome({
			cmsInternalOrigin: cmsOrigin,
			mediaConfig,
			fetch: async (request) => {
				seen = request;
				return jsonResponse(tinyHome());
			}
		});

		assert.equal(result.home.directory.totalMembers, 0);
		assert.ok(seen);
		const url = new URL(seen.url);
		assert.equal(url.origin, cmsOrigin);
		assert.equal(url.pathname, '/api/v1/public/home');
		assert.equal(url.search, '');
		assert.equal(seen.method, 'GET');
		assert.equal(seen.credentials, 'omit');
		assert.equal(seen.redirect, 'error');
		assert.equal(seen.headers.has('cookie'), false);
		assert.equal(seen.headers.has('authorization'), false);
		assert.equal(seen.headers.has('x-api-key'), false);
	});

	it('preserves missing Home as a 404 without exposing the response body', async () => {
		await assert.rejects(
			() =>
				loadPublicHome({
					cmsInternalOrigin: cmsOrigin,
					mediaConfig,
					fetch: async () => jsonResponse({ detail: 'private upstream detail' }, 404)
				}),
			(error) => error instanceof PublicHomeLoadError && error.status === 404 && !error.publicMessage.includes('private')
		);
	});

	it('maps upstream failures and malformed DTOs to controlled gateway errors', async () => {
		await assert.rejects(
			() =>
				loadPublicHome({
					cmsInternalOrigin: cmsOrigin,
					mediaConfig,
					fetch: async () => jsonResponse({ detail: 'raw backend stack' }, 500)
				}),
			(error) => error instanceof PublicHomeLoadError && error.status === 502 && !error.publicMessage.includes('raw backend')
		);

		await assert.rejects(
			() =>
				loadPublicHome({
					cmsInternalOrigin: cmsOrigin,
					mediaConfig,
					fetch: async () => jsonResponse({ nextDevNight: null, directory: { totalMembers: 'bad', dailyMembers: [] }, sponsors: [] })
				}),
			(error) => error instanceof PublicHomeLoadError && error.status === 502
		);
	});

	it('reports missing local CMS configuration as an honest 503 instead of synthetic content', async () => {
		await assert.rejects(
			() =>
				loadPublicHome({
					cmsInternalOrigin: undefined,
					mediaConfig,
					fetch: async () => jsonResponse(tinyHome())
				}),
			(error) => error instanceof PublicHomeLoadError && error.status === 503
		);
	});

	it('bounds stalled upstream requests with a timeout', async () => {
		await assert.rejects(
			() =>
				loadPublicHome({
					cmsInternalOrigin: cmsOrigin,
					mediaConfig,
					timeoutMs: 5,
					fetch: (request) =>
						new Promise<Response>((_resolve, reject) => {
							request.signal.addEventListener('abort', () => reject(request.signal.reason), { once: true });
						})
				}),
			(error) => error instanceof PublicHomeLoadError && error.status === 503
		);
	});
});
