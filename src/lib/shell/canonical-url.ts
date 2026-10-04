const fallbackOrigin = 'https://www.sgf.dev';

export function siteOrigin(value: string | undefined) {
	try {
		const url = new URL(value || fallbackOrigin);
		if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('invalid origin');
		url.pathname = '';
		url.search = '';
		url.hash = '';
		return url.origin;
	} catch {
		return fallbackOrigin;
	}
}

export function canonicalUrlForPathname(validatedOrigin: string, pathname: string | undefined) {
	const canonical = new URL(validatedOrigin);
	canonical.pathname = pathname || '/';
	canonical.search = '';
	canonical.hash = '';
	return canonical.href;
}
