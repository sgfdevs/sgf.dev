import { createDeliveryPageClient } from './client';
import { isContentPagePath, type ContentPagePath } from './paths';
import { mapDeliveryPage, PageDataError, PageNotFoundError } from './mapper';
import type { MediaSourceConfig } from '../media/config';

export class ContentPageLoadError extends Error {
	constructor(readonly status: 404 | 502 | 503, readonly publicMessage: string) { super(publicMessage); }
}

export async function loadContentPage(options: {
	path: ContentPagePath;
	origin: string | undefined;
	apiKey: string | undefined;
	media: MediaSourceConfig;
	fetch?: (request: Request) => Promise<Response>;
	requestSignal?: AbortSignal;
	timeoutMs?: number;
}) {
	if (!isContentPagePath(options.path)) throw new ContentPageLoadError(404, 'Page not found.');
	let client;
	try { client = createDeliveryPageClient(options.origin, options.apiKey, options.fetch); }
	catch { throw new ContentPageLoadError(503, 'Page content is unavailable because the CMS is not configured.'); }
	const timeout = AbortSignal.timeout(options.timeoutMs ?? 4000);
	const signal = options.requestSignal ? AbortSignal.any([timeout, options.requestSignal]) : timeout;
	let result;
	try { result = await client.getPage(options.path, signal); }
	catch {
		throw new ContentPageLoadError(signal.aborted ? 503 : 502, 'Page content could not be reached.');
	}
	if ([401, 403, 404].includes(result.response.status)) throw new ContentPageLoadError(404, 'Page not found.');
	if (!result.response.ok || result.data === undefined || result.error) throw new ContentPageLoadError(502, 'Page content returned an upstream error.');
	try { return { contentPage: mapDeliveryPage(result.data, options.path, options.media) }; }
	catch (cause) {
		if (cause instanceof PageNotFoundError) throw new ContentPageLoadError(404, 'Page not found.');
		if (cause instanceof PageDataError) throw new ContentPageLoadError(502, 'Page content was malformed.');
		throw cause;
	}
}
