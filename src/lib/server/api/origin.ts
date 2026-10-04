export function parseCmsInternalOrigin(input: string | undefined): string {
	if (!input) {
		throw new Error('CMS_INTERNAL_ORIGIN is required before calling the SGF CMS API.');
	}
	if (input.startsWith('//')) {
		throw new Error('CMS_INTERNAL_ORIGIN must include http:// or https://.');
	}

	const url = new URL(input);
	if (url.protocol !== 'http:' && url.protocol !== 'https:') {
		throw new Error('CMS_INTERNAL_ORIGIN must use http or https.');
	}
	if (url.username || url.password) {
		throw new Error('CMS_INTERNAL_ORIGIN must not include credentials.');
	}
	if (url.pathname !== '/' || url.search || url.hash) {
		throw new Error('CMS_INTERNAL_ORIGIN must be an origin only, with no path, query, or hash.');
	}

	return url.origin;
}
