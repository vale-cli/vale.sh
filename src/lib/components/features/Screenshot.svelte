<script lang="ts">
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';

	/**
	 * A screenshot of somebody else's site, framed as a window onto it.
	 *
	 * Class-based dark mode, so the theme toggle switches these rather than the
	 * OS preference deciding once. A sponsor who only supplies one capture gets
	 * it in both themes -- better a dark shot on a light page than a hole.
	 *
	 * Given an `href` the whole frame is the link. A screenshot of a home page
	 * is the most clickable-looking thing on the page whether or not anything
	 * happens, so it may as well go where it looks like it goes.
	 */
	let {
		light,
		dark,
		alt,
		caption,
		href,
		brand
	}: {
		light?: string;
		dark?: string;
		alt: string;
		caption?: string;
		href?: string;
		/** Tints the hover ring, so the frame belongs to the sponsor it shows. */
		brand?: string;
	} = $props();

	const both = $derived(Boolean(light && dark));
	const only = $derived(light ?? dark);

	// Full width at its own aspect ratio; the frame below clips the overflow.
	// `object-cover` was here from an earlier hover-zoom and, with no height on
	// the image itself, it had nothing to cover -- so it only risked stretching.
	const shot = 'block h-auto w-full';
</script>

{#if light || dark}
	<figure style={brand ? `--brand: ${brand};` : undefined}>
		<svelte:element
			this={href ? 'a' : 'div'}
			{href}
			target={href ? '_blank' : undefined}
			rel={href ? 'noreferrer' : undefined}
			class="group/shot relative block overflow-hidden rounded-xl border border-border bg-card transition-colors duration-200 {href
				? 'hover:border-[--brand] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--brand]'
				: ''}"
		>
			<!-- A window bar, so a bare capture reads as a browser rather than a slab. -->
			<div
				class="flex items-center gap-1.5 border-b border-border bg-muted px-3.5 py-2.5"
				aria-hidden="true"
			>
				<span class="h-2.5 w-2.5 rounded-full bg-foreground/25"></span>
				<span class="h-2.5 w-2.5 rounded-full bg-foreground/25"></span>
				<span class="h-2.5 w-2.5 rounded-full bg-foreground/25"></span>
				{#if caption}
					<span
						class="ml-2 truncate rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
					>
						{caption}
					</span>
				{/if}
				{#if href}
					<ArrowUpRight
						class="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-colors group-hover/shot:text-foreground"
					/>
				{/if}
			</div>

			<!-- Capped, so a tall capture crops instead of running the page long. -->
			<div class="aspect-[16/9] overflow-hidden ring-1 ring-inset ring-border/70">
				{#if both}
					<img src={light} {alt} class="{shot} dark:hidden" loading="lazy" />
					<img src={dark} {alt} class="hidden {shot} dark:block" loading="lazy" />
				{:else}
					<img src={only} {alt} class={shot} loading="lazy" />
				{/if}
			</div>
		</svelte:element>
	</figure>
{/if}
