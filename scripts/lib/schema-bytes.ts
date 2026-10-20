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
