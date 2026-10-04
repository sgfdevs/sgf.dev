import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { load } from '../../src/routes/+page';
import type { PageData, PageServerData } from '../../src/routes/$types';

const serverData = {
	home: {
		nextDevNight: null,
		directory: { totalMembers: 3, dailyMembers: [] },
		sponsors: []
	}
} satisfies PageServerData;

describe('home page universal load', () => {
	it('forwards server-loaded home data into PageData', async () => {
		const loadResult = await load({ data: serverData } as unknown as Parameters<typeof load>[0]);
		assert.ok(loadResult);

		const routeData = loadResult as { status: string; home: PageServerData['home'] };
		const pageData: PageData = {
			pageTitle: 'Springfield Devs',
			canonicalUrl: 'https://www.sgf.dev/',
			ogImageUrl: 'https://www.sgf.dev/images/og.jpg',
			searchIndexingEnabled: true,
			...routeData
		};

		assert.equal(pageData.status, 'Shared site shell layer only. Page content comes in later rewrite layers.');
		assert.equal(pageData.home.directory.totalMembers, 3);
		assert.equal(pageData.home, serverData.home);
	});
});
