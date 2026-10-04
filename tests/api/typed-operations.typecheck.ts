import { createSgfApiClientForOrigin } from '../../src/lib/server/api/factory';
import type { operations } from '../../src/lib/server/api/generated/sgfPublicApiSchema';

const client = createSgfApiClientForOrigin(async () => new Response('[]'), 'http://127.0.0.1:5099');

const skills = await client.GET('/api/tags/skills');
if (skills.data) {
	const firstSkill: string = skills.data[0] ?? '';
	void firstSkill;
}

const filters = await client.GET('/api/directory/filters/skills');
if (filters.data) {
	const firstFilterName: string = filters.data[0]?.name ?? '';
	void firstFilterName;
}

const members = await client.GET('/api/directory/search', {
	params: { query: { skills: 'Svelte', skip: 0, take: 10 } }
});
if (members.data) {
	const firstMemberTags: string[] = members.data[0]?.tags ?? [];
	void firstMemberTags;
	// @ts-expect-error The current backend contract is an array, not a paged object.
	members.data.items;
}

const home = await client.GET('/api/v1/public/home');
if (home.data) {
	const totalMembers: number | string = home.data.directory.totalMembers;
	const firstSponsorFlag: boolean = home.data.sponsors[0]?.isFoundingSponsor ?? false;
	const maybeDevNightName: string | undefined = home.data.nextDevNight?.name;
	void totalMembers;
	void firstSponsorFlag;
	void maybeDevNightName;
}

type PublicHomeSuccess = operations['PublicHome_Get']['responses'][200]['content']['application/json'];
type PublicHomeNotFound = operations['PublicHome_Get']['responses'][404]['content']['application/problem+json'];
const typedHome: PublicHomeSuccess = { directory: { totalMembers: 0, dailyMembers: [] }, sponsors: [] };
const typedProblemTitle: PublicHomeNotFound['title'] = null;
void typedHome;
void typedProblemTitle;

// @ts-expect-error No handwritten or hypothetical home endpoint exists in the committed schema.
await client.GET('/api/home');

// @ts-expect-error Directory search only accepts skills, skip, and take query params.
await client.GET('/api/directory/search', { params: { query: { redirectHost: 'https://evil.example' } } });
