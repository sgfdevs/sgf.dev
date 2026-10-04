<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const member = $derived(data.member);
</script>

<svelte:head>
	<title>Springfield Devs - {member.name}</title>
	<meta property="og:title" content={`Springfield Devs - ${member.name}`} />
</svelte:head>

<main class="profile" aria-labelledby="member-name">
	<header class="profile-header">
		<div class="information">
			<h1 id="member-name">{member.name}</h1>
			{#if member.jobTitle}<h2>{member.jobTitle}</h2>{/if}
			{#if member.websiteUrl}
				<a href={member.websiteUrl} target="_blank" rel="noopener noreferrer" class="button">Visit Site</a>
			{/if}
			{#if member.available}
				<button type="button" class="button outline" disabled title="Contact action is not available yet.">Hire Me</button>
			{/if}
		</div>

		<div class="image-wrapper">
			<figure class="image">
				<img src={member.image} alt={member.name} />
				<figcaption>
					{#each member.tags as tag}<div>{tag}</div>{/each}
				</figcaption>
			</figure>
		</div>
	</header>

	<section class="profile-content tabs" aria-label="Member profile sections">
		<input name="member-tabs" type="radio" id="member-about" checked class="tab" aria-controls="member-about-panel" />
		<label for="member-about" class="label">About</label>
		<div id="member-about-panel" class="panel about">
			<div class="col-1">
				<div class="metadata">
					{#if member.location}<div>{@render icon('location')} {member.location}</div>{/if}
					{#if member.joinMonthLabel}<div>{@render icon('calendar')} Member since {member.joinMonthLabel}</div>{/if}
				</div>
				<div class="socials">
					<h3>Social</h3>
					<ul>
						{#each member.socials as social}
							<li><a href={social.url} target="_blank" rel="noopener noreferrer">{@render icon(social.label)} {social.label}</a></li>
						{/each}
					</ul>
				</div>
			</div>
			<div class="col-2">
				<div class="bio">
					<h3>Biography</h3>
					<!-- biographyHtml is sanitized on the server, never raw AboutHtml. -->
					{@html member.biographyHtml}
				</div>
				{#if member.skills.length}
					<div class="skills">
						<h3>Skills</h3>
						<div class="skill-list">
							{#each member.skills as skill}<a href={skill.url} class="button outline skill">{skill.name}</a>{' '}{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>

		<input name="member-tabs" type="radio" id="member-archive" class="tab" aria-controls="member-archive-panel" />
		<label for="member-archive" class="label">Archive <span>0</span></label>
		<div id="member-archive-panel" class="panel archive">
			<h3>Archive</h3>
			<p>Member video archive feature is coming soon</p>
		</div>
	</section>
</main>

{#snippet icon(kind: string)}
	<svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		{#if kind === 'location'}
			<path d="M12 1a8 8 0 0 0-8 8c0 6 8 14 8 14s8-8 8-14a8 8 0 0 0-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
		{:else if kind === 'calendar'}
			<path d="M5 1h2v3h10V1h2v3h2v18H3V4h2V1Zm0 8v11h14V9H5Zm2 2h3v3H7v-3Zm6 0h3v3h-3v-3Z" />
		{:else if kind === 'Twitter'}
			<path d="M23 4a9 9 0 0 1-3 1 5 5 0 0 0 2-3 9 9 0 0 1-3 1 5 5 0 0 0-8 4v1A13 13 0 0 1 2 3a5 5 0 0 0 1 7L1 9a5 5 0 0 0 4 5H3a5 5 0 0 0 4 3 10 10 0 0 1-6 2 14 14 0 0 0 21-12V6l1-2Z" />
		{:else if kind === 'LinkedIn'}
			<path d="M2 2h20v20H2V2Zm3 7v10h3V9H5Zm1.5-5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM10 9v10h3v-6c0-3 4-3 4 0v6h3v-7c0-5-5-5-7-2V9h-3Z" />
		{:else if kind === 'Facebook'}
			<path d="M14 23V13h3l1-4h-4V7c0-1 0-2 2-2h2V1h-3c-4 0-6 2-6 6v2H6v4h3v10h5Z" />
		{:else if kind === 'Instagram'}
			<rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="currentColor" stroke-width="2" /><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2" /><circle cx="18" cy="6" r="1.5" />
		{:else if kind === 'Youtube'}
			<path d="M2 5c3-1 17-1 20 0 2 2 2 12 0 14-3 1-17 1-20 0-2-2-2-12 0-14Zm8 3v8l7-4-7-4Z" />
		{:else}
			<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" /><ellipse cx="12" cy="12" rx="4" ry="10" fill="none" stroke="currentColor" stroke-width="2" /><path d="M2 12h20M4 6h16M4 18h16" fill="none" stroke="currentColor" />
		{/if}
	</svg>
{/snippet}

<style>
	.profile { margin: 0 5vmax; }
	.profile-header { align-items: center; background: url('/images/circuitry/circuit_graphic.svg') 0% -30% no-repeat; color: #000; display: flex; flex-flow: column wrap; padding: 2rem 0; text-align: center; }
	.profile-header > * { flex: 1 1 auto; min-width: 0; }
	h1 { font-size: 4rem; line-height: 1; font-weight: 700; margin: 0.67em 0; overflow-wrap: anywhere; }
	h2 { font-size: 27px; font-weight: 700; line-height: 29.988px; margin: 0.83em 0; }
	h3 { font-size: 21.06px; line-height: 29.988px; font-weight: 700; margin: 1em 0; }
	p { margin: 1em 0; }
	.information { order: 2; width: 100%; }
	.image-wrapper { width: 100%; }
	.image-wrapper::after { background: var(--color-sgf-dark-blue); content: ''; display: block; height: 200px; position: absolute; top: 125px; right: 0; width: 300px; z-index: -1; }
	.image { position: relative; max-width: 800px; margin: 0; }
	.image img { width: 100%; height: auto; border-radius: 2rem; display: inline; vertical-align: baseline; }
	figcaption { position: absolute; bottom: 30px; right: 0; }
	figcaption div { background: #6f9dca; color: #fff; padding: 0 5px 0 14px; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 7px 50%); line-height: 23px; font-size: 14px; margin-bottom: 8px; }
	.profile-content { width: 100%; }
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
	.icon { color: var(--color-sgf-dark-blue); width: 1.8rem; height: 1.8rem; margin-right: 0.5rem; display: inline-block; vertical-align: middle; }
	.socials li { margin: 0.5rem 0; }
	.socials .icon { color: var(--color-sgf-light-blue); }
	a:not(.button), .bio :global(a) { color: var(--color-sgf-dark-blue); font-weight: 500; }
	a:hover, .bio :global(a:hover) { color: var(--color-sgf-light-blue); }
	a:focus-visible { outline: 2px solid var(--color-sgf-light-blue); outline-offset: 3px; }
	.button { background: var(--color-sgf-light-blue); border-radius: 25.5px; font-weight: 600; font-size: 14px; color: #fff; padding: 0 24px; border: 0; height: 40px; display: inline-flex; align-items: center; font-family: inherit; }
	.button.outline { border: 1px solid var(--color-sgf-light-blue); background: none; color: var(--color-sgf-dark-blue); }
	.button:disabled { cursor: default; }
	.skill-list .skill { color: #000; border-color: var(--color-sgf-gray); }
	.bio { overflow-wrap: anywhere; }
	.bio :global(p) { margin: 1em 0; }
	.bio :global(ul) { list-style: disc; margin: 1em 0; padding-left: 40px; }
	.bio :global(ol) { list-style: decimal; margin: 1em 0; padding-left: 40px; }
	.bio :global(strong), .bio :global(b) { font-weight: bold; }
	.bio :global(em), .bio :global(i) { font-style: italic; }
	.bio :global(blockquote) { margin: 1em 40px; }
	.bio :global(pre) { white-space: pre-wrap; }
	.bio :global(h2), .bio :global(h3), .bio :global(h4) { font-weight: 700; margin: 1em 0; }
	.bio :global(h2) { font-size: 27px; }
	.bio :global(h3) { font-size: 21.06px; }
	@media (min-width: 500px) { .image-wrapper { width: 75%; } }
	@media (min-width: 600px) { .label { width: auto; } .panel { order: 99; } }
	@media (min-width: 767px) { .image-wrapper::after { height: 340px; width: 440px; } }
	@media (min-width: 768px) { .col-1 { flex-wrap: nowrap; } .metadata { order: 2; } }
	@media (min-width: 1024px) {
		.profile-header { background-position: 60% -35%; flex-flow: row nowrap; padding: 4rem 0 2rem; text-align: left; }
		.information { order: initial; width: 33%; }
		.image-wrapper { width: 40%; }
		.image-wrapper::after { width: 30%; }
		.tabs { justify-content: flex-start; }
		.panel { flex-direction: row; }
		.col-1, .col-2 { flex-flow: column wrap; }
		.col-1 { order: 2; width: 33%; }
		.col-2 { padding-right: 2rem; width: 66%; }
		.metadata { order: initial; }
	}
</style>
