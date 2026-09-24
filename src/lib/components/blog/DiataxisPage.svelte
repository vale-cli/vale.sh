<script lang="ts">
	// One page run through all four styles, each alert colored by the kind
	// whose rule fired. The page wraps rather than scrolls: it is prose, and
	// a phone shows all of a line or nothing of its end. The page is real and so is the output; the colors
	// are the argument: a page that is every kind at once is flagged by
	// every kind at once.
	import { alerts, kindOf, kinds, page, repo } from '$lib/data/diataxis';

	import Figure from './Figure.svelte';

	let { caption }: { caption?: string } = $props();

	const ruleUrl = (rule: string) => `${repo}/Diataxis/styles/${rule.replace('.', '/')}.yml`;

	// The data holds the lines with text; the blank lines between them are
	// filled in so the numbering is the file's.
	const last = page[page.length - 1].line;
	const lines = Array.from({ length: last }, (_, i) => {
		const n = i + 1;
		return page.find((row) => row.line === n) ?? { line: n, spans: [] };
	});
</script>

<Figure {caption}>
	<div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
		{#each kinds as k (k.style)}
			<span class="flex items-center gap-1.5">
				<span class="h-2.5 w-2.5 rounded-sm {k.swatch}"></span>{k.label}
			</span>
		{/each}
	</div>
	<!--
		One row per source line, blank lines included so the numbers read as
		the file's. The text wraps inside its own column, so a continuation
		line lines up under the text rather than under the number.
	-->
	<div class="mt-3 rounded-lg border bg-card p-4 font-mono text-[13px] leading-relaxed">
		{#each lines as row (row.line)}
			<div class="flex">
				<span class="w-7 shrink-0 select-none pr-3 text-right text-muted-foreground/50"
					>{row.line}</span
				>
				<span class="min-w-0 whitespace-pre-wrap break-words"
					>{#each row.spans as span, i (i)}{#if span.rule}<mark
								class="rounded-sm px-0.5 ring-1 {kindOf(span.rule)?.tone}"
								title={span.rule}>{span.text}</mark
							>{:else}{span.text}{/if}{/each}</span
				>
			</div>
		{/each}
	</div>
	<ol class="mt-3 space-y-1.5 text-sm">
		{#each alerts as a (a.at + a.rule)}
			<li class="flex gap-3">
				<span class="w-10 shrink-0 font-mono text-xs tabular-nums text-muted-foreground"
					>{a.at}</span
				>
				<span class="min-w-0">
					<span class="mr-1 inline-block h-2 w-2 rounded-sm {kindOf(a.rule)?.swatch}"></span>
					<a href={ruleUrl(a.rule)} class="font-mono text-xs">{a.rule}</a>
					<span class="text-muted-foreground"> {a.message}</span>
				</span>
			</li>
		{/each}
	</ol>
</Figure>
