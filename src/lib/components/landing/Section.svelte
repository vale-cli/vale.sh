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

	`scroll-mt` clears the sticky header: without it a jump to #id puts the
	heading underneath the bar, which reads as having landed in the wrong
	place.
-->
<section {id} class="scroll-mt-20 border-b border-border/60">
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

			<!--
				The visible title is the heading; the eyebrow is not.

				A section with an id is linkable, so its heading is the link:
				the `#` appears on hover the way it does in the docs, and the
				whole title stays clickable for a reader who wants the URL.
			-->
			<h2 class="mt-2 text-4xl font-semibold sm:text-5xl">
				{#if id}
					<a
						href="#{id}"
						class="group/anchor inline-flex items-baseline gap-2 no-underline hover:no-underline"
					>
						{title}
						<span
							aria-hidden="true"
							class="text-2xl text-muted-foreground opacity-0 transition-opacity group-hover/anchor:opacity-100"
							>#</span
						>
					</a>
				{:else}
					{title}
				{/if}
			</h2>

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
