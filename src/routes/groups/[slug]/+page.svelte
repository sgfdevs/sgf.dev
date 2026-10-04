<script lang="ts">
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	const group = $derived(data.group);
</script>

<svelte:head><title>Springfield Devs - {group.name}</title></svelte:head>

<main class="group" aria-labelledby="group-name">
	<header class="group-header">
		<div class="information">
			<p class="category">Group</p><h1 id="group-name">{group.name}</h1>
			{#if group.websiteUrl}<a href={group.websiteUrl} class="button">Visit Site</a>{/if}
		</div>
		<div class="video">
			<!-- The single legacy video is trusted static markup. No CMS embed HTML or URL is accepted. -->
			<iframe title="Springfield Devs group introduction" src="https://www.youtube.com/embed/3a5mR5xoUbc" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
		</div>
	</header>
	<section class="group-content tabs" aria-label="Group sections">
		<input name="group-tabs" type="radio" id="group-about" checked class="tab" aria-controls="group-about-panel" />
		<label for="group-about" class="label">About</label>
		<div id="group-about-panel" class="panel about">
			<div class="col-1">
				<div class="metadata">
					{#if group.location}<div>Location: {group.location}</div>{/if}
					{#if group.establishedText}<div>{group.establishedText}</div>{/if}
				</div>
				{#if group.image}<div class="image"><img src={group.image} alt={group.name} /></div>{/if}
				<div class="socials"><h3>Social</h3><ul>{#each group.socials as social}<li><a href={social.url}>{social.label}</a></li>{/each}</ul></div>
			</div>
			<div class="col-2">
				<div class="bio"><h3>Biography</h3><!-- Server-sanitized, never raw AboutText. -->{@html group.aboutHtml}</div>
				{#if group.skills.length}<div class="skills"><h3>Skills</h3><div class="skill-list">{#each group.skills as skill}<a href={skill.url} class="button outline skill">{skill.name}</a>{' '}{/each}</div></div>{/if}
			</div>
		</div>
		{#if group.upcomingPresentations.length}
			<input name="group-tabs" type="radio" id="group-events" class="tab" aria-controls="group-events-panel" />
			<label for="group-events" class="label">Upcoming Events <span>{group.upcomingPresentations.length}</span></label>
			<div id="group-events-panel" class="panel archive"><h3>Events</h3><div class="cards grid">
				{#each group.upcomingPresentations as presentation}
					{#if presentation.presenters[0]}
						<div class="card company_card">
							<figure><img src={presentation.presenters[0].imageUrl} alt={presentation.presenters[0].name} /><figcaption>{#each presentation.presenters[0].tags as tag}<div>{tag}</div>{/each}</figcaption></figure>
							<div class="content"><dl><dt>{presentation.title}</dt>{#each presentation.presenters as presenter}<dd>{presenter.name}</dd>{/each}<dd>{presentation.eventName}</dd></dl><footer><button type="button" disabled title="Event details are not available yet." class="button outline small">Details</button></footer></div>
						</div>
					{/if}
				{/each}
			</div></div>
		{/if}
		{#if group.leaders.length}
			<input name="group-tabs" type="radio" id="group-leaders" class="tab" aria-controls="group-leaders-panel" />
			<label for="group-leaders" class="label">Leaders <span>{group.leaders.length}</span></label>
			<div id="group-leaders-panel" class="panel archive"><h3>Leaders</h3><div class="cards grid">
				{#each group.leaders as leader}
					<div class="card company_card">
						<figure>{#if leader.image}<img src={leader.image} alt={leader.name} />{/if}<figcaption>{#each leader.tags as tag}<div>{tag}</div>{/each}</figcaption></figure>
						<div class="content"><dl><dt>{leader.name}</dt><dd>{leader.location}</dd></dl><footer><a href={leader.path} class="button outline small">Profile</a></footer></div>
					</div>
				{/each}
			</div></div>
		{/if}
	</section>
</main>

<style>
	.group { margin: 0 5vmax; }
	.group-header { align-items: center; background: url('/images/circuitry/circuit_graphic.svg') 0% -30% no-repeat; color: #000; display: flex; flex-flow: column wrap; padding: 2rem 0; text-align: center; }
	.group-header > * { flex: 1 1 auto; min-width: 0; }
	h1 { font-size: 4rem; font-weight: 700; line-height: 1; margin: 2rem auto; padding-right: 1rem; overflow-wrap: anywhere; }
	h3 { font-size: 21.06px; line-height: 29.988px; font-weight: 700; margin: 1em 0; }
	.information { order: 2; width: 100%; }
	.category { color: var(--color-sgf-light-blue); text-transform: uppercase; }
	.video { width: 75%; }
	.video iframe { border: 0; border-radius: 2rem; display: block; height: 440px; width: 100%; }
	.group-content { width: 100%; }
	.tabs { display: flex; flex-wrap: wrap; justify-content: center; }
	.tab { position: absolute; opacity: 0; width: 1px; height: 1px; }
	.tab:checked + .label { color: inherit; }
	.tab:checked + .label + .panel { display: flex; }
	.tab:focus-visible + .label { outline: 2px solid var(--color-sgf-light-blue); outline-offset: -4px; }
	.label { color: #6e6d7a; font-weight: bold; cursor: pointer; padding: 20px 30px; width: 100%; }
	.label span { font-weight: normal; margin-left: 0.2rem; }
	.panel { border-top: 2px solid var(--color-sgf-light-gray); display: none; flex-direction: column; padding: 2rem 0; width: 100%; }
	.panel.archive { flex-direction: column; }
	.col-1, .col-2 { display: flex; flex-flow: row wrap; width: 100%; min-width: 0; }
	.col-1 > *, .col-2 > * { width: 100%; }
	.metadata { background: var(--color-sgf-gray); border-radius: 2rem; min-height: 10rem; padding: 2rem; }
	.metadata > div { margin: 0.5rem 0; }
	.image { margin: 1rem auto; }
	.image img { border-radius: 2rem; }
	.socials ul { display: flex; flex-flow: row wrap; justify-content: space-between; }
	.socials li { margin: 0.5rem 0; width: 40%; overflow-wrap: anywhere; }
	.bio :global(p) { margin: 1em 0; }
	.bio :global(img) { max-width: 100%; }
	.bio :global(pre) { overflow-x: auto; }
	.button { font-family: inherit; background: var(--color-sgf-light-blue); border-radius: 25.5px; font-weight: 600; font-size: 14px; color: #fff; padding: 0 24px; height: 40px; display: inline-flex; align-items: center; text-decoration: none; }
	.button.outline { border: 1px solid var(--color-sgf-light-blue); background: none; color: var(--color-sgf-dark-blue); }
	.button.small { padding: 0 14px; height: 30px; }
	.button.skill { color: #000; border-color: var(--color-sgf-gray); }
	.cards.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 315px), 1fr)); gap: 25px 27px; }
	.card { border: 1px solid #f5f7f7; border-radius: 27px; }
	.card figure { position: relative; height: 228px; border-radius: 27px 27px 0 0; overflow: hidden; margin: 0; }
	.card figure img { width: 100%; height: 100%; object-fit: cover; }
	.card figcaption { position: absolute; bottom: 16px; right: 0; }
	.card figcaption div { background: #6f9dca; color: #fff; padding: 0 5px 0 14px; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 7px 50%); line-height: 23px; font-size: 14px; margin-bottom: 8px; }
	.card .content { padding: 14px 16px 13px; }
	.card dl { text-align: center; margin: 0; }
	.card dt { font-weight: 600; font-size: 18px; }
	.card dd { font-size: 15px; margin: 0; }
	.card footer { margin-top: 20px; }
	@media (min-width: 600px) { .label { width: auto; } .panel { order: 99; } }
	@media (max-width: 1023px) { .image { width: 50%; } }
	@media (min-width: 1024px) {
		.group-header { background-position: 60% -35%; flex-flow: row nowrap; padding: 4rem 0 2rem; text-align: left; }
		.information { order: initial; width: 33%; } .video { width: 40%; }
		.tabs { justify-content: flex-start; } .panel { flex-direction: row; }
		.col-1 { order: 2; width: 33%; flex-flow: column wrap; } .col-2 { width: 66%; padding-right: 2rem; flex-flow: column wrap; }
	}
</style>
