import type { Handle } from '@sveltejs/kit/hooks';
import { memberClient, memberCookieName } from './lib/server/auth/runtime';
import { memberCookieHeader } from './lib/server/auth/cookies';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.member = null;
	const hasCookie = Boolean(memberCookieHeader(event.cookies, memberCookieName));
	if (hasCookie) {
		try {
			const { data } = await memberClient(event).session();
			if (data && typeof data.username === 'string' && typeof data.name === 'string') {
				event.locals.member = { username: data.username, name: data.name };
			}
		} catch {
			// Public pages remain usable during bridge outages or before configuration.
		}
	}
	const response = await resolve(event);
	if (hasCookie || ['/login', '/logout', '/account'].includes(event.url.pathname)) {
		response.headers.set('Cache-Control', 'no-store');
	}
	return response;
};
