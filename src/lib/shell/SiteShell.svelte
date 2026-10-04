<script lang="ts">
	import { browser } from '$app/env';
	import type { Snippet } from 'svelte';
	import type { ShellMemberState } from './auth-state';
	import SiteFooter from './SiteFooter.svelte';
	import SiteHeader from './SiteHeader.svelte';

	let { children, memberState = { kind: 'anonymous' } }: { children: Snippet; memberState?: ShellMemberState } = $props();

	let menuOpen = $state(false);
	let aboutPanelOpen = $state(false);
	let restoreScrollAfterClose = true;
	let lockedScrollY = 0;

	function closeMenu({ restoreScroll = true }: { restoreScroll?: boolean } = {}) {
		restoreScrollAfterClose = restoreScroll;
		menuOpen = false;
		aboutPanelOpen = false;
	}

	$effect(() => {
		if (!browser || !menuOpen) return;

		lockedScrollY = window.scrollY;
		document.documentElement.classList.add('sgf-mobile-menu-scroll-lock');
		document.body.classList.add('sgf-mobile-menu-scroll-lock');

		return () => {
			document.documentElement.classList.remove('sgf-mobile-menu-scroll-lock');
			document.body.classList.remove('sgf-mobile-menu-scroll-lock');

			const shouldRestoreScroll = restoreScrollAfterClose;
			const scrollY = lockedScrollY;
			restoreScrollAfterClose = true;

			if (shouldRestoreScroll) {
				window.requestAnimationFrame(() => window.scrollTo({ top: scrollY, left: window.scrollX, behavior: 'auto' }));
			}
		};
	});
</script>

<SiteHeader
	{memberState}
	{menuOpen}
	{aboutPanelOpen}
	onMenuToggle={() => {
		restoreScrollAfterClose = true;
		menuOpen = !menuOpen;
		if (!menuOpen) aboutPanelOpen = false;
	}}
	onMenuClose={closeMenu}
	onAboutOpen={() => (aboutPanelOpen = true)}
	onAboutClose={() => (aboutPanelOpen = false)}
/>

<div class="site-content" inert={menuOpen ? true : undefined}>
	{@render children()}
</div>

<div inert={menuOpen ? true : undefined}>
	<SiteFooter />
</div>
