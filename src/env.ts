import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	CMS_INTERNAL_ORIGIN: {
		description: 'Private origin for the local or deployed SGF CMS API. Required only when server code calls the CMS.',
		schema: (value) => (value ? value : undefined)
	},
	CMS_DELIVERY_API_KEY: {
		description: 'Server-only native Umbraco Delivery API key matching Umbraco:CMS:DeliveryApi:ApiKey. No default.',
		schema: (value) => (value ? value : undefined)
	},
	CMS_MEMBER_BRIDGE_SECRET: {
		description: 'Server-only member bridge secret matching SGFDevs:MemberBridge:Secret. No default.',
		schema: (value) => (value ? value : undefined)
	},
	CMS_MEMBER_COOKIE_NAME: {
		description: 'Server-only member application cookie name. Match the CMS if its default is customized.',
		schema: (value) => value || '.AspNetCore.Identity.Application'
	},
	MEDIA_PUBLIC_URL: {
		description: 'Browser-accessible media base URL. Defaults to https://media.sgf.dev/. Use the local CMS /media/ URL for local development.',
		schema: (value) => (value ? value : undefined)
	},
	PUBLIC_SITE_ORIGIN: {
		description: 'Public origin used for canonical and Open Graph URLs. Defaults to https://www.sgf.dev.',
		public: true,
		schema: (value) => {
			const origin = value || 'https://www.sgf.dev';
			const url = new URL(origin);
			if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
				throw new Error('PUBLIC_SITE_ORIGIN must be an http(s) origin without credentials');
			}
			if (url.pathname !== '/' || url.search || url.hash) {
				throw new Error('PUBLIC_SITE_ORIGIN must not include a path, query, or hash');
			}
			return url.origin;
		}
	},
	ANALYTICS_ENABLED: {
		description: 'Private runtime flag. Set to true to load the Plausible tracker. Defaults to false.',
		schema: (value) => value === 'true'
	},
	SEARCH_INDEXING_ENABLED: {
		description: 'Private runtime flag. Set to true only on production sites that should be indexed. Defaults to false.',
		schema: (value) => value === 'true'
	}
});
