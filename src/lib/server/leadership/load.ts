import { createSgfApiClientForOrigin } from '../api/factory';
import type { MediaSourceConfig } from '../media/config';
import { mapLeadership } from './mapper';

export type LeadershipLoadOptions = {
    fetch: (request: Request) => Promise<Response>;
    cmsInternalOrigin: string | undefined;
    mediaConfig: MediaSourceConfig;
    requestSignal?: AbortSignal;
    timeoutMs?: number;
};
export class LeadershipLoadError extends Error {
    constructor(readonly status: 404 | 502 | 503, readonly publicMessage: string) { super(publicMessage); }
}
export async function loadLeadership(options: LeadershipLoadOptions) {
    let api;
    try { api = createSgfApiClientForOrigin(options.fetch, options.cmsInternalOrigin); }
    catch { throw new LeadershipLoadError(503, 'Leadership data is unavailable because the CMS API is not configured.'); }
    const timeout = AbortSignal.timeout(options.timeoutMs ?? 4_000);
    const signal = options.requestSignal ? AbortSignal.any([options.requestSignal, timeout]) : timeout;
    try {
        const result = await api.GET('/api/v1/public/leadership', { signal });
        if (result.response.status === 404) throw new LeadershipLoadError(404, 'Leadership content not found.');
        if (!result.response.ok || result.error || result.data === undefined)
            throw new LeadershipLoadError(502, 'Leadership data returned an upstream error.');
        return mapLeadership(result.data, options.mediaConfig);
    } catch (cause) {
        if (cause instanceof LeadershipLoadError) throw cause;
        if (signal.aborted) throw new LeadershipLoadError(503, 'Leadership data is temporarily unavailable.');
        throw new LeadershipLoadError(502, 'Leadership data did not match the public contract.');
    }
}
