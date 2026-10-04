export function safeReturnTo(value: unknown): string {
	if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') ||
		/[\\\x00-\x1f\x7f]/.test(value)) return '/account';
	try {
		const decoded = decodeURIComponent(value);
		if (decoded.startsWith('//') || /[\\\x00-\x1f\x7f]/.test(decoded)) return '/account';
		const url = new URL(value, 'https://frontend.invalid');
		if (url.origin !== 'https://frontend.invalid' || ['/login', '/logout'].includes(url.pathname)) return '/account';
		return url.pathname + url.search + url.hash;
	} catch {
		return '/account';
	}
}
