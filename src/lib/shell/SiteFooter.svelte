<script lang="ts">
	import { footerMainLinks, footerSocialLinks } from './navigation';
</script>

<footer class="site-footer">
	<div class="site-container footer-container">
		<div class="footer-main">
			<div class="footer-logo">
				<a href="/" aria-label="Springfield Devs home">
					<img src="/images/logo_short.svg" alt="SGF Devs" />
				</a>
			</div>

			<nav aria-label="Footer">
				{#each footerMainLinks as link}
					<a href={link.href}>{link.label}</a>
				{/each}
			</nav>
		</div>

		<div class="other-links">
			<nav aria-label="Social links">
				{#each footerSocialLinks as link}
					<a href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined}>{link.label}</a>
				{/each}
			</nav>

			<p><span>V3.0</span></p>

			<nav class="hidden-legal" aria-hidden="true">
				<a href="/">Contact</a>
				<a href="/">Code of Conduct</a>
				<a href="/">Cookie Policy</a>
				<a href="/">Legal Stuff</a>
				<a href="/">Privacy Policy</a>
			</nav>
		</div>

		<div class="signup">
			<h5>Never miss a thing</h5>
			<p>
				Subscribe to our newsletter and be the first to know about exciting events, exclusive offers from sponsors and what’s happening in our dev community.
			</p>

			<form id="updates_subscribe" aria-describedby="newsletter-disabled-note" onsubmit={(event) => event.preventDefault()}>
				<div class="material-input">
					<label for="email">Email</label>
					<input type="email" placeholder="laurie.bream@raviga.com" name="email" id="email" autocomplete="email" />
					<label for="name" class="null-check">Leave this field empty</label>
					<input type="text" id="name" name="name" class="null-check" tabindex="-1" autocomplete="off" />
				</div>

				<button class="button" type="submit" disabled aria-disabled="true">Sign Up</button>
				<p id="newsletter-disabled-note" class="newsletter-note">Newsletter signup will be wired through a typed server action in a later layer.</p>
			</form>
		</div>
	</div>
</footer>

<style>
	.site-footer {
		border-radius: 27px 27px 0 0;
		padding: 57px 0 30px;
		background: #f4f4f4;
	}

	.site-footer a {
		color: #000;
		text-decoration: none;
	}

	.footer-container {
		display: grid;
		grid-template-areas: 'main signup' 'other signup';
	}

	.footer-main {
		grid-area: main;
		min-height: 270px;
	}

	.footer-logo a {
		display: inline-block;
		line-height: 0;
	}

	.footer-logo img {
		display: block;
		width: auto;
		height: auto;
	}

	.footer-main nav {
		display: flex;
		flex-wrap: wrap;
		gap: 30px;
		margin-top: 10px;
	}

	.footer-main nav a {
		font-size: 15px;
		line-height: 1em;
		font-weight: 700;
		display: flex;
		align-items: center;
	}

	.other-links {
		grid-area: other;
	}

	.other-links nav {
		display: flex;
		flex-wrap: wrap;
	}

	.other-links nav:first-child {
		gap: 20px;
	}

	.other-links a {
		font-size: 14px;
		line-height: 1em;
		font-weight: 300;
	}

	.other-links a:hover,
	.other-links a:focus-visible {
		text-decoration: underline;
	}

	.other-links p {
		margin: 30px 0 0;
	}

	.other-links span {
		font-size: 13px;
	}

	.hidden-legal {
		display: none !important;
	}

	.signup {
		grid-area: signup;
		max-width: 500px;
		min-height: 352px;
		margin-left: auto;
		font-weight: 300;
	}

	.signup h5 {
		font-size: 24px;
		color: #153558;
		letter-spacing: 0;
		line-height: 24px;
		margin: 0;
	}

	.signup p {
		margin: 18px 0;
	}

	.null-check {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}

	.material-input label {
		display: block;
		font-weight: 700;
		font-size: 14px;
		letter-spacing: 0.5px;
		line-height: 12px;
		text-transform: uppercase;
		margin-bottom: 10px;
	}

	.material-input input {
		background: none;
		border: 0;
		width: 100%;
		border-bottom: 2px solid #cbcbcb;
		padding: 10px 0;
		color: #000;
		margin: 0 0 25px;
		font: inherit;
	}

	.material-input input::placeholder {
		color: rgb(0 0 0 / 25%);
	}

	.material-input input:focus {
		outline: 0;
		border-color: #000;
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
		font-family: var(--font-sans);
	}

	.button:disabled {
		background: #e0e0e0;
		cursor: not-allowed;
	}

	.newsletter-note {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (max-width: 1024px) {
		.footer-container {
			display: flex;
			flex-direction: column;
		}

		.footer-main {
			min-height: 0;
			margin-bottom: 60px;
			order: 1;
		}

		.signup {
			max-width: 500px;
			min-height: 0;
			margin-bottom: 60px;
			margin-left: 0;
			order: 2;
		}

		.other-links {
			order: 3;
		}
	}
</style>
