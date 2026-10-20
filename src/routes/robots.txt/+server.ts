import { SEARCH_INDEXING_ENABLED } from '$app/env/private';
import { text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => text(
	`User-agent: *\n${SEARCH_INDEXING_ENABLED ? 'Allow: /' : 'Disallow: /'}\n`,
	{ headers: { 'Cache-Control': 'no-store' } }
);
