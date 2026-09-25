<script lang="ts">
	// One family's excerpts, read by each tool in turn. The select picks the
	// format, the tabs pick the tool, and the excerpt is the same under every
	// tab; what changes is which positions light up: a misspelling in prose
	// the tool reported, a word in code it reported anyway, a misspelling in
	// prose it missed. The excerpt wraps rather than scrolls, so a phone shows
	// all of a line.
	//
	// The syntax colors come from script/spelling-tokens.mjs, which runs
	// shiki over the excerpts at build time; each line's tokens are laid
	// under its marker spans here, split where a marker starts or ends
	// inside a token.
	import { tools, type Sample, type Span, type Tool } from '$lib/data/spelling';
	import allSamples from '$lib/data/spelling-samples.json';
	import tokens from '$lib/data/spelling-tokens.json';

	import Figure from './Figure.svelte';

	let { family, caption }: { family: Sample['family']; caption?: string } = $props();

	const samples = (allSamples as Sample[]).filter((s) => s.family === family);
	const tabs = tools.filter((t) => t.id !== 'textlint');
	let format = $state(samples[0].id);
	let tool = $state<Tool>('vale');

	const sample = $derived(samples.find((s) => s.id === format) ?? samples[0]);

	type Tok = { t: string; l: string; d: string };
	type Piece = { text: string; light: string; dark: string; span?: Span };

	// Lays a line's tokens under its spans: a piece is the run of one token
	// inside one span (or outside any), so both can style it.
	const merge = (spans: Span[], toks: Tok[]): Piece[] => {
		const pieces: Piece[] = [];
		let s = 0; // index into spans
		let sAt = 0; // offset of spans[s] in the line
		let at = 0; // offset of the current token
		for (const tok of toks) {
			let from = at;
			const to = at + tok.t.length;
			while (from < to) {
				while (s < spans.length && sAt + spans[s].text.length <= from) {
					sAt += spans[s].text.length;
					s++;
				}
				const span = spans[s];
				const end = span ? Math.min(to, sAt + span.text.length) : to;
				pieces.push({
					text: tok.t.slice(from - at, end - at),
					light: tok.l,
					dark: tok.d,
					span: span?.kind ? span : undefined
				});
				from = end;
			}
			at = to;
		}
		return pieces;
	};

	const lines = $derived(
		sample.lines.map((spans, i) =>
			merge(spans, (tokens as Record<string, Tok[][]>)[sample.id]?.[i] ?? [])
		)
	);

	const verdictOf = (span: Span, t: Tool) => {
		const hit = span.by?.includes(t);
		if (span.kind === 'prose') return hit ? 'found' : 'missed';
		return hit ? 'leaked' : 'skipped';
	};
	const tone: Record<string, string> = {
		found: 'rounded-sm bg-lime-500/20 ring-1 ring-lime-500/60',
		leaked: 'rounded-sm bg-rose-500/20 ring-1 ring-rose-500/60',
		missed: 'underline decoration-amber-500 decoration-dotted decoration-2 underline-offset-4',
		skipped: ''
	};
	const label: Record<string, string> = {
		found: 'reported, in prose',
		leaked: 'reported, in code',
		missed: 'missed, in prose',
		skipped: 'code, left alone'
	};

	const tally = (t: Tool) => {
		let found = 0,
			prose = 0,
			leaked = 0;
		for (const line of sample.lines) {
			for (const s of line) {
				if (s.kind === 'prose') {
					prose++;
					if (s.by?.includes(t)) found++;
				} else if (s.kind === 'code' && s.by?.includes(t)) {
					leaked++;
				}
			}
		}
		return { found, prose, leaked };
	};

	const tabBtn = (active: boolean) =>
		`rounded-t-md border-x border-t px-3 py-1.5 text-xs font-medium transition-colors ${
			active
				? 'border-border bg-card text-foreground'
				: 'border-transparent text-muted-foreground hover:text-foreground'
		}`;
</script>

<Figure {caption} hint="Pick a format, then a tool, to see what it reported in that excerpt.">
	<div class="flex items-end justify-between gap-2">
		<div class="flex" role="tablist">
			{#each tabs as t (t.id)}
				{@const n = tally(t.id)}
				<button
					type="button"
					role="tab"
					aria-selected={tool === t.id}
					onclick={() => (tool = t.id)}
					class={tabBtn(tool === t.id)}
					title="{n.found} of {n.prose} misspellings in prose found; {n.leaked} words in code leaked"
				>
					{t.label}
					<span
						class="ml-1.5 font-mono text-[10px] {n.leaked > 0 || n.found < n.prose
							? 'text-rose-400'
							: 'text-lime-600 dark:text-lime-400'}">{n.found}/{n.prose} · {n.leaked}</span
					>
				</button>
			{/each}
		</div>
		<label class="flex items-center gap-1.5 pb-1.5 text-[11px] text-muted-foreground">
			<span class="hidden sm:inline">Format</span>
			<select
				bind:value={format}
				class="rounded-md border border-border bg-background px-1.5 py-1 font-mono text-[11px] text-foreground"
			>
				{#each samples as s (s.id)}
					<option value={s.id}>{s.label}</option>
				{/each}
			</select>
		</label>
	</div>
	<div
		class="excerpt rounded-b-lg rounded-tr-lg border bg-card p-4 font-mono text-[12px] leading-relaxed"
	>
		{#each lines as pieces, i (i)}
			<div class="flex">
				<span class="w-7 shrink-0 select-none pr-3 text-right text-muted-foreground/50"
					>{i + 1}</span
				>
				<span class="min-w-0 whitespace-pre-wrap break-words"
					>{#each pieces as p, j (j)}{#if p.span}{@const st = verdictOf(p.span, tool)}<mark
								class="bg-transparent text-inherit {tone[st]}"
								title="{label[st]}: {p.span.what}"
								><span class="tok" style="--l:{p.light};--d:{p.dark}">{p.text}</span></mark
							>{:else}<span class="tok" style="--l:{p.light};--d:{p.dark}">{p.text}</span
							>{/if}{/each}{#if pieces.length === 0}{' '}{/if}</span
				>
			</div>
		{/each}
	</div>
	<div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
		<span class="flex items-center gap-1.5"
			><span class="h-2.5 w-2.5 rounded-sm bg-lime-500/60"></span>reported in prose</span
		>
		<span class="flex items-center gap-1.5"
			><span class="h-2.5 w-2.5 rounded-sm bg-rose-500/60"></span>reported in code</span
		>
		<span class="flex items-center gap-1.5"
			><span class="h-0.5 w-3 border-b-2 border-dotted border-amber-500"></span>missed in prose</span
		>
	</div>
</Figure>

<style>
	/* The token's color for the theme in force; the palette is shiki's. */
	.excerpt .tok {
		color: var(--l);
	}
	:global(html.dark) .excerpt .tok {
		color: var(--d);
	}
</style>
