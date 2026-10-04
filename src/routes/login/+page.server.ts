import { fail, redirect } from '@sveltejs/kit';
import { memberClient } from '../../lib/server/auth/runtime';
import { safeReturnTo } from '../../lib/server/auth/return-to';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url, locals }) => {
	const returnTo = safeReturnTo(url.searchParams.get('returnTo'));
	if (locals.member) redirect(303, returnTo);
	return { returnTo, passwordReset: url.searchParams.get('passwordReset') === 'success' };
};

export const actions: Actions = {
	default: async event => {
		const form = await event.request.formData();
		const username = form.get('username');
		const password = form.get('password');
		const rememberMe = form.get('rememberMe') === 'on';
		const returnTo = safeReturnTo(form.get('returnTo'));
		const failed = () => fail(400, {
			message: 'Unable to log in.', username: typeof username === 'string' ? username.slice(0, 256) : '',
			rememberMe, returnTo
		});
		if (typeof username !== 'string' || !username.trim() || username.length > 256 ||
			typeof password !== 'string' || !password || password.length > 4096) return failed();
		try {
			const { data } = await memberClient(event).login({ username, password, rememberMe });
			if (!data?.succeeded) return failed();
		} catch {
			return failed();
		}
		redirect(303, returnTo);
	}
};
