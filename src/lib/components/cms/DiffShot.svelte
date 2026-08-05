<script lang="ts">
	// The loop's third step — "prove it loads" — was the one with no evidence
	// behind it, and it is the step that actually sells the product: an edit to a
	// rule already in use is where a style guide quietly breaks.
	//
	// Real diff_rule output. One word was added to a working rule, and it put two
	// false positives into two files. Re-run diff_rule if you change this; the
	// spans and line numbers are the engine's, not decoration.
	const added = [
		{
			file: 'docs/guide.md',
			line: 1,
			span: '23–26',
			text: 'Be very careful with e',
			hit: 'very',
			tail: 'ry setting.'
		},
		{
			file: 'docs/intro.md',
			line: 3,
			span: '2–5',
			text: 'E',
			hit: 'very',
			tail: ' release ships on Friday.'
		}
	];
</script>

<div
	class="overflow-hidden rounded-2xl border shadow-xl shadow-lime-950/10 dark:shadow-black/40"
	style="background: var(--d-bg); border-color: var(--d-line); color: var(--d-fg);
	       --d-bg:#16180f; --d-line:#2a2e1f; --d-fg:#d7d6c8; --d-dim:#8a8d78; --d-faint:#62654f; --d-panel:#14160e;"
>
	<div
		class="flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-4 py-2 font-mono text-[11px]"
		style="border-color: var(--d-line); background: var(--d-panel); color: var(--d-dim)"
	>
		<span><b class="font-semibold" style="color: var(--d-fg)">Wordy.yml</b> · before → after</span>
		<span class="ml-auto rounded px-1.5 py-0.5" style="background:#243016; color:#a8d861">
			coverage: exercised
		</span>
	</div>

	<div class="p-4 font-mono text-[12.5px] leading-[1.7]">
		<div style="color: var(--d-faint)">the edit</div>
		<div class="mt-1">
			<span style="color:#a8d861">+ </span>nonword: <span style="color:#e3b168">true</span>
		</div>

		<div class="mt-4" style="color: var(--d-faint)">what it changed</div>
		<div class="mt-1">
			<span style="color:#e08a78">+2 alerts</span>
			<span style="color: var(--d-dim)">· −0 · 2 of 2 files</span>
		</div>

		<div class="mt-3 flex flex-col gap-2.5">
			{#each added as row (row.file)}
				<div class="border-t pt-2.5" style="border-color: var(--d-line)">
					<div style="color: var(--d-dim)">
						{row.file}<span style="color: var(--d-faint)">:{row.line}:{row.span}</span>
					</div>
					<div class="mt-0.5">
						{row.text}<span class="rounded px-0.5" style="background:#4a2420; color:#f0a08e"
							>{row.hit}</span
						>{row.tail}
					</div>
				</div>
			{/each}
		</div>

		<div
			class="mt-4 border-t pt-3 text-[11.5px]"
			style="border-color: var(--d-line); color: var(--d-dim)"
		>
			One word added to a working rule made <b style="color: var(--d-fg)">very</b> match inside
			<b style="color: var(--d-fg)">every</b>. Both are new false positives, in files nobody would
			have thought to re-check.
		</div>
	</div>
</div>
