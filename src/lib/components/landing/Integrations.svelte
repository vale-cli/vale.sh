<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import BrandIcon from './BrandIcon.svelte';
	import Section from './Section.svelte';
	import { integrationGroups } from '$lib/data/integrations';
</script>

<Section
	editorial
	id="integrations"
	eyebrow="One tool, every app"
	accent
	title="More than just a command-line interface."
	lede="Vale runs where you already write—in your editor, in your notes app, and in CI before anything merges."
>
	<!--
		A row per group and a chip per integration. Each was a card with a
		line of detail; the detail now rides in the tooltip, and the whole list
		fits in one screen.
	-->
	<dl class="divide-y divide-border border-y border-border">
		{#each integrationGroups as group}
			<div class="grid gap-x-8 gap-y-3 py-5 md:grid-cols-[14rem_minmax(0,1fr)]">
				<dt>
					<span class="block text-sm font-semibold tracking-tight">{group.title}</span>
					<span class="mt-1 block text-sm leading-6 text-muted-foreground">{group.note}</span>
				</dt>
				<dd>
					<ul class="flex flex-wrap gap-2">
						{#each group.items as item}
							<li>
								<a
									href={item.href}
									target="_blank"
									rel="noreferrer"
									title="{item.name} — {item.detail}"
									class="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors duration-200 hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
								>
									<BrandIcon
										name={item.name}
										slug={item.slug}
										avatar={item.avatar}
										size="h-4 w-4"
										class="text-foreground/70"
									/>
									{item.name}
								</a>
							</li>
						{/each}
					</ul>
				</dd>
			</div>
		{/each}
	</dl>

	<div class="mt-8">
		<a
			href="https://docs.vale.sh/guides/lsp"
			class="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-lime-500/40 underline-offset-4 transition-colors hover:text-lime-600 dark:hover:text-lime-400"
		>
			Learn more about our integrations
			<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
		</a>
	</div>
</Section>
