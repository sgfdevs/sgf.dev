import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { SGF_PUBLIC_GET_PATHS, createSgfApiClientForOrigin } from '../../src/lib/server/api/factory';
import { mapLeadership, LeadershipDataError } from '../../src/lib/server/leadership/mapper';
import { loadLeadership, LeadershipLoadError } from '../../src/lib/server/leadership/load';
import { leadershipFixture, media } from './fixture';

const json = (value: unknown) => new Response(JSON.stringify(value), { headers: { 'Content-Type': 'application/json' } });
const options = { cmsInternalOrigin: media.cmsInternalOrigin, mediaConfig: media };

test('actual exported schema permits one exact anonymous leadership GET with explicit public fields', async () => {
    const raw = await readFile('openapi/sgf-public-v1.openapi.json');
    assert.equal(createHash('sha256').update(raw).digest('hex'), 'c1feb27b31f5b112c42498522c38d851253c3a6218761216a03ef8fb6afa6947');
    const schema = JSON.parse(raw.toString());
    assert.equal(schema.paths['/api/v1/public/leadership'].get.operationId, 'PublicLeadership_Get');
    assert.deepEqual(Object.keys(schema.components.schemas.PublicLeadershipMemberDto.properties).sort(),
        ['imageUrl', 'name', 'officerBio', 'officerTitle', 'username']);
    assert.deepEqual([...SGF_PUBLIC_GET_PATHS].sort(), Object.keys(schema.paths).sort());
    let calls = 0;
    const api = createSgfApiClientForOrigin(async req => {
        calls++;
        assert.equal(req.url, media.cmsInternalOrigin + '/api/v1/public/leadership');
        assert.equal(req.method, 'GET'); assert.equal(req.credentials, 'omit'); assert.equal(req.redirect, 'error');
        for (const header of ['authorization', 'cookie', 'x-api-key']) assert.equal(req.headers.has(header), false);
        return json(leadershipFixture());
    }, media.cmsInternalOrigin);
    await api.GET('/api/v1/public/leadership');
    for (const path of ['/api/v1/public/leadership/extra', '/api/v1/public/leadership/', '/api/v1/public/leadership?preview=true'])
        assert.throws(() => api.GET(path as never));
    for (const extra of [{ baseUrl: 'https://evil.test' }, { fetch: async () => json({}) }, { headers: { Cookie: 'private' } }])
        assert.throws(() => api.GET('/api/v1/public/leadership', extra));
    assert.equal(calls, 1);
});

test('mapper preserves selection and history order, public names/titles, safe profile links and sanitized bios only', () => {
    const source = leadershipFixture();
    source.officers![0].officerBio = '<p>Public <strong>officer</strong><script>privateScript()</script><img src="https://evil.test/photo" onerror="privateScript()"><a href="javascript:privateScript()">bad</a></p>';
    const unsafeSource = { ...source, properties: { officers: ['private-picker'] }, email: 'private-email', key: 'private-key' };
    const mapped = mapLeadership(unsafeSource, media);
    assert.deepEqual(mapped.officers.map(m => m.name), ['Z synthetic officer', 'A synthetic officer']);
    assert.deepEqual(mapped.boardOfDirectors.map(m => m.name), ['A synthetic officer', 'Z synthetic officer']);
    assert.deepEqual(mapped.history.map(m => m.name), ['Z synthetic officer', 'A synthetic officer', 'Z synthetic officer']);
    assert.equal(mapped.officers[0].path, '/member/Ada123'); assert.equal(mapped.officers[0].officerTitle, 'President');
    assert.equal(mapped.officers[0].image, '/media/synthetic/officer.png');
    assert.match(mapped.officers[0].officerBio, /<strong>officer<\/strong>/);
    assert.equal(mapped.history[1].officerTitle || 'Board Member', 'Board Member');
    assert.ok(mapped.boardOfDirectors.every(m => m.officerBio === '' && m.officerTitle === null));
    for (const marker of ['private', 'evil.test', 'javascript:', '<script', 'onerror', 'properties', 'key', 'email'])
        assert.ok(!JSON.stringify(mapped).includes(marker));
    assert.throws(() => mapLeadership({ ...source, history: undefined }, media), LeadershipDataError);
    assert.throws(() => mapLeadership({ ...source, officers: [{ ...source.officers![0], username: '../private' }] }, media), LeadershipDataError);
    assert.equal(mapLeadership({ ...source, officers: [{ ...source.officers![0], imageUrl: '//evil.test/photo' }] }, media).officers[0].image, '/images/pipey.jpg');
});

test('loader reports controlled404/502/503 without exposing upstream text or inventing success', async () => {
    assert.equal((await loadLeadership({ ...options, fetch: async () => json(leadershipFixture()) })).officers.length, 2);
    for (const status of [404, 500, 302])
        await assert.rejects(loadLeadership({ ...options, fetch: async () => new Response('private-body', { status }) }),
            e => e instanceof LeadershipLoadError && e.status === (status === 404 ? 404 : 502) && !e.message.includes('private'));
    for (const fetch of [async () => json({}), async () => new Response('private-json', { headers: { 'Content-Type': 'application/json' } }), async () => { throw new Error('private-error'); }])
        await assert.rejects(loadLeadership({ ...options, fetch }), e => e instanceof LeadershipLoadError && e.status === 502 && !e.message.includes('private'));
    await assert.rejects(loadLeadership({ ...options, cmsInternalOrigin: undefined, fetch: async () => { assert.fail('unconfigured fetched'); } }),
        e => e instanceof LeadershipLoadError && e.status === 503);
    await assert.rejects(loadLeadership({ ...options, timeoutMs: 1, fetch: async req => { await new Promise(r => setTimeout(r, 10)); req.signal.throwIfAborted(); return json({}); } }),
        e => e instanceof LeadershipLoadError && e.status === 503);
});
