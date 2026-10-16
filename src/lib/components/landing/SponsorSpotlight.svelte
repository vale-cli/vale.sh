<script lang="ts">
	import BrandIcon from './BrandIcon.svelte';
	import Section from './Section.svelte';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import Landmark from 'lucide-svelte/icons/landmark';
	import { sponsors as allSponsors, type Sponsor } from '$lib/data/sponsors';

	// Kept separate from the adopter band on purpose: that band claims a
	// company ships Vale in its pipeline, which a sponsor has not necessarily
	// done.
	let {
		sponsors = allSponsors,
		more = true,
		editorial = false
	}: {
		sponsors?: Sponsor[];
		/**
		 * Link on to /sponsor. Off on /sponsor itself, which renders this section
		 * too and would otherwise point at the page the reader is already on.
		 */
		more?: boolean;
		editorial?: boolean;
	} = $props();

	const many = $derived(sponsors.length > 1);

	/*
		The brand color is kept to a bar along the top, the icon plate, and the
		hover state. A flat panel in the brand color read as an advertisement.
	*/
</script>

{#if sponsors.length}
	<Section
		id="spotlight"
		{editorial}
		eyebrow={editorial ? 'Supporting the project' : undefined}
		accent={editorial}
		title={many ? 'Sponsor spotlights' : 'Sponsor spotlight'}
		lede="These companies support Vale's future — and put it to work in their own products today."
	>
		<div class={many ? 'grid gap-5 sm:grid-cols-2' : 'mx-auto max-w-2xl'}>
			{#each sponsors as sponsor (sponsor.name)}
				<a
					href={sponsor.href}
					style="--brand: {sponsor.brand}; --brand-fg: {sponsor.fg};"
					class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-colors hover:border-[--brand] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--brand] focus-visible:ring-offset-2"
				>
					<span class="flex flex-1 flex-col p-5 sm:p-6">
						<span class="flex items-center gap-2.5">
							<span
								class="flex h-8 w-8 items-center justify-center rounded-md bg-[--brand] text-[--brand-fg]"
							>
								<BrandIcon
									mono
									name={sponsor.name}
									slug={sponsor.icon}
									avatar={sponsor.avatar}
									size="h-4 w-4"
								/>
							</span>
							<span class="text-sm font-medium text-foreground">{sponsor.name}</span>
							<span
								class="ml-auto font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
								>Sponsor</span
							>
						</span>

						<span
							class="mt-4 text-pretty text-xl font-medium leading-snug tracking-tight text-foreground"
						>
							{sponsor.blurb}
						</span>

						<span
							class="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors group-hover:decoration-[--brand]"
						>
							Read the story
							<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
						</span>
					</span>
				</a>
			{/each}
		</div>

		{#if more}
			<!-- The grant, here too: /sponsor carries it under Grants & Awards. -->
			<a
				href="https://floss.fund/blog/second-tranche-2025-anniversary/"
				target="_blank"
				rel="noreferrer"
				class="group mt-5 flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-lime-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 sm:p-6"
			>
				<span
					class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lime-500/10 text-lime-600 dark:text-lime-400"
				>
					<Landmark class="h-5 w-5" />
				</span>
				<span class="flex-1 text-pretty text-sm leading-6 text-muted-foreground">
					<span class="font-medium text-foreground">Funded by FLOSS/fund.</span>
					A $10,000 grant in the second 2025 tranche, alongside FFmpeg, Zig, Wireshark, and Blender.
				</span>
				<ArrowUpRight
					class="h-4 w-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-lime-600 dark:group-hover:text-lime-400"
				/>
			</a>

			<div class="mt-8 flex {editorial ? 'justify-start' : 'justify-center'}">
				<a
					href="/sponsor"
					class="group/all inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-lime-500/40 underline-offset-4 transition-colors hover:text-lime-600 dark:hover:text-lime-400"
				>
					See everyone who funds Vale
					<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover/all:translate-x-0.5" />
				</a>
			</div>
		{/if}
	</Section>
{/if}
