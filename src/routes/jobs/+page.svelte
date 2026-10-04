<script lang="ts">
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	const jobs = $derived(data.jobs!);
</script>

<svelte:head><title>{jobs.title}</title></svelte:head>

<main aria-labelledby="jobs-heading">
	<section class="filter_bar" aria-label="Jobs">
		<header>
			<section><img id="jobs-heading" src="/images/headlines/jobs.svg" alt="Jobs" /><span>Filter features coming soon!</span></section>
			<section><span><strong>{jobs.rows.length}</strong> Jobs</span><a href="/about/sponsorship/" class="button inverse outline light_blue">Post a Job</a></section>
		</header>
		<nav aria-label="Planned job filters"><ul><li aria-hidden="true">Filter</li><li class="active">Skills</li></ul></nav>
	</section>
	<div class="site-container results">
		<div class="table-scroll">
			<table>
				<thead><tr><th scope="col">Position</th><th scope="col">Company</th><th scope="col">Location</th><th scope="col">Employment Type</th><th scope="col">Posted</th><th scope="col">Compensation</th></tr></thead>
				<tbody>
					{#each jobs.rows as job}
						<tr><th scope="row"><a href={job.path}>{job.name}</a></th><td>{job.companyName}</td><td>{job.location}</td><td>{job.employmentType}</td><td>{job.posted}</td><td>{job.compensation}</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</main>

<style>
	.filter_bar { padding-top: 1rem; background: var(--color-sgf-dark-blue); color: white; }
	.filter_bar header { max-width: 1170px; margin: auto; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1rem; padding: 2rem 1rem; }
	.filter_bar header section { display: flex; align-items: center; flex-wrap: wrap; gap: 1rem; }
	.filter_bar img { width: 130px; max-width: 100%; }
	.filter_bar nav { background: var(--color-sgf-blue); }
	.filter_bar ul { max-width: 1170px; margin: auto; padding: 1rem; display: flex; list-style: none; gap: 2rem; }
	.button { color: white; border: 1px solid var(--color-sgf-light-blue); border-radius: 26px; padding: .6rem 1.5rem; text-decoration: none; }
	.results { margin-top: 75px; margin-bottom: 75px; }
	.table-scroll { overflow-x: auto; }
	table { width: 100%; border-collapse: collapse; text-align: left; }
	th, td { padding: .75rem; border-top: 1px solid var(--color-sgf-gray); }
	thead th { border-top: none; border-bottom: 2px solid var(--color-sgf-gray); }
	tbody tr { position: relative; }
	tbody tr:hover, tbody tr:focus-within { background: #f2f2f2; }
	tbody a { color: inherit; text-decoration: none; }
	tbody a::after { content: ''; position: absolute; inset: 0; }
	tbody a:focus-visible::after { outline: 2px solid var(--color-sgf-light-blue); outline-offset: -2px; }
</style>
