<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import { styleRuns, sampleFile, type Severity, type Alert } from '$lib/data/demo-runs';
	import context from '$lib/data/demo-context.json';

	/*
		One paragraph, three style guides. The prose is ours -- see the header of
		demo-runs.ts for why the hero is the one place that is true -- but every
		alert is Vale's own output against it, one run per style.
	*/
	let active = $state(styleRuns[0].id);
	const run = $derived(styleRuns.find((r) => r.id === active) ?? styleRuns[0]);

	const sevColor: Record<Severity, string> = {
		error: 'text-red-400',
		warning: 'text-amber-400',
		suggestion: 'text-sky-400'
	};

	type Span = { col: number; length: number; loc: string };
	const data = context as { paragraph: string; runs: Record<string, Span[]> };
	const spans = $derived(data.runs[run.id] ?? []);

	/** Splits the sample into marked and unmarked runs for the active style. */
	const parts = $derived.by(() => {
		const out: { text: string; marked: boolean }[] = [];
		let at = 0;
		for (const span of spans) {
			const from = span.col - 1;
			if (from > at) out.push({ text: data.paragraph.slice(at, from), marked: false });
			out.push({ text: data.paragraph.slice(from, from + span.length), marked: true });
			at = from + span.length;
		}
		if (at < data.paragraph.length) out.push({ text: data.paragraph.slice(at), marked: false });
		return out;
	});

	/** The rule name, without the style that owns it -- the tab says that. */
	const ruleName = (alert: Alert) => alert.rule.split('.').slice(1).join('.') || alert.rule;
</script>

<div class="overflow-hidden rounded-xl border border-border bg-zinc-950">
	<!-- Title bar doubles as the style switcher. -->
	<div class="flex items-center gap-3 border-b border-white/10 px-4 py-2.5">
		<span class="hidden shrink-0 items-center gap-2 sm:flex">
			<span class="h-3 w-3 rounded-full bg-red-500/80"></span>
			<span class="h-3 w-3 rounded-full bg-amber-500/80"></span>
			<span class="h-3 w-3 rounded-full bg-lime-500/80"></span>
		</span>

		<div class="hide-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1" role="tablist">
			{#each styleRuns as style (style.id)}
				{@const selected = style.id === run.id}
				<button
					type="button"
					role="tab"
					aria-selected={selected}
					title={style.blurb}
					onclick={() => (active = style.id)}
					class="inline-flex shrink-0 items-center rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 {selected
						? 'bg-white/10 text-zinc-100'
						: 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}"
				>
					{style.name}
				</button>
			{/each}
		</div>
	</div>

	<!-- Output -->
	<div
		class="px-4 py-4 font-mono text-[12px] leading-relaxed sm:text-[13px]"
		role="tabpanel"
		aria-label="{run.name} lint output"
	>
		<div class="break-all text-zinc-300">
			<span class="text-lime-400">$</span> vale {sampleFile}
		</div>

		<!--
			The prose first, marked. Printing the alerts alone asked the reader to
			trust a judgement about a file they could not see; the whole point here
			is that the same sentence changes verdict when the style does.
		-->
		<div class="mt-3 rounded-md border border-white/[0.07] bg-white/[0.02] p-3">
			<p class="break-words text-zinc-400">
				{#each parts as part}{#if part.marked}<mark
							class="rounded-[3px] bg-lime-400/20 px-0.5 text-zinc-100">{part.text}</mark
						>{:else}{part.text}{/if}{/each}
			</p>
		</div>

		<div class="mt-3 break-all text-zinc-100 underline underline-offset-4">{sampleFile}</div>

		<div class="mt-1 sm:grid sm:grid-cols-[auto_auto_minmax(0,1fr)] sm:gap-x-4 sm:gap-y-1">
			{#each run.alerts as alert (alert.loc + alert.rule)}
				<div class="mt-2 flex flex-col sm:contents">
					<span class="flex gap-3 sm:contents">
						<span class="shrink-0 text-zinc-500">{alert.loc}</span>
						<span class="shrink-0 {sevColor[alert.sev]}">{alert.sev}</span>
					</span>
					<span class="min-w-0 break-words">
						<span class="text-zinc-200">{alert.msg}</span>
						<span class="text-zinc-500">&nbsp;{ruleName(alert)}</span>
					</span>
				</div>
			{/each}
		</div>

		<div class="mt-3 text-zinc-400">
			<span class={run.summary.startsWith('0 errors') ? 'text-amber-400' : 'text-red-400'}>✖</span>
			{run.summary}
		</div>
	</div>

	<!--
		The demo is written prose; the real corpora, at pinned commits, are on the
		speed page. Saying which style produced this is the honest caption.
	-->
	<a
		href="/features/speed"
		class="group flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3 text-xs text-zinc-400 transition-colors hover:bg-white/[0.03] hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lime-500"
	>
		<span class="flex min-w-0 items-center gap-1.5 truncate">
			<span class="truncate font-mono text-zinc-300">{run.pkg}</span>
			<span class="text-zinc-600">·</span>
			<span class="truncate">{run.blurb}</span>
		</span>
		<span class="inline-flex shrink-0 items-center gap-1 font-medium text-zinc-200">
			See real runs
			<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
		</span>
	</a>
</div>
