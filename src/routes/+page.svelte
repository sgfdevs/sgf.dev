<script lang="ts">
	import type { PageProps } from './$types';

	type Home = PageProps['data']['home'];
	type DevNight = NonNullable<Home['nextDevNight']>;
	type Presenter = DevNight['presentations'][number]['presenters'][number];
	type Member = Home['directory']['dailyMembers'][number];
	type Sponsor = Home['sponsors'][number];

	let { data }: PageProps = $props();

	const home = $derived(data.home);
	const nextDevNight = $derived(home.nextDevNight);
	const hasDevNight = $derived(Boolean(nextDevNight && nextDevNight.presentations.length > 0));
</script>

{#snippet presenterImage(presenter: Presenter)}
	{#if presenter.profilePath}
		<a href={presenter.profilePath} aria-label={presenter.name}>
			<img src={presenter.imageUrl} alt={presenter.name} loading="lazy" />
		</a>
	{:else}
		<img src={presenter.imageUrl} alt={presenter.name} loading="lazy" />
	{/if}
{/snippet}

{#snippet presenterName(presenter: Presenter)}
	{#if presenter.profilePath}
		<dd><a href={presenter.profilePath}>{presenter.name}</a></dd>
	{:else}
		<dd>{presenter.name}</dd>
	{/if}
{/snippet}

{#snippet memberCard(member: Member)}
	<div class="card company-card">
		<figure>
			<a href={member.url}><img src={member.image} alt={member.name} loading="lazy" /></a>
			{#if member.tags.length}
				<figcaption>
					{#each member.tags as tag}
						<div>{tag}</div>
					{/each}
				</figcaption>
			{/if}
		</figure>

		<div class="content">
			<dl>
				<dt><a href={member.url}>{member.name}</a></dt>
				<dd>{member.location}</dd>
			</dl>

			<footer>
				<a class="button outline small" href={member.url}>Profile</a>
			</footer>
		</div>
	</div>
{/snippet}

{#snippet sponsorCard(sponsor: Sponsor)}
	<div class="card sponsor-card">
		<figure>
			<a href={sponsor.path} aria-label={sponsor.name}>
				{#if sponsor.logoUrl}
					<img src={sponsor.logoUrl} alt={sponsor.name} loading="lazy" />
				{:else}
					<span class="logo-fallback">{sponsor.name}</span>
				{/if}
			</a>
			{#if sponsor.isFoundingSponsor}
				<figcaption><div>Founding Sponsor</div></figcaption>
			{/if}
		</figure>

		<div class="content">
			<dl>
				<dt><a href={sponsor.path}>{sponsor.name}</a></dt>
				{#if sponsor.websiteUrl && sponsor.websiteLabel}
					<dd><a href={sponsor.websiteUrl} target="_blank" rel="noreferrer">{sponsor.websiteLabel}</a></dd>
				{:else}
					<dd>{sponsor.name}</dd>
				{/if}
			</dl>
		</div>
	</div>
{/snippet}

<svelte:head>
	<title>Springfield Devs</title>
</svelte:head>

<main class="home-page" aria-label="Springfield Devs site content">
	{#if hasDevNight && nextDevNight}
		<section class="dev-night-banner" aria-labelledby="dev-night-heading">
			<time datetime={nextDevNight.dateTimeAttribute}><span>{nextDevNight.dateLabel}</span></time>
			<div class="headline">
				<img id="dev-night-heading" src="/images/headlines/dev_night.svg" alt="Dev Night" />
			</div>

			<ul class={`presentations presentations-${Math.min(nextDevNight.presentations.length, 3)}`}>
				{#each nextDevNight.presentations as presentation}
					<li>
						<div class="members">
							{#each presentation.presenters as presenter}
								{@render presenterImage(presenter)}
							{/each}
						</div>

						{#if presentation.meetupUrl}
							<a class="presentation-link" title="Meetup Link" target="_blank" rel="noreferrer" href={presentation.meetupUrl}><h3>{presentation.title}</h3></a>
						{:else}
							<h3>{presentation.title}</h3>
						{/if}

						{#if presentation.presenters.length}
							<dl>
								<dt>Presented By</dt>
								{#each presentation.presenters as presenter}
									{@render presenterName(presenter)}
								{/each}
							</dl>
						{/if}

						{#if presentation.group?.showAttribution}
							<dl>
								<dt>From</dt>
								<dd><a href={presentation.group.path}>{presentation.group.name}</a></dd>
							</dl>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<section class="directory-preview" aria-labelledby="directory-heading">
		<header>
			<section>
				<img id="directory-heading" src="/images/headlines/directory.svg" alt="Directory" />
				<span>Find the Best Agencies and Professionals </span>
			</section>

			<section>
				<span><strong>{home.directory.totalMembers}</strong> Members</span>
			</section>
		</header>

		<div class="cards inline">
			<div class="scroll" aria-label="Featured directory members">
				<div class="card intro-card">
					<dl>
						<dt>Professional Directory</dt>
						<dd>Find the <strong>best agencies</strong> and <strong>talented professionals</strong> in Southwest Missouri</dd>
					</dl>

					<p>{home.directory.totalMembers} profiles found</p>

					<footer>
						<a href="/directory/" class="button outline">Explore</a>
					</footer>
				</div>

				{#each home.directory.dailyMembers as member}
					{@render memberCard(member)}
				{/each}
			</div>
		</div>
	</section>

	<section class="sponsors-highlight" aria-labelledby="sponsors-heading">
		<header>
			<section>
				<img id="sponsors-heading" src="/images/headlines/sponsor.svg" alt="Sponsors" />
				<span>We are proudly supported by these companies &amp; brands</span>
			</section>

			<div class="circuit-graphic" aria-hidden="true"></div>
		</header>

		<div class="cards grid">
			<div class="card intro-card">
				<dl>
					<dt>Sponsorship Opportunities</dt>
					<dd>Connect with the developer community in Springfield</dd>
				</dl>

				<footer>
					<a href="/about/sponsorship/" class="button outline black">Become a Sponsor</a>
				</footer>
			</div>

			{#each home.sponsors as sponsor}
				{@render sponsorCard(sponsor)}
			{/each}
		</div>
	</section>

	<section class="about-banner">
		<div class="site-container">
			<div class="content">
				<h3>Educating, inspiring and supporting developers, agencies and professionals in the Greater Springfield, MO area.</h3>
				<p>
					Springfield Devs is a non-profit organization focused on growing and fostering the developer community in Southwest Missouri since 2014. The first Wednesday of every month we host Dev Night where several local groups present on their related topics. These events are hosted in-person at the efactory and streamed live online. Dev Nights are always free events and food/beverages are served. Join our Meetup to receive notifications on the next Dev Night.
				</p>
				<p>
					<a href="https://www.meetup.com/sgfdevs/" class="button" target="_blank" rel="noreferrer">SGF Devs Meetup</a>
				</p>
				<p>And the party doesn't stop after Dev Night. Join our Discord server to keep the convos rolling.</p>
				<p>
					<a href="https://discord.sgf.dev/" class="button" target="_blank" rel="noreferrer">SGF Devs Discord</a>
				</p>
			</div>
		</div>
	</section>
</main>

<style>
	.home-page {
		overflow: hidden;
	}

	.button {
		background: var(--color-sgf-light-blue);
		border-radius: 25.5px;
		font-weight: 600;
		font-size: 14px;
		color: #fff;
		padding: 0 24px;
		border: 0;
		height: 40px;
		display: inline-flex;
		align-items: center;
		text-decoration: none;
	}

	.button.outline {
		border: 1px solid var(--color-sgf-light-blue);
		background: none;
		color: var(--color-sgf-dark-blue);
	}

	.button.outline.small {
		padding: 0 14px;
		height: 30px;
	}

	.button.outline.black {
		border-color: #000;
		color: #000;
	}

	.dev-night-banner {
		background: var(--color-sgf-dark-blue);
		border-radius: 27px;
		padding: 0 0 144px;
		color: #fff;
		text-align: center;
		position: relative;
		z-index: 10;
		overflow: hidden;
	}

	.dev-night-banner time {
		display: block;
		font-weight: 700;
		font-size: 20px;
		color: #fff;
	}

	.dev-night-banner time span {
		padding: 14px 0;
		width: 270px;
		display: inline-block;
		border-left: 2px solid var(--color-sgf-light-blue);
		border-right: 2px solid var(--color-sgf-light-blue);
	}

	.dev-night-banner .headline {
		position: relative;
		display: inline-block;
		margin: 0 0 60px;
		padding: 30px 50px 22px;
		transform: translateY(-4px);
		background-image: url('/images/circuit_oval.svg'), url('/images/circuit_oval.svg'), url('/images/circuit_oval.svg'), url('/images/circuit_oval.svg'), url('/images/circuit_line.svg'), url('/images/circuit_line.svg');
		background-size: 11px 11px, 11px 11px, 11px 11px, 11px 11px, 2px, 2px;
		background-repeat: no-repeat, no-repeat, no-repeat, no-repeat, repeat-x, repeat-x;
		background-position: 0 0, right 0, 0 bottom, right bottom, right 0 top 4px, right 0 bottom 4px;
	}

	.dev-night-banner .headline img {
		display: block;
	}

	.presentations {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 50px;
		padding: 0 43px;
		background: url('/images/circuit_line.svg') repeat-x center;
		background-size: 2px;
	}

	.presentations-1 {
		grid-template-columns: repeat(1, minmax(0, 1fr));
	}

	.presentations-2 {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.presentations-1 li {
		max-width: 575px;
		margin: 0 auto;
	}

	.presentations li {
		position: relative;
		border: 2px solid var(--color-sgf-light-blue);
		padding: 33px;
		background: var(--color-sgf-dark-blue);
		align-items: center;
		display: flex;
		flex-direction: column;
	}

	.presentations li .members {
		display: flex;
		top: -40px;
		position: absolute;
		align-self: center;
	}

	.presentations li .members > img,
	.presentations li .members > a {
		border: 2px solid var(--color-sgf-light-blue);
		border-radius: 50%;
		width: 80px;
		height: 80px;
		display: block;
		background: var(--color-sgf-dark-blue);
		overflow: hidden;
	}

	.presentations li .members a {
		flex-shrink: 0;
	}

	.presentations li .members > :not(:first-child) {
		margin-left: -10px;
		transform: rotateY(-1deg);
	}

	.presentations li img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		object-fit: cover;
		filter: grayscale(100%);
	}

	.presentations li h3 {
		font-size: 24px;
		font-weight: 700;
		color: #fff;
		letter-spacing: 0;
		line-height: 28px;
		margin: 1em 0;
	}

	.presentation-link {
		color: #fff;
		text-decoration: underline;
	}

	.presentations li dl {
		margin: 0;
	}

	.presentations li dl + dl {
		margin-top: 8px;
	}

	.presentations li dl dt,
	.presentations li dl dd {
		margin: 0;
		display: inline-block;
		text-transform: uppercase;
		letter-spacing: 0.7px;
	}

	.presentations li dl dd + dd::before {
		content: ' | ';
		position: relative;
	}

	.presentations li dl a {
		color: var(--color-sgf-light-blue);
		text-decoration: none;
	}

	.directory-preview {
		padding: 43px 0 122px;
		position: relative;
	}

	.directory-preview::before {
		position: absolute;
		z-index: 1;
		top: -30px;
		left: 0;
		width: 100%;
		height: 30px;
		background: #fff;
		border-radius: 27px 27px 0 0;
		content: '';
	}

	.directory-preview header,
	.sponsors-highlight > header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 46px;
	}

	.directory-preview header {
		padding: 0 50px;
	}

	.directory-preview header section:first-child,
	.sponsors-highlight > header section:first-child {
		display: flex;
		align-items: center;
	}

	.directory-preview header section:first-child img,
	.sponsors-highlight > header section:first-child img {
		margin-right: 8px;
		flex-shrink: 0;
	}

	.directory-preview header section:nth-child(2) {
		display: flex;
		align-items: flex-end;
	}

	.directory-preview header section:nth-child(2) span {
		font-weight: 300;
		margin-right: 14px;
	}

	.cards.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(315px, 1fr));
		gap: 25px 27px;
	}

	.cards.grid .card {
		max-width: 100%;
	}

	.cards.inline {
		position: relative;
	}

	.cards.inline .scroll {
		scroll-snap-type: x mandatory;
		display: flex;
		overflow-x: auto;
	}

	.cards.inline .scroll::-webkit-scrollbar {
		display: none;
	}

	.cards.inline .scroll .card {
		scroll-snap-align: end;
	}

	.cards.inline .card {
		margin-right: 30px;
		flex-shrink: 0;
	}

	.cards.inline .card:first-child {
		margin-left: 50px;
	}

	.card {
		border-radius: 27px;
		max-width: 316px;
		border: 1px solid #f5f7f7;
	}

	.card a {
		text-decoration: none;
	}

	.card figure {
		position: relative;
		height: 228px;
		border-top-left-radius: 27px;
		border-top-right-radius: 27px;
		overflow: hidden;
		margin: 0;
	}

	.card figure > a {
		display: block;
		height: 100%;
	}

	.card figure img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.card figure figcaption {
		position: absolute;
		bottom: 16px;
		right: 0;
	}

	.card figure figcaption div {
		background: #6f9dca;
		color: #fff;
		padding: 0 5px 0 14px;
		clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 7px 50%);
		line-height: 23px;
		font-weight: 400;
		font-size: 14px;
		letter-spacing: 0;
		margin-bottom: 8px;
	}

	.card dl {
		color: var(--color-sgf-dark-blue);
		text-align: center;
		margin: 0;
	}

	.card dl dt,
	.card dl dd {
		margin: 0;
		line-height: 1.5em;
	}

	.card dl dt,
	.card dl dt a {
		font-weight: 600;
		color: var(--color-sgf-dark-blue);
		text-decoration: none;
		font-size: 18px;
	}

	.card dl dd {
		font-size: 15px;
	}

	.card footer {
		margin-top: 20px;
	}

	.card .content {
		padding: 14px 16px 13px;
		background: #fff;
		border-radius: 0 0 27px 27px;
	}

	.intro-card {
		background: #f5f7f7;
		color: var(--color-sgf-dark-blue);
		padding: 28px 23px;
		font-size: 14px;
		display: flex !important;
		flex-direction: column;
		min-height: 299px;
	}

	.intro-card dl {
		margin: 0;
		text-align: left;
	}

	.intro-card dl dt {
		font-weight: 600;
		font-size: 14px;
		color: #000;
		margin-bottom: 15px;
	}

	.intro-card dl dd {
		margin: 0;
		font-weight: 700;
		font-size: 24px;
		color: var(--color-sgf-dark-blue);
		letter-spacing: -0.32px;
		line-height: 32px;
	}

	.intro-card dl dd strong {
		color: var(--color-sgf-light-blue);
	}

	.intro-card p {
		margin: 0;
	}

	.intro-card footer {
		margin-top: auto;
	}

	.company-card footer {
		display: flex;
		justify-content: space-between;
	}

	.sponsors-highlight {
		position: relative;
		background: var(--color-sgf-dark-blue);
		color: #fff;
		padding: 43px 50px;
		overflow: hidden;
	}

	.sponsors-highlight::before {
		position: absolute;
		z-index: 1;
		top: -30px;
		left: 0;
		width: 100%;
		height: 30px;
		background: var(--color-sgf-dark-blue);
		border-radius: 27px 27px 0 0;
		content: '';
	}

	.sponsors-highlight > header section {
		z-index: 2;
	}

	.sponsors-highlight > header section:first-child {
		margin-right: 30px;
	}

	.circuit-graphic {
		content: '';
		width: 100%;
		position: relative;
		height: 58px;
		flex: 1;
		top: -30px;
	}

	.circuit-graphic::before {
		position: absolute;
		top: 0;
		left: 0;
		width: calc(100% + 130px);
		content: '';
		height: 62px;
		background-image: url('/images/circuitry/sponsor_upper_left.svg'), linear-gradient(#6f9dca, #6f9dca), url('/images/circuitry/sponsor_upper_right.svg');
		background-size: 149px 51px, calc(100% - 155px) 2px, 8px 8px;
		background-repeat: no-repeat, no-repeat, no-repeat;
		background-position: 0 10px, 147px 10px, right 7px;
	}

	.circuit-graphic::after {
		position: absolute;
		top: 24px;
		left: 110px;
		width: 100%;
		content: '';
		height: 41px;
		background-image: url('/images/circuitry/sponsor_lower_left.svg'), linear-gradient(#6f9dca, #6f9dca), url('/images/circuitry/sponsor_lower_right.svg');
		background-size: 41px 31px, calc(100% - 225px) 2px, 8px 8px;
		background-repeat: no-repeat, no-repeat, no-repeat;
		background-position: 0 10px, 35px 10px, calc(100% - 184px) 7px;
	}

	.sponsors-highlight .card {
		border: 0;
	}

	.sponsor-card dl {
		text-align: left;
	}

	.sponsor-card dl a {
		font-weight: 300;
		color: #6f9dca;
		letter-spacing: 0;
	}

	.logo-fallback {
		height: 100%;
		display: grid;
		place-items: center;
		padding: 24px;
		background: #f5f7f7;
		color: var(--color-sgf-dark-blue);
		font-weight: 700;
		font-size: 24px;
		line-height: 1.2;
		text-align: center;
	}

	.about-banner {
		padding: 180px 0 102px;
		position: relative;
		overflow-x: hidden;
		background: url('/images/circuitry/circuit_graphic.svg') center right no-repeat;
		min-height: 353px;
	}

	.about-banner::before {
		position: absolute;
		z-index: 1;
		top: 0;
		left: 0;
		width: 100%;
		height: 30px;
		background: var(--color-sgf-dark-blue);
		border-radius: 0 0 27px 27px;
		content: '';
	}

	.about-banner .content {
		max-width: 43%;
	}

	.about-banner h3 {
		font-size: 36px;
		color: #153558;
		letter-spacing: 0;
		line-height: 43px;
		margin-bottom: 0;
	}

	@media (max-width: 1400px) {
		.about-banner {
			padding: 140px 0 96px;
			background-position: 70vw center;
		}

		.about-banner .content {
			max-width: 65%;
		}
	}

	@media (max-width: 1024px) {
		.directory-preview > header,
		.sponsors-highlight > header {
			flex-wrap: wrap;
		}

		.directory-preview > header span,
		.sponsors-highlight > header span {
			display: block;
		}
	}

	@media (max-width: 768px) {
		.dev-night-banner {
			padding-bottom: 80px;
		}

		.presentations {
			display: block;
			background-position: 0 50px;
		}

		.presentations li {
			margin-bottom: 24px;
			position: relative;
		}

		.presentations li:last-child {
			margin-bottom: 0;
		}

		.directory-preview header {
			padding: 0 30px;
		}

		.cards.inline .card:first-child {
			margin-left: 30px;
		}

		.sponsors-highlight {
			padding-right: 30px;
			padding-left: 30px;
		}

		.about-banner {
			padding: 130px 0 70px;
			background-position: 65vw 80%;
			background-size: 568px 257px;
		}

		.about-banner h3 {
			font-size: 30px;
			line-height: 37px;
		}

		.about-banner .content {
			max-width: 795px;
		}

		.about-banner p {
			max-width: 450px;
		}
	}

	@media (max-width: 767px) {
		.about-banner {
			background-image: none;
			position: relative;
			padding: 153px 0 40px;
		}

		.about-banner::after {
			position: absolute;
			top: -23px;
			left: 0;
			content: '';
			background: url('/images/circuitry/circuit_graphic.svg') right bottom no-repeat;
			height: 180px;
			width: 100%;
			background-size: 120%;
		}

		.about-banner .content,
		.about-banner p {
			max-width: 100%;
		}

		.about-banner h3 {
			font-size: 20px;
			line-height: 30px;
		}
	}
</style>
