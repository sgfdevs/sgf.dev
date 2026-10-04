import { createHash } from 'node:crypto';

export const SGF_PUBLIC_SCHEMA_RAW_EXPORT_SHA256 = '881f0b2d8e9e78b1290f831386f2e5d9b10de716f4748b66760382f04c2e41dc';
export const SGF_PUBLIC_SCHEMA_CANONICAL_SHA256 = '881f0b2d8e9e78b1290f831386f2e5d9b10de716f4748b66760382f04c2e41dc';

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
