import { resolve } from 'node:path';
import { writeFileAtomically } from './lib/atomic-write';

const schemaOrigin = process.env.SGF_CMS_SCHEMA_ORIGIN;
const outputPath = resolve('openapi/sgf-public-v1.openapi.json');
const schemaPath = '/umbraco/openapi/sgf-public-v1.json';

if (!schemaOrigin) {
	throw new Error('Set SGF_CMS_SCHEMA_ORIGIN to a local backend origin, for example http://127.0.0.1:5099.');
}

const origin = parseLocalSchemaOrigin(schemaOrigin);
const schemaUrl = new URL(schemaPath, origin);
const response = await fetch(schemaUrl, {
	credentials: 'omit',
	redirect: 'error'
});

if (!response.ok) {
	throw new Error(`Schema fetch failed: ${response.status} ${response.statusText}`);
}

const text = await response.text();
JSON.parse(text);
await writeFileAtomically(outputPath, `${text.trimEnd()}\n`);

function parseLocalSchemaOrigin(input: string): string {
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
