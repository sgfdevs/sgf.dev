import { CMS_INTERNAL_ORIGIN, CMS_DELIVERY_API_KEY } from '$app/env/private';
import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { readMediaSourceConfig } from '../media/runtime';
import { PrivateMediaConfigError } from '../media/config';
import { ContentPageLoadError, loadContentPage } from './load';
import type { ContentPagePath } from './paths';

export function contentPageLoad(path: ContentPagePath) {
	return async (event: RequestEvent) => {
		try {
			return await loadContentPage({
				path, origin: CMS_INTERNAL_ORIGIN, apiKey: CMS_DELIVERY_API_KEY,
				media: readMediaSourceConfig(), requestSignal: event.request.signal
			});
		} catch (cause) {
			if (cause instanceof ContentPageLoadError) error(cause.status, cause.publicMessage);
			if (cause instanceof PrivateMediaConfigError) error(503, 'Page media configuration is unavailable.');
			throw cause;
		}
	};
}
