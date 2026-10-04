import createClient from 'openapi-fetch';
import type { Cookies } from '@sveltejs/kit';
import type { paths, components } from './generated/memberApiSchema';
import { parseCmsInternalOrigin } from '../api/origin';
import { DEFAULT_MEMBER_COOKIE, memberCookieHeader, relayMemberCookies } from './cookies';

export type MemberSession = components['schemas']['MemberSessionDto'];

export function createMemberClient(options: {
	origin: string | undefined;
	secret: string | undefined;
	cookieName?: string;
	cookies: Cookies;
	secure: boolean;
	fetchImpl?: typeof globalThis.fetch;
}) {
	const origin = parseCmsInternalOrigin(options.origin);
	const url = new URL(origin);
	if (url.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
		throw new Error('Member bridge requires HTTPS outside loopback.');
	}
	if (!options.secret?.trim()) throw new Error('Member bridge is not configured.');
	const base = options.cookieName || DEFAULT_MEMBER_COOKIE;
	if (!/^[A-Za-z0-9_.-]+$/.test(base)) throw new Error('Invalid member cookie name.');
	const fetchImpl = options.fetchImpl ?? globalThis.fetch;
	const client = createClient<paths>({
		baseUrl: origin,
		fetch: async request => {
			const target = new URL(request.url);
			if (target.origin !== origin || ![
				'/api/v1/member/login', '/api/v1/member/session', '/api/v1/member/logout'
			].includes(target.pathname) || target.search || target.hash) throw new Error('Invalid member bridge request.');
			const headers = new Headers({ 'X-SGF-Member-Bridge': options.secret! });
			const cookie = memberCookieHeader(options.cookies, base);
			if (cookie) headers.set('Cookie', cookie);
			if (request.body) headers.set('Content-Type', 'application/json');
			// Native fetch, not event.fetch: Kit must never auto-forward browser credentials.
			const response = await fetchImpl(new Request(target, {
				method: request.method, body: request.body ? await request.text() : undefined,
				headers, redirect: 'error', credentials: 'omit', cache: 'no-store',
				signal: AbortSignal.timeout(8000)
			}));
			relayMemberCookies(response.headers, options.cookies, base, options.secure);
			return response;
		}
	});
	return {
		login: (body: components['schemas']['MemberLoginRequest']) => client.POST('/api/v1/member/login', { body }),
		session: () => client.GET('/api/v1/member/session'),
		logout: () => client.POST('/api/v1/member/logout')
	};
}
