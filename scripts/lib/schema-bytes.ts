import { createHash } from 'node:crypto';

export const SGF_PUBLIC_SCHEMA_RAW_EXPORT_SHA256 = 'c1feb27b31f5b112c42498522c38d851253c3a6218761216a03ef8fb6afa6947';
export const SGF_PUBLIC_SCHEMA_CANONICAL_SHA256 = 'c1feb27b31f5b112c42498522c38d851253c3a6218761216a03ef8fb6afa6947';

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
