import { ANALYTICS_ENABLED, SEARCH_INDEXING_ENABLED } from '$app/env/private';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => ({
	member: locals.member,
	analyticsEnabled: ANALYTICS_ENABLED,
	searchIndexingEnabled: SEARCH_INDEXING_ENABLED
});
