export type MediaSourceConfig = {
	publicMediaUrl: string;
	cmsInternalOrigin?: string;
};

export class PrivateMediaConfigError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'PrivateMediaConfigError';
	}
}

export function readMediaSourceConfigFromEnv(env: { MEDIA_PUBLIC_URL?: string; CMS_INTERNAL_ORIGIN?: string }): MediaSourceConfig {
	let url: URL;
	try { url = new URL(env.MEDIA_PUBLIC_URL || 'https://media.sgf.dev/'); }
	catch { throw new PrivateMediaConfigError('MEDIA_PUBLIC_URL must be a valid media base URL.'); }
	if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
		throw new PrivateMediaConfigError('MEDIA_PUBLIC_URL must be an HTTP(S) media base URL without credentials, query or fragment.');
	}
	if (!url.pathname.endsWith('/')) url.pathname += '/';
	return { publicMediaUrl: url.href, cmsInternalOrigin: env.CMS_INTERNAL_ORIGIN };
}
