<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		lede,
		wide = false,
		children
	}: {
		title: string;
		lede?: string;
		/** Widen to the 6-column grid for galleries; prose sections stay narrow. */
		wide?: boolean;
		children: Snippet;
	} = $props();
</script>

<section class="border-b border-border/60 py-14 sm:py-16">
	<div class="mx-auto px-6 lg:px-8 {wide ? 'max-w-6xl' : 'max-w-4xl'}">
		<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
		{#if lede}
			<p class="mt-4 max-w-2xl text-pretty leading-7 text-muted-foreground">{lede}</p>
		{/if}
		<div class="mt-10">
			{@render children()}
		</div>
	</div>
</section>
