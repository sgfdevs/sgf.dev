import createClient from 'openapi-fetch';
import type { paths } from './generated/deliveryApiSchema';
import { parseCmsInternalOrigin } from '../api/origin';
import { isContentPagePath, type ContentPagePath } from './paths';

const itemPath = '/umbraco/delivery/api/v2/content/item/{path}';
const itemPrefix = '/umbraco/delivery/api/v2/content/item/';
const fields = 'properties[blocks,titleTag,description,OgImage]';

// No general GET method or caller-supplied headers/options leave this wrapper.
export function createDeliveryPageClient(origin: string | undefined, apiKey: string | undefined,
	fetchImpl: (request: Request) => Promise<Response> = globalThis.fetch) {
	const baseUrl = parseCmsInternalOrigin(origin);
	if (!apiKey?.trim() || /[^\x21-\x7e]/.test(apiKey)) throw new Error('CMS_DELIVERY_API_KEY is required.');
	const client = createClient<paths>({
		baseUrl,
		credentials: 'omit',
		redirect: 'error',
		headers: { 'Api-Key': apiKey, Accept: 'application/json' },
		// The native endpoint takes a catch-all path. Preserve the slashes of only these fixed destinations.
		pathSerializer: (url, params) => {
			if (!isContentPagePath(params.path)) throw new Error('Unknown content destination.');
			return url.replace('{path}', params.path.slice(1));
		},
		fetch: async (request) => {
			const url = new URL(request.url);
			const destination = '/' + url.pathname.slice(itemPrefix.length);
			if (url.origin !== baseUrl || !url.pathname.startsWith(itemPrefix) || !isContentPagePath(destination)
				|| url.searchParams.get('fields') !== fields || [...url.searchParams.keys()].length !== 1
				|| request.method !== 'GET' || request.credentials !== 'omit' || request.redirect !== 'error'
				|| [...request.headers.keys()].some(key => !['accept', 'api-key'].includes(key))) {
				throw new Error('Delivery request escaped the fixed page contract.');
			}
			const response = await fetchImpl(request);
			if (!response.ok) {
				await response.body?.cancel();
				return new Response(null, { status: response.status });
			}
			// Bound the generated client's JSON parsing as well as its request duration.
			if (!response.headers.get('content-type')?.toLowerCase().includes('application/json')) throw new Error('Expected JSON.');
			const reader = response.body?.getReader();
			if (!reader) throw new Error('Missing Delivery body.');
			const chunks: Uint8Array[] = [];
			let bytes = 0;
			try {
				while (true) {
					const { value, done } = await reader.read();
					if (done) break;
					bytes += value.length;
					if (bytes > 1_048_576) throw new Error('Delivery body too large.');
					chunks.push(value);
				}
			} finally {
				await reader.cancel();
				reader.releaseLock();
			}
			return new Response(new Blob(chunks as BlobPart[]), { status: response.status, headers: { 'Content-Type': 'application/json' } });
		}
	});
	return {
		getPage(path: ContentPagePath, signal: AbortSignal) {
			if (!isContentPagePath(path)) throw new Error('Unknown content destination.');
			return client.GET(itemPath, { params: { path: { path }, query: { fields } }, signal });
		}
	};
}
