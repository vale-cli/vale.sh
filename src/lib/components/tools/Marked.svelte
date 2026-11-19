<script lang="ts">
	/**
	 * The reader's text with spans of it marked.
	 *
	 * Built from text nodes and <mark> elements, never from an HTML string: the
	 * input is whatever someone pasted, and this way none of it is ever parsed
	 * as markup.
	 */
	type Mark = { from: number; to: number; title?: string; tone?: 'warn' | 'bad' };

	let { text, marks, empty }: { text: string; marks: Mark[]; empty?: string } = $props();

	const runs = $derived.by(() => {
		const out: { text: string; mark?: Mark }[] = [];
		let last = 0;
		for (const m of [...marks].sort((a, b) => a.from - b.from)) {
			if (m.from < last) continue; // overlapping: the earlier mark wins
			if (m.from > last) out.push({ text: text.slice(last, m.from) });
			out.push({ text: text.slice(m.from, m.to), mark: m });
			last = m.to;
		}
		if (last < text.length) out.push({ text: text.slice(last) });
		return out;
	});
</script>

{#if marks.length === 0 && empty}
	<p
		class="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground"
	>
		{empty}
	</p>
{:else}
	<div
		class="max-h-[32rem] overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-card p-4 text-base leading-7 text-foreground"
	>
		{#each runs as run, i (i)}{#if run.mark}<mark
					title={run.mark.title}
					class="rounded px-0.5 text-inherit {run.mark.tone === 'bad'
						? 'bg-red-500/20 decoration-red-500'
						: 'bg-amber-400/30 decoration-amber-500'} underline decoration-2 underline-offset-4"
					>{run.text}</mark
				>{:else}{run.text}{/if}{/each}
	</div>
{/if}
