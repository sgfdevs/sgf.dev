<script lang="ts">
	import '../app.css';
	import SiteShell from '../lib/shell/SiteShell.svelte';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
</script>

<svelte:head>
	<meta name="description" content="Springfield Devs is a community of software developers in Springfield, Missouri." />
	<meta property="og:url" content={data.canonicalUrl} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={data.pageTitle} />
	<meta property="og:image" content={data.ogImageUrl} />
	{#if !data.searchIndexingEnabled}
		<meta name="robots" content="noindex, nofollow" />
	{/if}
</svelte:head>

<SiteShell>
	{@render children()}
</SiteShell>
