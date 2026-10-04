import { CMS_INTERNAL_ORIGIN } from '$app/env/private';
import { error } from '@sveltejs/kit';
import { loadJobs, JobLoadError } from '../../lib/server/jobs/load';
import { readMediaSourceConfig } from '../../lib/server/media/runtime';
import { PrivateMediaConfigError } from '../../lib/server/media/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	try {
		return { jobs: await loadJobs({ fetch: event.fetch, cmsInternalOrigin: CMS_INTERNAL_ORIGIN,
			mediaConfig: readMediaSourceConfig(), requestSignal: event.request.signal }) };
	} catch (cause) {
		if (cause instanceof JobLoadError) error(cause.status, cause.publicMessage);
		if (cause instanceof PrivateMediaConfigError) error(503, 'Jobs media configuration is unavailable.');
		throw cause;
	}
};
