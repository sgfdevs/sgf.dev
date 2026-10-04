import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isHttpError } from '@sveltejs/kit';
import { createSgfApiClientForOrigin } from '../../src/lib/server/api/factory';
import { requireSgfApiData } from '../../src/lib/server/api/errors';
import { parseCmsInternalOrigin } from '../../src/lib/server/api/origin';

function jsonResponse(body: unknown, init: ResponseInit = {}) {
	return new Response(JSON.stringify(body), {
		status: init.status ?? 200,
		headers: { 'content-type': 'application/json', ...init.headers }
	});
}

class EvilRequest extends Request {
	constructor(_input: RequestInfo | URL, init?: RequestInit) {
		super('https://evil.example/leak', init);
	}
}

describe('SGF API client foundation', () => {
	it('uses the fixed server origin and preserves the legacy skills array contract', async () => {
		const requests: Request[] = [];
		const client = createSgfApiClientForOrigin(async (request) => {
			requests.push(request);
			return jsonResponse(['Svelte', 'TypeScript']);
		}, 'http://127.0.0.1:5099');

		const result = await client.GET('/api/tags/skills');

		assert.deepEqual(requireSgfApiData(result), ['Svelte', 'TypeScript']);
		assert.equal(requests.length, 1);
		assert.equal(requests[0]?.url, 'http://127.0.0.1:5099/api/tags/skills');
		assert.equal(requests[0]?.method, 'GET');
	});

	it('sends typed directory search query parameters and keeps the response as an array', async () => {
		const requests: Request[] = [];
		const members = [
			{ name: 'Ada', location: 'Springfield', image: '/media/ada.jpg', url: '/members/ada', tags: ['Svelte'] }
		];
		const client = createSgfApiClientForOrigin(async (request) => {
			requests.push(request);
			return jsonResponse(members);
		}, 'https://cms.internal.example');

		const result = await client.GET('/api/directory/search', {
			params: { query: { skills: 'Svelte,TypeScript', skip: 0, take: 12 } }
		});

		assert.deepEqual(requireSgfApiData(result), members);
		const url = new URL(requests[0]?.url ?? '');
		assert.equal(url.origin, 'https://cms.internal.example');
		assert.equal(url.pathname, '/api/directory/search');
		assert.equal(url.searchParams.get('skills'), 'Svelte,TypeScript');
		assert.equal(url.searchParams.get('skip'), '0');
		assert.equal(url.searchParams.get('take'), '12');
	});

	it('keeps request-scoped fetch instances isolated', async () => {
		const firstUrls: string[] = [];
		const secondUrls: string[] = [];
		const first = createSgfApiClientForOrigin(async (request) => {
			firstUrls.push(request.url);
			return jsonResponse([]);
		}, 'http://127.0.0.1:5101');
		const second = createSgfApiClientForOrigin(async (request) => {
			secondUrls.push(request.url);
			return jsonResponse([]);
		}, 'http://127.0.0.1:5102');

		await first.GET('/api/directory/filters/skills');
		await second.GET('/api/directory/filters/skills');

		assert.deepEqual(firstUrls, ['http://127.0.0.1:5101/api/directory/filters/skills']);
		assert.deepEqual(secondUrls, ['http://127.0.0.1:5102/api/directory/filters/skills']);
	});

	it('maps upstream errors without leaking the upstream body', async () => {
		const response = jsonResponse({ detail: 'do not leak this backend detail' }, { status: 400 });

		assert.throws(
			() => requireSgfApiData({ error: { detail: 'secret' }, response }),
			(error) => {
				const message = String((error as Error).message ?? '');
				assert.equal(isHttpError(error, 400), true);
				assert.equal(message.includes('secret'), false);
				assert.equal(message.includes('do not leak'), false);
				return true;
			}
		);
	});

	it('rejects unsafe CMS origins at client construction', () => {
		const invalid = [
			undefined,
			'//cms.internal.example',
			'ftp://cms.internal.example',
			'http://user:pass@cms.internal.example',
			'http://cms.internal.example/api',
			'http://cms.internal.example?next=https://evil.example',
			'http://cms.internal.example#token'
		];

		for (const value of invalid) {
			assert.throws(() => parseCmsInternalOrigin(value));
		}
		assert.equal(parseCmsInternalOrigin('https://cms.internal.example/'), 'https://cms.internal.example');
	});

	it('does not allow per-request origin or fetch overrides', async () => {
		const client = createSgfApiClientForOrigin(async () => jsonResponse([]), 'http://127.0.0.1:5099');

		assert.throws(
			() => client.GET('/api/tags/skills', { baseUrl: 'https://evil.example' } as never),
			/SGF API requests must use the fixed CMS_INTERNAL_ORIGIN/
		);
		await assert.rejects(
			client.GET('/api/tags/skills', {
				middleware: [{ onRequest: () => new Request('https://evil.example/leak') }]
			} as never),
			/SGF API request escaped the fixed CMS_INTERNAL_ORIGIN/
		);
		await assert.rejects(
			client.GET('/api/tags/skills', { Request: EvilRequest } as never),
			/SGF API request escaped the fixed CMS_INTERNAL_ORIGIN/
		);
	});
});
