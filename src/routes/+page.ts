import type { PageLoad } from './$types';

export const load: PageLoad = ({ data }) => ({
	...data,
	status: 'Shared site shell layer only. Page content comes in later rewrite layers.'
});
