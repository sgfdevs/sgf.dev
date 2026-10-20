import type { MediaSourceConfig } from './config';

export const STATIC_MEDIA_PASSTHROUGH = '/images/pipey.jpg';
const unsafe = /[\u0000-\u0020\u007f\\\\]|%(?:0[0-9a-f]|1[0-9a-f]|2e|2f|5c|7f)/i;

// Public CDN paths omit /media/. Native CMS paths include it.
export function publicMediaHref(input: string | null | undefined, config: MediaSourceConfig): string | null {
	if (!input || unsafe.test(input) || input.startsWith('//') || /(?:^|\/)\.\.?(?:\/|$)/.test(input)) return null;
	try {
		const base = new URL(config.publicMediaUrl);
		const url = new URL(input, 'https://sgf.dev');
		if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
		if (url.origin === base.origin && url.pathname.startsWith(base.pathname)) return url.href;
		if (input.startsWith('/media/') || (url.origin === config.cmsInternalOrigin && url.pathname.startsWith('/media/'))) {
			const result = new URL(url.pathname.slice('/media/'.length) + url.search + url.hash, base);
			return result.origin === base.origin && result.pathname.startsWith(base.pathname) ? result.href : null;
		}
	} catch { /* Invalid URLs are omitted from rendered content. */ }
	return null;
}

export function mapMediaUrlToPublic(input: string | null | undefined, config: MediaSourceConfig): string | null {
	if (input === STATIC_MEDIA_PASSTHROUGH) return input;
	const href = publicMediaHref(input, config);
	return href && /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(new URL(href).pathname) ? href : null;
}
