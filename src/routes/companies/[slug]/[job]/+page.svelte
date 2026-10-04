<script lang="ts">
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	const job = $derived(data.job!);
</script>

<svelte:head><title>{job.title}</title></svelte:head>

<main class="site-container job-details" aria-labelledby="job-name">
	<h1>{job.companyName}</h1>
	<h2 id="job-name">{job.name}</h2>
	<div>{job.location} | {job.employmentType} | {job.compensation}</div>
	<div class="description">{@html job.descriptionHtml}</div>
	{#if job.applyUrl}<a href={job.applyUrl} class="button" target="_blank" rel="noopener noreferrer">Apply Now</a>{/if}
	{#if job.skills.length}
		<section class="skills" aria-labelledby="skills-heading"><h3 id="skills-heading">Skills</h3>
			<div class="skill-list">{#each job.skills as skill}<span class="button outline skill">{skill}</span>{/each}</div>
		</section>
	{/if}
</main>

<style>
	.job-details { margin-top: 3rem; margin-bottom: 50px; overflow-wrap: anywhere; }
	.description { margin: 1.5rem 0; }
	.description :global(ul) { list-style: disc; padding-left: 1em; }
	.description :global(ol) { list-style: decimal; padding-left: 1em; }
	.description :global(img) { max-width: 100%; height: auto; }
	.description :global(pre), .description :global(table) { max-width: 100%; overflow-x: auto; }
	.skills { margin: 50px 0; }
	.skill-list { display: flex; flex-wrap: wrap; gap: .5rem; }
	.button { background: var(--color-sgf-light-blue); border: 1px solid var(--color-sgf-light-blue); border-radius: 25.5px; font-weight: 600; font-size: 14px; color: white; padding: .6rem 24px; display: inline-flex; align-items: center; text-decoration: none; }
	.button.outline { background: none; color: black; border-color: var(--color-sgf-gray); }
</style>
