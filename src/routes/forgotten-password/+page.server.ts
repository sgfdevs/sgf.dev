import { fail } from '@sveltejs/kit';
import { memberClient } from '../../lib/server/auth/runtime';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async event => {
		const form = await event.request.formData();
		const email = form.get('email');
		const errors: Record<string, string[]> = {};
		if (typeof email !== 'string' || !email.trim() || email.length > 256) {
			errors.email = ['Enter your email address.'];
			return fail(400, { errors });
		}
		try {
			const { data, error, response } = await memberClient(event).forgotPassword({ email });
			if (data?.succeeded) return { succeeded: true };
			for (const field of ['email', '']) {
				const messages = (data?.errors ?? error?.errors)?.[field];
				if (messages?.length) errors[field] = messages.slice(0, 3);
			}
			if (!Object.keys(errors).length) errors[''] = ['Password reset is unavailable right now.'];
			return fail(response.status === 503 || response.status === 429 ? 503 : 400, { errors });
		} catch {
			errors[''] = ['Password reset is unavailable right now.'];
			return fail(503, { errors });
		}
	}
};
