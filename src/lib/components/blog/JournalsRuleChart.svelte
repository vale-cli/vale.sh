<script lang="ts">
	// Rules per style, one hue: a magnitude, not a set of identities. The
	// name and the count are text; the bar alone wears the color, and what
	// the style comes from rides underneath.
	import { styles } from '$lib/data/journals';

	import Figure from './Figure.svelte';

	let { caption }: { caption?: string } = $props();

	const most = Math.max(...styles.map((s) => s.rules));
	const barWidth = (n: number) => Math.max((n / most) * 100, 2);
	const total = styles.reduce((sum, s) => sum + s.rules, 0);
</script>

<Figure {caption}>
	<div class="space-y-3" role="img" aria-label="Rules per style, {total} in all">
		{#each styles as s (s.name)}
			<div class="grid grid-cols-[6rem_1fr_2.5rem] items-center gap-3 text-sm">
				<span class="font-mono text-xs">{s.name}</span>
				<div>
					<div class="h-2.5 w-full overflow-hidden rounded-full bg-muted">
						<div class="h-full rounded-full bg-lime-500" style="width: {barWidth(s.rules)}%"></div>
					</div>
					<div class="mt-1 text-[11px] text-muted-foreground">{s.source}</div>
				</div>
				<span class="text-right font-mono tabular-nums text-muted-foreground">{s.rules}</span>
			</div>
		{/each}
	</div>
</Figure>
