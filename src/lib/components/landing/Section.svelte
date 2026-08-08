<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		id,
		eyebrow,
		title,
		lede,
		accent = false,
		children
	}: {
		id?: string;
		/** Small kicker above the title. */
		eyebrow?: string;
		title: string;
		/** Plain copy, or a snippet when the lede carries its own markup. */
		lede?: string | Snippet;
		/** Tint the eyebrow lime. Reserve it for the one or two sections that
		    should carry the accent; the rest stay monochrome. */
		accent?: boolean;
		children: Snippet;
	} = $props();
</script>

<!--
	The landing page's rhythm: full-bleed band, hairline rule underneath, one
	container width. Sections differ in their body, never in their frame.
-->
<section {id} class="border-b border-border/60">
	<div class="mx-auto max-w-6xl border-border/60 px-6 py-14 sm:py-16 lg:border-x lg:px-8">
		<div class="mx-auto max-w-2xl text-center">
			{#if eyebrow}
				<p
					class="text-sm font-medium leading-7 {accent
						? 'text-lime-600 dark:text-lime-400'
						: 'text-muted-foreground'}"
				>
					{eyebrow}
				</p>
			{/if}

			<!-- The visible title is the heading; the eyebrow is not. -->
			<h2 class="mt-2 text-4xl font-semibold sm:text-5xl">{title}</h2>

			{#if typeof lede === 'string'}
				<p class="mt-6 text-pretty text-lg leading-8 text-muted-foreground">{lede}</p>
			{:else if lede}
				<p class="mt-6 text-pretty text-lg leading-8 text-muted-foreground">{@render lede()}</p>
			{/if}
		</div>

		<div class="mt-10">
			{@render children()}
		</div>
	</div>
</section>
