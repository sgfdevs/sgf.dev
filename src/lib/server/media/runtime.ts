import { CMS_INTERNAL_ORIGIN, MEDIA_PUBLIC_URL } from '$app/env/private';
import { readMediaSourceConfigFromEnv } from './config';

export function readMediaSourceConfig() {
	return readMediaSourceConfigFromEnv({ CMS_INTERNAL_ORIGIN, MEDIA_PUBLIC_URL });
}
