import { MEDIA_MAX_BYTES_DEFAULT, MEDIA_TIMEOUT_MS_DEFAULT, decodeSafePathSegment, hasInvalidPercentEscape } from './validation';

export type MediaSourceConfig = {
	publicSourceOrigin: string;
	cmsInternalOrigin?: string;
};

export type MediaProxyConfig = MediaSourceConfig & {
	upstreamOrigin: string;
	upstreamPathPrefix: string;
	maxBytes: number;
	timeoutMs: number;
};

export type MediaEnvironment = {
	CMS_INTERNAL_ORIGIN?: string;
	MEDIA_SOURCE_PUBLIC_ORIGIN?: string;
	MEDIA_UPSTREAM_ORIGIN?: string;
	MEDIA_UPSTREAM_PATH_PREFIX?: string;
};

const defaultPublicMediaOrigin = 'https://media.sgf.dev';

export class PrivateMediaConfigError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'PrivateMediaConfigError';
	}
}

function mediaConfigError(message: string): PrivateMediaConfigError {
	return new PrivateMediaConfigError(message);
}

export function readMediaSourceConfigFromEnv(env: MediaEnvironment): MediaSourceConfig {
	return {
		publicSourceOrigin: parseOrigin(env.MEDIA_SOURCE_PUBLIC_ORIGIN || defaultPublicMediaOrigin, 'MEDIA_SOURCE_PUBLIC_ORIGIN'),
		cmsInternalOrigin: env.CMS_INTERNAL_ORIGIN ? parseOrigin(env.CMS_INTERNAL_ORIGIN, 'CMS_INTERNAL_ORIGIN') : undefined
	};
}

export function readMediaProxyConfigFromEnv(env: MediaEnvironment): MediaProxyConfig {
	if (!env.MEDIA_UPSTREAM_ORIGIN) {
		throw mediaConfigError('MEDIA_UPSTREAM_ORIGIN is required before proxying SGF media.');
	}

	const upstreamOrigin = parseOrigin(env.MEDIA_UPSTREAM_ORIGIN, 'MEDIA_UPSTREAM_ORIGIN');
	return {
		...readMediaSourceConfigFromEnv(env),
		upstreamOrigin,
		upstreamPathPrefix: parseUpstreamPathPrefix(env.MEDIA_UPSTREAM_PATH_PREFIX, upstreamOrigin),
		maxBytes: MEDIA_MAX_BYTES_DEFAULT,
		timeoutMs: MEDIA_TIMEOUT_MS_DEFAULT
	};
}

export function parseOrigin(input: string, name: string): string {
	if (input.startsWith('//')) {
		throw mediaConfigError(`${name} must include http:// or https://.`);
	}

	let url: URL;
	try {
		url = new URL(input);
	} catch {
		throw mediaConfigError(`${name} must be a valid origin.`);
	}
	if (url.protocol !== 'http:' && url.protocol !== 'https:') {
		throw mediaConfigError(`${name} must use http or https.`);
	}
	if (url.username || url.password) {
		throw mediaConfigError(`${name} must not include credentials.`);
	}
	if (url.pathname !== '/' || url.search || url.hash) {
		throw mediaConfigError(`${name} must be an origin only, with no path, query, or hash.`);
	}

	return url.origin;
}

export function parseUpstreamPathPrefix(input: string | undefined, upstreamOrigin: string): string {
	const prefix = input || (upstreamOrigin === defaultPublicMediaOrigin ? '/' : undefined);
	if (!prefix) {
		throw mediaConfigError('MEDIA_UPSTREAM_PATH_PREFIX is required for non-production media origins.');
	}
	if (!prefix.startsWith('/')) {
		throw mediaConfigError('MEDIA_UPSTREAM_PATH_PREFIX must start with /.');
	}
	if (prefix.includes('?') || prefix.includes('#') || prefix.includes('\\')) {
		throw mediaConfigError('MEDIA_UPSTREAM_PATH_PREFIX must be a plain path prefix.');
	}
	if (prefix !== '/' && !prefix.endsWith('/')) {
		throw mediaConfigError('MEDIA_UPSTREAM_PATH_PREFIX must end with /.');
	}
	if (prefix === '/') {
		assertRootPrefixAllowed(upstreamOrigin);
		return prefix;
	}
	if (prefix.includes('//') || hasInvalidPercentEscape(prefix)) {
		throw mediaConfigError('MEDIA_UPSTREAM_PATH_PREFIX must not contain empty segments or invalid percent escapes.');
	}

	try {
		for (const segment of prefix.slice(1, -1).split('/')) {
			decodeSafePathSegment(segment);
		}
	} catch {
		throw mediaConfigError('MEDIA_UPSTREAM_PATH_PREFIX contains an unsafe segment.');
	}
	return prefix;
}

function assertRootPrefixAllowed(upstreamOrigin: string): void {
	if (upstreamOrigin !== defaultPublicMediaOrigin) {
		throw mediaConfigError('A root media upstream path is allowed only for the dedicated public media origin.');
	}
}
