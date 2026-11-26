<script lang="ts">
	// Vale on each format: how it reads the format, what it found, what it
	// reported from markup, and what the run cost. Time has a bar on a log
	// scale, since DITA's toolkit takes seconds and the rest milliseconds.
	import { families, rows, type Row } from '$lib/data/spelling';

	import Figure from './Figure.svelte';

	let { family, caption }: { family?: Row['family']; caption?: string } = $props();

	// One family, or all three under their own headings.
	const groups = families
		.filter((f) => !family || f.id === family)
		.map((f) => ({ ...f, rows: rows.filter((r) => r.family === f.id && r.tools.vale) }))
		.filter((g) => g.rows.length);
	const shown = groups.flatMap((g) => g.rows);
	const heading: Record<string, string> = {
		prose: 'Markup',
		source: 'Comments in source code',
		data: 'Data files'
	};

	// What reads each format; the rest Vale parses itself.
	const reader: Record<string, string> = {
		xml: 'xsltproc',
		typ: 'typst2vast, built in',
		dita: 'DITA Open Toolkit',
		js: 'Vale + grammar',
		go: 'Vale + grammar',
		py: 'Vale + grammar',
		rs: 'Vale + grammar',
		java: 'Vale + grammar',
		kt: 'Vale + grammar',
		yml: 'Vale + View, grammar',
		toml: 'Vale + View, grammar',
		json: 'Vale + View'
	};

	const n = (v: number) => v.toLocaleString('en-US');
	const fmt = (s: number) => (s < 1 ? `${Math.round(s * 1000)} ms` : `${s.toFixed(1)} s`);

	const times = shown.map((r) => r.tools.vale!.seconds);
	const lo = Math.log(Math.min(...times));
	const hi = Math.log(Math.max(...times));
	const width = (s: number) => 8 + (92 * (Math.log(s) - lo)) / (hi - lo || 1);
</script>

<Figure {caption}>
	<div class="overflow-x-auto">
		<table class="w-full border-collapse text-sm">
			<thead>
				<tr
					class="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground"
				>
					<th class="py-2 pr-3 text-left font-medium">Format</th>
					<th class="px-2 py-2 text-left font-medium">Read by</th>
					<th class="px-2 py-2 text-right font-medium">Misspellings found</th>
					<th class="px-2 py-2 text-right font-medium">From markup</th>
					<th class="px-2 py-2 text-left font-medium">Time</th>
					<th class="py-2 pl-2 text-right font-medium">Memory</th>
				</tr>
			</thead>
			<tbody>
				{#each groups as group (group.id)}
					{#if groups.length > 1}
						<tr>
							<td
								colspan="6"
								class="pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
								>{heading[group.id]}</td
							>
						</tr>
					{/if}
					{#each group.rows as row, i (row.format)}
						{@const v = row.tools.vale!}
						<tr class={i % 2 ? 'bg-muted/30' : ''}>
							<td class="whitespace-nowrap py-2 pr-3">{row.label}</td>
							<td class="whitespace-nowrap px-2 py-2 text-muted-foreground"
								>{reader[row.format] ?? 'Vale'}</td
							>
							<td class="px-2 py-2 text-right font-mono text-[12px] tabular-nums">
								<span class={v.found === row.expected ? 'text-lime-700 dark:text-lime-400' : ''}
									>{n(v.found)} of {n(row.expected)}</span
								>
							</td>
							<td class="px-2 py-2 text-right font-mono text-[12px] tabular-nums">{n(v.leaked)}</td>
							<td class="px-2 py-2">
								<div class="flex items-center gap-2">
									<span class="w-14 shrink-0 text-right font-mono text-[12px] tabular-nums"
										>{fmt(v.seconds)}</span
									>
									<span class="hidden h-1.5 w-24 sm:block" aria-hidden="true">
										<span
											class="block h-1.5 rounded-full bg-lime-500/70"
											style="width: {width(v.seconds)}%"
										></span>
									</span>
								</div>
							</td>
							<td class="py-2 pl-2 text-right font-mono text-[12px] tabular-nums">{v.mb} MB</td>
						</tr>
					{/each}
				{/each}
			</tbody>
		</table>
	</div>
	<p class="mt-3 text-xs text-muted-foreground/80">
		Each format's 300 KB test document; a source file's prose is its comments, and a data file's is
		its named fields and comments. Misspellings found are the planted words in prose Vale reported;
		from markup counts the planted words in code, URLs, and other markup it reported. Time and
		memory are for the same document with nothing misspelled, five hyperfine runs after a warm-up;
		the time bars are on a log scale.
	</p>
</Figure>
