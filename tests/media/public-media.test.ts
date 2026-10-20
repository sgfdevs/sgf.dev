import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mapMediaUrlToPublic, publicMediaHref } from '../../src/lib/server/media/mapper';
import { readMediaSourceConfigFromEnv } from '../../src/lib/server/media/config';

const config = { publicMediaUrl: 'https://media.example.test/', cmsInternalOrigin: 'http://cms.internal' };

test('preserves CDN URLs and maps native CMS media without losing image parameters', () => {
	const image = 'https://media.example.test/logos/sponsor.svg?width=500&height=300&mode=crop';
	assert.equal(mapMediaUrlToPublic(image, config), image);
	assert.equal(mapMediaUrlToPublic('http://cms.internal/media/people/ada.webp?v=2', config), 'https://media.example.test/people/ada.webp?v=2');
	assert.equal(publicMediaHref('/media/docs/bylaws.pdf#page=2', config), 'https://media.example.test/docs/bylaws.pdf#page=2');
});

test('supports a local public CMS media base without using the internal API address', () => {
	const local = readMediaSourceConfigFromEnv({ MEDIA_PUBLIC_URL: 'http://localhost:5099/media', CMS_INTERNAL_ORIGIN: 'http://cms.internal' });
	assert.equal(mapMediaUrlToPublic('/media/people/ada.png', local), 'http://localhost:5099/media/people/ada.png');
});

test('omits unsafe images and unapproved hosts', () => {
	assert.equal(mapMediaUrlToPublic('javascript:alert(1)', config), null);
	assert.equal(mapMediaUrlToPublic('https://other.example.test/tracker.png', config), null);
	assert.equal(mapMediaUrlToPublic('/media/../private.png', config), null);
	assert.equal(mapMediaUrlToPublic('/media/docs/bylaws.pdf', config), null);
});
