<script lang="ts">
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
</script>

<svelte:head><title>Springfield Devs - Login</title></svelte:head>

<main class="site-container login">
	<form method="POST" class="form">
		{#if data.passwordReset}<p role="status">Your password has been updated. Please log in.</p>{/if}
		{#if form?.message}<p class="validation-summary-errors" role="alert">{form.message}</p>{/if}
		<input type="hidden" name="returnTo" value={form?.returnTo ?? data.returnTo} />
		<div class="field">
			<label for="username">Username</label>
			<input id="username" type="text" name="username" placeholder="Username" autocomplete="username" required maxlength="256" value={form?.username ?? ''} />
		</div>
		<div class="field">
			<label for="password">Password</label>
			<input id="password" name="password" type="password" placeholder="Enter your email..." autocomplete="current-password" required />
		</div>
		<label class="remember"><input type="checkbox" name="rememberMe" checked={form?.rememberMe ?? true} /> Remember me</label>
		<footer><button class="button tall wide" type="submit">Login</button></footer>
		<footer class="forgot"><p><a href="/forgotten-password">Forgot your password?</a></p></footer>
	</form>
</main>

<style>
	.login { padding-top: 0; padding-bottom: 75px; }
	.form { max-width: 675px; margin: 0 auto; }
	.field { margin-bottom: 35px; }
	.field label { display: block; font-size: 18px; font-weight: 900; color: #000; letter-spacing: 0.5px; margin-bottom: 3px; }
	.field input { box-sizing: border-box; height: 64px; width: 100%; padding: 0 16px; border: 1px solid #c1c1c1; border-radius: 3px; font: inherit; color: var(--color-sgf-text); background: white; }
	.remember { display: flex; align-items: center; gap: 8px; margin-bottom: 25px; }
	footer { display: flex; }
	.button { cursor: pointer; display: inline-flex; align-items: center; border: 0; border-radius: var(--radius-sgf-button-tall); background: var(--color-sgf-light-blue); color: white; font: inherit; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.57px; }
	.tall { height: 64px; }
	.wide { padding: 0 36px; }
	.forgot { margin-top: 25px; }
	.forgot p { margin: 0; }
	.forgot a { color: var(--color-sgf-light-blue); }
	.validation-summary-errors { color: #a11818; font-weight: bold; }
</style>
