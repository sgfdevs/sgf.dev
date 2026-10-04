<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Springfield Devs</title>
</svelte:head>

<main aria-labelledby="page-title">
	<h1 id="page-title">Springfield Devs</h1>
	<p>{data.status}</p>
	<p>CMS content and public pages will be wired up in later rewrite layers.</p>
</main>
