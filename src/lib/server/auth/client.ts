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
				'/api/v1/member/login', '/api/v1/member/session', '/api/v1/member/logout', '/api/v1/member/register',
				'/api/v1/member/forgot-password', '/api/v1/member/reset-password', '/api/v1/member/profile', '/api/v1/member/avatar', '/api/v1/member/newsletter'
			].includes(target.pathname) || target.search || target.hash) throw new Error('Invalid member bridge request.');
			const headers = new Headers({ 'X-SGF-Member-Bridge': options.secret! });
			const newsletter = target.pathname === '/api/v1/member/newsletter';
			const cookie = newsletter ? '' : memberCookieHeader(options.cookies, base);
			if (cookie) headers.set('Cookie', cookie);
			const avatar = target.pathname === '/api/v1/member/avatar';
			if (request.body) headers.set('Content-Type', avatar ? request.headers.get('Content-Type')! : 'application/json');
			// Native fetch, not event.fetch: Kit must never auto-forward browser credentials.
			const response = await fetchImpl(new Request(target, {
				method: request.method, body: request.body ? (avatar ? await request.arrayBuffer() : await request.text()) : undefined,
				headers, redirect: 'error', credentials: 'omit', cache: 'no-store',
				signal: AbortSignal.timeout(avatar ? 30000 : 8000)
			}));
			if (!newsletter) relayMemberCookies(response.headers, options.cookies, base, options.secure);
			return response;
		}
	});
	return {
		newsletterSignup: (body: components['schemas']['NewsletterSignupRequest']) => client.POST('/api/v1/member/newsletter', { body }),
		uploadAvatar: (file: File) => client.POST('/api/v1/member/avatar', {
			// OpenAPI represents binary data as a string. Send the native File as multipart bytes.
			body: { file: file.name },
			bodySerializer: () => {
				const body = new FormData();
				body.set('file', file);
				return body;
			}
		}),
		profile: () => client.GET('/api/v1/member/profile'),
		updateProfile: (body: components['schemas']['MemberProfileEditRequest']) => client.POST('/api/v1/member/profile', { body }),
		forgotPassword: (body: components['schemas']['MemberForgotPasswordRequest']) => client.POST('/api/v1/member/forgot-password', { body }),
		resetPassword: (body: components['schemas']['MemberResetPasswordRequest']) => client.POST('/api/v1/member/reset-password', { body }),
		register: (body: components['schemas']['MemberRegistrationRequest']) => client.POST('/api/v1/member/register', { body }),
		login: (body: components['schemas']['MemberLoginRequest']) => client.POST('/api/v1/member/login', { body }),
		session: () => client.GET('/api/v1/member/session'),
		logout: () => client.POST('/api/v1/member/logout')
	};
}
