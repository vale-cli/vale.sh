<script lang="ts">
	// Every format against every tool, one cell each: the share of planted
	// misspellings found over how many words it reported from the markup,
	// with a dot carrying the verdict. Green found everything and reported
	// nothing from markup, amber found everything but leaked, red missed.
	import { families, rows, tools, type Cell, type Row } from '$lib/data/spelling';

	import Figure from './Figure.svelte';

	let { family, caption }: { family?: Row['family']; caption?: string } = $props();

	// One family's rows, or every family under its own heading.
	const shown = family ? families.filter((f) => f.id === family) : families;

	// The tuned view: each token reader with its own documented ignore
	// patterns, where it has such a run; a tool without one keeps its cell.
	const hasTuned = rows.some(
		(r) => (!family || r.family === family) && Object.values(r.tools).some((c) => c?.tuned)
	);
	let tuned = $state(false);
	const cellFor = (c: Cell | undefined) => (tuned && c?.tuned ? c.tuned : c);

	const verdict = (c: Cell, expected: number) =>
		c.found < expected ? 'missed' : c.leaked > 0 ? 'leaked' : 'clean';
	const dot: Record<string, string> = {
		clean: 'bg-lime-500',
		leaked: 'bg-amber-500',
		missed: 'bg-rose-500'
	};
	const pct = (c: Cell, expected: number) => {
		const p = (c.found / expected) * 100;
		return p === 100 ? '100%' : p >= 99.95 ? '99.9%' : `${p.toFixed(1)}%`;
	};
	const n = (v: number) => v.toLocaleString('en-US');
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
			{#if tuned}
				<span class="hidden sm:inline"
					>typos, codespell, and cspell with their documented ignore patterns</span
				>
			{/if}
		</div>
	{/if}
	<div class="overflow-x-auto" role="img" aria-label="Each tool's result on each format">
		<table class="w-full border-collapse text-sm">
			<thead>
				<tr
					class="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground"
				>
					<th class="py-2 pr-3 text-left font-medium">Format</th>
					{#each tools as t (t.id)}
						<th class="px-2 py-2 text-right font-medium">{t.label}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each shown as fam (fam.id)}
					{#if !family}
						<tr>
							<td
								colspan={tools.length + 1}
								class="pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
							>
								{fam.label}
							</td>
						</tr>
					{/if}
					{#each rows.filter((r) => r.family === fam.id) as row, i (row.format)}
						<tr class={i % 2 ? 'bg-muted/30' : ''}>
							<td class="whitespace-nowrap py-2 pr-3">{row.label}</td>
							{#each tools as t (t.id)}
								{@const c = cellFor(row.tools[t.id])}
								<td class="px-2 py-2 align-top">
									{#if c}
										{@const v = verdict(c, row.expected)}
										<div
											class="flex items-start justify-end gap-2"
											title="{n(c.found)} of {n(row.expected)} misspellings in prose found; {n(
												c.leaked
											)} words reported from markup"
										>
											<span class="mt-1.5 h-2 w-2 shrink-0 rounded-full {dot[v]}"></span>
											<div class="text-right font-mono text-[12px] tabular-nums leading-tight">
												<div class="text-foreground">{pct(c, row.expected)}</div>
												<div
													class="text-[11px] {c.leaked > 0
														? 'text-amber-700 dark:text-amber-400'
														: 'text-muted-foreground'}"
												>
													{n(c.leaked)} leaked
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
				{/each}
			</tbody>
		</table>
	</div>
	<div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
		<span class="flex items-center gap-1.5"
			><span class="h-2 w-2 rounded-full bg-lime-500"></span>clean run: found everything, leaked
			nothing</span
		>
		<span class="flex items-center gap-1.5"
			><span class="h-2 w-2 rounded-full bg-amber-500"></span>found everything, leaked</span
		>
		<span class="flex items-center gap-1.5"
			><span class="h-2 w-2 rounded-full bg-rose-500"></span>missed prose</span
		>
	</div>
	<p class="mt-2 text-xs text-muted-foreground/80">
		Found, as a percentage of the markers planted in prose, over how many markers planted in markup
		were leaked. A dash is a tool with no reader for the format.
	</p>
</Figure>
