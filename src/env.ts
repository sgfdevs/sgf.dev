import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	CMS_INTERNAL_ORIGIN: {
		description: 'Private origin for the local or deployed SGF CMS API. Required only when server code calls the CMS.',
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
	MEDIA_SOURCE_PUBLIC_ORIGIN: {
		description: 'Private validation origin for public SGF media DTO URLs. Defaults to https://media.sgf.dev.',
		schema: (value) => (value ? value : undefined)
	},
	MEDIA_UPSTREAM_ORIGIN: {
		description: 'Private fixed upstream origin for same-origin SGF media proxy requests. Required before /media/* is fetched.',
		schema: (value) => (value ? value : undefined)
	},
	MEDIA_UPSTREAM_PATH_PREFIX: {
		description: 'Private upstream media namespace fence. Use / only for https://media.sgf.dev; local/CMS/S3 origins need a specific prefix.',
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
	PUBLIC_SEARCH_INDEXING_ENABLED: {
		description: 'Set to true only for production builds that should be indexed. Missing or false emits noindex.',
		public: true,
		schema: (value) => value === 'true'
	}
});
