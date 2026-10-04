<script lang="ts">
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<svelte:head><title>Springfield Devs - Groups</title></svelte:head>

<main aria-label="Groups">
	<div class="circuit_header"><div class="headline"><img src="/images/headlines/groups.svg" alt="Groups" /></div></div>
	<div class="group_listing">
		{#each data.groups as group}
			<section>
				{#if group.image}<div class="image"><img src={group.image} alt={group.name} /></div>{/if}
				<div class="content">
					<h2>{group.name}</h2><h3>What we're about</h3>
					<!-- Only the server-sanitized projection reaches this HTML sink. -->
					{@html group.aboutHtml}
					<a href={group.path} class="button">Group Details</a>
					{#if group.leaders.length}
						<dl><dt>Group Leaders</dt>
							{#each group.leaders as leader}
								<dd><a href={leader.path}>{#if leader.image}<img src={leader.image} alt={leader.name} />{/if}<span>{leader.listLabel}</span></a></dd>
							{/each}
						</dl>
					{/if}
				</div>
			</section>
		{/each}
	</div>
</main>

<style>
	.circuit_header { background: var(--color-sgf-dark-blue) url('/images/circuitry/header.svg') no-repeat 112%; padding-top: 90px; border-radius: 27px; min-height: 440px; }
	.headline { max-width: 1200px; margin: 0 auto; }
	.group_listing { position: relative; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 554px), 1fr)); gap: 60px; max-width: 1230px; margin: -200px auto 50px; padding: 0 30px; }
	h2 { font-size: 36px; font-weight: 700; color: var(--color-sgf-dark-blue); line-height: 40px; margin: 0.83em 0 0; }
	h3, dt { font-weight: 400; font-size: 16px; color: var(--color-sgf-light-blue); letter-spacing: 1.78px; line-height: 30px; text-transform: uppercase; }
	h3 { margin: 1em 0; }
	.content :global(p) { color: #000; margin: 1em 0; }
	.content :global(p a) { color: #000; text-decoration: underline; }
	.image img { border-radius: 27px; width: 100%; }
	dl { margin: 14px 0 0; display: flex; flex-wrap: wrap; }
	dt { width: 100%; }
	dd { margin: 0 16px 0 0; }
	dd img { filter: grayscale(1); border-radius: 27px; width: 96px; height: 96px; object-fit: cover; }
	dd span { display: block; font-weight: 700; font-size: 14px; color: var(--color-sgf-dark-blue); line-height: 21px; }
	.button { background: var(--color-sgf-light-blue); border-radius: 25.5px; font-weight: 600; font-size: 14px; color: #fff; padding: 0 24px; height: 40px; display: inline-flex; align-items: center; text-decoration: none; }
	@media (max-width: 1023px) { .headline { padding: 0 30px; } }
	@media (max-width: 768px) { .group_listing { grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); } }
	@media (max-width: 767px) { .group_listing { padding: 0; } .content { padding: 0 30px; } }
</style>
