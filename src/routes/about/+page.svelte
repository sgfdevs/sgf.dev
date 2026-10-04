<script lang="ts">
	import ContentPage from '../../lib/pages/ContentPage.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<ContentPage contentPage={data.contentPage} />
