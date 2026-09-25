<script lang="ts">
	// What a run costs on one family's formats: time and peak memory per tool
	// per format, in a table rather than bars, because fourteen formats by
	// five tools is seventy numbers and a bar per number is noise. Every
	// number is shown at full weight; a dot before each cell carries the
	// run's verdict from the score table, and the row's fastest time and
	// smallest memory are green, whichever tool has them.
	import { rows, tools, type Cell, type Row } from '$lib/data/spelling';

	import Figure from './Figure.svelte';

	let { family, caption }: { family: Row['family']; caption?: string } = $props();

	const shown = rows.filter((r) => r.family === family);
	const cols = tools.filter((t) => shown.some((r) => r.tools[t.id]));

	// The tuned view, as in the grid.
	const hasTuned = shown.some((r) => Object.values(r.tools).some((c) => c?.tuned));
	let tuned = $state(false);
	const cellFor = (c: Cell | undefined) => (tuned && c?.tuned ? c.tuned : c);

	const verdict = (c: Cell, expected: number) =>
		c.found < expected ? 'missed' : c.leaked > 0 ? 'leaked' : 'clean';
	const dot: Record<string, string> = {
		clean: 'bg-lime-500',
		leaked: 'bg-amber-500',
		missed: 'bg-rose-500'
	};
	const fmt = (s: number) => (s < 1 ? `${Math.round(s * 1000)} ms` : `${s.toFixed(1)} s`);

	const cells = (row: Row) =>
		cols.map((t) => cellFor(row.tools[t.id])).filter((c): c is Cell => !!c);
	const fastest = (row: Row) => Math.min(...cells(row).map((c) => c.seconds));
	const smallest = (row: Row) => Math.min(...cells(row).map((c) => c.mb));

	const best = 'font-semibold text-lime-700 dark:text-lime-400';
</script>

<Figure {caption}>
	{#if hasTuned}
		<div class="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
			<span>Show</span>
			<div class="inline-flex rounded-md border border-border" role="group">
				<button
					type="button"
					class="rounded-l-md px-2.5 py-1 {tuned ? '' : 'bg-muted text-foreground'}"
					onclick={() => (tuned = false)}>as shipped</button
				>
				<button
					type="button"
					class="rounded-r-md px-2.5 py-1 {tuned ? 'bg-muted text-foreground' : ''}"
					onclick={() => (tuned = true)}>tuned</button
				>
			</div>
		</div>
	{/if}
	<div class="overflow-x-auto" role="img" aria-label="Time and memory per tool and format">
		<table class="w-full border-collapse text-sm">
			<thead>
				<tr
					class="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground"
				>
					<th class="py-2 pr-3 text-left font-medium">Format</th>
					{#each cols as t (t.id)}
						<th class="px-2 py-2 text-right font-medium">{t.label}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each shown as row, i (row.format)}
					{@const fast = fastest(row)}
					{@const small = smallest(row)}
					<tr class={i % 2 ? 'bg-muted/30' : ''}>
						<td class="whitespace-nowrap py-2 pr-3">{row.label}</td>
						{#each cols as t (t.id)}
							{@const c = cellFor(row.tools[t.id])}
							<td class="px-2 py-2 align-top">
								{#if c}
									{@const v = verdict(c, row.expected)}
									<div class="flex items-start justify-end gap-2">
										<span
											class="mt-1.5 h-2 w-2 shrink-0 rounded-full {dot[v]}"
											title={v === 'clean'
												? 'a clean run: found everything, leaked nothing'
												: v === 'leaked'
													? 'leaked: reported words from the markup'
													: 'missed prose'}
										></span>
										<div class="text-right font-mono text-[12px] tabular-nums leading-tight">
											<div class={c.seconds === fast ? best : 'text-foreground'}>
												{fmt(c.seconds)}
											</div>
											<div class="text-[11px] {c.mb === small ? best : 'text-muted-foreground'}">
												{c.mb} MB
											</div>
										</div>
									</div>
								{:else}
									<div class="text-right text-muted-foreground/50">—</div>
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
		<span class="flex items-center gap-1.5"
			><span class="h-2 w-2 rounded-full bg-lime-500"></span>clean run</span
		>
		<span class="flex items-center gap-1.5"
			><span class="h-2 w-2 rounded-full bg-amber-500"></span>leaked</span
		>
		<span class="flex items-center gap-1.5"
			><span class="h-2 w-2 rounded-full bg-rose-500"></span>missed</span
		>
		<span class="flex items-center gap-1.5"
			><span class="font-mono font-semibold text-lime-700 dark:text-lime-400">91 ms</span>fastest,
			or smallest, in its row</span
		>
	</div>
	<p class="mt-2 text-xs text-muted-foreground/80">
		Mean wall-clock time over peak memory, on the 300 KB document with nothing misspelled in it,
		five hyperfine runs after a warm-up.
	</p>
</Figure>
