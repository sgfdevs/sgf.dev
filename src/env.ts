import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	CMS_INTERNAL_ORIGIN: {
		description: 'Private origin for the local or deployed SGF CMS API. Required only when server code calls the CMS.',
		schema: (value) => (value ? value : undefined)
	}
});
