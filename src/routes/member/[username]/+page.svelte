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
							<li><a href={social.url} target="_blank" rel="noopener noreferrer">{@render socialIcon(social.label)} {social.label}</a></li>
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
		{/if}
	</svg>
{/snippet}

{#snippet socialIcon(kind: string)}
	<!-- Font Awesome Free 5.14.0 by @fontawesome, CC BY 4.0. See /licenses/font-awesome-free.txt. -->
	{#if kind === 'Twitter'}
		<svg class="social-icon" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true"><path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" /></svg>
	{:else if kind === 'LinkedIn'}
		<svg class="social-icon" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true"><path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" /></svg>
	{:else if kind === 'Facebook'}
		<svg class="social-icon" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true"><path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z" /></svg>
	{:else if kind === 'Instagram'}
		<svg class="social-icon" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" /></svg>
	{:else if kind === 'Youtube'}
		<svg class="social-icon" viewBox="0 0 576 512" fill="currentColor" aria-hidden="true"><path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" /></svg>
	{:else}
		<svg class="social-icon" viewBox="0 0 496 512" fill="currentColor" aria-hidden="true"><path d="M336.5 160C322 70.7 287.8 8 248 8s-74 62.7-88.5 152h177zM152 256c0 22.2 1.2 43.5 3.3 64h185.3c2.1-20.5 3.3-41.8 3.3-64s-1.2-43.5-3.3-64H155.3c-2.1 20.5-3.3 41.8-3.3 64zm324.7-96c-28.6-67.9-86.5-120.4-158-141.6 24.4 33.8 41.2 84.7 50 141.6h108zM177.2 18.4C105.8 39.6 47.8 92.1 19.3 160h108c8.7-56.9 25.5-107.8 49.9-141.6zM487.4 192H372.7c2.1 21 3.3 42.5 3.3 64s-1.2 43-3.3 64h114.6c5.5-20.5 8.6-41.8 8.6-64s-3.1-43.5-8.5-64zM120 256c0-21.5 1.2-43 3.3-64H8.6C3.2 212.5 0 233.8 0 256s3.2 43.5 8.6 64h114.6c-2-21-3.2-42.5-3.2-64zm39.5 96c14.5 89.3 48.7 152 88.5 152s74-62.7 88.5-152h-177zm159.3 141.6c71.4-21.2 129.4-73.7 158-141.6h-108c-8.8 56.9-25.6 107.8-50 141.6zM19.3 352c28.6 67.9 86.5 120.4 158 141.6-24.4-33.8-41.2-84.7-50-141.6h-108z" /></svg>
	{/if}
{/snippet}

<style>
	/* Keep the legacy negative-z photo backdrop above the white body, below the header artwork. */
	.profile { margin: 0 5vmax; isolation: isolate; }
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
	.social-icon { color: var(--color-sgf-light-blue); height: 1.8rem; width: auto; margin-right: 0.5rem; display: inline-block; vertical-align: middle; }
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
