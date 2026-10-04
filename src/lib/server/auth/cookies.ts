import type { Cookies } from '@sveltejs/kit';

export const DEFAULT_MEMBER_COOKIE = '.AspNetCore.Identity.Application';

export function isMemberCookie(name: string, base: string): boolean {
	return name === base || (name.startsWith(base + 'C') && /^[1-9][0-9]*$/.test(name.slice(base.length + 1)));
}

export function memberCookieHeader(cookies: Cookies, base: string): string {
	return cookies.getAll({ decode: (value) => value })
		.filter(({ name, value }) => isMemberCookie(name, base) && /^[A-Za-z0-9_=-]+$/.test(value))
		.map(({ name, value }) => `${name}=${value}`).join('; ');
}

export function clearMemberCookies(cookies: Cookies, base: string, secure: boolean): void {
	const names = new Set([base, ...cookies.getAll().filter(c => isMemberCookie(c.name, base)).map(c => c.name)]);
	for (const name of names) cookies.delete(name, { path: '/', httpOnly: true, secure, sameSite: 'lax' });
}

// ASP.NET's ChunkingCookieManager uses base=chunks-N and baseC1, baseC2, etc.
// Only relay that cookie family. CMS domains/paths must not follow it to the frontend.
export function relayMemberCookies(headers: Headers, cookies: Cookies, base: string, secure: boolean): void {
	const received = headers.getSetCookie().map(header => {
		const [pair, ...attributes] = header.split(';');
		const equals = pair.indexOf('=');
		const name = pair.slice(0, equals).trim();
		const value = pair.slice(equals + 1).trim();
		if (equals < 1 || !isMemberCookie(name, base) || !/^[A-Za-z0-9_=-]*$/.test(value)) return null;
		const options: Parameters<Cookies['set']>[2] = {
			path: '/', httpOnly: true, secure, sameSite: 'lax', encode: value => value
		};
		for (const attribute of attributes) {
			const [key, ...rest] = attribute.trim().split('=');
			const text = rest.join('=');
			if (key.toLowerCase() === 'expires') {
				const expires = new Date(text);
				if (!Number.isNaN(expires.getTime())) options.expires = expires;
			}
			if (key.toLowerCase() === 'max-age' && /^-?[0-9]+$/.test(text)) options.maxAge = Number(text);
		}
		return { name, value, options };
	}).filter(value => value !== null);
	if (received.some(cookie => cookie.name === base)) {
		const names = new Set(received.map(c => c.name));
		for (const cookie of cookies.getAll()) {
			if (isMemberCookie(cookie.name, base) && !names.has(cookie.name)) {
				cookies.delete(cookie.name, { path: '/', httpOnly: true, secure, sameSite: 'lax' });
			}
		}
	}
	for (const { name, value, options } of received) cookies.set(name, value, options);
}
