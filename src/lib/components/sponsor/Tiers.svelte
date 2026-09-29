<script lang="ts">
	import Section from '$lib/components/landing/Section.svelte';
	import { tiers, partner } from '$lib/data/sponsor-tiers';
	import Check from 'lucide-svelte/icons/check';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
</script>

<!--
	The anchor every funding email links to. Four cards, each a one-time
	payment. Sponsor carries the accent: $1,000 is the easy yes, and marking
	Partner instead would read as an upsell.
-->
<Section
	id="tiers"
	eyebrow="Ways to sponsor"
	title="Pick the level that fits"
	lede="Vale is free and always will be. The teams that depend on it keep it that way."
	accent
>
	<div class="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-4">
		{#each tiers as tier (tier.id)}
			{@const featured = Boolean(tier.badge)}
			<div
				id="tier-{tier.id}"
				class="flex h-full scroll-mt-24 flex-col rounded-2xl border bg-card p-6 {featured
					? 'border-lime-500 ring-1 ring-lime-500'
					: 'border-border/60'}"
			>
				<div class="flex min-h-6 items-center gap-2">
					<span class="text-xl font-semibold">{tier.name}</span>
					{#if tier.badge}
						<span
							class="rounded-md bg-lime-500/10 px-2 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-wider text-lime-600 dark:text-lime-400"
						>
							{tier.badge}
						</span>
					{/if}
				</div>

				<div class="mt-3 flex items-baseline gap-1.5">
					<span class="text-3xl font-semibold tabular-nums tracking-tight">{tier.price}</span>
					{#if tier.unit}
						<span class="text-sm text-muted-foreground">{tier.unit}</span>
					{/if}
				</div>
				<p class="mt-1 text-xs text-muted-foreground">{tier.note}</p>

				<p class="mt-3 text-sm text-muted-foreground">{tier.who}</p>

				<ul class="mb-6 mt-5 flex flex-col gap-3">
					{#each tier.features as feature (feature)}
						<li class="flex items-start gap-2.5 text-sm leading-6">
							<Check class="mt-1 size-4 shrink-0 text-lime-600 dark:text-lime-400" />
							<span>{feature}</span>
						</li>
					{/each}
				</ul>

				<div class="mt-auto flex flex-col gap-2">
					{#each tier.links as link, i (link.label)}
						<a
							href={link.href}
							target="_blank"
							rel="noreferrer"
							class="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 {featured &&
							i === 0
								? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
								: 'border border-border bg-background text-foreground hover:bg-muted/60'}"
						>
							{link.label}
							<ArrowUpRight class="h-4 w-4" />
						</a>
					{/each}
					{#if tier.limit}
						<p class="text-center text-xs text-muted-foreground">{tier.limit}</p>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<!-- What the Partner channel is, and its guardrails, stated where the price is. -->
	<div
		id="partner"
		class="mt-12 scroll-mt-24 rounded-2xl border border-border/60 bg-card p-6 sm:p-8"
	>
		<h3 class="text-lg font-semibold tracking-tight">What Partner includes</h3>
		<dl class="mt-5 grid gap-5 sm:grid-cols-2">
			{#each partner as item (item.term)}
				<div>
					<dt class="text-sm font-medium text-foreground">{item.term}</dt>
					<dd class="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</dd>
				</div>
			{/each}
		</dl>
	</div>
</Section>
