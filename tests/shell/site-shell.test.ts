import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { aboutLinks, desktopMainLinks, footerMainLinks, footerSocialLinks, mobileMainLinks } from '../../src/lib/shell/navigation';

const root = new URL('../..', import.meta.url);
const headerPath = new URL('src/lib/shell/SiteHeader.svelte', root);
const footerPath = new URL('src/lib/shell/SiteFooter.svelte', root);
const layoutPath = new URL('src/routes/+layout.svelte', root);

describe('site shell static contract', () => {
	it('keeps the legacy header and footer link targets in frontend-owned data', () => {
		assert.deepEqual(aboutLinks.map(({ label, href }) => [label, href]), [
			['Springfield Devs', '/about/'],
			['Method Conference', 'https://www.methodconf.com'],
			['Leadership', '/about/leadership/'],
			['Code of Conduct', '/about/code-of-conduct/'],
			['Sponsorship', '/about/sponsorship/'],
			['Volunteer to Speak', 'https://sessionize.com/sgf-dev-night']
		]);
		assert.deepEqual(desktopMainLinks.map(({ label, href }) => [label, href]), [
			['Groups', '/groups'],
			['Directory', '/directory'],
			['Archives', 'https://www.youtube.com/playlist?list=PLUyFlCloUuMuS47jYIPiJ0I6djvf1xp6p'],
			['Events', 'https://www.meetup.com/sgfdevs/events/']
		]);
		assert.deepEqual(mobileMainLinks.map(({ label, href }) => [label, href]), [
			['Groups', '/groups/'],
			['Directory', '/directory/'],
			['Archives', 'https://www.youtube.com/playlist?list=PLUyFlCloUuMuS47jYIPiJ0I6djvf1xp6p'],
			['Events', 'https://www.meetup.com/sgfdevs/events/'],
			['Login', '/login'],
			['Signup', '/register']
		]);
		assert.deepEqual(footerMainLinks.map(({ label, href }) => [label, href]), [
			['About', '/about/'],
			['Directory', '/directory/'],
			['Chapters', '/groups/']
		]);
		assert.deepEqual(footerSocialLinks.map(({ label, href }) => [label, href]), [
			['Twitch', 'https://www.twitch.tv/sgfdevs'],
			['YouTube', 'https://www.youtube.com/@SGFDevs'],
			['GitHub', 'https://github.com/sgfdevs'],
			['Facebook', 'https://www.facebook.com/sgfdevs'],
			['Twitter', 'https://twitter.com/sgfdevs/'],
			['Instagram', 'https://www.instagram.com/sgfdevs/'],
			['Discord', '/discord']
		]);
	});

	it('keeps newsletter markup visible but non-submitting until the server action layer', async () => {
		const footer = await readFile(footerPath, 'utf8');
		assert.match(footer, /id="updates_subscribe"/);
		assert.match(footer, /name="email"/);
		assert.match(footer, /name="name"/);
		assert.match(footer, /class="null-check"/);
		assert.match(footer, /type="submit" disabled/);
		assert.doesNotMatch(footer, /api\/newsletter\/signup/);
	});

	it('uses original inline shell icons and does not load Font Awesome Pro or analytics', async () => {
		const [header, footer, layout] = await Promise.all([
			readFile(headerPath, 'utf8'),
			readFile(footerPath, 'utf8'),
			readFile(layoutPath, 'utf8')
		]);
		const shell = `${header}\n${footer}\n${layout}`;
		assert.doesNotMatch(shell, /Font Awesome 5 Pro|fa-light|fa-duotone|plausible|fontawesome/i);
		assert.match(shell, /<Chevron/);
	});

	it('fixes the legacy Open Graph origin and leaves indexing opt-in', async () => {
		const layout = await readFile(layoutPath, 'utf8');
		assert.match(layout, /property="og:url" content=\{data\.canonicalUrl\}/);
		assert.match(layout, /<meta name="robots" content="noindex, nofollow" \/>/);
		assert.doesNotMatch(layout, /hearolife/);
	});
});
