import { createSgfApiClientForOrigin } from '../../src/lib/server/api/factory';

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

// @ts-expect-error No handwritten or hypothetical home endpoint exists in the committed schema.
await client.GET('/api/home');

// @ts-expect-error Directory search only accepts skills, skip, and take query params.
await client.GET('/api/directory/search', { params: { query: { redirectHost: 'https://evil.example' } } });
