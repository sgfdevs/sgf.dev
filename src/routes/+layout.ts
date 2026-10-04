import { PUBLIC_SEARCH_INDEXING_ENABLED, PUBLIC_SITE_ORIGIN } from '$app/env/public';
import type { LayoutLoad } from './$types';

const fallbackOrigin = 'https://www.sgf.dev';

function siteOrigin(value: string | undefined) {
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

export const load: LayoutLoad = ({ url }) => {
	const origin = siteOrigin(PUBLIC_SITE_ORIGIN);
	return {
		canonicalUrl: new URL(url.pathname || '/', origin).href,
		ogImageUrl: new URL('/images/og.jpg', origin).href,
		pageTitle: 'Springfield Devs',
		searchIndexingEnabled: PUBLIC_SEARCH_INDEXING_ENABLED === true
	};
};
