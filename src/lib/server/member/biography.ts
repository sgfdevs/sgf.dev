import sanitizeHtml from 'sanitize-html';
import { safeMemberHttpUrl } from './links';

// Only this server-sanitized string is passed to the profile's deliberate @html sink.
export function sanitizeMemberBiography(html: string | null): string {
	return sanitizeHtml(html ?? '', {
		allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'blockquote', 'h2', 'h3', 'h4', 'pre', 'code', 'hr', 'a'],
		allowedAttributes: { a: ['href', 'title', 'target', 'rel'] },
		allowedSchemes: ['http', 'https'],
		allowProtocolRelative: false,
		transformTags: {
			a: (_tag, attrs) => {
				const href = safeMemberHttpUrl(attrs.href ?? null);
				return {
					tagName: 'a',
					attribs: href
						? { href, ...(attrs.title ? { title: attrs.title } : {}), target: '_blank', rel: 'noopener noreferrer' }
						: {}
				};
			}
		}
	});
}
