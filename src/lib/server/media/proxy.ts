import type { MediaProxyConfig } from './config';
import { MEDIA_PUBLIC_ROUTE_PREFIX, hasInvalidPercentEscape, normalizeMediaQuery, parseRouteMediaPath } from './validation';

export type MediaProxyEvent = {
	url: URL;
	request: Request;
};

export type MediaFetch = (request: Request) => Promise<Response>;

const allowedContentTypes = new Set(['image/jpeg', 'image/png']);
const forbiddenRequestHeaders = ['authorization', 'cookie', 'x-api-key', 'range', 'referer', 'origin', 'forwarded'];
const forbiddenResponseHeaders = ['content-encoding', 'set-cookie', 'www-authenticate'];

export class MediaProxyError extends Error {
	constructor(
		readonly status: number,
		message = 'Media unavailable'
	) {
		super(message);
	}
}

export async function handleMediaProxyRequest(
	event: MediaProxyEvent,
	method: 'GET' | 'HEAD',
	config: MediaProxyConfig,
	fetchImpl: MediaFetch = fetch
): Promise<Response> {
	let parsed;
	let query: string;
	try {
		parsed = parseRouteMediaPath(event.url.pathname, MEDIA_PUBLIC_ROUTE_PREFIX);
		assertSearchIsSafe(event.url.search);
		query = normalizeMediaQuery(event.url.searchParams);
	} catch {
		throw new MediaProxyError(400, 'Invalid media request');
	}

	const signal = createLinkedSignal(event.request.signal, config.timeoutMs);
	const upstreamRequest = createMediaUpstreamRequest(parsed.key, query, method, config, signal);
	assertFinalMediaRequest(upstreamRequest, parsed.key, query, method, config);

	let upstreamResponse: Response;
	try {
		upstreamResponse = await fetchImpl(upstreamRequest);
	} catch (error) {
		if (isAbortError(error)) {
			throw new MediaProxyError(504);
		}
		throw new MediaProxyError(502);
	}

	return await buildProxyResponse(upstreamResponse, method, query, config);
}

export function createMediaUpstreamRequest(
	mediaKey: string,
	query: string,
	method: 'GET' | 'HEAD',
	config: MediaProxyConfig,
	signal?: AbortSignal
): Request {
	const url = buildUpstreamUrl(mediaKey, query, config);
	return new Request(url, {
		method,
		cache: 'no-store',
		credentials: 'omit',
		redirect: 'error',
		referrerPolicy: 'no-referrer',
		signal,
		headers: new Headers()
	});
}

export function assertFinalMediaRequest(
	request: Request,
	mediaKey: string,
	query: string,
	method: 'GET' | 'HEAD',
	config: MediaProxyConfig
): void {
	const url = new URL(request.url);
	if (url.origin !== config.upstreamOrigin) {
		throw new Error('Media upstream request escaped the configured origin.');
	}
	if (url.pathname !== expectedUpstreamPath(mediaKey, config)) {
		throw new Error('Media upstream request escaped the configured path fence.');
	}
	if (!url.pathname.startsWith(config.upstreamPathPrefix)) {
		throw new Error('Media upstream request escaped the configured media namespace.');
	}
	if (url.search !== (query ? `?${query}` : '')) {
		throw new Error('Media upstream request changed the approved query.');
	}
	if (request.method !== method || !['GET', 'HEAD'].includes(request.method)) {
		throw new Error('Media upstream request used an unsupported method.');
	}
	if (request.credentials !== 'omit') {
		throw new Error('Media upstream request must omit credentials.');
	}
	if (request.redirect !== 'error') {
		throw new Error('Media upstream request must not follow redirects.');
	}
	if (request.referrerPolicy !== 'no-referrer') {
		throw new Error('Media upstream request must not send a referrer.');
	}
	if (request.cache !== 'no-store') {
		throw new Error('Media upstream request must not use a shared fetch cache.');
	}
	assertNoForbiddenRequestHeaders(request.headers);
}

function buildUpstreamUrl(mediaKey: string, query: string, config: MediaProxyConfig): URL {
	const url = new URL(config.upstreamOrigin);
	url.pathname = expectedUpstreamPath(mediaKey, config);
	url.search = query;
	return url;
}

function expectedUpstreamPath(mediaKey: string, config: MediaProxyConfig): string {
	return config.upstreamPathPrefix === '/' ? `/${mediaKey}` : `${config.upstreamPathPrefix}${mediaKey}`;
}

function assertNoForbiddenRequestHeaders(headers: Headers): void {
	for (const header of forbiddenRequestHeaders) {
		if (headers.has(header)) {
			throw new Error('Media upstream request included a forbidden header.');
		}
	}
	for (const [header] of headers) {
		if (header.startsWith('x-forwarded-')) {
			throw new Error('Media upstream request included a forwarded header.');
		}
	}
}

async function buildProxyResponse(
	upstreamResponse: Response,
	method: 'GET' | 'HEAD',
	query: string,
	config: MediaProxyConfig
): Promise<Response> {
	let headers: Headers;
	try {
		if (upstreamResponse.status >= 300 && upstreamResponse.status < 400) {
			throw new MediaProxyError(502);
		}
		if (!upstreamResponse.ok) {
			throw new MediaProxyError(upstreamResponse.status === 404 ? 404 : 502);
		}
		assertNoForbiddenResponseHeaders(upstreamResponse.headers);

		const contentType = parseAllowedContentType(upstreamResponse.headers.get('content-type'));
		if (!contentType) {
			throw new MediaProxyError(502);
		}

		const declaredLength = parseContentLength(upstreamResponse.headers.get('content-length'));
		if (declaredLength !== undefined && declaredLength > config.maxBytes) {
			throw new MediaProxyError(502);
		}

		headers = buildSafeResponseHeaders(upstreamResponse.headers, contentType, query, method === 'HEAD' ? declaredLength : undefined);
	} catch (error) {
		await cancelResponseBodyQuietly(upstreamResponse);
		throw error;
	}

	if (method === 'HEAD') {
		await cancelResponseBodyQuietly(upstreamResponse);
		return new Response(null, { status: 200, headers });
	}

	const body = await readBodyUnderLimit(upstreamResponse, config.maxBytes);
	const responseBody = new ArrayBuffer(body.byteLength);
	new Uint8Array(responseBody).set(body);
	headers.set('content-length', String(body.byteLength));
	return new Response(responseBody, { status: 200, headers });
}

function assertNoForbiddenResponseHeaders(headers: Headers): void {
	for (const header of forbiddenResponseHeaders) {
		if (headers.has(header)) {
			throw new MediaProxyError(502);
		}
	}
	const cacheControl = headers.get('cache-control');
	if (cacheControl && /(?:^|,)\s*private\b/i.test(cacheControl)) {
		throw new MediaProxyError(502);
	}
}

function parseAllowedContentType(value: string | null): string | null {
	if (!value) return null;
	const type = value.split(';', 1)[0]?.trim().toLowerCase() ?? '';
	return allowedContentTypes.has(type) ? type : null;
}

function parseContentLength(value: string | null): number | undefined {
	if (!value) return undefined;
	if (!/^[0-9]+$/.test(value)) {
		throw new MediaProxyError(502);
	}
	const parsed = Number(value);
	if (!Number.isSafeInteger(parsed)) {
		throw new MediaProxyError(502);
	}
	return parsed;
}

function buildSafeResponseHeaders(
	upstreamHeaders: Headers,
	contentType: string,
	query: string,
	contentLength: number | undefined
): Headers {
	const headers = new Headers({
		'cache-control': queryHasVersionToken(query) ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
		'content-type': contentType,
		'x-content-type-options': 'nosniff'
	});
	if (contentLength !== undefined) {
		headers.set('content-length', String(contentLength));
	}

	const etag = sanitizeEtag(upstreamHeaders.get('etag'));
	if (etag) {
		headers.set('etag', etag);
	}
	const lastModified = sanitizeLastModified(upstreamHeaders.get('last-modified'));
	if (lastModified) {
		headers.set('last-modified', lastModified);
	}

	return headers;
}

function sanitizeEtag(value: string | null): string | null {
	if (!value) return null;
	const etag = value.trim();
	if (etag.length > 128) return null;
	return /^(?:W\/)?"[\x21\x23-\x7e]{0,124}"$/.test(etag) ? etag : null;
}

function sanitizeLastModified(value: string | null): string | null {
	if (!value) return null;
	const lastModified = value.trim();
	if (!/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(lastModified)) {
		return null;
	}
	const parsed = Date.parse(lastModified);
	if (!Number.isFinite(parsed)) return null;
	const canonical = new Date(parsed).toUTCString();
	return canonical === lastModified ? canonical : null;
}

async function cancelResponseBodyQuietly(response: Response): Promise<void> {
	if (!response.body) return;
	try {
		await response.body.cancel();
	} catch {
		// Cleanup should not mask the response validation error.
	}
}

async function readBodyUnderLimit(response: Response, maxBytes: number): Promise<Uint8Array> {
	if (!response.body) return new Uint8Array();

	const reader = response.body.getReader();
	const chunks: Uint8Array[] = [];
	let total = 0;

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			if (!value) continue;

			total += value.byteLength;
			if (total > maxBytes) {
				await reader.cancel();
				throw new MediaProxyError(502);
			}
			chunks.push(value);
		}
	} catch (error) {
		if (error instanceof MediaProxyError) throw error;
		if (isAbortError(error)) throw new MediaProxyError(504);
		throw new MediaProxyError(502);
	}

	const body = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		body.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return body;
}

function queryHasVersionToken(query: string): boolean {
	return new URLSearchParams(query).has('v');
}

function assertSearchIsSafe(search: string): void {
	if (hasInvalidPercentEscape(search)) {
		throw new Error('Media query contains an invalid percent escape.');
	}
}

function createLinkedSignal(signal: AbortSignal, timeoutMs: number): AbortSignal {
	const timeoutSignal = AbortSignal.timeout(timeoutMs);
	return AbortSignal.any([signal, timeoutSignal]);
}

function isAbortError(error: unknown): boolean {
	return error instanceof DOMException && (error.name === 'AbortError' || error.name === 'TimeoutError');
}
