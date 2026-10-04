import type { components } from '../api/generated/sgfPublicApiSchema';
import type { MediaSourceConfig } from './config';
import {
	MEDIA_PUBLIC_ROUTE_PREFIX,
	MEDIA_SOURCE_RELATIVE_PREFIX,
	STATIC_MEDIA_PASSTHROUGH,
	hasInvalidPercentEscape,
	normalizeMediaQuery,
	parseMediaKey
} from './validation';

export type PublicDirectoryMemberDto = components['schemas']['PublicDirectoryMemberDto'];

export function mapPublicDirectoryMemberMedia(
	member: PublicDirectoryMemberDto,
	config: MediaSourceConfig
): PublicDirectoryMemberDto {
	return {
		...member,
		image: mapMediaUrlToSameOrigin(member.image, config) ?? STATIC_MEDIA_PASSTHROUGH
	};
}

export function mapMediaUrlToSameOrigin(input: string | null | undefined, config: MediaSourceConfig): string | null {
	if (!input) return null;
	if (input === STATIC_MEDIA_PASSTHROUGH) return input;
	if (input.startsWith('//') || input.includes('\\') || hasInvalidPercentEscape(input)) return null;
	if (input.includes('#')) return null;

	const publicSourceOrigin = config.publicSourceOrigin;
	const cmsInternalOrigin = config.cmsInternalOrigin;

	if (input.startsWith(MEDIA_SOURCE_RELATIVE_PREFIX)) {
		return buildSameOriginMediaUrl(input.slice(MEDIA_SOURCE_RELATIVE_PREFIX.length));
	}

	if (input.startsWith(`${publicSourceOrigin}/`)) {
		return buildSameOriginMediaUrl(input.slice(publicSourceOrigin.length + 1));
	}

	if (cmsInternalOrigin && input.startsWith(`${cmsInternalOrigin}${MEDIA_SOURCE_RELATIVE_PREFIX}`)) {
		return buildSameOriginMediaUrl(input.slice(cmsInternalOrigin.length + MEDIA_SOURCE_RELATIVE_PREFIX.length));
	}

	return null;
}

function buildSameOriginMediaUrl(rawPathAndQuery: string): string | null {
	const [rawPath, ...queryParts] = rawPathAndQuery.split('?');
	if (!rawPath || queryParts.length > 1) return null;

	let mediaKey: string;
	let mediaQuery: string;
	try {
		mediaKey = parseMediaKey(rawPath).key;
		mediaQuery = normalizeMediaQuery(new URLSearchParams(queryParts[0] ?? ''));
	} catch {
		return null;
	}

	return `${MEDIA_PUBLIC_ROUTE_PREFIX}${mediaKey}${mediaQuery ? `?${mediaQuery}` : ''}`;
}
