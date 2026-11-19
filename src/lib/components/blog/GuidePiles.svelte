<script lang="ts">
	// A written guide, statement by statement, with the pile each lands in
	// and what becomes of it. The guide is the skill's own worked example.
	import { piles, statements } from '$lib/data/onboard';

	import Figure from './Figure.svelte';

	let { caption }: { caption?: string } = $props();
</script>

<Figure {caption}>
	<ol class="overflow-hidden rounded-xl border border-border bg-card">
		{#each statements as s, i (s.says)}
			<li
				class="grid items-center gap-x-4 gap-y-1.5 px-4 py-3 sm:grid-cols-[1fr_9rem_12rem] {i > 0
					? 'border-t border-border/60'
					: ''}"
			>
				<span class="text-sm">{s.says}</span>
				<span>
					<span
						class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 {piles[s.pile]
							.tone}">{piles[s.pile].label}</span
					>
				</span>
				<span class="text-xs text-muted-foreground">
					{#if s.tests}
						<span class="font-mono text-foreground">{s.becomes}</span>
						<span class="mx-1">·</span>{s.tests} tests
					{:else}
						{s.becomes}
					{/if}
				</span>
			</li>
		{/each}
	</ol>
</Figure>
