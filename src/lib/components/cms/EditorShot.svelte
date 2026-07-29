<!--
	A product shot of the Vale CMS editor. Deliberately always dark, even in the
	site's light theme — it reads as a screenshot of an application, not as a
	region of this page, and a light-surface version would just be a worse copy
	of a real editor.

	The rule on screen is a `sequence` check with part-of-speech tags, chosen
	deliberately over something like `repetition`. A four-line repetition rule
	proves nothing — anyone can edit that in a textarea. A token sequence with an
	optional adverb and a VBN participle is the case where you actually need to
	know what the engine will do, which is the whole argument for the product.
	If you simplify this rule, the screenshot stops making the point.

	The palette is scoped to this component via inline custom properties rather
	than the site's shadcn tokens, for the same reason as the dark treatment:
	those tokens follow the visitor's theme, and this must not.
-->
<div
	class="overflow-hidden rounded-2xl border shadow-2xl shadow-lime-950/20 dark:shadow-black/40"
	style="background: var(--e-bg); border-color: var(--e-line); color: var(--e-fg);
	       --e-bg:#16180f; --e-line:#2a2e1f; --e-fg:#d7d6c8; --e-dim:#8a8d78; --e-faint:#62654f; --e-panel:#14160e;"
>
	<!-- Title bar -->
	<div
		class="flex items-center gap-2 border-b px-4 py-2.5"
		style="border-color: var(--e-line); background: var(--e-panel)"
	>
		<span class="size-2.5 rounded-full bg-[#e06c5b]"></span>
		<span class="size-2.5 rounded-full bg-[#d9a441]"></span>
		<span class="size-2.5 rounded-full bg-[#7fb84a]"></span>
		<span class="ml-2.5 font-mono text-xs" style="color: var(--e-dim)">
			<b class="font-semibold" style="color: var(--e-fg)">product-docs</b> · main
		</span>
		<span class="ml-auto rounded-md bg-lime-500 px-3 py-1 text-[11.5px] font-semibold text-lime-950">
			Save
		</span>
	</div>

	<div class="grid min-h-[26rem] grid-cols-1 min-[900px]:grid-cols-[212px_minmax(0,1fr)_286px]">
		<!-- Project tree -->
		<div
			class="hidden border-r py-3 font-mono text-[12.5px] min-[900px]:block"
			style="border-color: var(--e-line); color: var(--e-dim)"
		>
			<div class="px-4 py-1 text-[10.5px] uppercase tracking-wider" style="color: var(--e-faint)">
				Project
			</div>
			<div class="flex items-center gap-1.5 px-4 py-1">
				<span style="color: var(--e-faint)">◆</span> .vale.ini
			</div>
			<div class="px-4 py-1 text-[10.5px] uppercase tracking-wider" style="color: var(--e-faint)">
				Styles / House
			</div>
			<div
				class="flex items-center gap-1.5 py-1 pl-7 pr-4 text-lime-50"
				style="background: rgb(132 204 22 / 0.14); box-shadow: inset 2px 0 0 #84cc16"
			>
				<span class="text-lime-500">▸</span> Passive.yml
			</div>
			<div class="flex items-center gap-1.5 py-1 pl-7 pr-4">
				<span style="color: var(--e-faint)">▸</span> Terms.yml
			</div>
			<div class="flex items-center gap-1.5 py-1 pl-7 pr-4">
				<span style="color: var(--e-faint)">▸</span> Headings.yml
				<span class="ml-auto text-[11px]" style="color: var(--e-faint)">+11</span>
			</div>
			<div class="px-4 py-1 text-[10.5px] uppercase tracking-wider" style="color: var(--e-faint)">
				Assets
			</div>
			<div class="flex items-center gap-1.5 px-4 py-1">
				<span style="color: var(--e-faint)">▤</span> Vocab / Base
			</div>
			<div class="flex items-center gap-1.5 px-4 py-1">
				<span style="color: var(--e-faint)">▤</span> en_US.dic · .aff
			</div>
			<div class="flex items-center gap-1.5 px-4 py-1">
				<span style="color: var(--e-faint)">▤</span> Filters · Views
			</div>
		</div>

		<!-- Editor -->
		<div class="flex min-w-0 flex-col border-r" style="border-color: var(--e-line)">
			<div class="flex h-10 items-center border-b px-3" style="border-color: var(--e-line)">
				<div
					class="flex h-full items-center border-b-2 border-lime-500 px-3 font-mono text-xs"
					style="color: var(--e-fg)"
				>
					Passive.yml
				</div>
				<div
					class="ml-auto flex overflow-hidden rounded-md border text-[11px]"
					style="border-color: var(--e-line)"
				>
					<span class="bg-lime-500/20 px-2.5 py-1" style="color: var(--e-fg)">Form</span>
					<span class="px-2.5 py-1" style="color: var(--e-dim)">Raw</span>
				</div>
			</div>

			<!--
				One element per line, deliberately. Svelte's compiler collapses
				whitespace inside text nodes (preserveWhitespace is off), so literal
				newlines plus `whitespace-pre` on the container would render every line
				as one. Block layout survives that, and indents use &nbsp; for the same
				reason — a real two-space indent collapses to one.
			-->
			<div class="flex-1 overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-[1.8]">
				<div class="whitespace-pre">
					<span style="color: var(--e-faint)">1</span><span class="ml-4 italic" style="color:#6c7059"
						># "be" + optional adverb + past participle.</span
					>
				</div>
				<div class="whitespace-pre">
					<span style="color: var(--e-faint)">2</span><span class="ml-4 text-lime-400">extends</span
					>: <span style="color:#e3b168">sequence</span>
				</div>
				<div class="whitespace-pre">
					<span style="color: var(--e-faint)">3</span><span class="ml-4 text-lime-400">message</span
					>: <span style="color:#e3b168">"'%s' looks like passive voice."</span>
				</div>
				<div class="whitespace-pre">
					<span style="color: var(--e-faint)">4</span><span class="ml-4 text-lime-400">level</span>:
					<span style="color:#e3b168">warning</span>
				</div>
				<div class="whitespace-pre">
					<span style="color: var(--e-faint)">5</span><span class="ml-4 text-lime-400">tokens</span>:
				</div>
				<div class="whitespace-pre">
					<span style="color: var(--e-faint)">6</span><span class="ml-4"
						>&nbsp;&nbsp;- <span class="text-lime-400">pattern</span>:
						<span style="color:#c9a6f2">'(?:is|are|was|were|been)'</span></span
					>
				</div>
				<div class="whitespace-pre">
					<span style="color: var(--e-faint)">7</span><span class="ml-4"
						>&nbsp;&nbsp;- <span class="text-lime-400">tag</span>:
						<span style="color:#e3b168">RB</span></span
					>
				</div>
				<div class="whitespace-pre">
					<span style="color: var(--e-faint)">8</span><span class="ml-4"
						>&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-lime-400">optional</span>:
						<span style="color:#7cc7f2">true</span></span
					>
				</div>
				<div class="whitespace-pre">
					<span style="color: var(--e-faint)">9</span><span class="ml-4"
						>&nbsp;&nbsp;- <span class="text-lime-400">tag</span>:
						<span style="color:#e3b168">VBN</span></span
					>
				</div>
			</div>

			<!-- The proof: what the engine resolved this to, in its own terms. -->
			<div
				class="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 border-t px-4 py-2.5 font-mono text-[11.5px]"
				style="border-color: var(--e-line); background: var(--e-panel); color: var(--e-dim)"
			>
				<span class="text-lime-500">compiled</span>
				<span style="color:#c9a6f2">(?:is|are|was|were|been)</span>
				<span style="color: var(--e-faint)">→</span>
				<span style="color:#e3b168">RB?</span>
				<span style="color: var(--e-faint)">→</span>
				<span style="color:#e3b168">VBN</span>
				<span style="color:#6c7059">— exactly what the engine runs</span>
			</div>
		</div>

		<!-- Test pane -->
		<div class="hidden min-w-0 flex-col gap-3 p-4 min-[900px]:flex">
			<div class="text-[11px] font-semibold uppercase tracking-wider" style="color: var(--e-faint)">
				Test · release-notes.md
			</div>
			<div class="text-[15px] leading-[1.8]" style="color: var(--e-fg)">
				The schema <span
					class="underline decoration-[#e0a63c] decoration-wavy decoration-2 underline-offset-4"
					>was carefully reviewed</span
				>
				by legal. Older keys
				<span class="underline decoration-[#e0a63c] decoration-wavy decoration-2 underline-offset-4"
					>were deprecated</span
				>
				last week. Please
				<span class="underline decoration-[#6ea0ff] decoration-wavy decoration-2 underline-offset-4"
					>utilise</span
				> the new endpoint.
			</div>
			<div class="flex flex-col gap-2 border-t pt-3" style="border-color: var(--e-line)">
				<div class="flex items-start gap-2">
					<span
						class="mt-px shrink-0 rounded bg-[#e0a63c]/15 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-[#e0a63c]"
						>warning</span
					>
					<span class="text-[12.5px] leading-tight" style="color: var(--e-fg)">
						'was carefully reviewed' looks like passive voice.
						<span class="font-mono text-[11px]" style="color: var(--e-faint)">House.Passive</span>
					</span>
				</div>
				<div class="flex items-start gap-2">
					<span
						class="mt-px shrink-0 rounded bg-[#e0a63c]/15 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-[#e0a63c]"
						>warning</span
					>
					<span class="text-[12.5px] leading-tight" style="color: var(--e-fg)">
						'were deprecated' looks like passive voice.
						<span class="font-mono text-[11px]" style="color: var(--e-faint)">House.Passive</span>
					</span>
				</div>
				<div class="flex items-start gap-2">
					<span
						class="mt-px shrink-0 rounded bg-[#6ea0ff]/15 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-[#6ea0ff]"
						>suggestion</span
					>
					<span class="text-[12.5px] leading-tight" style="color: var(--e-fg)">
						Prefer 'use'.
						<span class="font-mono text-[11px]" style="color: var(--e-faint)">House.Terms</span>
					</span>
				</div>
			</div>
			<p class="mt-auto text-[11.5px] leading-snug" style="color: var(--e-faint)">
				The optional <span class="font-mono">RB</span> is why the first match includes
				<span class="font-mono">carefully</span>.
			</p>
		</div>
	</div>

	<!-- Status bar -->
	<div
		class="flex items-center gap-4 border-t px-4 py-2 font-mono text-[11px]"
		style="border-color: var(--e-line); background: var(--e-panel); color: var(--e-dim)"
	>
		<span class="text-lime-500">● engine ready</span>
		<span>16 assets</span>
		<span>3 alerts</span>
		<span class="ml-auto">saved · main</span>
	</div>
</div>
