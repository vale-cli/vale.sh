<script lang="ts">
	// The cost chart from /voices: the bars are the argument. Drawn against
	// the largest bar rather than a round number, so the 0 row stays visible
	// as a label instead of vanishing.
	import { costs } from '$lib/data/voices';

	const widest = Math.max(...costs.map((c) => c.tokens));
	const barWidth = (n: number) => (n === 0 ? 0 : Math.max((n / widest) * 100, 1.5));
</script>

<div class="not-prose my-8 space-y-4">
	{#each costs as cost (cost.label)}
		<div>
			<div class="flex items-baseline justify-between gap-4 text-sm">
				<span>{cost.label}</span>
				<span class="font-mono tabular-nums text-muted-foreground">{cost.tokens}</span>
			</div>
			<div class="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
				<div
					class="h-full rounded-full {cost.tokens > 1000
						? 'bg-muted-foreground/60'
						: 'bg-lime-500'}"
					style="width: {barWidth(cost.tokens)}%"
				></div>
			</div>
			<p class="mt-1 text-xs text-muted-foreground/80">{cost.when}</p>
		</div>
	{/each}
</div>
