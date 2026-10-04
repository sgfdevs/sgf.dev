import { redirect } from '@sveltejs/kit';
import { memberClient, memberCookieName, memberCookieSecure } from '../../lib/server/auth/runtime';
import { clearMemberCookies, memberCookieHeader } from '../../lib/server/auth/cookies';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async event => {
		try {
			if (memberCookieHeader(event.cookies, memberCookieName)) await memberClient(event).logout();
		} catch {
			// Local logout still works when the CMS bridge is unavailable.
		} finally {
			clearMemberCookies(event.cookies, memberCookieName, memberCookieSecure(event));
			event.locals.member = null;
		}
		redirect(303, '/login');
	}
};
