import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createSgfApiClientForOrigin, isPublicGroupSlug } from '../../src/lib/server/api/factory';
import { loadGroups, GroupLoadError } from '../../src/lib/server/groups/load';
import { mapGroup, GroupDataError } from '../../src/lib/server/groups/mapper';
import { groupFixture, media } from './fixture';
const json = (value: unknown) => new Response(JSON.stringify(value), { headers: { 'Content-Type': 'application/json' } });
const options = { cmsInternalOrigin: media.cmsInternalOrigin, mediaConfig: media };

test('real exported contract adds only groups and generated DTOs, not Delivery member pickers', async () => {
	const raw = await readFile('openapi/sgf-public-v1.openapi.json');
	assert.equal(createHash('sha256').update(raw).digest('hex'), '3e074e950bf1243ee47ce724a214753e60f26c7e23363d4e662f55c26c17f416');
	const schema = JSON.parse(raw.toString());
	assert.equal(schema.paths['/api/v1/public/groups'].get.operationId, 'PublicGroups_List');
	assert.equal(schema.paths['/api/v1/public/groups/{slug}'].get.operationId, 'PublicGroups_Get');
	for (const dto of ['PublicGroupDto', 'PublicGroupLeaderDto', 'PublicGroupSkillDto', 'PublicGroupPresentationDto'])
		assert.ok(!Object.keys(schema.components.schemas[dto].properties).some(k => /id$|key|properties|email|password/i.test(k)));
});

test('group paths snapshot slug once, preserve case, omit credentials and reject escapes', async () => {
	let calls = 0;
	const api = createSgfApiClientForOrigin(async req => {
		calls++;
		assert.equal(req.url, media.cmsInternalOrigin + '/api/v1/public/groups/Rust-SGF');
		assert.equal(req.credentials, 'omit'); assert.equal(req.redirect, 'error'); assert.equal(req.method, 'GET');
		assert.ok(!req.headers.has('cookie') && !req.headers.has('authorization'));
		return json(groupFixture());
	}, media.cmsInternalOrigin);
	let reads = 0;
	await api.GET('/api/v1/public/groups/{slug}', { params: { path: { get slug() { reads++; return reads === 1 ? 'Rust-SGF' : '../escape'; } } } });
	assert.equal(reads, 1);
	for (const slug of ['', '..', '../x', 'a/b', 'a\\b', '%41', 'a?x', 'a#x', '-a', 'é', 'a'.repeat(201)]) {
		assert.equal(isPublicGroupSlug(slug), false);
		assert.throws(() => api.GET('/api/v1/public/groups/{slug}', { params: { path: { slug } } }));
	}
	for (const extra of [{ baseUrl: 'https://evil.test' }, { fetch: async () => json({}) }, { headers: { Cookie: 'private' } }, { headers: { Authorization: 'private' } }])
		assert.throws(() => api.GET('/api/v1/public/groups/{slug}', { params: { path: { slug: 'Rust-SGF' } }, ...extra }));
	assert.equal(calls, 1);
});

test('explicit mapping keeps dates/order/case, safe leaders, skills and sanitized HTML without private fields', async () => {
	const source = { ...groupFixture(), id: 'private-id', key: 'private-key', properties: { leaders: ['private-picker'] },
		aboutHtml: '<p>Text <a href="https://example.test">good</a><script>bad()</script><iframe src="https://evil.test"></iframe><img src="/media/synthetic/group.jpg" onerror="bad()"></p>' };
	const mapped = mapGroup(source, media);
	assert.equal(mapped.name, source.name); assert.equal(mapped.path, '/groups/Rust-SGF/');
	assert.equal(mapped.image, '/media/synthetic/group.jpg');
	assert.equal(mapped.establishedText, source.establishedText);
	assert.equal(mapped.skills[0].url, '/directory/?skills=11111111-2222-3333-4444-555555555555');
	assert.equal(mapped.leaders[0].path, '/member/Jane');
	assert.equal(mapped.leaders[0].listLabel, 'Jane E.');
	assert.equal(mapped.upcomingPresentations[0].startsAtLocal, '2026-10-07T18:30:00');
	assert.equal(mapped.socials.length, 1);
	for (const marker of ['private-', 'iframe', 'script', 'bad()', 'onerror']) assert.ok(!JSON.stringify(mapped).includes(marker));
	assert.throws(() => mapGroup({ ...source, leaders: [{ ...source.leaders![0], profilePath: '//evil.test' }] }, media), GroupDataError);
	const list = await loadGroups({ ...options, fetch: async () => json([groupFixture(), groupFixture('A synthetic group', '/groups/a-group/')]) });
	assert.deepEqual(list.groups.map(g => g.name), ['Z synthetic group', 'A synthetic group']);
	assert.equal((await loadGroups({ ...options, fetch: async () => json(groupFixture('Springfield Devs', '/groups/springfield-devs/')) }, 'springfield-devs')).group?.name, 'Springfield Devs');
});

test('missing/protected group is404, malformed or upstream failures502 and configuration/timeout503, no successful fallback', async () => {
	await assert.rejects(loadGroups({ ...options, fetch: async () => { assert.fail('invalid slug fetched'); } }, '../private'), e => e instanceof GroupLoadError && e.status === 404);
	for (const status of [404, 500, 302]) await assert.rejects(loadGroups({ ...options, fetch: async () => new Response('private text', { status }) }, 'missing'),
		e => e instanceof GroupLoadError && e.status === (status === 404 ? 404 : 502) && !e.message.includes('private'));
	for (const fetch of [async () => json({}), async () => new Response('not JSON', { headers: { 'Content-Type': 'application/json' } }), async () => { throw new Error('private exception'); }])
		await assert.rejects(loadGroups({ ...options, fetch }, 'missing'), e => e instanceof GroupLoadError && e.status === 502 && !e.message.includes('private'));
	await assert.rejects(loadGroups({ ...options, cmsInternalOrigin: undefined, fetch: async () => { assert.fail('not configured'); } }), e => e instanceof GroupLoadError && e.status === 503);
	await assert.rejects(loadGroups({ ...options, timeoutMs: 1, fetch: async req => { await new Promise(r => setTimeout(r, 10)); req.signal.throwIfAborted(); return json([]); } }), e => e instanceof GroupLoadError && e.status === 503);
});
