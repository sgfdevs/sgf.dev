export const MEDIA_PUBLIC_ROUTE_PREFIX = '/media/';
export const MEDIA_SOURCE_RELATIVE_PREFIX = '/media/';
export const STATIC_MEDIA_PASSTHROUGH = '/images/pipey.jpg';

export const MEDIA_MAX_BYTES_DEFAULT = 8 * 1024 * 1024;
export const MEDIA_TIMEOUT_MS_DEFAULT = 5_000;

const MAX_MEDIA_KEY_BYTES = 1024;
const MEDIA_KEY_SEGMENTS = 2;
const safeSegmentPattern = /^[A-Za-z0-9._~-]+$/;
const allowedMediaExtensionPattern = /\.(?:jpe?g|png)$/i;
const invalidPercentEscapePattern = /%(?:$|[^0-9A-Fa-f]|.[^0-9A-Fa-f])/;
const encodedDangerPattern = /%(?:00|2e|2f|5c)/i;

export type ParsedMediaPath = {
	key: string;
	segments: string[];
};

export function parseRouteMediaPath(pathname: string, publicPrefix = MEDIA_PUBLIC_ROUTE_PREFIX): ParsedMediaPath {
	if (!pathname.startsWith(publicPrefix)) {
		throw new Error('Media path must use the fixed public media prefix.');
	}

	return parseMediaKey(pathname.slice(publicPrefix.length));
}

export function parseMediaKey(rawKey: string): ParsedMediaPath {
	if (!rawKey) {
		throw new Error('Media key is required.');
	}
	if (rawKey.length > MAX_MEDIA_KEY_BYTES) {
		throw new Error('Media key is too long.');
	}
	if (rawKey.startsWith('/') || rawKey.endsWith('/') || rawKey.includes('//')) {
		throw new Error('Media key must not contain empty segments.');
	}
	if (rawKey.includes('\\')) {
		throw new Error('Media key must not contain backslashes.');
	}
	if (hasInvalidPercentEscape(rawKey)) {
		throw new Error('Media key contains an invalid percent escape.');
	}
	if (encodedDangerPattern.test(rawKey)) {
		throw new Error('Media key contains an unsafe encoded character.');
	}

	const rawSegments = rawKey.split('/');
	if (rawSegments.length !== MEDIA_KEY_SEGMENTS) {
		throw new Error('Media key must contain exactly two segments.');
	}

	const segments = rawSegments.map((segment) => decodeSafePathSegment(segment));
	if (!allowedMediaExtensionPattern.test(segments[segments.length - 1] ?? '')) {
		throw new Error('Media key uses an unsupported file extension.');
	}
	return {
		key: segments.map((segment) => encodeURIComponent(segment)).join('/'),
		segments
	};
}

export function normalizeMediaQuery(searchParams: URLSearchParams): string {
	const normalized = new URLSearchParams();
	const allowed = new Set(['width', 'v']);

	for (const key of searchParams.keys()) {
		if (!allowed.has(key)) {
			throw new Error('Media query contains an unsupported parameter.');
		}
		if (searchParams.getAll(key).length !== 1) {
			throw new Error('Media query contains duplicate parameters.');
		}
	}

	copyBoundedInteger(searchParams, normalized, 'width', 1, 4096);
	copyVersionToken(searchParams, normalized);

	return normalized.toString();
}

export function hasInvalidPercentEscape(value: string): boolean {
	return invalidPercentEscapePattern.test(value);
}

export function decodeSafePathSegment(rawSegment: string): string {
	if (!rawSegment || rawSegment === '.' || rawSegment === '..') {
		throw new Error('Media key contains an unsafe segment.');
	}

	let segment: string;
	try {
		segment = decodeURIComponent(rawSegment);
	} catch {
		throw new Error('Media key contains an invalid percent escape.');
	}

	if (
		!segment ||
		segment === '.' ||
		segment === '..' ||
		segment.includes('\0') ||
		segment.includes('/') ||
		segment.includes('\\') ||
		segment.includes('%') ||
		segment.includes(':') ||
		segment.includes('@') ||
		!safeSegmentPattern.test(segment)
	) {
		throw new Error('Media key contains an unsafe segment.');
	}

	return segment;
}

function copyBoundedInteger(
	source: URLSearchParams,
	target: URLSearchParams,
	key: 'width',
	minimum: number,
	maximum: number
): void {
	const value = source.get(key);
	if (value === null) return;
	if (!/^[0-9]+$/.test(value) || (value.length > 1 && value.startsWith('0'))) {
		throw new Error('Media query contains an invalid numeric parameter.');
	}

	const parsed = Number(value);
	if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
		throw new Error('Media query contains an out-of-range numeric parameter.');
	}

	target.set(key, String(parsed));
}

function copyVersionToken(source: URLSearchParams, target: URLSearchParams): void {
	const value = source.get('v');
	if (value === null) return;
	if (!/^[A-Za-z0-9_-]{1,64}$/.test(value)) {
		throw new Error('Media query contains an invalid cache token.');
	}

	target.set('v', value);
}
