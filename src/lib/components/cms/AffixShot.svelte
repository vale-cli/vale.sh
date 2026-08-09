<script lang="ts">
	// A product shot of the dictionary tooling. Always dark, matching EditorShot,
	// so it reads as a screenshot of an application rather than as a region of
	// this page — and for the same reason it uses scoped custom properties rather
	// than the site's theme tokens.
	//
	// The data is real: these are expand_dictionary's actual expansions for the
	// affix file shown, not an illustration. The point it makes only works
	// because it is real — three words carrying the SAME three flags, and two of
	// them silently miss the form you would assume they have. If you change the
	// words or the flags, re-run expand_dictionary and use what it returns.
	const entries = [
		{
			word: 'deploy',
			flags: 'SDG',
			got: ['deploy', 'deploying'],
			missing: ['deploys', 'deployed']
		},
		{
			word: 'index',
			flags: 'SDG',
			got: ['index', 'indexes', 'indexed', 'indexing'],
			missing: []
		},
		{
			word: 'verify',
			flags: 'SDG',
			got: ['verify', 'verified', 'verifying'],
			missing: ['verifies']
		}
	];
</script>

<div
	class="overflow-hidden rounded-2xl border shadow-xl"
	style="background: var(--a-bg); border-color: var(--a-line); color: var(--a-fg);
	       --a-bg:#16180f; --a-line:#2a2e1f; --a-fg:#d7d6c8; --a-dim:#8a8d78; --a-faint:#62654f; --a-panel:#14160e;"
>
	<div
		class="flex items-center gap-2 border-b px-4 py-2"
		style="border-color: var(--a-line); background: var(--a-panel)"
	>
		<span class="font-mono text-[11px]" style="color: var(--a-dim)">
			<b class="font-semibold" style="color: var(--a-fg)">acme.dic</b> · affix coverage
		</span>
	</div>

	<div class="p-4 font-mono text-[12.5px] leading-[1.7]">
		<div class="mb-3 flex flex-wrap gap-x-4 gap-y-1" style="color: var(--a-faint)">
			<span><b style="color:#e3b168">S</b> plural</span>
			<span><b style="color:#e3b168">D</b> past</span>
			<span><b style="color:#e3b168">G</b> progressive</span>
		</div>

		<div class="flex flex-col gap-3">
			{#each entries as e (e.word)}
				<div class="border-t pt-2.5" style="border-color: var(--a-line)">
					<div>
						<span style="color: var(--a-fg)">{e.word}</span><span style="color: var(--a-faint)"
							>/</span
						><span style="color:#e3b168">{e.flags}</span>
					</div>
					<div class="mt-1.5 flex flex-wrap gap-1.5">
						{#each e.got as form (form)}
							<span
								class="rounded px-1.5 py-0.5 text-[11.5px]"
								style="background:#243016; color:#a8d861">{form}</span
							>
						{/each}
						{#each e.missing as form (form)}
							<span
								class="rounded px-1.5 py-0.5 text-[11.5px] line-through"
								style="background:#33201c; color:#e08a78">{form}</span
							>
						{/each}
					</div>
				</div>
			{/each}
		</div>

		<div
			class="mt-4 border-t pt-3 text-[11.5px]"
			style="border-color: var(--a-line); color: var(--a-dim)"
		>
			Same three flags on all three words. <span style="color:#e08a78"
				>Struck-through forms are never generated</span
			> — the affix conditions exclude them, and the spell-checker will flag every one as a misspelling.
		</div>
	</div>
</div>
