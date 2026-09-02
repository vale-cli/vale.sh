<script lang="ts">
	// The same draft checked both ways, on one linear scale. Vale's bar is
	// held to a visible sliver rather than scaled honestly to nothing; the
	// number beside it carries the value, the bar carries the gap.
	import { timings } from '$lib/data/voices';

	import Figure from './Figure.svelte';

	let { caption }: { caption?: string } = $props();

	const slowest = Math.max(...timings.map((t) => t.seconds));
	const barWidth = (s: number) => Math.max((s / slowest) * 100, 1.5);
	const fmt = (s: number) => (s < 1 ? `${Math.round(s * 1000)} ms` : `${s.toFixed(1)} s`);
</script>

<Figure {caption}>
	<div class="space-y-4" role="img" aria-label="Wall-clock time to review one draft">
		{#each timings as t (t.label)}
			<div>
				<div class="flex items-baseline justify-between gap-4 text-sm">
					<span>{t.label}</span>
					<span class="font-mono tabular-nums text-muted-foreground">{fmt(t.seconds)}</span>
				</div>
				<div class="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
					<div
						class="h-full rounded-full {t.seconds > 1 ? 'bg-muted-foreground/60' : 'bg-lime-500'}"
						style="width: {barWidth(t.seconds)}%"
					></div>
				</div>
				<p class="mt-1 text-xs text-muted-foreground/80">{t.detail}</p>
			</div>
		{/each}
	</div>
</Figure>
