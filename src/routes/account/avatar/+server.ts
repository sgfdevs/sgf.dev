import { redirect } from '@sveltejs/kit';
import { memberClient } from '../../../lib/server/auth/runtime';
import { mapMediaUrlToSameOrigin } from '../../../lib/server/media/mapper';
import { readMediaSourceConfig } from '../../../lib/server/media/runtime';
import type { RequestHandler } from './$types';

const maxBytes = 8 * 1024 * 1024;
function failed(reason: string): never { redirect(303, '/account?avatar=' + reason); }

export const POST: RequestHandler = async event => {
    if (!event.locals.member) redirect(303, '/login?returnTo=%2Faccount');
    if (Number(event.request.headers.get('content-length')) > maxBytes + 65536) failed('size');
    let body: FormData;
    try { body = await event.request.formData(); }
    catch { failed('invalid'); }
    const file = body.get('file');
    if (event.url.search || [...body.keys()].some(key => key !== 'file') || body.getAll('file').length !== 1 ||
        !(file instanceof File) || !file.size) failed('invalid');
    if (file.size > maxBytes) failed('size');
    let result;
    try { result = await memberClient(event).uploadAvatar(file); }
    catch { failed('unavailable'); }
    if (result.response.status === 401) redirect(303, '/login?returnTo=%2Faccount');
    if (result.response.status === 413) failed('size');
    if (result.response.status === 429) failed('busy');
    if (result.response.status === 400) failed('invalid');
    if (!result.data?.profileImageUrl || !mapMediaUrlToSameOrigin(result.data.profileImageUrl, readMediaSourceConfig()))
        failed('unavailable');
    // Reload the current member profile; never accept a browser-selected media URL or ID.
    redirect(303, '/account?avatar=updated');
};
