import sanitizeHtml from 'sanitize-html';
import type { MediaSourceConfig } from '../media/config';
import { mapMediaUrlToSameOrigin } from '../media/mapper';

const unsafe = /[\u0000-\u0020\u007f\\]|%(?:0[0-9a-f]|1[0-9a-f]|7f|5c)/i;
const pdfPath = /^\/media\/([A-Za-z0-9_-]+)\/([A-Za-z0-9_.~-]+\.pdf)$/i;

// PDFs remain hrefs on the existing public document origin. They never enter the image proxy.
export function publicDocumentHref(path: string, media: MediaSourceConfig): string | null {
	if (unsafe.test(path) || !path.startsWith('/media/')) return null;
	const url = new URL(path, 'https://sgf.dev');
	const match = pdfPath.exec(url.pathname);
	return match ? `${media.publicSourceOrigin}/${match[1]}/${match[2]}${url.search}${url.hash}` : null;
}

export function safePageHref(raw: string, media: MediaSourceConfig): string | null {
	if (!raw || unsafe.test(raw) || raw.startsWith('//')) return null;
	const document = publicDocumentHref(raw, media);
	if (document) return document;
	if (raw.startsWith('/') || raw.startsWith('#')) {
		// Reject escaped protocol-relative paths too.
		try {
			const decoded = decodeURIComponent(raw);
			if (decoded.startsWith('//') || unsafe.test(decoded)) return null;
			const url = new URL(raw, 'https://sgf.dev');
			if (url.origin !== 'https://sgf.dev') return null;
			return raw;
		} catch { return null; }
	}
	try {
		const url = new URL(raw);
		if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
		if (url.origin === media.cmsInternalOrigin && url.pathname.startsWith('/media/')) {
			return publicDocumentHref(`${url.pathname}${url.search}${url.hash}`, media) ?? mapMediaUrlToSameOrigin(raw, media);
		}
		return url.href;
	} catch { return null; }
}

export function sanitizePageHtml(html: string, media: MediaSourceConfig): string {
	return sanitizeHtml(html, {
		allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'blockquote',
			'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'code', 'hr', 'a', 'img', 'figure', 'figcaption',
			'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td'],
		allowedAttributes: { a: ['href', 'title', 'target', 'rel'], img: ['src', 'alt', 'loading'], th: ['scope'] },
		allowedSchemes: ['http', 'https'],
		allowProtocolRelative: false,
		transformTags: {
			a: (_tag, attrs) => {
				const href = safePageHref(attrs.href ?? '', media);
				return { tagName: 'a', attribs: href ? { href, ...(attrs.title ? { title: attrs.title } : {}),
					...(attrs.target === '_blank' ? { target: '_blank', rel: 'noopener noreferrer' } : {}) } : {} };
			},
			img: (_tag, attrs): sanitizeHtml.Tag => {
				const src = mapMediaUrlToSameOrigin(attrs.src, media);
				return { tagName: 'img', attribs: src ? { src, alt: attrs.alt ?? '', loading: 'lazy' } : {} };
			}
		},
		exclusiveFilter: frame => frame.tag === 'img' && !frame.attribs.src
	});
}
