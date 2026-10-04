<script lang="ts">
	import { browser } from '$app/env';
	import type { Snippet } from 'svelte';
	import type { ShellMemberState } from './auth-state';
	import SiteFooter from './SiteFooter.svelte';
	import SiteHeader from './SiteHeader.svelte';

	let { children, memberState = { kind: 'anonymous' } }: { children: Snippet; memberState?: ShellMemberState } = $props();

	let menuOpen = $state(false);
	let aboutPanelOpen = $state(false);

	function closeMenu() {
		menuOpen = false;
		aboutPanelOpen = false;
	}

	$effect(() => {
		if (!browser) return;
		document.body.classList.toggle('fixed', menuOpen);
		return () => document.body.classList.remove('fixed');
	});
</script>

<SiteHeader
	{memberState}
	{menuOpen}
	{aboutPanelOpen}
	onMenuToggle={() => {
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
