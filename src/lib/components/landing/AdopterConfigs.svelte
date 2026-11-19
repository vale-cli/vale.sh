<script lang="ts">
	import type { AdopterBand } from '$lib/types/adopter-band';
	import BrandIcon from './BrandIcon.svelte';
	import Section from './Section.svelte';
	import InlineCode from '$lib/components/features/InlineCode.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';

	// The band is chosen in $lib/server/adopter-band, at build time, so the
	// page's script carries these entries and not the whole adopter list.
	let { band, editorial = false }: { band: AdopterBand; editorial?: boolean } = $props();
</script>

{#snippet configsLede()}
	Every team here publishes something you can open — the <InlineCode>.vale.ini</InlineCode> they run,
	or the page they wrote about running it. Hover a mark for where.
{/snippet}

<Section
	{editorial}
	eyebrow={editorial ? 'Used in production' : undefined}
	accent={editorial}
	id="configs"
	title="Read their configs"
	lede={configsLede}
>
	<!--
		Four stories with a figure each, then twelve bare marks, large, named
		beneath. The mark's tooltip is the receipt:
		the repository and path, or the host, plus the team's own line. Nothing
		scrolls; these are links and a moving row makes them a moving target.
	-->
	<ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
		{#each band.stories as story (story.name)}
			<li>
				<a
					href={story.url}
					target="_blank"
					rel="noreferrer"
					class="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-lime-500/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
				>
					<span class="flex items-center gap-2.5">
						<BrandIcon name={story.name} slug={story.icon} avatar={story.avatar} size="h-6 w-6" />
						<span class="text-sm font-medium text-foreground">{story.name}</span>
					</span>
					<span class="mt-5 text-4xl font-semibold tracking-tight text-foreground"
						>{story.figure}</span
					>
					<span class="mt-1 text-sm font-medium text-foreground">{story.label}</span>
					<span class="mt-2 grow text-sm leading-6 text-muted-foreground">{story.detail}</span>
					<span
						class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-lime-600 dark:text-lime-400"
					>
						Read the source
						<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
					</span>
				</a>
			</li>
		{/each}
	</ul>

	<Tooltip.Provider delayDuration={150}>
		<ul class="mt-12 grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">
			{#each band.marks as mark (mark.name)}
				<li>
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<a
									{...props}
									href={mark.url}
									target="_blank"
									rel="noreferrer"
									class="group flex flex-col items-center gap-3 rounded-lg px-2 py-3 text-center transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
								>
									<BrandIcon
										name={mark.name}
										slug={mark.slug}
										avatar={mark.avatar}
										size="h-12 w-12"
									/>
									<span class="text-sm font-medium tracking-tight text-foreground">{mark.name}</span
									>
								</a>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content side="top" class="max-w-xs text-pretty">
							<span class="block font-mono text-[11px] opacity-80">{mark.receipt}</span>
							<span class="mt-1 block">{mark.context}</span>
						</Tooltip.Content>
					</Tooltip.Root>
				</li>
			{/each}
		</ul>
	</Tooltip.Provider>

	<!-- The split by sector, each chip landing on that sector's roster. -->
	<ul class="mt-12 flex flex-wrap gap-2" aria-label="Adopters by sector">
		{#each band.chips as chip (chip.name)}
			<li>
				<a
					href={chip.href}
					class="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-lime-500/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
				>
					{chip.name}
					<span class="font-mono text-xs">{chip.count}</span>
				</a>
			</li>
		{/each}
	</ul>

	<div class="mt-8 flex {editorial ? 'justify-start' : 'justify-center'}">
		<a
			href="/adopters"
			class="group inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
		>
			Browse all {band.total}
			<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
		</a>
	</div>
</Section>
