import { fail } from '@sveltejs/kit';
import { memberClient } from '../../lib/server/auth/runtime';
import type { Actions } from './$types';

const unavailable = 'Newsletter signup is unavailable right now. Please try again.';

export const actions: Actions = {
    default: async event => {
        event.setHeaders({ 'cache-control': 'no-store' });
        const form = await event.request.formData();
        const email = form.get('email');
        const name = form.get('name');
        const values = {
            newsletter: true,
            email: typeof email === 'string' ? email : '',
            name: typeof name === 'string' ? name.slice(0, 256) : ''
        };
        // The honeypot is empty-only, including whitespace. Do not call the bridge.
        if (name !== null && (typeof name !== 'string' || name !== ''))
            return fail(400, { ...values, accepted: false, message: 'Unable to sign up. Please try again.' });
        if (typeof email !== 'string' || email.length > 254 ||
            !/^[^\s@]+@[^\s@]+$/.test(email.trim()))
            return fail(400, { ...values, accepted: false, message: 'Please enter a valid email address.' });
        try {
            const { data, response } = await memberClient(event).newsletterSignup({ email, name: '' });
            if (data?.accepted)
                return { newsletter: true, accepted: true, email: '', name: '', message: '' };
            // Do not copy upstream error bodies into a browser response.
            return fail(response.status === 400 ? 400 : 503, {
                ...values, accepted: false,
                message: response.status === 400 ? 'Please enter a valid email address.' : unavailable
            });
        } catch {
            return fail(503, { ...values, accepted: false, message: unavailable });
        }
    }
};
