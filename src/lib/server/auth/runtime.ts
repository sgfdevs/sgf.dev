import { dev } from '$app/env';
import { CMS_INTERNAL_ORIGIN, CMS_MEMBER_BRIDGE_SECRET, CMS_MEMBER_COOKIE_NAME } from '$app/env/private';
import type { RequestEvent } from '@sveltejs/kit';
import { createMemberClient } from './client';

export const memberCookieName = CMS_MEMBER_COOKIE_NAME;

export function memberCookieSecure(event: Pick<RequestEvent, 'url'>): boolean {
	return !dev || event.url.protocol === 'https:';
}

export function memberClient(event: Pick<RequestEvent, 'cookies' | 'url'>) {
	return createMemberClient({
		origin: CMS_INTERNAL_ORIGIN, secret: CMS_MEMBER_BRIDGE_SECRET,
		cookieName: memberCookieName, cookies: event.cookies, secure: memberCookieSecure(event)
	});
}
