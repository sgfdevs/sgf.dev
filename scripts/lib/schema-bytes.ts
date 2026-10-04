import { createHash } from 'node:crypto';

export const SGF_PUBLIC_SCHEMA_RAW_EXPORT_SHA256 = '3e074e950bf1243ee47ce724a214753e60f26c7e23363d4e662f55c26c17f416';
export const SGF_PUBLIC_SCHEMA_CANONICAL_SHA256 = '3e074e950bf1243ee47ce724a214753e60f26c7e23363d4e662f55c26c17f416';

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
