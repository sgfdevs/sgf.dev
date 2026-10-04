import { CMS_INTERNAL_ORIGIN } from '$app/env/private';
import { error, isHttpError } from '@sveltejs/kit';
import { loadPublicHome, PublicHomeLoadError } from '../lib/server/home/load';
import { readMediaSourceConfig } from '../lib/server/media/runtime';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	try {
		const mediaConfig = readMediaSourceConfig();
		return await loadPublicHome({
			fetch: event.fetch,
			cmsInternalOrigin: CMS_INTERNAL_ORIGIN,
			mediaConfig,
			requestSignal: event.request.signal
		});
	} catch (loadError) {
		if (isHttpError(loadError)) throw loadError;
		if (loadError instanceof PublicHomeLoadError) {
			error(loadError.status, loadError.publicMessage);
		}
		if (loadError instanceof Error && loadError.name === 'PrivateMediaConfigError') {
			error(503, 'Home media configuration is unavailable.');
		}
		throw loadError;
	}
};
