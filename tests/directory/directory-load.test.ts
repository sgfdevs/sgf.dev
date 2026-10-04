import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DirectoryLoadError, loadDirectory, parseDirectorySkillQuery } from '../../src/lib/server/directory/load';

const mediaConfig = {
	publicSourceOrigin: 'https://media.sgf.dev',
	cmsInternalOrigin: 'http://cms.test'
};

function jsonResponse(body: unknown, init: ResponseInit = {}) {
	return new Response(JSON.stringify(body), {
		status: init.status ?? 200,
		headers: { 'content-type': 'application/json', ...init.headers }
	});
}

function directoryFetch(requests: Request[]) {
	return async (request: Request) => {
		requests.push(request);
		const url = new URL(request.url);

		if (url.pathname === '/api/directory/filters/skills') {
			return jsonResponse([
				{ name: 'JavaScript', id: 7, key: '11111111-1111-1111-1111-111111111111', isActive: false },
				{ name: 'C#', id: 8, key: '22222222-2222-2222-2222-222222222222', isActive: true }
			]);
		}

		if (url.pathname === '/api/directory/search' && !url.searchParams.has('skills')) {
			return jsonResponse([
				{
					name: 'Ada Lovelace',
					location: 'Springfield, MO',
					image: '/media/members/ada.jpg?width=500',
					url: '/member/Ada',
					tags: ['Speaker']
				},
				{
					name: 'Grace Hopper',
					location: 'Nixa, MO',
					image: 'https://evil.test/grace.jpg',
					url: '/member/grace',
					tags: []
				}
			]);
		}

		if (url.pathname === '/api/directory/search' && url.searchParams.get('skills') === '7') {
			return jsonResponse([
				{
					name: 'Ada Lovelace',
					location: 'Springfield, MO',
					image: '/media/members/ada.jpg?width=500',
					url: '/member/Ada',
					tags: ['Speaker']
				}
			]);
		}

		return jsonResponse({ detail: 'unexpected request' }, { status: 500 });
	};
}

describe('directory loading', () => {
	it('parses only supported skills query values', () => {
		const params = new URLSearchParams('skills=7,8&skills=JavaScript&reset-token=secret&skills=7');
		assert.deepEqual(parseDirectorySkillQuery(params), ['7', '8', 'JavaScript']);
	});

	it('rejects oversized skill query values before contacting the API', () => {
		const params = new URLSearchParams();
		params.set('skills', 'x'.repeat(129));
		assert.throws(() => parseDirectorySkillQuery(params), (error) => {
			assert.equal(error instanceof DirectoryLoadError, true);
			assert.equal((error as DirectoryLoadError).status, 400);
			return true;
		});
	});

	it('loads the default all-member directory without pagination parameters', async () => {
		const requests: Request[] = [];
		const result = await loadDirectory({
			fetch: directoryFetch(requests),
			cmsInternalOrigin: 'http://cms.test',
			mediaConfig,
			url: new URL('https://www.sgf.dev/directory/?ignored=true')
		});

		assert.equal(result.directory.totalMembers, 2);
		assert.equal(result.directory.visibleMembers, 2);
		assert.equal(result.directory.filters[0]?.active, false);
		assert.equal(result.directory.filters[1]?.active, false);
		assert.equal(result.directory.members[0]?.image, '/media/members/ada.jpg?width=500');
		assert.equal(result.directory.members[1]?.image, '/images/pipey.jpg');
		assert.deepEqual(
			requests.map((request) => new URL(request.url).pathname + new URL(request.url).search),
			['/api/directory/filters/skills', '/api/directory/search']
		);
	});

	it('loads selected skill results while preserving the all-member count', async () => {
		const requests: Request[] = [];
		const result = await loadDirectory({
			fetch: directoryFetch(requests),
			cmsInternalOrigin: 'http://cms.test',
			mediaConfig,
			url: new URL('https://www.sgf.dev/directory/?skills=7&auth=secret&skip=100&take=1')
		});

		assert.equal(result.directory.totalMembers, 2);
		assert.equal(result.directory.visibleMembers, 1);
		assert.deepEqual(result.directory.members.map((member) => member.name), ['Ada Lovelace']);
		assert.equal(result.directory.filters[0]?.active, true);
		assert.equal(result.directory.filters[1]?.active, false);

		const searchUrls = requests
			.map((request) => new URL(request.url))
			.filter((url) => url.pathname === '/api/directory/search');
		assert.equal(searchUrls.length, 2);
		assert.equal(searchUrls[0]?.search, '');
		assert.equal(searchUrls[1]?.searchParams.get('skills'), '7');
		assert.equal(searchUrls[1]?.searchParams.has('skip'), false);
		assert.equal(searchUrls[1]?.searchParams.has('take'), false);
		assert.equal(searchUrls[1]?.searchParams.has('auth'), false);
	});

	it('maps upstream 400s to a public directory query error', async () => {
		await assert.rejects(
			loadDirectory({
				fetch: async (request) => {
					const url = new URL(request.url);
					if (url.pathname === '/api/directory/filters/skills') return jsonResponse([]);
					if (url.pathname === '/api/directory/search' && !url.searchParams.has('skills')) return jsonResponse([]);
					return jsonResponse({ detail: 'do not leak this' }, { status: 400, headers: { 'content-type': 'application/problem+json' } });
				},
				cmsInternalOrigin: 'http://cms.test',
				mediaConfig,
				url: new URL('https://www.sgf.dev/directory/?skills=JavaScript')
			}),
			(error) => {
				assert.equal(error instanceof DirectoryLoadError, true);
				assert.equal((error as DirectoryLoadError).status, 400);
				assert.equal(String((error as Error).message).includes('do not leak'), false);
				return true;
			}
		);
	});
});
