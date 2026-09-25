<script lang="ts">
	// A repository of one format, per format: twenty files, one invocation
	// per tool, time and peak memory. The same table as the cost of one
	// document, so the two read together, and the row's fastest and
	// smallest are green whichever tool has them.
	import { repos, rows, tools, type RepoCell } from '$lib/data/spelling';

	import Figure from './Figure.svelte';

	let { caption }: { caption?: string } = $props();

	const shown = rows.filter((r) => r.family === 'prose' && repos.rows[r.format]);
	const cols = tools.filter((t) => shown.some((r) => repos.rows[r.format][t.id]));

	const fmt = (s: number) => (s < 1 ? `${Math.round(s * 1000)} ms` : `${s.toFixed(1)} s`);
	const cells = (format: string) =>
		cols.map((t) => repos.rows[format][t.id]).filter((c): c is RepoCell => !!c);
	const fastest = (format: string) => Math.min(...cells(format).map((c) => c.seconds));
	const smallest = (format: string) => Math.min(...cells(format).map((c) => c.mb));

	const best = 'font-semibold text-lime-700 dark:text-lime-400';
</script>

<Figure {caption}>
	<div
		class="overflow-x-auto"
		role="img"
		aria-label="Time and memory per tool on a repository of each format"
	>
		<table class="w-full border-collapse text-sm">
			<thead>
				<tr
					class="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground"
				>
					<th class="py-2 pr-3 text-left font-medium">{repos.files} files of</th>
					{#each cols as t (t.id)}
						<th class="px-2 py-2 text-right font-medium">{t.label}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each shown as row, i (row.format)}
					{@const fast = fastest(row.format)}
					{@const small = smallest(row.format)}
					<tr class={i % 2 ? 'bg-muted/30' : ''}>
						<td class="whitespace-nowrap py-2 pr-3">{row.label}</td>
						{#each cols as t (t.id)}
							{@const c = repos.rows[row.format][t.id]}
							<td class="px-2 py-2 align-top">
								{#if c}
									<div class="text-right font-mono text-[12px] tabular-nums leading-tight">
										<div class={c.seconds === fast ? best : 'text-foreground'}>
											{fmt(c.seconds)}
										</div>
										<div class="text-[11px] {c.mb === small ? best : 'text-muted-foreground'}">
											{c.mb} MB
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
	<p class="mt-2 text-xs text-muted-foreground/80">
		Mean wall-clock time over peak memory for one invocation on a directory of {repos.files} copies of
		the clean 300 KB document, three hyperfine runs after a warm-up. Green is the row's fastest time
		or smallest memory.
	</p>
</Figure>
