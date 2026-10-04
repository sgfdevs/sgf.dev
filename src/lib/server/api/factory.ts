import createClient from 'openapi-fetch';
import type { Client } from 'openapi-fetch';
import type { paths } from './generated/sgfPublicApiSchema';
import { parseCmsInternalOrigin } from './origin';

export type SgfApiClient = Pick<Client<paths>, 'GET'>;
export type SgfApiFetch = (request: Request) => Promise<Response>;

export const SGF_PUBLIC_GET_PATHS = [
	'/api/tags/skills',
	'/api/directory/filters/skills',
	'/api/directory/search',
	'/api/v1/public/home'
] as const satisfies readonly Extract<keyof paths, string>[];

const publicGetPathSet = new Set<string>(SGF_PUBLIC_GET_PATHS);
const forbiddenNetworkOverrides = ['baseUrl', 'fetch'] as const;
const forbiddenAuthHeaders = ['authorization', 'cookie', 'x-api-key'] as const;

type RequestInitGuard = (Record<string, unknown> & { headers?: HeadersInit }) | undefined;

export function createSgfApiClientForOrigin(fetchImpl: SgfApiFetch, internalOrigin: string | undefined): SgfApiClient {
	const baseUrl = parseCmsInternalOrigin(internalOrigin);
	const client = createClient<paths>({
		baseUrl,
		fetch: (request) => {
			assertCmsPublicRequest(request, baseUrl);
			return fetchImpl(request);
		},
		credentials: 'omit',
		redirect: 'error'
	});

	return {
		GET(url, ...init) {
			assertPublicGetPath(url);
			const guardedInit = guardPublicRequestInit(init[0] as RequestInitGuard);
			return client.GET(url, guardedInit as never);
		}
	};
}

function guardPublicRequestInit(init: RequestInitGuard): RequestInitGuard {
	if (!init) return undefined;

	for (const option of forbiddenNetworkOverrides) {
		if (option in init) {
			throw new Error('SGF API requests must use the fixed CMS_INTERNAL_ORIGIN and request-scoped fetch.');
		}
	}

	const headers = normalizeAllowedHeaders(init.headers);
	return headers ? withNormalizedHeaders(init, headers) : init;
}

function withNormalizedHeaders(init: Exclude<RequestInitGuard, undefined>, headers: Headers): RequestInitGuard {
	const guardedInit: Record<string, unknown> & { headers: Headers } = { headers };

	for (const key of Object.keys(init)) {
		if (key !== 'headers') {
			guardedInit[key] = init[key];
		}
	}

	return guardedInit;
}

function normalizeAllowedHeaders(rawHeaders: HeadersInit | undefined): Headers | undefined {
	if (!rawHeaders) return undefined;

	const headers = new Headers(rawHeaders);
	assertNoForbiddenAuthHeaders(headers);
	return headers;
}

function assertCmsPublicRequest(request: Request, baseUrl: string): void {
	const url = new URL(request.url);
	if (url.origin !== baseUrl) {
		throw new Error('SGF API request escaped the fixed CMS_INTERNAL_ORIGIN.');
	}
	if (request.method !== 'GET') {
		throw new Error('SGF API request escaped the approved public GET methods.');
	}
	assertPublicGetPath(url.pathname);
	if (request.redirect !== 'error') {
		throw new Error('SGF API requests must keep redirect disabled.');
	}
	if (request.credentials !== 'omit') {
		throw new Error('SGF API requests must omit credentials.');
	}
	assertNoForbiddenAuthHeaders(request.headers);
}

function assertNoForbiddenAuthHeaders(headers: Headers): void {
	for (const header of forbiddenAuthHeaders) {
		if (headers.has(header)) {
			throw new Error('SGF API public requests must not include auth headers.');
		}
	}
}

function assertPublicGetPath(path: string): void {
	if (!publicGetPathSet.has(path)) {
		throw new Error('SGF API request escaped the approved public API paths.');
	}
}
