<script lang="ts">
    import type { PageProps } from './$types';
    let { form }: PageProps = $props();
</script>

<svelte:head><title>Newsletter | Springfield Devs</title></svelte:head>

<section class="site-container newsletter-page">
    <h1>{form?.accepted ? 'Check your email' : 'Newsletter signup'}</h1>
    <p>{form?.accepted
        ? "You'll be sent an email to confirm your subscriptions to our newsletter."
        : 'Use the signup form below to subscribe, or retry your request.'}</p>
</section>

<style>
    .newsletter-page { padding-block: 60px; }
</style>
