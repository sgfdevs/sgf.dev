import { marked } from 'marked';
import type { ContentPagePath } from './paths';
import type { MediaSourceConfig } from '../media/config';
import { mapMediaUrlToSameOrigin } from '../media/mapper';
import { publicDocumentHref, sanitizePageHtml } from './html';

export type ContentPageView = {
	path: ContentPagePath;
	name: string;
	title: string;
	description: string | null;
	ogImage: string | null;
	isAbout: boolean;
	blocks: { html: string }[];
	documents: { articles: string; bylaws: string };
};

export class PageDataError extends Error {}
export class PageNotFoundError extends Error {}

type RecordValue = Record<string, unknown>;
function record(value: unknown): RecordValue {
	if (!value || typeof value !== 'object' || Array.isArray(value)) throw new PageDataError();
	return value as RecordValue;
}
function text(value: unknown, max = 131_072): string {
	if (typeof value !== 'string' || value.length > max) throw new PageDataError();
	return value;
}
function optionalText(value: unknown): string | null {
	return value === null || value === undefined ? null : text(value, 2000).trim() || null;
}
function normalizedPath(value: unknown): string {
	return text(value, 200).replace(/\/$/, '');
}

export function mapDeliveryPage(value: unknown, path: ContentPagePath, media: MediaSourceConfig): ContentPageView {
	const page = record(value);
	if (text(page.contentType, 200) !== 'page') throw new PageNotFoundError();
	if (normalizedPath(record(page.route).path) !== path.replace(/\/$/, '')) throw new PageDataError();
	const name = text(page.name, 2000).trim();
	if (!name) throw new PageDataError();
	const properties = record(page.properties);
	const blocks = properties.blocks == null ? [] : record(properties.blocks).items;
	if (!Array.isArray(blocks) || blocks.length > 100) throw new PageDataError();
	return {
		path,
		name,
		title: optionalText(properties.titleTag) ?? `Springfield Devs - ${name}`,
		description: optionalText(properties.description),
		ogImage: mapOgImage(properties.OgImage, media),
		isAbout: path === '/about/',
		blocks: blocks.map(item => {
			const content = record(record(item).content);
			const raw = record(content.properties).content;
			let html: string;
			if (content.contentType === 'markdown') {
				// Umbraco 18.2's Markdown converter returns text in Delivery, not the Razor HTML value.
				html = marked.parse(raw == null ? '' : text(raw), { async: false });
			} else if (content.contentType === 'richTextEditor') {
				// Use Umbraco's converted markup, never raw editor JSON or embeds.
				html = raw == null ? '' : typeof raw === 'string' ? text(raw) : text(record(raw).markup);
				if (raw && typeof raw === 'object') {
					const nested = record(raw).blocks;
					if (!Array.isArray(nested) || nested.length) throw new PageDataError();
				}
			} else throw new PageDataError();
			return { html: sanitizePageHtml(html, media) };
		}),
		documents: {
			articles: publicDocumentHref('/media/kbxmwecj/articles-of-incorporation.pdf', media)!,
			bylaws: publicDocumentHref('/media/wy0hhb5d/bylaws.pdf', media)!
		}
	};
}

function mapOgImage(value: unknown, media: MediaSourceConfig): string | null {
	if (value == null) return null;
	if (!Array.isArray(value) || value.length > 1) throw new PageDataError();
	if (!value.length) return null;
	return mapMediaUrlToSameOrigin(text(record(value[0]).url, 2000), media);
}
