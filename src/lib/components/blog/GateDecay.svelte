<script lang="ts">
	// Does the model drop rules as the context or the rule list grows? Each
	// row is one run: how many of the eighteen baseline findings it kept,
	// and what the run cost. The 57-rule rows add how its reading of the
	// Microsoft rules compared with Vale's.
	import { decay, microsoftAlerts } from '$lib/data/quality-gate';

	import Figure from './Figure.svelte';

	let { caption }: { caption?: string } = $props();

	const most = Math.max(...decay.map((d) => d.tokens));
	const width = (n: number) => Math.max((n / most) * 100, 1.5);
	const fmt = (n: number) => n.toLocaleString('en-US');
</script>

<Figure {caption}>
	<div
		class="space-y-3"
		role="img"
		aria-label="Eight model runs under growing context and rule counts: every run kept all eighteen baseline findings; cost rose with context."
	>
		{#each decay as d (d.condition + d.run)}
			<div>
				<div class="flex items-baseline justify-between gap-4 text-sm">
					<span
						>{d.condition}
						<span class="text-muted-foreground">· run {d.run}</span></span
					>
					<span class="font-mono tabular-nums text-muted-foreground"
						>{d.kept}/18 kept · {d.seconds.toFixed(0)} s</span
					>
				</div>
				<div class="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
					<div
						class="h-full rounded-full {d.kept === 18 ? 'bg-lime-500' : 'bg-rose-400'}"
						style="width: {width(d.tokens)}%"
					></div>
				</div>
				<p class="mt-1 text-xs text-muted-foreground/80">
					{fmt(d.tokens)} tokens{#if d.matched !== undefined}
						· Microsoft rules: matched {d.matched} of {microsoftAlerts}, missed {d.missed}, {d.extra}
						not in the style{/if}
				</p>
			</div>
		{/each}
	</div>
	<ul class="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
		<li class="flex items-center gap-2">
			<span class="h-2.5 w-2.5 rounded-full bg-lime-500" aria-hidden="true"></span>
			<span>bar length is tokens billed for the run; green means all eighteen findings kept</span>
		</li>
	</ul>
</Figure>
