import { createHash } from 'node:crypto';

export const SGF_PUBLIC_SCHEMA_RAW_EXPORT_SHA256 = 'f9eee0ce6ec1ab9295ddd6eda12f0675c5bbd046efae7f1c23f768f33fde6d89';
export const SGF_PUBLIC_SCHEMA_CANONICAL_SHA256 = 'f9eee0ce6ec1ab9295ddd6eda12f0675c5bbd046efae7f1c23f768f33fde6d89';

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
