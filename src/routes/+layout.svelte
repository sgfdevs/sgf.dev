<script lang="ts">
	import '../app.css';
	import SiteShell from '../lib/shell/SiteShell.svelte';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
	const contentPage = $derived(page.data.company ?? page.data.contentPage);
	const canonical = $derived(contentPage ? new URL(contentPage.path, data.canonicalUrl).href : data.canonicalUrl);
	const ogImage = $derived(contentPage?.ogImage ? new URL(contentPage.ogImage, data.canonicalUrl).href : data.ogImageUrl);
</script>

<svelte:head>
	{#if !contentPage || contentPage.description}
		<meta name="description" content={contentPage?.description ?? 'Springfield Devs is a community of software developers in Springfield, Missouri.'} />
	{/if}
	<link rel="canonical" href={canonical} />
	<meta property="og:url" content={canonical} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={contentPage?.title ?? data.pageTitle} />
	{#if contentPage?.description}<meta property="og:description" content={contentPage.description} />{/if}
	<meta property="og:image" content={ogImage} />
	{#if !data.searchIndexingEnabled}
		<meta name="robots" content="noindex, nofollow" />
	{/if}
</svelte:head>

<SiteShell memberState={data.member ? { kind: 'member', label: data.member.name } : { kind: 'anonymous' }}>
	{@render children()}
</SiteShell>
