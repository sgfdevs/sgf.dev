import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDeliveryPageClient } from '../../src/lib/server/pages/client';
import { ContentPageLoadError, loadContentPage } from '../../src/lib/server/pages/load';
import { mapDeliveryPage } from '../../src/lib/server/pages/mapper';
import { isContentPagePath, type ContentPagePath } from '../../src/lib/server/pages/paths';
import { deliveryPage, media } from './fixture';

const legacyPaths = ['/archives/', '/2022-holiday-party/', '/2022-tech-survey/', '/search-results/'] as const;
const json = (value: unknown) => new Response(JSON.stringify(value), { headers: { 'Content-Type': 'application/json' } });

test('legacy pages use exact native paths, fixed fields and server-only credentials', async () => {
	const requests: string[] = [];
	const client = createDeliveryPageClient(media.cmsInternalOrigin, 'synthetic-key', async request => {
		const url = new URL(request.url);
		requests.push(url.pathname);
		assert.equal(url.searchParams.get('fields'), 'properties[blocks,titleTag,description,OgImage]');
		assert.deepEqual([...request.headers.keys()].sort(), ['accept', 'api-key']);
		assert.equal(request.credentials, 'omit');
		assert.equal(request.redirect, 'error');
		return json(deliveryPage());
	});
	for (const path of legacyPaths) {
		assert.ok(isContentPagePath(path));
		await client.getPage(path, AbortSignal.timeout(1000));
	}
	assert.deepEqual(requests, legacyPaths.map(path => '/umbraco/delivery/api/v2/content/item/' + path.slice(1)));
	for (const path of ['/member/', '/events/', '/companies/', '/archives/extra/', '/archives', '/search-results/?q=test', '/%61rchives/']) {
		assert.equal(isContentPagePath(path), false);
		assert.throws(() => client.getPage(path as ContentPagePath, AbortSignal.timeout(1000)));
	}
});

test('generic legacy blocks keep formatting and links; empty search page adds no functionality', () => {
	const holiday = {
		...deliveryPage('/2022-holiday-party/'),
		properties: { blocks: { items: [{
			content: { contentType: 'markdown', properties: { content: '## Synthetic party\n\n**Join us.** [RSVP](https://forms.gle/example)\n\n![Banner](/media/synthetic/party.png)\n\n<script>bad()</script><iframe src="https://example.test"></iframe>' } }
		}] } }
	};
	const mapped = mapDeliveryPage(holiday, '/2022-holiday-party/', media);
	assert.equal(mapped.isAbout, false);
	assert.match(mapped.blocks[0].html, /<h2>Synthetic party<\/h2>/);
	assert.match(mapped.blocks[0].html, /<strong>Join us\.<\/strong>/);
	assert.match(mapped.blocks[0].html, /href="https:\/\/forms.gle\/example"/);
	assert.match(mapped.blocks[0].html, /src="\/media\/synthetic\/party.png"/);
	assert.doesNotMatch(JSON.stringify(mapped), /bad\(\)|iframe|private-/);
	const search = mapDeliveryPage({
		...deliveryPage('/search-results/'), name: 'Search Results',
		properties: { blocks: null, titleTag: '', description: null, OgImage: [] }
	}, '/search-results/', media);
	assert.equal(search.title, 'Springfield Devs - Search Results');
	assert.equal(search.description, null);
	assert.deepEqual(search.blocks, []);
});

test('legacy missing/protected pages remain 404; mismatched or malformed Delivery data stays 502', async () => {
	const options = { path: '/archives/' as const, origin: media.cmsInternalOrigin, apiKey: 'synthetic-key', media };
	for (const status of [401, 403, 404]) {
		await assert.rejects(loadContentPage({ ...options, fetch: async () => new Response('private detail', { status }) }),
			(e: unknown) => e instanceof ContentPageLoadError && e.status === 404 && !e.message.includes('private'));
	}
	for (const value of [
		{ ...deliveryPage('/archives/'), route: { path: '/search-results/' } },
		{ ...deliveryPage('/archives/'), properties: { blocks: { items: 'bad' } } }
	]) {
		await assert.rejects(loadContentPage({ ...options, fetch: async () => json(value) }),
			(e: unknown) => e instanceof ContentPageLoadError && e.status === 502);
	}
	await assert.rejects(loadContentPage({
		...options, fetch: async () => json({ ...deliveryPage('/archives/'), contentType: 'member' })
	}), (e: unknown) => e instanceof ContentPageLoadError && e.status === 404);
});
