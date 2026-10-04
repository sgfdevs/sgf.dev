<script lang="ts">
	import type { PageProps } from './$types';

	type Directory = PageProps['data']['directory'];
	type Member = Directory['members'][number];

	let { data }: PageProps = $props();

	const directory = $derived(data.directory);
	const activeFilterCount = $derived(directory.filters.filter((filter) => filter.active).length);
</script>

<svelte:head>
	<title>Directory | Springfield Devs</title>
</svelte:head>

<main id="directory_app" class="directory-page" aria-labelledby="directory-heading">
	<section class="filter_bar" aria-label="Directory filters">
		<header>
			<section>
				<img id="directory-heading" src="/images/headlines/directory.svg" alt="Directory" />
				<span>Find the Best Agencies and Professionals </span>
			</section>

			<section>
				<span><strong>{directory.totalMembers}</strong> Members</span>
				<a href="/register" class="button inverse outline light_blue">Join Us</a>
			</section>
		</header>

		<form method="GET" action="/directory/">
			<nav aria-label="Directory filter groups">
				<ul class="filter-tabs">
					<li class="filter-icon" aria-hidden="true">Filter</li>
					<li class="active">Skills {#if activeFilterCount}<span>{activeFilterCount}</span>{/if}</li>
				</ul>

				<div class="filters">
					<ul aria-label="Skill filters">
						{#each directory.filters as filter, index}
							<li>
								<input id={`skill-${index}`} type="checkbox" name="skills" value={filter.value} checked={filter.active} />
								<label class:active={filter.active} for={`skill-${index}`}>{filter.name}</label>
							</li>
						{/each}
					</ul>
				</div>
			</nav>

			<div class="filter-actions">
				<button type="submit" class="button">Apply filters</button>
				{#if activeFilterCount}
					<a href="/directory/" class="button outline small">Clear filters</a>
				{/if}
			</div>
		</form>
	</section>

	<section class="directory-results site-container" aria-label="Directory members" aria-live="polite">
		{#if activeFilterCount}
			<p class="result-summary">Showing {directory.visibleMembers} matching {directory.visibleMembers === 1 ? 'member' : 'members'}.</p>
		{/if}

		{#if directory.members.length}
			<div class="cards grid">
				{#each directory.members as member (`${member.url}-${member.name}`)}
					{@render memberCard(member)}
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<h2>No members found</h2>
				<p>Try clearing the skill filters.</p>
				<a href="/directory/" class="button outline">Clear filters</a>
			</div>
		{/if}
	</section>
</main>

{#snippet memberCard(member: Member)}
	<div class="card company-card">
		<figure>
			<a href={member.url}>
				<img src={member.image} alt={`${member.name} Profile Image`} loading="lazy" />
			</a>
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
				<dt>{member.name}</dt>
				<dd>{member.location}</dd>
			</dl>

			<footer>
				<a class="button outline small" href={member.url}>Profile</a>
			</footer>
		</div>
	</div>
{/snippet}

<style>
	.directory-page {
		padding-bottom: 50px;
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
		font-family: inherit;
		cursor: pointer;
	}

	.button.inverse {
		background: var(--color-sgf-dark-blue);
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

	.button.outline.light_blue {
		border-color: var(--color-sgf-light-blue);
		color: #fff;
	}

	.filter_bar {
		background: var(--color-sgf-dark-blue);
		border-radius: 27px;
		padding: 30px 46px;
	}

	.filter_bar header {
		margin-bottom: 14px;
		display: flex;
		justify-content: space-between;
		color: #fff;
		gap: 24px;
	}

	.filter_bar header section:first-child {
		display: flex;
		align-items: center;
	}

	.filter_bar header section:first-child img {
		margin-right: 8px;
		flex-shrink: 0;
	}

	.filter_bar header section:nth-child(2) {
		display: flex;
		align-items: flex-end;
		flex-shrink: 0;
	}

	.filter_bar header section:nth-child(2) span {
		font-weight: 300;
		margin-right: 14px;
		transform: translateY(-5px);
	}

	.filter_bar nav {
		background: #f4f4f4;
		border-radius: 27px;
		overflow: hidden;
	}

	.filter-tabs {
		display: flex;
	}

	.filter-tabs li {
		padding: 20px 25px;
		font-weight: 600;
		font-size: 14px;
		color: var(--color-sgf-dark-blue);
		letter-spacing: 0.5px;
		text-transform: uppercase;
		border-right: 1px solid #e6e6e6;
		display: flex;
		align-items: center;
	}

	.filter-tabs .filter-icon {
		padding-left: 32px;
		padding-right: 22px;
	}

	.filter-tabs li.active {
		background-color: #e6e6e6;
	}

	.filter-tabs li.active::after {
		content: '⌄';
		margin-left: 14px;
		transform: translateY(1px);
	}

	.filter-tabs span {
		width: 18px;
		height: 18px;
		background: var(--color-sgf-light-blue);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transform: translateY(-2px) translateX(6px);
		font-weight: 700;
		font-size: 12px;
	}

	.filters ul {
		padding: 24px 24px 14px;
		border-top: 1px solid #e6e6e6;
		display: flex;
		flex-wrap: wrap;
	}

	.filters li {
		margin: 0 10px 10px 0;
	}

	.filters input {
		position: absolute;
		opacity: 0;
		width: 1px;
		height: 1px;
	}

	.filters label {
		border: 1px solid #d8d8d8;
		background: none;
		color: #000;
		border-radius: 25.5px;
		font-weight: 600;
		font-size: 14px;
		padding: 0 20px;
		height: 30px;
		display: inline-flex;
		align-items: center;
		text-decoration: none;
		cursor: pointer;
		transition:
			0.25s color,
			0.25s border-color,
			0.25s background-color;
	}

	.filters label:hover,
	.filters input:focus-visible + label {
		color: var(--color-sgf-light-blue);
		border-color: var(--color-sgf-light-blue);
	}

	.filters label.active {
		background: var(--color-sgf-light-blue);
		border-color: var(--color-sgf-light-blue);
		color: #fff;
	}

	.filters label.active::after {
		content: '×';
		transform: translateX(9px);
	}

	.filter-actions {
		display: flex;
		gap: 10px;
		align-items: center;
		margin-top: 16px;
	}

	.directory-results {
		margin-top: 50px;
		margin-bottom: 50px;
	}

	.result-summary {
		margin: 0 0 24px;
		font-size: 16px;
		color: var(--color-sgf-dark-blue);
	}

	.cards.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(315px, 1fr));
		gap: 25px 27px;
	}

	.cards.grid .card {
		max-width: 100%;
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

	.card dl dt {
		font-weight: 600;
		color: var(--color-sgf-dark-blue);
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

	.company-card footer {
		display: flex;
		justify-content: space-between;
	}

	.empty-state {
		border-radius: 27px;
		background: #f5f7f7;
		padding: 40px;
		max-width: 680px;
	}

	.empty-state h2 {
		font-size: 30px;
		line-height: 1.2;
		color: var(--color-sgf-dark-blue);
		margin: 0 0 8px;
	}

	.empty-state p {
		margin: 0 0 20px;
	}

	@media (max-width: 1024px) {
		.filter_bar header {
			flex-wrap: wrap;
		}

		.filter_bar header span {
			display: block;
		}
	}

	@media (max-width: 768px) {
		.filter_bar {
			padding-right: 30px;
			padding-left: 30px;
		}

		.filter_bar header,
		.filter_bar header section:first-child,
		.filter_bar header section:nth-child(2) {
			display: block;
		}

		.filter_bar header section:first-child img {
			display: block;
			margin: 0 0 8px;
		}

		.filter_bar header section:nth-child(2) span {
			margin: 14px 0 12px;
			transform: none;
		}

		.filter-tabs {
			overflow-x: auto;
		}

		.filter-tabs li {
			white-space: nowrap;
		}

		.directory-results {
			margin-top: 50px;
		}
	}
</style>
