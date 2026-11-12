<script lang="ts">
	// The counting test: who found the fourteen long sentences, and what it
	// cost them. Every row got all fourteen, so the bars carry the cost and
	// the numbers beside them carry the result.
	import { counting } from '$lib/data/quality-gate';

	import Figure from './Figure.svelte';

	let { caption }: { caption?: string } = $props();

	const slowest = Math.max(...counting.map((c) => c.seconds));
	const barWidth = (s: number) => Math.max((s / slowest) * 100, 1.5);
	const fmt = (s: number) => (s < 1 ? `${Math.round(s * 1000)} ms` : `${s.toFixed(1)} s`);
	const tokens = (n: number) => (n === 0 ? 'no tokens' : `${n.toLocaleString('en-US')} tokens`);
</script>

<Figure {caption}>
	<div class="space-y-4" role="img" aria-label="Time to find the fourteen long sentences">
		{#each counting as c (c.label)}
			<div>
				<div class="flex items-baseline justify-between gap-4 text-sm">
					<span>{c.label}</span>
					<span class="font-mono tabular-nums text-muted-foreground">{fmt(c.seconds)}</span>
				</div>
				<div class="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
					<div
						class="h-full rounded-full {c.seconds > 1 ? 'bg-rose-400' : 'bg-lime-500'}"
						style="width: {barWidth(c.seconds)}%"
					></div>
				</div>
				<p class="mt-1 text-xs text-muted-foreground/80">
					{c.right} of {c.of} found{c.extra ? `, ${c.extra} more at the boundary` : ''} · {tokens(
						c.tokens
					)}
				</p>
			</div>
		{/each}
	</div>
</Figure>
