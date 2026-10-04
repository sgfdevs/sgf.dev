import { createSgfApiClientForOrigin, isPublicGroupSlug } from '../api/factory';
import type { MediaSourceConfig } from '../media/config';
import { mapGroup } from './mapper';
import type { PublicGroupDto } from './mapper';

export type GroupLoadOptions = {
	fetch: (request: Request) => Promise<Response>;
	cmsInternalOrigin: string | undefined;
	mediaConfig: MediaSourceConfig;
	requestSignal?: AbortSignal;
	timeoutMs?: number;
};
export class GroupLoadError extends Error {
	constructor(readonly status: 404 | 502 | 503, readonly publicMessage: string) { super(publicMessage); }
}

// Omitting slug requests only the list. A bad detail slug never reaches the CMS.
export async function loadGroups(options: GroupLoadOptions, slug?: string) {
	if (slug !== undefined && !isPublicGroupSlug(slug)) throw new GroupLoadError(404, 'Group not found.');
	let api;
	try { api = createSgfApiClientForOrigin(options.fetch, options.cmsInternalOrigin); }
	catch { throw new GroupLoadError(503, 'Group data is unavailable because the CMS API is not configured.'); }
	const timeout = AbortSignal.timeout(options.timeoutMs ?? 4_000);
	const signal = options.requestSignal ? AbortSignal.any([options.requestSignal, timeout]) : timeout;
	try {
		const result = slug === undefined
			? await api.GET('/api/v1/public/groups', { signal })
			: await api.GET('/api/v1/public/groups/{slug}', { params: { path: { slug } }, signal });
		if (result.response.status === 404) throw new GroupLoadError(404, 'Group content was not found.');
		if (!result.response.ok || result.error || result.data === undefined) throw new GroupLoadError(502, 'Group data returned an upstream error.');
		if (slug === undefined) {
			if (!Array.isArray(result.data)) throw new GroupLoadError(502, 'Group data did not match the public contract.');
			return { groups: result.data.map(group => mapGroup(group, options.mediaConfig)), group: null };
		}
		return { groups: [], group: mapGroup(result.data as PublicGroupDto, options.mediaConfig) };
	} catch (error) {
		if (error instanceof GroupLoadError) throw error;
		if (signal.aborted) throw new GroupLoadError(503, 'Group data request timed out or was cancelled.');
		throw new GroupLoadError(502, 'Group data could not be reached or did not match the public contract.');
	}
}
