import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.member) redirect(303, '/login?returnTo=%2Faccount');
	return { accountMember: locals.member, profileHref: '/member/' + encodeURIComponent(locals.member.username) };
};
