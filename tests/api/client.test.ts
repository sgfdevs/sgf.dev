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

class CrossOriginRequest extends Request {
	constructor(_input: RequestInfo | URL, init?: RequestInit) {
		super('https://evil.example/leak', init);
	}
}

class SameOriginPrivateRequest extends Request {
	constructor(_input: RequestInfo | URL, init?: RequestInit) {
		super('http://127.0.0.1:5099/umbraco/backoffice/private', init);
	}
}

const forbiddenAuthHeaders = ['Authorization', 'Cookie', 'X-Api-Key'] as const;

type HeaderRepresentation = {
	label: string;
	build: (name: string, value: string) => HeadersInit;
};

const headerRepresentations: HeaderRepresentation[] = [
	{ label: 'object', build: (name, value) => ({ [name]: value }) },
	{ label: 'tuple array', build: (name, value) => [[name, value]] },
	{ label: 'Headers instance', build: (name, value) => new Headers([[name, value]]) }
];

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

	it('does not allow per-request origin or fetch overrides', () => {
		let customFetchCalls = 0;
		const client = createSgfApiClientForOrigin(async () => jsonResponse([]), 'http://127.0.0.1:5099');

		assert.throws(
			() => client.GET('/api/tags/skills', { baseUrl: 'https://evil.example' } as never),
			/SGF API requests must use the fixed CMS_INTERNAL_ORIGIN/
		);
		assert.throws(
			() =>
				client.GET('/api/tags/skills', {
					fetch: async () => {
						customFetchCalls += 1;
						return jsonResponse([]);
					}
				} as never),
			/SGF API requests must use the fixed CMS_INTERNAL_ORIGIN/
		);
		assert.equal(customFetchCalls, 0);
	});

	it('rejects same-origin private path escapes before network fetch', async () => {
		let networkCalls = 0;
		const client = createSgfApiClientForOrigin(async () => {
			networkCalls += 1;
			return jsonResponse([]);
		}, 'http://127.0.0.1:5099');

		await assert.rejects(
			client.GET('/api/tags/skills', {
				middleware: [
					{
						onRequest: () =>
							new Request('http://127.0.0.1:5099/umbraco/backoffice/private', {
								credentials: 'omit',
								redirect: 'error'
							})
					}
				]
			} as never),
			/approved public API paths/
		);
		await assert.rejects(
			client.GET('/api/tags/skills', { Request: SameOriginPrivateRequest } as never),
			/approved public API paths/
		);
		await assert.rejects(
			client.GET('/api/tags/skills', {
				middleware: [
					{
						onRequest: () =>
							new Request('http://127.0.0.1:5099/api/tags/skills', {
								credentials: 'omit',
								method: 'POST',
								redirect: 'error'
							})
					}
				]
			} as never),
			/approved public GET methods/
		);
		assert.equal(networkCalls, 0);
	});

	it('still rejects cross-origin middleware and custom Request escapes', async () => {
		let networkCalls = 0;
		const client = createSgfApiClientForOrigin(async () => {
			networkCalls += 1;
			return jsonResponse([]);
		}, 'http://127.0.0.1:5099');

		await assert.rejects(
			client.GET('/api/tags/skills', {
				middleware: [{ onRequest: () => new Request('https://evil.example/leak') }]
			} as never),
			/SGF API request escaped the fixed CMS_INTERNAL_ORIGIN/
		);
		await assert.rejects(
			client.GET('/api/tags/skills', { Request: CrossOriginRequest } as never),
			/SGF API request escaped the fixed CMS_INTERNAL_ORIGIN/
		);
		assert.equal(networkCalls, 0);
	});

	it('keeps redirect, credential, and auth-header policy immutable', async () => {
		let networkCalls = 0;
		const client = createSgfApiClientForOrigin(async () => {
			networkCalls += 1;
			return jsonResponse([]);
		}, 'http://127.0.0.1:5099');

		await assert.rejects(async () => client.GET('/api/tags/skills', { redirect: 'follow' } as never), /redirect disabled/);
		await assert.rejects(async () => client.GET('/api/tags/skills', { credentials: 'include' } as never), /omit credentials/);
		await assert.rejects(
			async () => client.GET('/api/tags/skills', { headers: { authorization: 'Bearer secret' } } as never),
			/auth headers/
		);
		assert.equal(networkCalls, 0);
	});

	it('rejects forbidden auth headers in every HeadersInit representation before fetch', async () => {
		let networkCalls = 0;
		const client = createSgfApiClientForOrigin(async () => {
			networkCalls += 1;
			return jsonResponse([]);
		}, 'http://127.0.0.1:5099');

		for (const headerName of forbiddenAuthHeaders) {
			for (const representation of headerRepresentations) {
				await assert.rejects(
					async () =>
						client.GET('/api/tags/skills', {
							headers: representation.build(headerName, 'secret')
						} as never),
					/auth headers/,
					`${representation.label} ${headerName}`
				);
			}
		}
		assert.equal(networkCalls, 0);
	});

	it('rejects mixed-case and duplicate forbidden headers before fetch', async () => {
		let networkCalls = 0;
		const client = createSgfApiClientForOrigin(async () => {
			networkCalls += 1;
			return jsonResponse([]);
		}, 'http://127.0.0.1:5099');

		await assert.rejects(
			async () =>
				client.GET('/api/tags/skills', {
					headers: [
						['Accept', 'application/json'],
						['AUTHORIZATION', 'Bearer one'],
						['authorization', 'Bearer two']
					]
				} as never),
			/auth headers/
		);
		await assert.rejects(
			async () =>
				client.GET('/api/tags/skills', {
					headers: { Cookie: 'a=b', cookie: 'c=d' }
				} as never),
			/auth headers/
		);
		assert.equal(networkCalls, 0);
	});

	it('keeps benign per-request headers across supported HeadersInit forms', async () => {
		const requests: Request[] = [];
		const client = createSgfApiClientForOrigin(async (request) => {
			requests.push(request);
			return jsonResponse([]);
		}, 'http://127.0.0.1:5099');
		const benignRepresentations: HeadersInit[] = [
			{ Accept: 'application/json', 'X-Request-Id': 'object-request' },
			[
				['Accept', 'application/json'],
				['X-Request-Id', 'tuple-request']
			],
			new Headers([
				['Accept', 'application/json'],
				['X-Request-Id', 'headers-request']
			])
		];

		for (const headers of benignRepresentations) {
			await client.GET('/api/tags/skills', { headers } as never);
		}

		assert.equal(requests.length, 3);
		assert.equal(requests[0]?.headers.get('accept'), 'application/json');
		assert.equal(requests[0]?.headers.get('x-request-id'), 'object-request');
		assert.equal(requests[1]?.headers.get('accept'), 'application/json');
		assert.equal(requests[1]?.headers.get('x-request-id'), 'tuple-request');
		assert.equal(requests[1]?.headers.get('0'), null);
		assert.equal(requests[2]?.headers.get('accept'), 'application/json');
		assert.equal(requests[2]?.headers.get('x-request-id'), 'headers-request');
	});

	it('passes only a normalized header snapshot to openapi-fetch', async () => {
		let initHeaderReads = 0;
		let headerValueReads = 0;
		const requests: Request[] = [];
		const rawHeaders = {};
		Object.defineProperty(rawHeaders, 'X-Request-Id', {
			enumerable: true,
			get() {
				headerValueReads += 1;
				return headerValueReads === 1 ? 'snapshot-request' : 'mutated-request';
			}
		});
		const init = {};
		Object.defineProperty(init, 'headers', {
			enumerable: true,
			get() {
				initHeaderReads += 1;
				return rawHeaders;
			}
		});
		const client = createSgfApiClientForOrigin(async (request) => {
			requests.push(request);
			return jsonResponse([]);
		}, 'http://127.0.0.1:5099');

		await client.GET('/api/tags/skills', init as never);

		assert.equal(initHeaderReads, 1);
		assert.equal(headerValueReads, 1);
		assert.equal(requests.length, 1);
		assert.equal(requests[0]?.headers.get('x-request-id'), 'snapshot-request');
	});

	it('rejects inherited forbidden headers before fetch', async () => {
		let networkCalls = 0;
		const init = Object.create({
			get headers() {
				return [['Authorization', 'Bearer secret']];
			}
		});
		const client = createSgfApiClientForOrigin(async () => {
			networkCalls += 1;
			return jsonResponse([]);
		}, 'http://127.0.0.1:5099');

		await assert.rejects(async () => client.GET('/api/tags/skills', init as never), /auth headers/);
		assert.equal(networkCalls, 0);
	});

	it('does not expose global openapi-fetch middleware registration', () => {
		const client = createSgfApiClientForOrigin(async () => jsonResponse([]), 'http://127.0.0.1:5099');

		assert.equal('use' in client, false);
	});

	it('maps unknown upstream bodies and preserves network failures', async () => {
		const upstreamError = createSgfApiClientForOrigin(
			async () => new Response('raw backend failure', { status: 418 }),
			'http://127.0.0.1:5099'
		);
		const errorResult = await upstreamError.GET('/api/tags/skills');
		assert.throws(
			() => requireSgfApiData(errorResult),
			(error) => {
				const message = String((error as Error).message ?? '');
				assert.equal(isHttpError(error, 502), true);
				assert.equal(message.includes('raw backend failure'), false);
				return true;
			}
		);

		const networkError = createSgfApiClientForOrigin(async () => {
			throw new TypeError('network broke');
		}, 'http://127.0.0.1:5099');
		await assert.rejects(networkError.GET('/api/tags/skills'), /network broke/);
	});
});
