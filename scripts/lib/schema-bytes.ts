import { createHash } from 'node:crypto';

export const SGF_PUBLIC_SCHEMA_RAW_EXPORT_SHA256 = 'c99de23daaf51441e5b4cc33aba073736482fa3833b7088c42c9738a4d528cba';
export const SGF_PUBLIC_SCHEMA_CANONICAL_SHA256 = 'c99de23daaf51441e5b4cc33aba073736482fa3833b7088c42c9738a4d528cba';

export function normalizeOpenApiSnapshotText(text: string): string {
	return text.replace(/\r\n?/g, '\n').replace(/\n+$/g, '');
}

export function parseOpenApiSnapshotText(text: string): unknown {
	const normalized = normalizeOpenApiSnapshotText(text);
	return JSON.parse(normalized);
}

export function canonicalOpenApiSnapshotText(text: string): string {
	const normalized = normalizeOpenApiSnapshotText(text);
	JSON.parse(normalized);
	return normalized;
}

export function sha256Text(text: string): string {
	return createHash('sha256').update(text, 'utf8').digest('hex');
}
