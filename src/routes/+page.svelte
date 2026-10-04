<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Springfield Devs</title>
</svelte:head>

<main class="p-6" aria-labelledby="page-title">
	<h1 class="text-3xl font-semibold" id="page-title">Springfield Devs</h1>
	<p class="mt-4 text-sm">{data.status}</p>
	<p>CMS content and public pages will be wired up in later rewrite layers.</p>
</main>
