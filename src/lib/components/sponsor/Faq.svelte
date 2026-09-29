<script lang="ts">
	import Section from '$lib/components/landing/Section.svelte';
	import { faq } from '$lib/data/sponsor-tiers';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
</script>

<!-- Native disclosure: works without script, and each answer is findable by the browser's search. -->
<Section id="faq" eyebrow="Questions" title="Before you sponsor">
	<div
		class="mx-auto max-w-3xl divide-y divide-border/60 rounded-2xl border border-border/60 bg-card"
	>
		{#each faq as item (item.q)}
			<details class="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
				<summary
					class="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
				>
					{item.q}
					<ChevronDown
						class="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
					/>
				</summary>
				<p class="mt-2 text-sm leading-6 text-muted-foreground">{item.a}</p>
			</details>
		{/each}
	</div>
</Section>
