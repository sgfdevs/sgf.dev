import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import type { MediaSourceConfig } from '../media/config';
import { mapMediaUrlToSameOrigin } from '../media/mapper';
import { sanitizePageHtml } from '../pages/html';
import { safeMemberHttpUrl } from '../member/links';
import { isCompanyPath } from './paths';

export class CompanyDataError extends Error {}
export class CompanyNotFoundError extends Error {}
function record(value: unknown): Record<string, unknown> {
	if (!value || typeof value !== 'object' || Array.isArray(value)) throw new CompanyDataError();
	return value as Record<string, unknown>;
}
function text(value: unknown, max = 131072): string {
	if (typeof value !== 'string' || value.length > max) throw new CompanyDataError();
	return value;
}
function optional(value: unknown): string | null {
	return value == null ? null : text(value, 2000).trim() || null;
}
function image(value: unknown, media: MediaSourceConfig): string | null {
	if (value == null) return null;
	if (!Array.isArray(value) || value.length > 1) throw new CompanyDataError();
	return value.length ? mapMediaUrlToSameOrigin(text(record(value[0]).url, 2000), media) : null;
}

// Parse only iframe src, then rebuild a trusted URL. Never return embed HTML or attributes.
export function trustedCompanyVideo(value: unknown): string | null {
	if (value == null || value === '') return null;
	const raw = text(value, 20000);
	let source: string | undefined;
	sanitizeHtml(raw, { allowedTags: ['iframe'], allowedAttributes: { iframe: ['src'] },
		transformTags: { iframe: (tagName, attrs) => { source ??= attrs.src; return { tagName, attribs: {} }; } } });
	if (!source) return null;
	try {
		const url = new URL(source);
		if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
		if (['www.youtube.com', 'www.youtube-nocookie.com'].includes(url.hostname) && /^\/embed\/[a-zA-Z0-9_-]{11}$/.test(url.pathname))
			return 'https://www.youtube-nocookie.com' + url.pathname;
		if (url.hostname === 'player.vimeo.com' && /^\/video\/[0-9]{1,12}$/.test(url.pathname))
			return 'https://player.vimeo.com' + url.pathname;
	} catch { /* Invalid legacy embeds remain unavailable. */ }
	return null;
}

export function mapDeliveryCompany(value: unknown, requestedPath: string, media: MediaSourceConfig) {
	const company = record(value);
	if (text(company.contentType, 200) !== 'company') throw new CompanyNotFoundError();
	const route = text(record(company.route).path, 220);
	const path = route.endsWith('/') ? route : route + '/';
	if (!isCompanyPath(path) || path.toLowerCase() !== requestedPath.toLowerCase()) throw new CompanyDataError();
	const name = text(company.name, 2000).trim();
	if (!name) throw new CompanyDataError();
	const p = record(company.properties);
	const headline = optional(p.headline);
	const logo = image(p.image, media);
	const featuredImage = image(p.featuredImage, media);
	const websiteUrl = safeMemberHttpUrl(optional(p.websiteUrl));
	const socialSources: [string, unknown][] = [
		['Website', p.websiteUrl], ['Twitter', p.twitterUrl], ['LinkedIn', p.linkedInUrl],
		['Facebook', p.facebookUrl], ['Instagram', p.instagramUrl]
	];
	if (p.isFoundingSponsor != null && typeof p.isFoundingSponsor !== 'boolean') throw new CompanyDataError();
	const skills = p.skillTags ?? [];
	if (!Array.isArray(skills) || skills.length > 100) throw new CompanyDataError();
	return {
		path, name, headline, title: 'Springfield Devs - ' + name, description: headline, ogImage: featuredImage ?? logo,
		image: logo, featuredImage, video: trustedCompanyVideo(p.featuredEmbed), location: optional(p.location),
		aboutHtml: sanitizePageHtml(marked.parse(p.aboutText == null ? '' : text(p.aboutText), { async: false }), media),
		websiteUrl, isFoundingSponsor: p.isFoundingSponsor === true,
		socials: socialSources.flatMap(([label, raw]) => {
			const url = safeMemberHttpUrl(optional(raw)); return url ? [{ label, url }] : [];
		}),
		skills: skills.map(value => {
			const skill = record(value);
			const term = text(skill.directoryFilterValue, 36);
			if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(term)) throw new CompanyDataError();
			return { name: text(skill.name, 2000), url: '/directory/?skills=' + encodeURIComponent(term) };
		})
	};
}
