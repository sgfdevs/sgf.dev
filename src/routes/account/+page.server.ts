import { error, fail, redirect } from '@sveltejs/kit';
import { memberClient } from '../../lib/server/auth/runtime';
import { profileValues, readProfileForm } from '../../lib/server/auth/profile';
import { mapMediaUrlToSameOrigin } from '../../lib/server/media/mapper';
import { readMediaSourceConfig } from '../../lib/server/media/runtime';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async event => {
    if (!event.locals.member) redirect(303, '/login?returnTo=%2Faccount');
    let result;
    try { result = await memberClient(event).profile(); }
    catch { error(503, 'Profile editing is unavailable right now.'); }
    if (result?.response.status === 401) redirect(303, '/login?returnTo=%2Faccount');
    if (!result?.data) error(503, 'Profile editing is unavailable right now.');
    const profile = result.data;
    return {
        values: profileValues(profile.values),
        skills: profile.skills.map(choice => ({ key: choice.key, name: choice.name })),
        groups: profile.groups.map(choice => ({ key: choice.key, name: choice.name })),
        image: mapMediaUrlToSameOrigin(profile.profileImageUrl ?? '/images/pipey.jpg', readMediaSourceConfig()) ?? '/images/pipey.jpg',
        profileHref: '/member/' + encodeURIComponent(event.locals.member.username),
        saved: event.url.searchParams.get('saved') === '1',
        avatarStatus: event.url.searchParams.get('avatar') ?? ''
    };
};

export const actions: Actions = {
    default: async event => {
        if (!event.locals.member) redirect(303, '/login?returnTo=%2Faccount');
        const { values, errors } = readProfileForm(await event.request.formData());
        if (Object.keys(errors).length) return fail(400, { values, errors });
        let result;
        try { result = await memberClient(event).updateProfile(values); }
        catch {
            errors[''] = ['Profile editing is unavailable right now.'];
            return fail(503, { values, errors });
        }
        if (result?.response.status === 401) redirect(303, '/login?returnTo=%2Faccount');
        if (!result?.data?.succeeded) {
            const upstream = result?.data?.errors ?? result?.error?.errors;
            for (const field of [...Object.keys(values), '']) {
                const messages = upstream?.[field];
                if (Array.isArray(messages) && messages.length) {
                    errors[field] = messages.filter((message): message is string => typeof message === 'string').slice(0, 3);
                }
            }
            if (!Object.keys(errors).length) errors[''] = ['Profile editing is unavailable right now.'];
            return fail(!result || result.response.status >= 500 ? 503 : 400, { values, errors });
        }
        redirect(303, '/account?saved=1');
    }
};
