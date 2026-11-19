<script lang="ts">
	// The proposal's table as bars: each severity on the first run and with
	// the drafted baseline, on one scale. The errors row is the finding.
	import { baseline, firstRun } from '$lib/data/onboard';

	import Figure from './Figure.svelte';

	let { caption }: { caption?: string } = $props();

	const rows = [
		{ key: 'errors', label: 'Errors', note: 'block a merge', tone: 'bg-rose-400' },
		{ key: 'warnings', label: 'Warnings', note: 'raised in review', tone: 'bg-amber-400' },
		{ key: 'suggestions', label: 'Suggestions', note: 'advice', tone: 'bg-foreground/30' }
	] as const;

	const most = Math.max(...rows.flatMap((r) => [firstRun[r.key], baseline[r.key]]));
	const pct = (n: number) => Math.max((n / most) * 100, 1);
</script>

<Figure {caption}>
	<div class="grid gap-3 sm:grid-cols-[auto_1fr] sm:gap-x-6">
		<div class="rounded-xl border border-border bg-card px-5 py-4">
			<p class="text-xs text-muted-foreground">Blocking errors</p>
			<p class="mt-1 font-mono text-4xl font-semibold tabular-nums">
				<span class="text-muted-foreground/60">{firstRun.errors}</span>
				<span class="text-muted-foreground/60">→</span>
				{baseline.errors}
			</p>
			<p class="mt-1 text-xs text-muted-foreground">before a file is written</p>
		</div>
		<div class="space-y-4 self-center">
			{#each rows as r (r.key)}
				<div
					role="img"
					aria-label="{r.label}: {firstRun[r.key]} on the first run, {baseline[
						r.key
					]} with the baseline"
				>
					<div class="flex items-baseline justify-between gap-4 text-sm">
						<span>{r.label} <span class="text-xs text-muted-foreground">· {r.note}</span></span>
						<span class="font-mono tabular-nums text-muted-foreground"
							>{firstRun[r.key]} → <span class="text-foreground">{baseline[r.key]}</span></span
						>
					</div>
					<div class="mt-1.5 space-y-0.5">
						<div
							class="h-2 rounded-sm opacity-40 {r.tone}"
							style="width: {pct(firstRun[r.key])}%"
						></div>
						<div class="h-2 rounded-sm {r.tone}" style="width: {pct(baseline[r.key])}%"></div>
					</div>
				</div>
			{/each}
		</div>
	</div>
	<ul class="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
		<li class="flex items-center gap-2">
			<span class="h-2.5 w-2.5 rounded-sm bg-foreground/30 opacity-40" aria-hidden="true"></span>
			<span>first run</span>
		</li>
		<li class="flex items-center gap-2">
			<span class="h-2.5 w-2.5 rounded-sm bg-foreground/30" aria-hidden="true"></span>
			<span>with the baseline</span>
		</li>
	</ul>
</Figure>
