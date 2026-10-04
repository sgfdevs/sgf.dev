import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { mapDeliveryCompany, trustedCompanyVideo, CompanyDataError } from '../../src/lib/server/companies/mapper';
import { createDeliveryCompanyClient } from '../../src/lib/server/companies/client';
import { loadCompany, CompanyLoadError } from '../../src/lib/server/companies/load';
import { companyFixture, companyPath, skillTerm } from './fixture';
import { mapGroup } from '../../src/lib/server/groups/mapper';
import { groupFixture, media } from '../groups/fixture';
const json = (value: unknown) => new Response(JSON.stringify(value), { headers: { 'Content-Type': 'application/json' } });
const options = { path: companyPath, origin: media.cmsInternalOrigin, apiKey: 'synthetic-key', media };

test('company mapper keeps legacy public fields and real filters, never private IDs, pickers or arbitrary embeds', async () => {
	const source = companyFixture();
	const mapped = mapDeliveryCompany(source, companyPath, media);
	assert.equal(mapped.path, companyPath); assert.equal(mapped.name, source.name);
	assert.equal(mapped.headline, source.properties.headline);
	assert.equal(mapped.image, '/media/synthetic/logo.png');
	assert.equal(mapped.featuredImage, '/media/synthetic/featured.png');
	assert.equal(mapped.isFoundingSponsor, true); assert.equal(mapped.location, 'Springfield, MO');
	assert.equal(mapped.skills[0].url, '/directory/?skills=' + skillTerm);
	assert.equal(mapGroup(groupFixture(), media).skills[0].url, mapped.skills[0].url);
	assert.match(mapped.aboutHtml, /<strong>unchanged<\/strong>/);
	assert.equal(mapped.socials.length, 2);
	for (const forbidden of ['private-', '<script', '<iframe', '__companyInjected', 'javascript:']) assert.ok(!JSON.stringify(mapped).includes(forbidden));
	assert.equal(trustedCompanyVideo('<iframe src="https://www.youtube.com/embed/3a5mR5xoUbc?autoplay=1" onload="bad()"></iframe>'), 'https://www.youtube-nocookie.com/embed/3a5mR5xoUbc');
	assert.equal(trustedCompanyVideo('<iframe src="https://player.vimeo.com/video/123456"></iframe>'), 'https://player.vimeo.com/video/123456');
	for (const src of ['https://evil.test/embed/3a5mR5xoUbc', 'https://www.youtube.com.evil.test/embed/3a5mR5xoUbc', 'http://www.youtube.com/embed/3a5mR5xoUbc', 'https://private@www.youtube.com/embed/3a5mR5xoUbc', 'https://www.youtube.com/watch?v=3a5mR5xoUbc'])
		assert.equal(trustedCompanyVideo('<iframe src="' + src + '"></iframe>'), null);
	assert.throws(() => mapDeliveryCompany({ ...source, route: { path: '/companies/wrong/' } }, companyPath, media), CompanyDataError);
	const raw = await readFile('openapi/umbraco-delivery.openapi.json');
	assert.equal(createHash('sha256').update(raw).digest('hex'), '7f630c8bc7a21658b0b9619b6311998fce749909c67ca4ff159c9fd22a2edec0');
});

test('company Delivery transport stays server-only, fixed-origin, bounded to one slug and approved fields', async () => {
	let calls = 0;
	const client = createDeliveryCompanyClient(options.origin, options.apiKey, async req => {
		calls++;
		const url = new URL(req.url);
		assert.equal(url.origin, options.origin);
		assert.equal(url.pathname, '/umbraco/delivery/api/v2/content/item/companies/Custom-Sponsor/');
		assert.equal(req.headers.get('Api-Key'), 'synthetic-key');
		assert.ok(!req.headers.has('cookie') && !req.headers.has('authorization') && !req.headers.has('preview'));
		assert.equal(req.credentials, 'omit'); assert.equal(req.redirect, 'error');
		assert.ok(!url.searchParams.has('expand'));
		assert.ok(!url.searchParams.get('fields')!.includes('companyTags'));
		return json(companyFixture());
	});
	await client.getCompany(companyPath, AbortSignal.timeout(1000));
	for (const path of ['/companies/', '/companies/a/job/', '/member/Jane', '/companies/../', '/companies/a%2Fb/', '//evil.test/companies/a/'])
		assert.throws(() => client.getCompany(path, AbortSignal.timeout(1000)));
	assert.equal(calls, 1);
});

test('company missing or protected404, config503 and upstream502 have no successful fallback', async () => {
	for (const status of [401, 403, 404, 500, 302]) await assert.rejects(loadCompany({ ...options, fetch: async () => new Response('private', { status }) }),
		e => e instanceof CompanyLoadError && e.status === ([401, 403, 404].includes(status) ? 404 : 502));
	await assert.rejects(loadCompany({ ...options, origin: undefined }), e => e instanceof CompanyLoadError && e.status === 503);
	await assert.rejects(loadCompany({ ...options, path: '/companies/', fetch: async () => { assert.fail('listing fetched'); } }), e => e instanceof CompanyLoadError && e.status === 404);
	await assert.rejects(loadCompany({ ...options, fetch: async () => json({}) }), e => e instanceof CompanyLoadError && e.status === 502);
	await assert.rejects(loadCompany({ ...options, fetch: async () => json({ ...companyFixture(), contentType: 'job' }) }), e => e instanceof CompanyLoadError && e.status === 404);
	await assert.rejects(loadCompany({ ...options, timeoutMs: 1, fetch: async req => { await new Promise(r => setTimeout(r, 10)); req.signal.throwIfAborted(); return json({}); } }), e => e instanceof CompanyLoadError && e.status === 503);
	assert.equal((await loadCompany({ ...options, fetch: async () => json(companyFixture()) })).company.path, companyPath);
});
