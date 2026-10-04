import { createServer, type Server } from 'node:http';
import { once } from 'node:events';
import { existsSync, readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PrivateMediaConfigError, parseOrigin, parseUpstreamPathPrefix, type MediaProxyConfig } from '../../src/lib/server/media/config';
import { mapMediaUrlToSameOrigin, mapPublicDirectoryMemberMedia } from '../../src/lib/server/media/mapper';
import {
	MediaProxyError,
	assertFinalMediaRequest,
	createMediaUpstreamRequest,
	handleMediaProxyRequest,
	type MediaFetch
} from '../../src/lib/server/media/proxy';
import { normalizeMediaQuery, parseMediaKey, parseRouteMediaPath } from '../../src/lib/server/media/validation';

const pngBytes = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lZs8fAAAAABJRU5ErkJggg==',
	'base64'
);

function config(overrides: Partial<MediaProxyConfig> = {}): MediaProxyConfig {
	return {
		publicSourceOrigin: 'https://media.sgf.dev',
		cmsInternalOrigin: 'http://127.0.0.1:5099',
		upstreamOrigin: 'http://127.0.0.1:5100',
		upstreamPathPrefix: '/media/',
		maxBytes: 8 * 1024 * 1024,
		timeoutMs: 5_000,
		...overrides
	};
}

function eventFor(pathAndQuery: string, method: 'GET' | 'HEAD' = 'GET') {
	const url = new URL(pathAndQuery, 'http://localhost');
	return {
		url,
		request: new Request(url, { method })
	};
}

async function responseFor(
	pathAndQuery: string,
	fetchImpl: MediaFetch,
	overrides: Partial<MediaProxyConfig> = {},
	method: 'GET' | 'HEAD' = 'GET'
) {
	return await handleMediaProxyRequest(eventFor(pathAndQuery, method), method, config(overrides), fetchImpl);
}

function imageResponse(body: BodyInit | null = pngBytes, init: ResponseInit = {}) {
	return new Response(body, {
		status: init.status ?? 200,
		headers: { 'content-type': 'image/png', ...init.headers }
	});
}

function cancellableImageResponse(init: ResponseInit = {}) {
	let cancelled = false;
	const body = new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(pngBytes);
		},
		cancel() {
			cancelled = true;
		}
	});

	return {
		response: imageResponse(body, init),
		wasCancelled: () => cancelled
	};
}

describe('media URL mapper', () => {
	it('maps public CDN root and raw CMS media URLs to same-origin media paths', () => {
		assert.equal(
			mapMediaUrlToSameOrigin('https://media.sgf.dev/2ohcee3f/tiffany.jpg?width=500&v=1dab6ba4e54822f', config()),
			'/media/2ohcee3f/tiffany.jpg?width=500&v=1dab6ba4e54822f'
		);
		assert.equal(
			mapMediaUrlToSameOrigin('/media/elzl3w1n/1538675380692.jpg?width=500&v=abc', config()),
			'/media/elzl3w1n/1538675380692.jpg?width=500&v=abc'
		);
		assert.equal(
			mapMediaUrlToSameOrigin('http://127.0.0.1:5099/media/elzl3w1n/1538675380692.jpg', config()),
			'/media/elzl3w1n/1538675380692.jpg'
		);
	});

	it('keeps only the exact static fallback passthrough', () => {
		assert.equal(mapMediaUrlToSameOrigin('/images/pipey.jpg', config()), '/images/pipey.jpg');
		assert.equal(mapMediaUrlToSameOrigin('/images/logo.svg', config()), null);
		assert.equal(mapMediaUrlToSameOrigin('/images/pipey.jpg?width=500', config()), null);
	});

	it('rejects unsafe DTO source strings before URL normalization can hide them', () => {
		const invalid = [
			'https://evil.example/x.jpg',
			'https://www.sgf.dev/media/x.jpg',
			'//media.sgf.dev/x.jpg',
			'https://user:pass@media.sgf.dev/x.jpg',
			'/media/https://evil.example/x.jpg',
			'/media/a/../secret.jpg',
			'/media/a/%2e%2e/secret.jpg',
			'/media/a%2fb.jpg',
			'/media/a%252fb.jpg',
			'/media/a%5cb.jpg',
			'/media/a%00.jpg',
			'/media/a//b.jpg',
			'/media/./b.jpg',
			'/media/a.jpg?url=https://evil.example/x.jpg',
			'/media/a.jpg?width=999999',
			'/media/a.jpg?width=500&width=800',
			'/media/a.jpg#fragment',
			'/media/folder/file.svg',
			'/media/folder/file.gif',
			'/media/folder/file.webp',
			'/media/folder/file.pdf',
			'/media/folder/file'
		];

		for (const value of invalid) {
			assert.equal(mapMediaUrlToSameOrigin(value, config()), null, value);
		}
	});

	it('maps the generated directory member image field and leaves other fields alone', () => {
		const member = {
			name: 'Ada',
			location: 'Springfield',
			image: 'https://media.sgf.dev/a/ada.png?width=500&v=abc',
			url: '/members/ada',
			tags: ['Svelte']
		};

		assert.deepEqual(mapPublicDirectoryMemberMedia(member, config()), {
			...member,
			image: '/media/a/ada.png?width=500&v=abc'
		});
		assert.equal(mapPublicDirectoryMemberMedia({ ...member, image: 'https://evil.example/ada.png' }, config()).image, '/images/pipey.jpg');
		assert.equal(mapPublicDirectoryMemberMedia({ ...member, image: 'https://media.sgf.dev/a/ada.svg' }, config()).image, '/images/pipey.jpg');
	});
});

describe('media path, query, and configuration validation', () => {
	it('accepts fixture-backed raster extensions and observed query parameters', () => {
		assert.equal(parseMediaKey('folder/photo.jpg').key, 'folder/photo.jpg');
		assert.equal(parseMediaKey('folder/photo.jpeg').key, 'folder/photo.jpeg');
		assert.equal(parseMediaKey('folder/logo.png').key, 'folder/logo.png');
		assert.equal(normalizeMediaQuery(new URLSearchParams('width=500&v=1dab6ba4e54822f')), 'width=500&v=1dab6ba4e54822f');
	});

	it('rejects the threat-matrix path examples', () => {
		const invalid = [
			'',
			'/absolute.jpg',
			'a//b.jpg',
			'a/./b.jpg',
			'a/../b.jpg',
			'a/%2e%2e/b.jpg',
			'a%2fb.jpg',
			'a%252fb.jpg',
			'a%5cb.jpg',
			'a\\b.jpg',
			'a%00.jpg',
			'http:/evil.example/x.jpg',
			'https:/evil.example/x.jpg',
			'user:pass@host/x.jpg',
			'one-segment.jpg',
			'folder/.hidden/too/many/path/segments/for/this/proxy/image.jpg'
		];

		for (const value of invalid) {
			assert.throws(() => parseMediaKey(value), value);
		}
	});

	it('rejects unknown, duplicate, escaped, and out-of-range query parameters', () => {
		const invalid = [
			'url=https://evil.example/x.jpg',
			'width=0',
			'width=4097',
			'width=0500',
			'width=500&width=800',
			'height=250',
			'quality=75',
			'format=png',
			'format=svg',
			'format=pdf',
			'v=',
			'v=a'.repeat(70),
			'rmode=crop'
		];

		for (const query of invalid) {
			assert.throws(() => normalizeMediaQuery(new URLSearchParams(query)), query);
		}
	});

	it('requires a specific local/CMS/S3 path fence and allows root only for the dedicated media origin', () => {
		assert.equal(parseOrigin('https://media.sgf.dev/', 'MEDIA_SOURCE_PUBLIC_ORIGIN'), 'https://media.sgf.dev');
		assert.equal(parseUpstreamPathPrefix(undefined, 'https://media.sgf.dev'), '/');
		assert.equal(parseUpstreamPathPrefix('/media/', 'http://127.0.0.1:5099'), '/media/');
		assert.equal(parseUpstreamPathPrefix('/bootstrap-bucket/media/', 'http://127.0.0.1:8333'), '/bootstrap-bucket/media/');
		assert.throws(() => parseUpstreamPathPrefix(undefined, 'http://127.0.0.1:5099'));
		assert.throws(() => parseUpstreamPathPrefix('/', 'http://127.0.0.1:5099'));
		assert.throws(() => parseUpstreamPathPrefix('/', 'https://cms.sgf.dev'));
		assert.throws(() => parseUpstreamPathPrefix('/', 'https://media.sgf.dev:8443'), PrivateMediaConfigError);
		assert.throws(() => parseOrigin('not-a-url', 'MEDIA_UPSTREAM_ORIGIN'), PrivateMediaConfigError);
		assert.throws(() => parseOrigin('https://media.sgf.dev/private', 'MEDIA_UPSTREAM_ORIGIN'), PrivateMediaConfigError);
		assert.throws(() => parseUpstreamPathPrefix('/media/%2e%2e/', 'http://127.0.0.1:5099'), PrivateMediaConfigError);
	});
});

describe('media proxy route handler', () => {
	it('builds and checks the final upstream request immediately before fetch', () => {
		const upstreamRequest = createMediaUpstreamRequest('folder/photo.jpg', 'width=500&v=abc', 'GET', config());

		assert.equal(upstreamRequest.url, 'http://127.0.0.1:5100/media/folder/photo.jpg?width=500&v=abc');
		assert.equal(upstreamRequest.method, 'GET');
		assert.equal(upstreamRequest.credentials, 'omit');
		assert.equal(upstreamRequest.redirect, 'error');
		assert.equal(upstreamRequest.referrerPolicy, 'no-referrer');
		assert.equal(upstreamRequest.cache, 'no-store');
		assertFinalMediaRequest(upstreamRequest, 'folder/photo.jpg', 'width=500&v=abc', 'GET', config());
		assert.equal(upstreamRequest.headers.has('cookie'), false);
		assert.equal(upstreamRequest.headers.has('authorization'), false);
		assert.equal(upstreamRequest.headers.has('range'), false);
	});

	it('does not call the network for invalid paths or queries', async () => {
		let calls = 0;
		const fetchImpl: MediaFetch = async () => {
			calls += 1;
			return imageResponse();
		};
		const invalid = [
			'/media/a%2fb.jpg',
			'/media/a%252fb.jpg',
			'/media/a%5cb.jpg',
			'/media/a%00.jpg',
			'/media/http:/evil.example/x.jpg',
			'/media/folder/photo.jpg?url=https://evil.example/x.jpg',
			'/media/folder/photo.jpg?width=500&width=800',
			'/media/folder/photo.jpg?width=999999',
			'/media/folder/photo.jpg?format=svg',
			'/media/folder/photo.gif'
		];

		for (const path of invalid) {
			await assert.rejects(responseFor(path, fetchImpl), MediaProxyError, path);
		}
		assert.equal(calls, 0);
	});

	it('fetches valid media with no caller cookies or request headers', async () => {
		const requests: Request[] = [];
		const url = new URL('/media/folder/photo.png?width=500&v=abc', 'http://localhost');
		const event = {
			url,
			request: new Request(url, {
				headers: {
					cookie: 'session=secret',
					authorization: 'Bearer secret',
					range: 'bytes=0-1',
					referer: 'https://cms.sgf.dev/private'
				}
			})
		};

		const response = await handleMediaProxyRequest(
			event,
			'GET',
			config(),
			async (request) => {
				requests.push(request);
				return imageResponse(pngBytes);
			}
		);

		assert.equal(response.status, 200);
		assert.equal(requests.length, 1);
		for (const header of ['cookie', 'authorization', 'range', 'referer', 'origin', 'forwarded', 'x-forwarded-for']) {
			assert.equal(requests[0]?.headers.has(header), false, header);
		}
		assert.equal(requests[0]?.credentials, 'omit');
		assert.equal(requests[0]?.redirect, 'error');
		assert.equal(requests[0]?.referrerPolicy, 'no-referrer');
		assert.equal(requests[0]?.cache, 'no-store');
	});

	it('filters response headers and keeps GET and HEAD body behavior distinct', async () => {
		const upstreamHeaders = {
			'content-type': 'image/png; charset=binary',
			'content-length': String(pngBytes.byteLength),
			'cache-control': 'public, max-age=10',
			server: 'upstream',
			'cf-ray': 'secret',
			'x-storage-secret': 'hidden',
			etag: '"abc"',
			'last-modified': 'Wed, 21 Oct 2015 07:28:00 GMT'
		};
		const fetchImpl: MediaFetch = async () => imageResponse(pngBytes, { headers: upstreamHeaders });
		const get = await responseFor('/media/folder/photo.png?width=500&v=abc', fetchImpl);
		const head = await responseFor('/media/folder/photo.png?width=500&v=abc', fetchImpl, {}, 'HEAD');

		assert.equal(get.headers.get('content-type'), 'image/png');
		assert.equal(get.headers.get('cache-control'), 'public, max-age=31536000, immutable');
		assert.equal(get.headers.get('x-content-type-options'), 'nosniff');
		assert.equal(get.headers.get('etag'), '"abc"');
		assert.equal(get.headers.get('last-modified'), 'Wed, 21 Oct 2015 07:28:00 GMT');
		assert.equal(get.headers.get('server'), null);
		assert.equal(get.headers.get('cf-ray'), null);
		assert.equal(get.headers.get('x-storage-secret'), null);
		assert.deepEqual(new Uint8Array(await get.arrayBuffer()), new Uint8Array(pngBytes));
		assert.equal(head.status, 200);
		assert.equal(head.headers.get('content-length'), String(pngBytes.byteLength));
		assert.equal((await head.text()).length, 0);
	});

	it('sanitizes optional upstream validators before forwarding them', async () => {
		const strong = await responseFor('/media/folder/photo.png', async () =>
			imageResponse(pngBytes, { headers: { etag: '"abc"', 'last-modified': 'Wed, 21 Oct 2015 07:28:00 GMT' } })
		);
		assert.equal(strong.headers.get('etag'), '"abc"');
		assert.equal(strong.headers.get('last-modified'), 'Wed, 21 Oct 2015 07:28:00 GMT');

		const weak = await responseFor('/media/folder/photo.png', async () => imageResponse(pngBytes, { headers: { etag: 'W/"abc"' } }));
		assert.equal(weak.headers.get('etag'), 'W/"abc"');

		const malformed = await responseFor('/media/folder/photo.png', async () =>
			imageResponse(pngBytes, {
				headers: {
					etag: 'bare:opaque/value',
					'last-modified': 'Mon Jan 01 2001 00:00:00 GMT+0000 (internal host)'
				}
			})
		);
		assert.equal(malformed.headers.get('etag'), null);
		assert.equal(malformed.headers.get('last-modified'), null);
	});

	it('rejects forbidden upstream response types, redirects, errors, private headers, and body-cap violations', async () => {
		await assert.rejects(responseFor('/media/folder/photo.png', async () => new Response('<html></html>', { headers: { 'content-type': 'text/html' } })), MediaProxyError);
		await assert.rejects(responseFor('/media/folder/photo.png', async () => new Response(pngBytes, { headers: { 'content-type': 'image/gif' } })), MediaProxyError);
		await assert.rejects(responseFor('/media/folder/photo.png', async () => imageResponse(null, { status: 302, headers: { location: 'https://evil.example/x' } })), MediaProxyError);
		await assert.rejects(responseFor('/media/folder/photo.png', async () => imageResponse('missing', { status: 404 })), MediaProxyError);
		await assert.rejects(responseFor('/media/folder/photo.png', async () => imageResponse(pngBytes, { headers: { 'set-cookie': 'secret=1' } })), MediaProxyError);
		await assert.rejects(responseFor('/media/folder/photo.png', async () => imageResponse(pngBytes, { headers: { 'content-encoding': 'gzip' } })), MediaProxyError);
		await assert.rejects(responseFor('/media/folder/photo.png', async () => imageResponse(pngBytes, { headers: { 'cache-control': 'private' } })), MediaProxyError);
		await assert.rejects(responseFor('/media/folder/photo.png', async () => imageResponse(pngBytes, { headers: { 'content-length': '9' } }), { maxBytes: 8 }), MediaProxyError);
		await assert.rejects(responseFor('/media/folder/photo.png', async () => imageResponse(Buffer.alloc(9)), { maxBytes: 8 }), MediaProxyError);
	});

	it('cancels upstream bodies on early rejection and unused HEAD bodies', async () => {
		const cases: Array<{ name: string; response: Response; overrides?: Partial<MediaProxyConfig>; method?: 'GET' | 'HEAD'; wasCancelled: () => boolean }> = [];

		for (const [name, init, overrides] of [
			['unsupported MIME', { headers: { 'content-type': 'text/html' } }, undefined],
			['forbidden header', { headers: { 'set-cookie': 'secret=1' } }, undefined],
			['private cache', { headers: { 'cache-control': 'private' } }, undefined],
			['invalid declared length', { headers: { 'content-length': 'abc' } }, undefined],
			['oversized declared length', { headers: { 'content-length': '9' } }, { maxBytes: 8 }],
			['non-success', { status: 500 }, undefined]
		] as const) {
			const tracked = cancellableImageResponse(init);
			cases.push({ name, response: tracked.response, overrides, wasCancelled: tracked.wasCancelled });
		}

		for (const rejected of cases) {
			await assert.rejects(responseFor('/media/folder/photo.png', async () => rejected.response, rejected.overrides), MediaProxyError, rejected.name);
			assert.equal(rejected.wasCancelled(), true, rejected.name);
		}

		const head = cancellableImageResponse({ headers: { 'content-length': String(pngBytes.byteLength) } });
		const response = await responseFor('/media/folder/photo.png', async () => head.response, {}, 'HEAD');
		assert.equal(response.status, 200);
		assert.equal(head.wasCancelled(), true);
	});

	it('links caller aborts to the upstream request signal', async () => {
		const controller = new AbortController();
		const url = new URL('/media/folder/photo.png', 'http://localhost');
		const seen: AbortSignal[] = [];
		const pending = handleMediaProxyRequest(
			{ url, request: new Request(url, { signal: controller.signal }) },
			'GET',
			config(),
			async (request) => {
				seen.push(request.signal);
				controller.abort();
				throw new DOMException('aborted', 'AbortError');
			}
		);

		await assert.rejects(pending, MediaProxyError);
		assert.equal(seen.length, 1);
		assert.equal(seen[0]?.aborted, true);
	});

	it('maps upstream timeout aborts to a generic gateway timeout', async () => {
		await assert.rejects(
			responseFor('/media/folder/photo.png', async () => {
				throw new DOMException('timed out', 'TimeoutError');
			}),
			(error) => error instanceof MediaProxyError && error.status === 504
		);
	});

	it('serves a synthetic local image through the configured namespace', async () => {
		const { server, origin } = await startImageServer();
		try {
			const response = await responseFor(
				'/media/folder/synthetic.png?width=500&v=abc',
				fetch,
				{ upstreamOrigin: origin, upstreamPathPrefix: '/media/' }
			);
			assert.equal(response.status, 200);
			assert.equal(response.headers.get('content-type'), 'image/png');
			assert.deepEqual(new Uint8Array(await response.arrayBuffer()), new Uint8Array(pngBytes));
		} finally {
			server.close();
		}
	});
});

describe('media proxy source hygiene', () => {
	it('keeps private media env imports in server-only modules', () => {
		const route = readFileSync('src/routes/media/[...key]/+server.ts', 'utf8');
		const runtimeSource = readFileSync('src/lib/server/media/runtime.ts', 'utf8');
		const configSource = readFileSync('src/lib/server/media/config.ts', 'utf8');
		const mapperSource = readFileSync('src/lib/server/media/mapper.ts', 'utf8');

		assert.match(runtimeSource, /\$app\/env\/private/);
		assert.doesNotMatch(runtimeSource, /\$app\/env\/public/);
		assert.doesNotMatch(configSource, /\$app\/env\/private/);
		assert.doesNotMatch(route, /MEDIA_UPSTREAM_ORIGIN/);
		assert.doesNotMatch(mapperSource, /HomeDto|Presenter|Sponsor/);
	});

	it('fixture media currently uses raster images with width and v only when the coordinator fixture is present', () => {
		const fixturePath = '/tmp/sgf-public-parity-fixtures/fixtures/home.public.fixture.json';
		const fixture = existsSync(fixturePath)
			? readFileSync(fixturePath, 'utf8')
			: JSON.stringify([
					'https://media.sgf.dev/2ohcee3f/tiffany.jpg?width=500&v=1dab6ba4e54822f',
					'https://media.sgf.dev/hr4mbdax/untitled_2023-04-13_03-52-54.png'
				]);
		const matches = [...fixture.matchAll(/https:\/\/media\.sgf\.dev\/[^" ]+/g)].map((match) => match[0]);
		assert.ok(matches.length > 0);
		assert.ok(matches.every((url) => /\.(?:jpg|jpeg|png)(?:\?|$)/i.test(url)), 'fixture should not need SVG/PDF in this layer');
		assert.ok(matches.every((url) => !url.includes('?') || /^width=\d+&v=[A-Za-z0-9_-]+$/.test(url.split('?')[1] ?? '')));
	});
});

async function startImageServer(): Promise<{ server: Server; origin: string }> {
	const server = createServer((request, response) => {
		assert.equal(request.headers.cookie, undefined);
		assert.equal(request.headers.authorization, undefined);
		assert.equal(request.headers.range, undefined);
		assert.equal(request.url, '/media/folder/synthetic.png?width=500&v=abc');
		response.writeHead(200, {
			'content-type': 'image/png',
			'content-length': String(pngBytes.byteLength)
		});
		response.end(pngBytes);
	});
	server.listen(0, '127.0.0.1');
	await once(server, 'listening');
	const address = server.address();
	assert.ok(address && typeof address === 'object');
	return { server, origin: `http://127.0.0.1:${address.port}` };
}
