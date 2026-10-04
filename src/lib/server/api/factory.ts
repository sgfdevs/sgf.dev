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
	'/api/v1/public/home',
	'/api/v1/public/members/{username}',
	'/api/v1/public/groups',
	'/api/v1/public/groups/{slug}',
	'/api/v1/public/leadership'
] as const satisfies readonly Extract<keyof paths, string>[];

export const MEMBER_GET_TEMPLATE = '/api/v1/public/members/{username}';
export const GROUP_GET_TEMPLATE = '/api/v1/public/groups/{slug}';
const publicGetPathSet = new Set<string>(SGF_PUBLIC_GET_PATHS.filter((path) => path !== MEMBER_GET_TEMPLATE && path !== GROUP_GET_TEMPLATE));
const concreteMemberPath = /^\/api\/v1\/public\/members\/[A-Za-z0-9]{1,1000}$/;
const concreteGroupPath = /^\/api\/v1\/public\/groups\/[A-Za-z0-9][A-Za-z0-9_-]{0,199}$/;

export function isPublicGroupSlug(value: unknown): value is string {
	return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,199}$/.test(value);
}

export function isPublicMemberUsername(value: unknown): value is string {
	return typeof value === 'string' && value.length >= 1 && value.length <= 1000 && !/[^A-Za-z0-9]/.test(value);
}
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
			if (url !== MEMBER_GET_TEMPLATE && url !== GROUP_GET_TEMPLATE) assertPublicGetPath(url);
			const options = url === MEMBER_GET_TEMPLATE || url === GROUP_GET_TEMPLATE
				? snapshotPathOptions(init[0] as RequestInitGuard, url === MEMBER_GET_TEMPLATE ? 'username' : 'slug')
				: init[0] as RequestInitGuard;
			const guardedInit = guardPublicRequestInit(options);
			return client.GET(url, guardedInit as never);
		}
	};
}

function snapshotPathOptions(init: RequestInitGuard, field: 'username' | 'slug'): RequestInitGuard {
	const params = init?.params as { path?: Record<string, unknown> } | undefined;
	const value = params?.path?.[field];
	if (!(field === 'username' ? isPublicMemberUsername(value) : isPublicGroupSlug(value))) {
		throw new Error(field === 'username'
			? 'SGF API member username must be ASCII alphanumeric, 1 to 1000 characters.'
			: 'SGF API group slug must be ASCII alphanumeric with hyphens or underscores, 1 to 200 characters.');
	}

	// Read getter/inherited path input once. Only the validated string reaches substitution.
	const snapshot: Record<string, unknown> = {};
	for (const key of Object.keys(params ?? {})) {
		if (key !== 'path') snapshot[key] = (params as Record<string, unknown>)[key];
	}
	snapshot.path = { [field]: value };
	const options: Record<string, unknown> = {};
	for (const key of Object.keys(init ?? {})) {
		if (key !== 'params') options[key] = init?.[key];
	}
	// Keep inherited override/header guards as well as own options.
	for (const key of [...forbiddenNetworkOverrides, 'headers']) {
		if (init && key in init && !(key in options)) options[key] = init[key];
	}
	options.params = snapshot;
	return options;
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
	if (!concreteMemberPath.test(url.pathname) && !concreteGroupPath.test(url.pathname)) assertPublicGetPath(url.pathname);
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
