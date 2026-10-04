import { createDeliveryCompanyClient } from './client';
import { isCompanyPath } from './paths';
import { mapDeliveryCompany, CompanyDataError, CompanyNotFoundError } from './mapper';
import type { MediaSourceConfig } from '../media/config';

export class CompanyLoadError extends Error {
	constructor(readonly status: 404 | 502 | 503, readonly publicMessage: string) { super(publicMessage); }
}

export async function loadCompany(options: {
	path: string;
	origin: string | undefined;
	apiKey: string | undefined;
	media: MediaSourceConfig;
	fetch?: (request: Request) => Promise<Response>;
	requestSignal?: AbortSignal;
	timeoutMs?: number;
}) {
	if (!isCompanyPath(options.path)) throw new CompanyLoadError(404, 'Company not found.');
	let client;
	try { client = createDeliveryCompanyClient(options.origin, options.apiKey, options.fetch); }
	catch { throw new CompanyLoadError(503, 'Company content is unavailable because the CMS is not configured.'); }
	const timeout = AbortSignal.timeout(options.timeoutMs ?? 4000);
	const signal = options.requestSignal ? AbortSignal.any([timeout, options.requestSignal]) : timeout;
	let result;
	try { result = await client.getCompany(options.path, signal); }
	catch {
		throw new CompanyLoadError(signal.aborted ? 503 : 502, 'Company content could not be reached.');
	}
	if ([401, 403, 404].includes(result.response.status)) throw new CompanyLoadError(404, 'Company not found.');
	if (!result.response.ok || result.data === undefined || result.error) throw new CompanyLoadError(502, 'Company content returned an upstream error.');
	try { return { company: mapDeliveryCompany(result.data, options.path, options.media) }; }
	catch (cause) {
		if (cause instanceof CompanyNotFoundError) throw new CompanyLoadError(404, 'Company not found.');
		if (cause instanceof CompanyDataError) throw new CompanyLoadError(502, 'Company content was malformed.');
		throw cause;
	}
}
