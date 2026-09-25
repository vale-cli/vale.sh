<script lang="ts">
	// One scenario -- a 3 MB document, or a whole repository -- every tool on
	// one linear scale, time as the bar and peak memory beside it. Vale's bar
	// carries the accent; the rest are neutral, so the chart reads as "ours
	// against the field" without a legend.
	import { scale } from '$lib/data/spelling';

	import Figure from './Figure.svelte';

	let { scenario, caption }: { scenario: string; caption?: string } = $props();

	const run = scale.find((s) => s.id === scenario);
	const bars = run?.tools ?? [];
	const slowest = Math.max(...bars.map((b) => b.seconds));
	const width = (s: number) => Math.max((s / slowest) * 100, 1.5);
	const fmt = (s: number) => (s < 1 ? `${Math.round(s * 1000)} ms` : `${s.toFixed(1)} s`);
</script>

<Figure {caption}>
	<div class="space-y-3" role="img" aria-label={run?.label}>
		{#each bars as b (b.label)}
			<div>
				<div class="flex items-baseline justify-between gap-4 text-sm">
					<span>{b.label}</span>
					<span class="font-mono tabular-nums text-muted-foreground">
						{fmt(b.seconds)} · {b.mb} MB
					</span>
				</div>
				<div class="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
					<div
						class="h-full rounded-full {b.ours ? 'bg-lime-500' : 'bg-muted-foreground/60'}"
						style="width: {width(b.seconds)}%"
					></div>
				</div>
				{#if b.detail}
					<p class="mt-1 text-xs text-muted-foreground/80">{b.detail}</p>
				{/if}
			</div>
		{/each}
	</div>
</Figure>
