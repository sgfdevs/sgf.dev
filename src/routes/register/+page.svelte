<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	let { form }: PageProps = $props();
	let hint = $state(false);
	const fields = [
		{ name: 'firstName', label: 'First Name', autocomplete: 'given-name', type: 'text' },
		{ name: 'lastName', label: 'Last Name', autocomplete: 'family-name', type: 'text' },
		{ name: 'email', label: 'Email', autocomplete: 'email', type: 'email' },
		{ name: 'username', label: 'Username', autocomplete: 'username', type: 'text' }
	] as const;
</script>

<svelte:head><title>Springfield Devs - Register</title></svelte:head>

<main class="site-container registration">
	<form method="POST" class="form" use:enhance={({ formElement }) => {
		const password = formElement.elements.namedItem('password');
		if (password instanceof HTMLInputElement) password.value = '';
	}}>
		<header>
			<h1>Get started with your account</h1>
			<p>Meet your peers. Engage with experts. Iron sharpening iron, you get it. Do it all with a membership to Springfield Devs. Already have an account? <a href="/login">Log in</a></p>
			{#each form?.errors?.[''] ?? [] as message}<p class="error" role="alert">{message}</p>{/each}
		</header>
		{#each fields as field}
			<div class="field">
				<div class="label-row">
					<label for={field.name}>{field.label}</label>
					{#each form?.errors?.[field.name] ?? [] as message}<span id={`${field.name}-error`} class="error" role="alert">{message}</span>{/each}
				</div>
				<input id={field.name} name={field.name} type={field.type} autocomplete={field.autocomplete} required maxlength="256" value={form?.values?.[field.name] ?? ''} aria-invalid={!!form?.errors?.[field.name]} aria-describedby={form?.errors?.[field.name] ? `${field.name}-error` : undefined} />
			</div>
		{/each}
		<div class="field">
			<div class="label-row">
				<label for="password">Password</label>
				{#each form?.errors?.password ?? [] as message}<span id="password-error" class="error" role="alert">{message}</span>{/each}
			</div>
			<input id="password" name="password" type="password" autocomplete="new-password" required maxlength="4096" aria-invalid={!!form?.errors?.password} aria-describedby={form?.errors?.password ? 'password-error' : undefined} />
		</div>
		<div class="field">
			<div class="label-row">
				<label for="challengeQuestion">Null Check <span>(What is the Springfield, MO Airport Code?)</span></label>
				<button class="hint" type="button" onclick={() => hint = !hint} aria-expanded={hint}>Need Help?</button>
				{#each form?.errors?.challengeQuestion ?? [] as message}<span id="challengeQuestion-error" class="error" role="alert">{message}</span>{/each}
			</div>
			{#if hint}<p class="hint-answer">The answer is SGF</p>{/if}
			<input id="challengeQuestion" name="challengeQuestion" type="text" required maxlength="256" value={form?.values?.challengeQuestion ?? ''} aria-invalid={!!form?.errors?.challengeQuestion} aria-describedby={form?.errors?.challengeQuestion ? 'challengeQuestion-error' : undefined} />
		</div>
		<footer>
			<button class="button tall wide" type="submit">Get Started!</button>
			<p>By clicking the "get started" button, you are creating a Springfield Devs account, and you agree to Springfield Devs <a href="/about/code-of-conduct/">Code of Conduct</a>.</p>
		</footer>
	</form>
</main>

<style>
	.registration { padding-top: 0; padding-bottom: 75px; }
	.form { max-width: 675px; margin: 0 auto; }
	header { margin-bottom: 35px; }
	h1 { font-size: 36px; color: #000; }
	.field { margin-bottom: 35px; }
	.label-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px; margin-bottom: 3px; }
	label { font-size: 18px; font-weight: 900; color: #000; letter-spacing: 0.5px; }
	label span { font-size: 14px; font-weight: normal; }
	.field input { box-sizing: border-box; height: 64px; width: 100%; padding: 0 16px; border: 1px solid #c1c1c1; border-radius: 3px; font: inherit; color: var(--color-sgf-text); background: white; }
	.hint { border: 0; background: none; padding: 0; font: inherit; font-size: 14px; color: var(--color-sgf-light-blue); cursor: pointer; text-decoration: underline; }
	.hint-answer { margin: 0 0 8px; }
	footer { display: flex; align-items: center; gap: 35px; }
	footer p { margin: 0; font-size: 14px; }
	a { color: var(--color-sgf-light-blue); }
	.button { cursor: pointer; display: inline-flex; flex-shrink: 0; align-items: center; border: 0; border-radius: var(--radius-sgf-button-tall); background: var(--color-sgf-light-blue); color: white; font: inherit; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.57px; }
	.tall { height: 64px; }
	.wide { padding: 0 36px; }
	.error { color: #a11818; font-weight: bold; font-size: 14px; }
	@media (max-width: 600px) { footer { flex-direction: column; align-items: flex-start; gap: 16px; } }
</style>
