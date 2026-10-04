<script lang="ts">
	import { tick } from 'svelte';
	import { browser } from '$app/env';
	import { afterNavigate } from '$app/navigation';
	import Chevron from './Chevron.svelte';
	import type { ShellMemberState } from './auth-state';
	import { aboutLinks, desktopMainLinks, mobileMainLinks } from './navigation';

	type HeaderProps = {
		memberState?: ShellMemberState;
		menuOpen: boolean;
		aboutPanelOpen: boolean;
		onMenuToggle: () => void;
		onMenuClose: () => void;
		onAboutOpen: () => void;
		onAboutClose: () => void;
	};

	let {
		memberState = { kind: 'anonymous' },
		menuOpen,
		aboutPanelOpen,
		onMenuToggle,
		onMenuClose,
		onAboutOpen,
		onAboutClose
	}: HeaderProps = $props();

	let mobileNav: HTMLElement;
	let menuButton: HTMLButtonElement;
	let desktopAboutLink: HTMLAnchorElement;
	let aboutButton: HTMLButtonElement;
	let backButton: HTMLButtonElement;
	let returnFocusAfterClose = false;

	const focusableSelector = [
		'a[href]',
		'button:not([disabled])',
		'input:not([disabled])',
		'select:not([disabled])',
		'textarea:not([disabled])',
		'[tabindex]:not([tabindex="-1"])'
	].join(',');

	function focusAfterRender(element: () => HTMLElement | undefined) {
		void tick().then(() => window.setTimeout(() => element()?.focus(), 100));
	}

	function toggleMenu() {
		const opening = !menuOpen;
		returnFocusAfterClose = menuOpen;
		onMenuToggle();
		if (opening) focusAfterRender(() => aboutButton);
	}

	function closeMenu({ focusReturn = true } = {}) {
		returnFocusAfterClose = focusReturn;
		onMenuClose();
	}

	function openAboutPanel() {
		onAboutOpen();
		focusAfterRender(() => backButton);
	}

	function closeAboutPanel() {
		onAboutClose();
		focusAfterRender(() => aboutButton);
	}

	function visibleFocusables() {
		if (!mobileNav) return [];
		return Array.from(mobileNav.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => {
			const ariaHiddenParent = element.closest('[aria-hidden="true"]');
			const rects = element.getClientRects();
			return !ariaHiddenParent && rects.length > 0;
		});
	}

	function handleDocumentKeydown(event: KeyboardEvent) {
		if (!menuOpen) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			closeMenu();
			return;
		}
		if (event.key !== 'Tab') return;

		const focusables = visibleFocusables();
		if (!focusables.length) return;

		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		const current = document.activeElement;
		if (event.shiftKey && current === first) {
			event.preventDefault();
			last?.focus();
		} else if (!event.shiftKey && current === last) {
			event.preventDefault();
			first?.focus();
		}
	}

	$effect(() => {
		if (!browser) return;

		const media = window.matchMedia('(min-width: 1024px)');
		const handleChange = () => {
			if (!media.matches || !menuOpen) return;
			closeMenu({ focusReturn: false });
			focusAfterRender(() => desktopAboutLink);
		};

		media.addEventListener('change', handleChange);
		handleChange();

		return () => media.removeEventListener('change', handleChange);
	});

	$effect(() => {
		if (!browser || !menuOpen) return;
		const focusAboutPanel = aboutPanelOpen;

		if (focusAboutPanel) focusAfterRender(() => backButton);
		else focusAfterRender(() => aboutButton);
		document.addEventListener('keydown', handleDocumentKeydown);
		return () => document.removeEventListener('keydown', handleDocumentKeydown);
	});

	$effect(() => {
		if (!browser || menuOpen || !returnFocusAfterClose) return;
		returnFocusAfterClose = false;
		focusAfterRender(() => menuButton);
	});

	if (browser) {
		afterNavigate(() => closeMenu({ focusReturn: false }));
	}
</script>

<header class="site-header">
	<div class="site-container header-container">
		<div class="logo">
			<a href="/" aria-label="Springfield Devs home">
				<img src="/images/logo.svg" alt="Springfield Devs Logo" width="124" height="58" />
			</a>
		</div>

		<nav id="desktop-nav" class="desktop-nav" aria-label="Main">
			<ul>
				<li class="about-item">
					<a bind:this={desktopAboutLink} href="/about/">About <Chevron /></a>
					<nav class="about-dropdown" aria-label="About">
						<ul>
							{#each aboutLinks as link}
								<li>
									<a href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined}>{link.label}</a>
								</li>
							{/each}
						</ul>
					</nav>
				</li>
				{#each desktopMainLinks as link}
					<li><a href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined}>{link.label}</a></li>
				{/each}
			</ul>
		</nav>

		<nav class="user-nav" aria-label="User">
			<ul>
				<li class="mobile-trigger">
					<button bind:this={menuButton} id="mobile-nav-toggle" class="mobile-nav-toggle" type="button" aria-expanded={menuOpen} aria-controls="mobile_nav" onclick={toggleMenu}>
						<span class:open={menuOpen} class="nav-icon" aria-hidden="true">
							<span></span><span></span><span></span><span></span><span></span><span></span>
						</span>
						<span>Menu</span>
					</button>
				</li>
				{#if memberState.kind === 'member'}
					<li><a href={memberState.accountHref ?? '/account'}>{memberState.label}</a></li>
					<li><button type="button" disabled aria-disabled="true">Logout</button></li>
				{:else}
					<li class="desktop-user-link"><a href="/login">Login</a></li>
					<li class="desktop-user-link"><a href="/register">Sign Up</a></li>
				{/if}
			</ul>
		</nav>

		<button class:nav-hidden={!menuOpen} id="mobile-nav-background" class="mobile-nav-background" type="button" aria-label="Close menu" tabindex="-1" onclick={() => closeMenu()}></button>
		<nav bind:this={mobileNav} id="mobile_nav" class:nav-hidden={!menuOpen} class="mobile-nav" aria-hidden={!menuOpen} aria-label="Main">
			<div class:show-about={aboutPanelOpen} class="mobile-panels">
				<ul class="mobile-panel mobile-main-panel" aria-hidden={aboutPanelOpen} inert={aboutPanelOpen ? true : undefined}>
					<li>
						<button bind:this={aboutButton} id="mobile_nav_about" type="button" onclick={openAboutPanel}>About <Chevron direction="right" /></button>
					</li>
					{#each mobileMainLinks as link}
						<li><a href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined}>{link.label}</a></li>
					{/each}
				</ul>
				<div class="mobile-panel mobile-about-panel" aria-hidden={!aboutPanelOpen} inert={aboutPanelOpen ? undefined : true}>
					<button bind:this={backButton} id="mobile_nav_back" type="button" onclick={closeAboutPanel}><Chevron direction="left" />Back</button>
					<ul>
						{#each aboutLinks.filter((link) => link.label !== 'Sponsorship') as link}
							<li><a href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined}>{link.label}</a></li>
						{/each}
					</ul>
				</div>
			</div>
		</nav>
	</div>
</header>

<style>
	.site-header {
		padding: 28px 0 40px;
	}

	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo {
		line-height: 0;
	}

	.logo a {
		display: inline-block;
		line-height: 0;
	}

	.logo img {
		display: block;
		width: 124px;
		height: 58px;
	}

	ul {
		display: flex;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	a,
	button {
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 15px;
		line-height: 1.9992;
		color: var(--color-sgf-dark-blue);
		letter-spacing: 0.5px;
		text-transform: uppercase;
		transition: all 0.25s ease;
		text-decoration: none;
		display: inline-block;
	}

	button {
		background: none;
		border: 0;
		padding: 0;
		cursor: pointer;
	}

	a:hover,
	a:focus-visible,
	button:hover,
	button:focus-visible {
		color: var(--color-sgf-light-blue);
	}

	.desktop-nav ul li {
		margin-left: 3.5vw;
		position: relative;
	}

	.desktop-nav ul li:first-child {
		margin-left: 0;
	}

	.about-dropdown {
		padding-top: 25px;
		position: absolute;
		z-index: 100;
		top: 20px;
		left: 0;
		transform: translateX(-40%) translateY(20px);
		pointer-events: none;
		transition: 0.25s all;
		opacity: 0;
	}

	.about-dropdown ul {
		pointer-events: none;
		background: #fff;
		padding: 0 42px;
		display: block;
		border-radius: 27px;
		box-shadow: 5px 5px 20px rgb(0 0 0 / 50%);
	}

	.about-dropdown li {
		margin: 0;
		white-space: nowrap;
		padding: 17px 0;
		text-align: center;
		border-bottom: 1px solid #979797;
	}

	.about-dropdown li:last-child {
		border-bottom: 0;
	}

	.about-dropdown a {
		font-size: 18px;
		line-height: 1.666;
		letter-spacing: 0.5px;
	}

	.about-item:hover > a,
	.about-item:focus-within > a {
		color: var(--color-sgf-light-blue);
	}

	.about-item:hover .about-dropdown,
	.about-item:focus-within .about-dropdown {
		pointer-events: auto;
		opacity: 1;
		transform: translateX(-40%) translateY(10px);
	}

	.about-item:hover .about-dropdown ul,
	.about-item:focus-within .about-dropdown ul {
		pointer-events: auto;
	}

	.desktop-nav :global(.chevron) {
		margin-left: 5px;
	}

	.user-nav ul li {
		margin-left: 25px;
	}

	.user-nav ul li:first-child {
		margin-left: 0;
	}

	.mobile-trigger {
		display: none;
	}

	.mobile-nav-toggle {
		display: none;
		align-items: center;
		font-size: 15px;
	}

	.nav-icon {
		width: 20px;
		height: 20px;
		position: relative;
		display: block;
		margin-right: 30px;
		transition: 0.5s ease-in-out;
	}

	.nav-icon span {
		display: block;
		position: absolute;
		height: 3px;
		width: 50%;
		background: var(--color-sgf-dark-blue);
		opacity: 1;
		transition: 0.25s ease-in-out;
	}

	.nav-icon span:nth-child(even) { left: 50%; }
	.nav-icon span:nth-child(odd) { left: 0; }
	.nav-icon span:nth-child(1), .nav-icon span:nth-child(2) { top: 0; }
	.nav-icon span:nth-child(3), .nav-icon span:nth-child(4) { top: 7px; }
	.nav-icon span:nth-child(5), .nav-icon span:nth-child(6) { top: 14px; }

	.nav-icon.open span:nth-child(1),
	.nav-icon.open span:nth-child(6) { transform: rotate(45deg); }
	.nav-icon.open span:nth-child(2),
	.nav-icon.open span:nth-child(5) { transform: rotate(-45deg); }
	.nav-icon.open span:nth-child(1) { left: 2px; top: 3px; }
	.nav-icon.open span:nth-child(2) { left: 50%; top: 3px; }
	.nav-icon.open span:nth-child(3) { left: -50%; opacity: 0; }
	.nav-icon.open span:nth-child(4) { left: 100%; opacity: 0; }
	.nav-icon.open span:nth-child(5) { left: 2px; top: 11px; }
	.nav-icon.open span:nth-child(6) { left: calc(50% - 2px); top: 10px; width: calc(50% + 3px); }

	.mobile-nav-background {
		position: fixed;
		top: 125.5px;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: #000;
		visibility: visible;
		opacity: 0.7;
		transition: opacity 0.4s;
		z-index: 19;
	}

	.mobile-nav-background.nav-hidden {
		visibility: hidden;
		opacity: 0;
	}

	.mobile-nav {
		visibility: visible;
		position: fixed;
		right: 0;
		top: 100px;
		width: 100%;
		max-width: 500px;
		min-height: calc(100vh - 100px);
		height: auto;
		background-color: #fff;
		z-index: 20;
		opacity: 1;
		padding: 2em;
		box-shadow: 0 20px 20px rgb(43 156 218 / 25%);
		transition: all 0.4s;
		overflow: hidden;
	}

	.mobile-nav.nav-hidden {
		visibility: hidden;
		right: -100vw;
		opacity: 0;
	}

	.mobile-nav::before,
	.mobile-nav::after,
	.mobile-main-panel::before,
	.mobile-main-panel::after {
		content: '';
		display: block;
		position: absolute;
		background-size: contain;
		background-repeat: no-repeat;
		pointer-events: none;
	}

	.mobile-nav::before {
		background-image: url('/images/circuitry/mobile_lines_top_left.svg');
		width: 110px;
		height: 55px;
		top: 0;
		left: 0;
	}

	.mobile-nav::after {
		background-image: url('/images/circuitry/mobile_lines_bottom_right.svg');
		width: 33%;
		height: 35px;
		background-position: bottom right;
		bottom: 10px;
		right: 0;
	}

	.mobile-main-panel::before {
		background-image: url('/images/circuitry/mobile_lines_bottom_left.svg');
		width: 115px;
		height: 9px;
		bottom: 20%;
		left: 0;
	}

	.mobile-main-panel::after {
		background-image: url('/images/circuitry/mobile_lines_mid_right.svg');
		width: 100px;
		height: 56px;
		top: calc(50% - 25px);
		right: -3.6em;
	}

	.mobile-panels {
		width: 100%;
		position: relative;
	}

	.mobile-panel {
		display: block;
		width: calc(100% - 50px);
		height: 62vh;
		max-height: 350px;
		margin-left: 50px;
		background-color: #fff;
		position: relative;
		padding-left: 0;
		transition: transform 0.3s ease, left 0.3s ease;
	}

	.mobile-panels.show-about .mobile-main-panel {
		transform: translateX(-100vw);
	}

	.mobile-about-panel {
		position: absolute;
		top: 0;
		left: 100vw;
	}

	.mobile-panels.show-about .mobile-about-panel {
		left: 0;
	}

	.mobile-panel ul {
		display: block;
		width: 80%;
		height: 62vh;
		max-height: 350px;
		background-color: #fff;
	}

	.mobile-panel li {
		display: block;
		padding-bottom: 0.18em;
		font-size: 20px;
	}

	.mobile-panel a,
	.mobile-panel button {
		font-size: 20px;
		line-height: 1.5;
		letter-spacing: 0.5px;
	}

	.mobile-panel :global(.chevron) {
		font-size: 10px;
		margin-left: 3px;
	}

	.mobile-about-panel {
		padding-top: 2em;
	}

	#mobile_nav_back {
		margin-left: 2em;
		margin-bottom: 1em;
		font-size: 18px;
		line-height: normal;
		letter-spacing: normal;
		font-family: sans-serif;
	}

	#mobile_nav_back :global(.chevron) {
		font-size: 16px;
		margin-right: 10px;
		margin-left: 0;
	}

	@media (max-width: 1023px) {
		.desktop-nav {
			display: none;
		}

		.mobile-trigger,
		.mobile-nav-toggle {
			display: flex;
		}

		.user-nav ul li.desktop-user-link {
			display: none;
		}
	}
</style>
