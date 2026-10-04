import { createSgfApiClientForOrigin } from '../api/factory';
import { isCompanySlug } from '../companies/paths';
import type { MediaSourceConfig } from '../media/config';
import { mapJobs, mapJob } from './mapper';

export type JobsLoadOptions = {
	fetch: (request: Request) => Promise<Response>;
	cmsInternalOrigin: string | undefined;
	mediaConfig: MediaSourceConfig;
	requestSignal?: AbortSignal;
	timeoutMs?: number;
};
export class JobLoadError extends Error {
	constructor(readonly status: 404 | 502 | 503, readonly publicMessage: string) { super(publicMessage); }
}
export async function loadJobs(options: JobsLoadOptions) {
	return request(options, async (api, signal) => {
		const result = await api.GET('/api/v1/public/jobs', { signal });
		assertResult(result);
		return mapJobs(result.data!);
	});
}
export async function loadJob(options: JobsLoadOptions, company: string, job: string) {
	if (!isCompanySlug(company) || !isCompanySlug(job)) throw new JobLoadError(404, 'Job content not found.');
	return request(options, async (api, signal) => {
		const result = await api.GET('/api/v1/public/jobs/{company}/{job}', { params: { path: { company, job } }, signal });
		assertResult(result);
		return mapJob(result.data!, `/companies/${company}/${job}/`, options.mediaConfig);
	});
}
function assertResult(result: { response: Response; data?: unknown; error?: unknown }) {
	if ([401, 403, 404].includes(result.response.status)) throw new JobLoadError(404, 'Job content not found.');
	if (!result.response.ok || result.error || result.data === undefined) throw new JobLoadError(502, 'Jobs data returned an upstream error.');
}
async function request<T>(options: JobsLoadOptions,
	read: (api: ReturnType<typeof createSgfApiClientForOrigin>, signal: AbortSignal) => Promise<T>): Promise<T> {
	let api;
	try { api = createSgfApiClientForOrigin(options.fetch, options.cmsInternalOrigin); }
	catch { throw new JobLoadError(503, 'Jobs data is unavailable because the CMS API is not configured.'); }
	const timeout = AbortSignal.timeout(options.timeoutMs ?? 4000);
	const signal = options.requestSignal ? AbortSignal.any([options.requestSignal, timeout]) : timeout;
	try { return await read(api, signal); }
	catch (cause) {
		if (cause instanceof JobLoadError) throw cause;
		throw new JobLoadError(signal.aborted ? 503 : 502,
			signal.aborted ? 'Jobs data is temporarily unavailable.' : 'Jobs data did not match the public contract.');
	}
}
