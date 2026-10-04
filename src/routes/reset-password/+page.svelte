<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
	const fields = [{ name: 'password', label: 'Password' }, { name: 'confirmPassword', label: 'Confirm Password' }] as const;
</script>

<svelte:head>
	<title>Springfield Devs - Reset password</title>
	<meta name="referrer" content="no-referrer" />
</svelte:head>

<main class="site-container password-page">
	{#if !data.validLink || form?.invalidLink}
		<section class="form">
			<h1>Reset your password</h1>
			<p class="error" role="alert">This reset link is invalid or has expired.</p>
			<a href="/forgotten-password">Request a new reset link</a>
		</section>
	{:else}
		<form method="POST" class="form" use:enhance={({ formElement }) => {
			for (const input of formElement.querySelectorAll<HTMLInputElement>('input[type=password]')) input.value = '';
		}}>
			<header>
				<h1>Reset your password</h1>
				{#each form?.errors?.[''] ?? [] as message}<p class="error" role="alert">{message}</p>{/each}
			</header>
			{#each fields as field}
				<div class="field">
					<div class="label-row">
						<label for={field.name}>{field.label}</label>
						{#each form?.errors?.[field.name] ?? [] as message}<span id={`${field.name}-error`} class="error" role="alert">{message}</span>{/each}
					</div>
					<input id={field.name} name={field.name} type="password" autocomplete="new-password" required maxlength="4096" aria-invalid={!!form?.errors?.[field.name]} aria-describedby={form?.errors?.[field.name] ? `${field.name}-error` : undefined} />
				</div>
			{/each}
			<footer><button type="submit">Update password</button><a href="/login">Back to login</a></footer>
			<p><a href="/forgotten-password">Request a new reset link</a></p>
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
