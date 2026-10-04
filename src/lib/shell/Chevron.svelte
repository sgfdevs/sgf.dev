<script lang="ts">
	let { direction = 'down', label }: { direction?: 'down' | 'right' | 'left'; label?: string } = $props();

	const pathByDirection = {
		down: 'M3 5.5 8 10.5 13 5.5',
		right: 'M5.5 3 10.5 8 5.5 13',
		left: 'M10.5 3 5.5 8 10.5 13'
	};
</script>

<svg class="chevron" viewBox="0 0 16 16" aria-label={label} aria-hidden={label ? undefined : 'true'} focusable="false">
	<path d={pathByDirection[direction]} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>

<style>
	.chevron {
		width: 0.82em;
		height: 0.82em;
		display: inline-block;
		vertical-align: -0.08em;
	}
</style>
