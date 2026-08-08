<script lang="ts">
	import BrandIcon from './BrandIcon.svelte';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import { sponsors as allSponsors, type Sponsor } from '$lib/data/sponsors';

	// Kept separate from LogoWall on purpose: that band claims a company ships
	// Vale in its pipeline, which a sponsor has not necessarily done.
	let { sponsors = allSponsors }: { sponsors?: Sponsor[] } = $props();

	// One sponsor fills the row. Several become a rail, sized so the next card
	// is already partly in view -- the only affordance that reads as scrollable
	// without adding controls.
	const many = $derived(sponsors.length > 1);
</script>

{#if sponsors.length}
	<section class="border-b border-border/60">
		<div class="mx-auto max-w-6xl border-border/60 px-6 py-12 lg:border-x lg:px-8">
			<p class="text-sm font-medium text-muted-foreground">
				{many ? 'Sponsors' : 'Sponsor spotlight'}
			</p>

			<div
				class="mt-6 {many
					? 'hide-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-1 lg:-mx-8 lg:px-8'
					: ''}"
			>
				{#each sponsors as sponsor (sponsor.name)}
					<a
						href={sponsor.href}
						style="--brand: {sponsor.brand}; --brand-fg: {sponsor.fg};"
						class="group relative flex shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-[--brand] p-8 text-[--brand-fg] transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 sm:p-10 {many
							? 'w-[86%] sm:w-[64%] lg:w-[49%]'
							: 'w-full'}"
					>
						<!-- Faint dot field, so a large flat panel has some surface. -->
						<span
							aria-hidden="true"
							class="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:14px_14px]"
						></span>

						<span class="relative flex items-center gap-2">
							<BrandIcon name={sponsor.name} slug={sponsor.icon} class="h-4 w-4" />
							<span class="text-xs font-semibold uppercase tracking-[0.14em]">
								{sponsor.name}
							</span>
						</span>

						<p
							class="relative mt-8 max-w-md text-pretty text-2xl font-medium leading-snug sm:text-3xl"
						>
							{sponsor.blurb}
						</p>

						<!--
							The button inverts the pair, so it stays legible whether the brand
							is pale (dark button) or saturated (light button).
						-->
						<span
							class="relative mt-10 inline-flex w-fit items-center gap-1.5 rounded-lg bg-[--brand-fg] px-5 py-2.5 text-sm font-medium text-[--brand]"
						>
							Read the story
							<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
						</span>
					</a>
				{/each}
			</div>
		</div>
	</section>
{/if}
