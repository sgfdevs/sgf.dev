import { CMS_INTERNAL_ORIGIN } from '$app/env/private';
import { error, isHttpError } from '@sveltejs/kit';
import { DirectoryLoadError, loadDirectory } from '../../lib/server/directory/load';
import { readMediaSourceConfig } from '../../lib/server/media/runtime';
import type { PageServerLoad } from './$types';

export const trailingSlash = 'always';

export const load: PageServerLoad = async (event) => {
	try {
		const mediaConfig = readMediaSourceConfig();
		return await loadDirectory({
			fetch: event.fetch,
			cmsInternalOrigin: CMS_INTERNAL_ORIGIN,
			mediaConfig,
			url: event.url,
			requestSignal: event.request.signal
		});
	} catch (loadError) {
		if (isHttpError(loadError)) throw loadError;
		if (loadError instanceof DirectoryLoadError) {
			error(loadError.status, loadError.publicMessage);
		}
		if (loadError instanceof Error && loadError.name === 'PrivateMediaConfigError') {
			error(503, 'Directory media configuration is unavailable.');
		}
		throw loadError;
	}
};
