import { PUBLIC_SEARCH_INDEXING_ENABLED, PUBLIC_SITE_ORIGIN } from '$app/env/public';
import { canonicalUrlForPathname, siteOrigin } from '../lib/shell/canonical-url';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ url }) => {
	const origin = siteOrigin(PUBLIC_SITE_ORIGIN);
	return {
		canonicalUrl: canonicalUrlForPathname(origin, url.pathname),
		ogImageUrl: new URL('/images/og.jpg', origin).href,
		pageTitle: 'Springfield Devs',
		searchIndexingEnabled: PUBLIC_SEARCH_INDEXING_ENABLED === true
	};
};
