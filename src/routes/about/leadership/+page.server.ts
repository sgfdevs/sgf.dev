import { CMS_INTERNAL_ORIGIN } from '$app/env/private';
import { error } from '@sveltejs/kit';
import { loadLeadership, LeadershipLoadError } from '../../../lib/server/leadership/load';
import { readMediaSourceConfig } from '../../../lib/server/media/runtime';
import { PrivateMediaConfigError } from '../../../lib/server/media/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
    try {
        return { leadership: await loadLeadership({
            fetch: event.fetch, cmsInternalOrigin: CMS_INTERNAL_ORIGIN,
            mediaConfig: readMediaSourceConfig(), requestSignal: event.request.signal
        }) };
    } catch (cause) {
        if (cause instanceof LeadershipLoadError) error(cause.status, cause.publicMessage);
        if (cause instanceof PrivateMediaConfigError) error(503, 'Leadership media configuration is unavailable.');
        throw cause;
    }
};
