<script lang="ts">
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<svelte:head><title>Springfield Devs - Account</title></svelte:head>
<main class="site-container account">
	<h1>Welcome, {data.accountMember.name}</h1>
	<p>You are logged in.</p>
	<p><a href={data.profileHref}>View your public profile</a></p>
	<p>Account editing is not available yet.</p>
	<form method="POST" action="/logout"><button type="submit">Logout</button></form>
</main>

<style>
	.account { padding-bottom: 75px; }
	h1 { font-size: 32px; color: var(--color-sgf-dark-blue); }
	a { color: var(--color-sgf-dark-blue); text-decoration: underline; }
	button { border: 0; border-radius: 26px; padding: 14px 30px; background: var(--color-sgf-dark-blue); color: white; font: inherit; cursor: pointer; }
</style>
