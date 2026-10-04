import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { writeFileAtomically } from './lib/atomic-write';
import { canonicalOpenApiSnapshotText } from './lib/schema-bytes';

export const sgfPublicSchemaOutputPath = resolve('openapi/sgf-public-v1.openapi.json');
export const sgfPublicSchemaPath = '/umbraco/openapi/sgf-public-v1.json';

export type FetchSgfApiSchemaOptions = {
	schemaOrigin?: string;
	outputPath?: string;
	fetchImpl?: typeof fetch;
};

export async function fetchSgfApiSchema({
	schemaOrigin = process.env.SGF_CMS_SCHEMA_ORIGIN,
	outputPath = sgfPublicSchemaOutputPath,
	fetchImpl = fetch
}: FetchSgfApiSchemaOptions = {}): Promise<void> {
	if (!schemaOrigin) {
		throw new Error('Set SGF_CMS_SCHEMA_ORIGIN to a local backend origin, for example http://127.0.0.1:5099.');
	}

	const origin = parseLocalSchemaOrigin(schemaOrigin);
	const schemaUrl = new URL(sgfPublicSchemaPath, origin);
	const response = await fetchImpl(schemaUrl, {
		credentials: 'omit',
		redirect: 'error'
	});

	if (!response.ok) {
		throw new Error(`Schema fetch failed: ${response.status} ${response.statusText}`);
	}

	const canonicalText = canonicalOpenApiSnapshotText(await response.text());
	await writeFileAtomically(outputPath, canonicalText);
}

export function parseLocalSchemaOrigin(input: string): string {
	if (input.startsWith('//')) {
		throw new Error('SGF_CMS_SCHEMA_ORIGIN must include http:// or https://.');
	}

	const url = new URL(input);
	if (url.protocol !== 'http:' && url.protocol !== 'https:') {
		throw new Error('SGF_CMS_SCHEMA_ORIGIN must use http or https.');
	}
	if (url.username || url.password) {
		throw new Error('SGF_CMS_SCHEMA_ORIGIN must not include credentials.');
	}
	if (url.pathname !== '/' || url.search || url.hash) {
		throw new Error('SGF_CMS_SCHEMA_ORIGIN must be an origin only, with no path, query, or hash.');
	}
	if (!isLocalHost(url.hostname)) {
		throw new Error('SGF_CMS_SCHEMA_ORIGIN must point at localhost, 127.0.0.1, or ::1.');
	}

	return url.origin;
}

function isLocalHost(hostname: string): boolean {
	return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname === '::1';
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
	await fetchSgfApiSchema();
}
