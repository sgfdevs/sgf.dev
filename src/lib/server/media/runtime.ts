import { CMS_INTERNAL_ORIGIN, MEDIA_SOURCE_PUBLIC_ORIGIN, MEDIA_UPSTREAM_ORIGIN, MEDIA_UPSTREAM_PATH_PREFIX } from '$app/env/private';
import { readMediaProxyConfigFromEnv, readMediaSourceConfigFromEnv } from './config';

export function readMediaSourceConfig() {
	return readMediaSourceConfigFromEnv({
		CMS_INTERNAL_ORIGIN,
		MEDIA_SOURCE_PUBLIC_ORIGIN
	});
}

export function readMediaProxyConfig() {
	return readMediaProxyConfigFromEnv({
		CMS_INTERNAL_ORIGIN,
		MEDIA_SOURCE_PUBLIC_ORIGIN,
		MEDIA_UPSTREAM_ORIGIN,
		MEDIA_UPSTREAM_PATH_PREFIX
	});
}
