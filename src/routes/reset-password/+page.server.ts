import { fail, redirect } from '@sveltejs/kit';
import { memberClient } from '../../lib/server/auth/runtime';
import type { Actions, PageServerLoad } from './$types';

function linkValues(url: URL) {
	// URLSearchParams decodes once. Do not trim, normalize or decode these opaque values again.
	const memberId = url.searchParams.get('memberId');
	const token = url.searchParams.get('token');
	if (!memberId || !token || memberId.length > 256 || token.length > 8192 ||
		url.searchParams.getAll('memberId').length !== 1 || url.searchParams.getAll('token').length !== 1) return null;
	return { memberId, token };
}

export const load: PageServerLoad = ({ url }) => ({ validLink: Boolean(linkValues(url)) });

export const actions: Actions = {
	default: async event => {
		const link = linkValues(event.url);
		const errors: Record<string, string[]> = {};
		if (!link) return fail(400, { invalidLink: true, errors });
		const form = await event.request.formData();
		const password = form.get('password');
		const confirmPassword = form.get('confirmPassword');
		for (const [field, value] of [['password', password], ['confirmPassword', confirmPassword]] as const) {
			if (typeof value !== 'string' || !value) errors[field] = ['This field is required.'];
			else if (value.length > 4096) errors[field] = ['This value is too long.'];
		}
		if (password !== confirmPassword) errors.confirmPassword = ['Passwords do not match.'];
		if (Object.keys(errors).length || typeof password !== 'string' || typeof confirmPassword !== 'string') {
			return fail(400, { errors, invalidLink: false });
		}
		try {
			const { data, error, response } = await memberClient(event).resetPassword({ ...link, password, confirmPassword });
			if (!data?.succeeded) {
				for (const field of ['password', 'confirmPassword', '']) {
					const messages = (data?.errors ?? error?.errors)?.[field];
					if (messages?.length) errors[field] = messages.slice(0, 3);
				}
				if (!Object.keys(errors).length) errors[''] = ['Password reset is unavailable right now.'];
				const invalidLink = errors['']?.includes('This reset link is invalid or has expired.') ?? false;
				return fail(response.status === 503 || response.status === 429 ? 503 : 400, { errors, invalidLink });
			}
		} catch {
			errors[''] = ['Password reset is unavailable right now.'];
			return fail(503, { errors, invalidLink: false });
		}
		redirect(303, '/login?passwordReset=success');
	}
};
