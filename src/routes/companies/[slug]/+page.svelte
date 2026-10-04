<script lang="ts">
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	const company = $derived(data.company);
</script>

<svelte:head><title>{company.title}</title></svelte:head>

<main class="company" aria-labelledby="company-name">
	<header class="company-header">
		<div class="information">
			{#if company.image}<img class="logo" src={company.image} alt={company.name} />{/if}
			<h1 id="company-name">{company.headline ?? company.name}</h1>
			{#if company.websiteUrl}<a href={company.websiteUrl} target="_blank" rel="noopener noreferrer" class="button">Visit Site</a>{/if}
		</div>
		<div class="image">
			{#if company.video}
				<iframe title={company.name + ' introduction'} src={company.video} loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="fullscreen; picture-in-picture" allowfullscreen></iframe>
			{:else if company.featuredImage}<img src={company.featuredImage} alt={company.name} />{/if}
		</div>
	</header>
	<section class="company-content tabs" aria-label="Company sections">
		<input name="company-tabs" type="radio" id="company-about" checked class="tab" aria-controls="company-about-panel" />
		<label for="company-about" class="label">About</label>
		<div id="company-about-panel" class="panel about">
			<div class="col-1">
				<div class="metadata">
					{#if company.isFoundingSponsor}<div class="flag"><div>Founding Sponsor</div></div>{/if}
					{#if company.location}<div class="location">{company.location}</div>{/if}
				</div>
				<div class="socials"><h3>Social</h3><ul>{#each company.socials as social}<li><a href={social.url}>{social.label === 'Website' ? social.url : social.label}</a></li>{/each}</ul></div>
			</div>
			<div class="col-2">
				<div class="bio"><h3>Biography</h3><!-- Server-sanitized Markdown, never raw CMS HTML. -->{@html company.aboutHtml}</div>
				{#if company.skills.length}<div class="skills"><h3>Skills</h3><div class="skill-list">{#each company.skills as skill}<a href={skill.url} class="button outline skill">{skill.name}</a>{' '}{/each}</div></div>{/if}
			</div>
		</div>
		{#each ['Archive', 'Members', 'Jobs'] as tab}
			<input name="company-tabs" type="radio" id={'company-' + tab.toLowerCase()} class="tab" aria-controls={'company-' + tab.toLowerCase() + '-panel'} />
			<label for={'company-' + tab.toLowerCase()} class="label">{tab}</label>
			<div id={'company-' + tab.toLowerCase() + '-panel'} class="panel archive"><h3>{tab}</h3><p>Coming Soon.</p></div>
		{/each}
	</section>
</main>

<style>
	.company { margin: 0 5vmax; }
	.company-header { align-items: center; background: url('/images/circuitry/circuit_graphic.svg') 0% -30% no-repeat; color: #000; display: flex; flex-flow: column wrap; padding: 2rem 0; text-align: center; }
	.company-header > * { flex: 1 1 auto; min-width: 0; }
	h1 { font-size: 4rem; font-weight: 700; line-height: 1; margin: 2rem auto; overflow-wrap: anywhere; }
	h3 { font-size: 21.06px; line-height: 29.988px; font-weight: 700; margin: 1em 0; }
	.logo { max-width: min(100%, 275px); }
	.information { order: 2; width: 100%; }
	.image { width: 75%; }
	.image img, .image iframe { border-radius: 2rem; width: 100%; }
	.image iframe { border: 0; display: block; aspect-ratio: 16 / 9; }
	.image::after { background: var(--color-sgf-dark-blue); content: ''; display: block; height: 200px; position: absolute; top: 125px; right: 0; width: 300px; z-index: -1; }
	.company-content { width: 100%; }
	.tabs { display: flex; flex-wrap: wrap; justify-content: center; }
	.tab { position: absolute; opacity: 0; width: 1px; height: 1px; }
	.tab:checked + .label { color: inherit; }
	.tab:checked + .label + .panel { display: flex; }
	.tab:focus-visible + .label { outline: 2px solid var(--color-sgf-light-blue); outline-offset: -4px; }
	.label { color: #6e6d7a; font-weight: bold; cursor: pointer; padding: 20px 30px; width: 100%; }
	.panel { border-top: 2px solid var(--color-sgf-light-gray); display: none; flex-direction: column; padding: 2rem 0; width: 100%; }
	.panel.archive { flex-direction: column; }
	.col-1, .col-2 { display: flex; flex-flow: row wrap; width: 100%; min-width: 0; }
	.col-1 > *, .col-2 > * { width: 100%; }
	.metadata { background: var(--color-sgf-gray); border-radius: 2rem; min-height: 10rem; padding: 2rem; }
	.metadata > div { margin: 0.5rem 0; }
	.flag { position: absolute; right: 5vmax; }
	.flag div { background: var(--color-sgf-light-blue); clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 7px 50%); color: #fff; font-size: 14px; font-weight: 400; line-height: 23px; margin-bottom: 8px; padding: 0 5px 0 14px; }
	.socials li { margin: 0.5rem 0; overflow-wrap: anywhere; }
	a:not(.button) { color: var(--color-sgf-dark-blue); font-weight: 500; }
	a:not(.button):hover { color: var(--color-sgf-light-blue); }
	.bio :global(p) { margin: 1em 0; }
	.bio :global(img) { max-width: 100%; }
	.bio :global(pre) { overflow-x: auto; }
	.button { font-family: inherit; background: var(--color-sgf-light-blue); border-radius: 25.5px; font-weight: 600; font-size: 14px; color: #fff; padding: 0 24px; height: 40px; display: inline-flex; align-items: center; text-decoration: none; }
	.button.outline { border: 1px solid var(--color-sgf-light-blue); background: none; color: var(--color-sgf-dark-blue); }
	.button.skill { color: #000; border-color: var(--color-sgf-gray); }
	@media (min-width: 600px) { .label { width: auto; } .panel { order: 99; } }
	@media (min-width: 767px) { .image::after { height: 340px; width: 440px; } }
	@media (min-width: 1024px) {
		.company-header { background-position: 60% -35%; flex-flow: row nowrap; padding: 4rem 0 2rem; text-align: left; }
		.information { order: initial; width: 33%; } .image { width: 40%; } .image::after { width: 30%; }
		.tabs { justify-content: flex-start; } .panel { flex-direction: row; }
		.col-1 { order: 2; width: 33%; flex-flow: column wrap; } .col-2 { width: 66%; padding-right: 2rem; flex-flow: column wrap; }
		.flag { right: 6vmax; }
	}
</style>
