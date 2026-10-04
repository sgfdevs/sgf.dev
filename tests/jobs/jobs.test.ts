import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createSgfApiClientForOrigin } from '../../src/lib/server/api/factory';
import { mapJobs, mapJob, JobDataError } from '../../src/lib/server/jobs/mapper';
import { loadJobs, loadJob, JobLoadError } from '../../src/lib/server/jobs/load';
import { jobFixture, jobsFixture, media } from './fixture';
const json = (value: unknown) => new Response(JSON.stringify(value), { headers: { 'Content-Type': 'application/json' } });
const options = { cmsInternalOrigin: media.cmsInternalOrigin, mediaConfig: media };

test('real exported jobs contract and fixed anonymous request paths', async () => {
	const raw = await readFile('openapi/sgf-public-v1.openapi.json');
	assert.equal(createHash('sha256').update(raw).digest('hex'), '1e68666e8d424d88ac4469f281aa937c6b26dcf35cd722633054e815184fde2b');
	const schema = JSON.parse(raw.toString());
	assert.equal(schema.paths['/api/v1/public/jobs'].get.operationId, 'PublicJobs_List');
	assert.equal(schema.paths['/api/v1/public/jobs/{company}/{job}'].get.operationId, 'PublicJobs_Get');
	assert.deepEqual(Object.keys(schema.components.schemas.PublicJobDto.properties).sort(),
		['applyUrl', 'companyName', 'compensation', 'descriptionHtml', 'employmentType', 'location', 'name', 'path', 'posted', 'skills']);
	let calls = 0;
	const api = createSgfApiClientForOrigin(async request => {
		calls++;
		assert.equal(request.url, media.cmsInternalOrigin + '/api/v1/public/jobs/element-11/mid-level-engineer');
		assert.equal(request.method, 'GET'); assert.equal(request.credentials, 'omit'); assert.equal(request.redirect, 'error');
		assert.equal([...request.headers.keys()].some(k => ['cookie', 'authorization', 'x-api-key', 'api-key'].includes(k)), false);
		return json(jobFixture());
	}, media.cmsInternalOrigin);
	await api.GET('/api/v1/public/jobs/{company}/{job}', { params: { path: { company: 'element-11', job: 'mid-level-engineer' } } });
	for (const bad of ['../private', 'a/b', 'a%2fb', 'a?preview=true'])
		assert.throws(() => api.GET('/api/v1/public/jobs/{company}/{job}', { params: { path: { company: 'element-11', job: bad } } }));
	for (const path of ['/api/v1/public/jobs/extra', '/api/v1/public/jobs?preview=true', '/api/v1/public/jobs/']) assert.throws(() => api.GET(path as never));
	for (const extra of [{ baseUrl: 'https://evil.test' }, { fetch: async () => json({}) }, { headers: { Cookie: 'private' } }])
		assert.throws(() => api.GET('/api/v1/public/jobs', extra));
	assert.equal(calls, 1);
});

test('mapper keeps rows, order, parent labels and dates but strips private fields and unsafe HTML/apply URLs', () => {
	assert.deepEqual(mapJobs(jobsFixture()).rows.map(j => j.name), ['Z synthetic engineer', 'A synthetic designer']);
	assert.equal(mapJobs(jobsFixture()).rows[0].posted, 'January 2, 2001');
	assert.equal(mapJobs(Array.from({ length: 1100 }, jobFixture)).rows.length, 1100);
	const source = { ...jobFixture(), email: 'private-email', skillTags: ['private-picker'], id: 'private-id',
		descriptionHtml: '<p>Public<script>private()</script><iframe src="https://evil.test"></iframe><a href="javascript:private()">bad</a><img src="https://evil.test/photo"></p>' };
	const view = mapJob(source, source.path!, media);
	assert.equal(view.companyName, 'Synthetic company'); assert.deepEqual(view.skills, ['C#', 'TypeScript', 'C#']);
	assert.equal(view.applyUrl, 'https://example.test/apply');
	for (const marker of ['private-', '<script', 'iframe', 'evil.test', 'javascript:']) assert.ok(!JSON.stringify(view).includes(marker));
	for (const applyUrl of ['//evil.test', 'javascript:private()', 'https://user:password@example.test', '/%2fescape', media.cmsInternalOrigin + '/apply'])
		assert.equal(mapJob({ ...jobFixture(), applyUrl }, source.path!, media).applyUrl, null);
	assert.equal(mapJob({ ...jobFixture(), applyUrl: '/apply/' }, source.path!, media).applyUrl, '/apply/');
	assert.throws(() => mapJob(source, '/companies/other/job/', media), JobDataError);
	assert.throws(() => mapJobs([{ ...jobFixture(), path: '/companies/element-11/' }]), JobDataError);
});

test('loaders map missing/protected/malformed/upstream cases to controlled errors', async () => {
	assert.equal((await loadJobs({ ...options, fetch: async () => json(jobsFixture()) })).rows.length, 2);
	assert.equal((await loadJob({ ...options, fetch: async () => json(jobFixture()) }, 'element-11', 'mid-level-engineer')).name, 'Z synthetic engineer');
	for (const status of [401, 403, 404, 500, 302])
		await assert.rejects(loadJob({ ...options, fetch: async () => new Response('private-body', { status }) }, 'element-11', 'mid-level-engineer'),
			e => e instanceof JobLoadError && e.status === ([401, 403, 404].includes(status) ? 404 : 502) && !e.message.includes('private'));
	await assert.rejects(loadJobs({ ...options, fetch: async () => json({}) }), e => e instanceof JobLoadError && e.status === 502);
	await assert.rejects(loadJobs({ ...options, cmsInternalOrigin: undefined, fetch: async () => { assert.fail(); } }), e => e instanceof JobLoadError && e.status === 503);
	await assert.rejects(loadJob({ ...options, fetch: async () => { assert.fail(); } }, 'element-11', '../bad'), e => e instanceof JobLoadError && e.status === 404);
});
