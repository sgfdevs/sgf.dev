<script lang="ts">
	import '../app.css';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<meta name="description" content="Springfield Devs frontend rewrite" />
</svelte:head>

{@render children()}
