<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	let { form }: PageProps = $props();
</script>

<svelte:head><title>Springfield Devs - Forgotten password</title></svelte:head>

<main class="site-container password-page">
	{#if form?.succeeded}
		<section class="form" role="status">
			<h1>Check your email</h1>
			<p>If an account exists for that email, we sent a reset link.</p>
			<a href="/login">Back to login</a>
		</section>
	{:else}
		<form method="POST" class="form" use:enhance>
			<header>
				<h1>Forgot your password?</h1>
				{#each form?.errors?.[''] ?? [] as message}<p class="error" role="alert">{message}</p>{/each}
			</header>
			<div class="field">
				<div class="label-row">
					<label for="email">Email</label>
					{#each form?.errors?.email ?? [] as message}<span id="email-error" class="error" role="alert">{message}</span>{/each}
				</div>
				<input id="email" name="email" type="email" autocomplete="email" required maxlength="256" aria-invalid={!!form?.errors?.email} aria-describedby={form?.errors?.email ? 'email-error' : undefined} />
			</div>
			<footer><button type="submit">Send reset link</button><a href="/login">Back to login</a></footer>
		</form>
	{/if}
</main>

<style>
	.password-page { padding-bottom: 75px; }
	.form { max-width: 675px; margin: 0 auto; }
	header, .field { margin-bottom: 35px; }
	h1 { font-size: 36px; color: #000; }
	.label-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px; margin-bottom: 3px; }
	label { font-size: 18px; font-weight: 900; color: #000; letter-spacing: 0.5px; }
	input { box-sizing: border-box; height: 64px; width: 100%; padding: 0 16px; border: 1px solid #c1c1c1; border-radius: 3px; font: inherit; color: var(--color-sgf-text); background: white; }
	footer { display: flex; align-items: center; gap: 35px; }
	a { color: var(--color-sgf-light-blue); }
	button { cursor: pointer; display: inline-flex; align-items: center; border: 0; border-radius: var(--radius-sgf-button-tall); background: var(--color-sgf-light-blue); color: white; font: inherit; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.57px; height: 64px; padding: 0 36px; }
	.error { color: #a11818; font-weight: bold; font-size: 14px; }
	@media (max-width: 600px) { footer { flex-direction: column; align-items: flex-start; gap: 16px; } }
</style>
