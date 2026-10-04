import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createDeliveryPageClient } from '../../src/lib/server/pages/client';
import { ContentPageLoadError, loadContentPage } from '../../src/lib/server/pages/load';
import { mapDeliveryPage, PageDataError, PageNotFoundError } from '../../src/lib/server/pages/mapper';
import { safePageHref, sanitizePageHtml } from '../../src/lib/server/pages/html';
import { contentPagePaths, type ContentPagePath } from '../../src/lib/server/pages/paths';
import { deliveryPage, media } from './fixture';

const options = { path: '/about/code-of-conduct/' as const, origin: media.cmsInternalOrigin, apiKey: 'synthetic-key', media };
const json = (value: unknown) => new Response(JSON.stringify(value), { headers: { 'Content-Type': 'application/json' } });

test('actual native schema provenance, header and operation stay separate from public/member contracts', async () => {
	const raw = await readFile('openapi/umbraco-delivery.openapi.json');
	assert.equal(createHash('sha256').update(raw).digest('hex'), '7f630c8bc7a21658b0b9619b6311998fce749909c67ca4ff159c9fd22a2edec0');
	const schema = JSON.parse(raw.toString());
	assert.equal(schema.info.title, 'Umbraco Delivery API');
	assert.equal(schema.components.securitySchemes.ApiKeyAuth.name, 'Api-Key');
	assert.equal(schema.paths['/umbraco/delivery/api/v2/content/item/{path}'].get.operationId, 'GetContentItemByPath2.0');
});

test('fixed generated Delivery requests, API key only, no preview or member credentials', async () => {
	let calls = 0;
	const client = createDeliveryPageClient(media.cmsInternalOrigin, 'synthetic-key', async request => {
		calls++;
		const url = new URL(request.url);
		assert.equal(url.origin, media.cmsInternalOrigin);
		assert.ok(contentPagePaths.some(path => url.pathname === '/umbraco/delivery/api/v2/content/item/' + path.slice(1)));
		assert.equal(url.searchParams.get('fields'), 'properties[blocks,titleTag,description,OgImage]');
		assert.deepEqual([...request.headers.keys()].sort(), ['accept', 'api-key']);
		assert.equal(request.headers.get('Api-Key'), 'synthetic-key');
		assert.equal(request.credentials, 'omit'); assert.equal(request.redirect, 'error');
		assert.equal(request.method, 'GET');
		return json(deliveryPage());
	});
	for (const path of contentPagePaths) await client.getPage(path, AbortSignal.timeout(1000));
	assert.throws(() => client.getPage('/about/leadership/' as ContentPagePath, AbortSignal.timeout(1000)));
	assert.throws(() => client.getPage('//evil.test' as ContentPagePath, AbortSignal.timeout(1000)));
	assert.equal(calls, contentPagePaths.length);
});

test('configuration fails closed before fetching; protected and missing pages are 404', async () => {
	const neverFetch = async () => { assert.fail('must not fetch'); };
	for (const changes of [{ origin: undefined }, { origin: 'https://cms.test/path' }, { apiKey: undefined }, { apiKey: 'bad\nkey' }]) {
		await assert.rejects(loadContentPage({ ...options, ...changes, fetch: neverFetch }), (e: unknown) => e instanceof ContentPageLoadError && e.status === 503);
	}
	for (const status of [401, 403, 404]) await assert.rejects(loadContentPage({ ...options, fetch: async () => new Response('private upstream text', { status }) }),
		(e: unknown) => e instanceof ContentPageLoadError && e.status === 404 && !e.message.includes('private'));
});

test('upstream errors, redirect, wrong JSON and malformed data are safe 502s; timeout is 503', async () => {
	for (const fetch of [
		async () => new Response(null, { status: 302, headers: { Location: 'https://evil.test' } }),
		async () => new Response('private', { status: 500 }),
		async () => new Response('not json', { headers: { 'Content-Type': 'application/json' } }),
		async () => new Response('{}', { headers: { 'Content-Type': 'text/html' } }),
		async () => json({}),
		async () => json({ ...deliveryPage(), route: { path: '/wrong/' } }),
		async () => json({ ...deliveryPage(), properties: { blocks: 'wrong' } }),
		async () => json({ ...deliveryPage(), properties: { blocks: { items: [{ content: { contentType: 'embed', properties: {} } }] } } }),
		async () => new Response('x'.repeat(1_048_577), { headers: { 'Content-Type': 'application/json' } })
	]) await assert.rejects(loadContentPage({ ...options, fetch }), (e: unknown) => e instanceof ContentPageLoadError && e.status === 502);
	await assert.rejects(loadContentPage({ ...options, timeoutMs: 1, fetch: async request => { await new Promise(resolve => setTimeout(resolve, 10)); request.signal.throwIfAborted(); return json(deliveryPage()); } }),
		(e: unknown) => e instanceof ContentPageLoadError && e.status === 503);
});

test('known metadata, ordered markdown/native rich-text blocks and document links map without raw properties', () => {
	const mapped = mapDeliveryPage(deliveryPage(), options.path, media);
	assert.equal(mapped.title, 'Conduct | Springfield Devs');
	assert.equal(mapped.description, 'Our community standards.');
	assert.equal(mapped.ogImage, '/media/synthetic/banner.jpg');
	assert.match(mapped.blocks[0].html, /<h2>Welcome<\/h2>/);
	assert.match(mapped.blocks[0].html, /<strong>kind<\/strong>/);
	assert.match(mapped.blocks[0].html, /href="\/register"/);
	assert.match(mapped.blocks[0].html, /<ul>/);
	assert.match(mapped.blocks[1].html, /href="https:\/\/media.example.test\/example\/sponsorship.pdf"/);
	assert.equal(mapped.documents.articles, 'https://media.example.test/kbxmwecj/articles-of-incorporation.pdf');
	assert.equal(mapped.documents.bylaws, 'https://media.example.test/wy0hhb5d/bylaws.pdf');
	const serialized = JSON.stringify(mapped);
	for (const marker of ['private-', 'unknownProperty', 'officers', 'contentType', 'startItem', 'createDate']) assert.ok(!serialized.includes(marker));
	assert.equal(mapDeliveryPage(deliveryPage('/about/'), '/about/', media).isAbout, true);
});

test('empty optional metadata and blocks are valid, malformed properties or unsupported embedded blocks are not', () => {
	const value = { ...deliveryPage(), properties: { titleTag: '', description: null, OgImage: [], blocks: null } };
	const mapped = mapDeliveryPage(value, options.path, media);
	assert.equal(mapped.title, 'Springfield Devs - Code of Conduct');
	assert.equal(mapped.description, null); assert.equal(mapped.ogImage, null); assert.deepEqual(mapped.blocks, []);
	assert.throws(() => mapDeliveryPage({ ...value, contentType: 'leadership' }, options.path, media), PageNotFoundError);
	for (const properties of [{ titleTag: {} }, { OgImage: {} }, { blocks: { items: 'bad' } },
		{ blocks: { items: [{ content: { contentType: 'richTextEditor', properties: { content: { markup: '<p>x</p>', blocks: [{}] } } } }] } }
	]) assert.throws(() => mapDeliveryPage({ ...value, properties }, options.path, media), PageDataError);
	assert.equal(mapDeliveryPage({ ...value, properties: { OgImage: [{ url: 'https://evil.test/x.svg' }] } }, options.path, media).ogImage, null);
	const legacyRich = { blocks: { items: [{ content: { contentType: 'richTextEditor', properties: { content: '<p>Native HTML</p>' } } }] } };
	assert.equal(mapDeliveryPage({ ...value, properties: legacyRich }, options.path, media).blocks[0].html, '<p>Native HTML</p>');
});

test('sanitizer preserves content and approved image mapping, strips scripts, handlers, styles and embeds', () => {
	const html = sanitizePageHtml('<h2>Heading</h2><p style="color:red" onclick="bad()">Text <a href="javascript:bad()">bad</a> <a href="https://example.test/" target="_blank" onclick="bad()">good</a></p><script>bad()</script><style>bad()</style><iframe src="https://evil.test"></iframe><img src="/media/test/photo.png" onerror="bad()" alt="Photo"><img src="data:image/png,x"><img src="https://evil.test/x.jpg"><svg onload="bad()"></svg>', media);
	assert.match(html, /<h2>Heading<\/h2>/); assert.match(html, /<p>Text/);
	assert.match(html, /rel="noopener noreferrer"/);
	assert.match(html, /src="\/media\/test\/photo.png" alt="Photo" loading="lazy"/);
	for (const marker of ['bad()', 'onclick', 'onerror', 'style=', 'script', 'iframe', 'svg', 'data:', 'evil.test']) assert.ok(!html.includes(marker));
	assert.equal((html.match(/<img/g) ?? []).length, 1);
});

test('safe links and PDF hrefs stay separate from JPEG/PNG proxy', () => {
	for (const raw of ['javascript:alert(1)', 'data:text/html,x', '//evil.test', '/%2fexample.test', '/a\\b', '/%0aevil', 'https://user:pass@example.test/']) assert.equal(safePageHref(raw, media), null);
	assert.equal(safePageHref('/register', media), '/register');
	assert.equal(safePageHref('#sponsors', media), '#sponsors');
	assert.equal(safePageHref('https://discord.gg/example', media), 'https://discord.gg/example');
	assert.equal(safePageHref('/media/example/sponsorship.pdf#page=2', media), 'https://media.example.test/example/sponsorship.pdf#page=2');
	assert.equal(safePageHref('http://cms.example.test/media/example/sponsorship.pdf', media), 'https://media.example.test/example/sponsorship.pdf');
	assert.equal(sanitizePageHtml('<img src="/media/example/sponsorship.pdf"><a href="/media/example/sponsorship.pdf">Download</a>', media), '<a href="https://media.example.test/example/sponsorship.pdf">Download</a>');
});
