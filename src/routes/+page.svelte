<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Springfield Devs</title>
</svelte:head>

<main class="frontend-placeholder" aria-label="Springfield Devs site content">
	<p>{data.status}</p>
</main>
