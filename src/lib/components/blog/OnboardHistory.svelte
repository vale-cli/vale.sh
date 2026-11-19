<script lang="ts">
	// A repository's recent commits scored against each convention: the bar
	// is how many already pass. One convention is close; the rest are not
	// what this history does.
	import { history, historyOf } from '$lib/data/onboard';

	import Figure from './Figure.svelte';

	let { caption }: { caption?: string } = $props();

	const passing = (failing: number) => historyOf - failing;
	const pct = (n: number) => (n / historyOf) * 100;
</script>

<Figure {caption}>
	<div
		class="space-y-3"
		role="img"
		aria-label="Commits of the last {historyOf} that pass each convention"
	>
		{#each history as h (h.name)}
			<div class="grid grid-cols-[6.5rem_1fr_5.5rem] items-center gap-3 text-sm">
				<span class="font-mono text-xs {h.closest ? 'font-semibold' : ''}">{h.name}</span>
				<div class="h-2.5 w-full overflow-hidden rounded-full bg-muted">
					{#if passing(h.failing) > 0}
						<div
							class="h-full rounded-full {h.closest ? 'bg-lime-500' : 'bg-foreground/30'}"
							style="width: {pct(passing(h.failing))}%"
						></div>
					{/if}
				</div>
				<span class="text-right font-mono text-xs tabular-nums text-muted-foreground"
					>{passing(h.failing)} of {historyOf} pass</span
				>
			</div>
		{/each}
	</div>
</Figure>
