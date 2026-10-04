import { fail, redirect } from '@sveltejs/kit';
import { memberClient } from '../../lib/server/auth/runtime';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.member) redirect(303, '/account');
};

export const actions: Actions = {
	default: async event => {
		const form = await event.request.formData();
		const fields = ['firstName', 'lastName', 'email', 'username', 'challengeQuestion'] as const;
		const values = Object.fromEntries(fields.map(field => {
			const value = form.get(field);
			return [field, typeof value === 'string' ? value.slice(0, 256) : ''];
		})) as Record<typeof fields[number], string>;
		const errors: Record<string, string[]> = {};
		for (const field of fields) {
			const value = form.get(field);
			if (typeof value !== 'string') errors[field] = ['This field is required.'];
			else if (value.length > 256) errors[field] = ['This value is too long.'];
		}
		const password = form.get('password');
		if (typeof password !== 'string' || !password) errors.password = ['Password is required.'];
		else if (password.length > 4096) errors.password = ['This value is too long.'];
		if (Object.keys(errors).length || typeof password !== 'string') return fail(400, { values, errors });

		try {
			const { data, error, response } = await memberClient(event).register({ ...values, password });
			if (!data?.succeeded) {
				const upstream = data?.errors ?? error?.errors;
				for (const field of [...fields, 'password', '']) {
					const messages = upstream?.[field];
					if (Array.isArray(messages) && messages.length) errors[field] = messages.slice(0, 3);
				}
				if (!Object.keys(errors).length) errors[''] = ['Registration is unavailable right now.'];
				return fail(response.status === 503 || response.status === 429 ? 503 : 400, { values, errors });
			}
		} catch {
			errors[''] = ['Registration is unavailable right now.'];
			return fail(503, { values, errors });
		}
		// The bridge has already relayed the persistent member cookie. The next request loads its session.
		redirect(303, '/account');
	}
};
