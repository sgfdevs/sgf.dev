import { CMS_INTERNAL_ORIGIN } from '$app/env/private';
import { error, isHttpError } from '@sveltejs/kit';
import { loadGroups, GroupLoadError } from '../../../lib/server/groups/load';
import { readMediaSourceConfig } from '../../../lib/server/media/runtime';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	try {
		const options = { fetch: event.fetch, cmsInternalOrigin: CMS_INTERNAL_ORIGIN,
			mediaConfig: readMediaSourceConfig(), requestSignal: event.request.signal };
		const { group } = await loadGroups(options, event.params.slug);
		if (!group) error(404, 'Group not found.');
		return { group };
	} catch (cause) {
		if (isHttpError(cause)) throw cause;
		if (cause instanceof GroupLoadError) error(cause.status, cause.publicMessage);
		if (cause instanceof Error && cause.name === 'PrivateMediaConfigError') error(503, 'Group media configuration is unavailable.');
		throw cause;
	}
};
