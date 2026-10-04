<script lang="ts">
	import AboutBody from './AboutBody.svelte';
	import type { ContentPageView } from '../server/pages/mapper';
	let { contentPage }: { contentPage: ContentPageView } = $props();
</script>

<svelte:head><title>{contentPage.title}</title></svelte:head>

<main class="content-page">
	{#if contentPage.isAbout}
		<AboutBody documents={contentPage.documents} />
	{:else}
		<div class="site-container"><header class="simple_content"><h1>{contentPage.name}</h1></header></div>
	{/if}
	{#if contentPage.blocks.length}
		<div class="site-container">
			<div class="simple_content">
				{#each contentPage.blocks as block}
					<div class="page-block">{@html block.html}</div>
				{/each}
			</div>
		</div>
	{/if}
</main>

<style>
	.content-page { padding-bottom: 50px; }
	.simple_content { max-width: 920px; margin: 0 auto; overflow-wrap: anywhere; }
	h1 { font-size: 36px; line-height: 43px; margin: 20px 0; font-weight: 600; color: var(--color-sgf-dark-blue); }
	.page-block :global(h1), .page-block :global(h2), .page-block :global(h3), .page-block :global(h4), .page-block :global(h5), .page-block :global(h6) { color: var(--color-sgf-dark-blue); font-weight: 600; line-height: 1.25; margin: 1em 0 .5em; }
	.page-block :global(h1) { font-size: 36px; }
	.page-block :global(h2) { font-size: 32px; }
	.page-block :global(h3) { font-size: 26px; }
	.page-block :global(p), .page-block :global(ul), .page-block :global(ol), .page-block :global(blockquote), .page-block :global(pre), .page-block :global(table) { margin: 0 0 1em; }
	.page-block :global(a) { color: var(--color-sgf-light-blue); text-decoration: underline; }
	.page-block :global(ul), .page-block :global(ol) { padding-left: 1.5em; }
	.page-block :global(ul) { list-style: disc; }
	.page-block :global(ol) { list-style: decimal; }
	.page-block :global(blockquote) { border-left: 3px solid var(--color-sgf-light-blue); padding-left: 1em; }
	.page-block :global(pre) { overflow-x: auto; padding: 1em; background: var(--color-sgf-light-grey); }
	.page-block :global(table) { display: block; overflow-x: auto; border-collapse: collapse; }
	.page-block :global(td), .page-block :global(th) { border: 1px solid var(--color-sgf-grey); padding: .5em; }
	@media (max-width: 768px) { h1, .page-block :global(h1), .page-block :global(h2) { font-size: 26px; line-height: 1.25; } }
</style>
