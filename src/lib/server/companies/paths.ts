export function isCompanySlug(value: unknown): value is string {
	return typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,199}$/.test(value);
}
export function isCompanyPath(value: unknown): value is string {
	return typeof value === 'string' && /^\/companies\/[^/]+\/$/.test(value) && isCompanySlug(value.split('/')[2]);
}
