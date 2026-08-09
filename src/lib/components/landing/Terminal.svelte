<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import BrandIcon from './BrandIcon.svelte';
	import { demoRuns, type Severity, type Alert } from '$lib/data/demo-runs';
	import context from '$lib/data/demo-context.json';

	// Real output, captured per project. See src/lib/data/demo-runs.ts for the
	// commands that regenerate it.
	let active = $state(demoRuns[0].id);
	const run = $derived(demoRuns.find((r) => r.id === active) ?? demoRuns[0]);

	const sevColor: Record<Severity, string> = {
		error: 'text-red-400',
		warning: 'text-amber-400',
		suggestion: 'text-sky-400'
	};

	type Excerpt = {
		label: number;
		text: string;
		spans: { col: number; length: number }[];
		locs: string[];
	};

	/*
		One excerpt per sentence, not one per alert. Docker's `very` and `really`
		fall in the same sentence -- wrapped across two lines -- and CircleCI flags
		`will` twice in one; printing the source per alert would have shown those
		sentences twice over. script/demo does the joining and names the alerts
		each excerpt covers.
	*/
	const groups = $derived(
		((context as Record<string, Excerpt[]>)[run.id] ?? []).map((source) => ({
			source,
			alerts: run.alerts.filter((a) => source.locs.includes(a.loc))
		}))
	);

	/**
	 * Splits a source line into marked and unmarked runs.
	 *
	 * Long lines are windowed around the marks rather than wrapped in full --
	 * CircleCI's line 103 runs past 190 characters, and the interesting part is
	 * the two words Vale objected to, not the sentence they sit in.
	 */
	const PAD = 34;
	function segment(source: Excerpt) {
		const first = source.spans[0];
		const last = source.spans[source.spans.length - 1];
		let start = Math.max(0, first.col - 1 - PAD);
		let end = Math.min(source.text.length, last.col - 1 + last.length + PAD);

		// Snap to whitespace so a window never opens mid-word: cutting at a fixed
		// offset produced "…M service or machine provisioner".
		if (start > 0) {
			const space = source.text.indexOf(' ', start);
			if (space !== -1 && space < first.col - 1) start = space + 1;
		}
		if (end < source.text.length) {
			const space = source.text.lastIndexOf(' ', end);
			if (space > last.col - 1 + last.length) end = space;
		}

		const parts: { text: string; marked: boolean }[] = [];
		let at = start;
		for (const span of source.spans) {
			const from = span.col - 1;
			if (from > at) parts.push({ text: source.text.slice(at, from), marked: false });
			parts.push({ text: source.text.slice(from, from + span.length), marked: true });
			at = from + span.length;
		}
		if (at < end) parts.push({ text: source.text.slice(at, end), marked: false });

		return { parts, leading: start > 0, trailing: end < source.text.length };
	}

	/** The rule name, without the style that owns it. */
	const ruleName = (alert: Alert) => alert.rule.split('.').slice(1).join('.') || alert.rule;
</script>

<div class="overflow-hidden rounded-xl border border-border bg-zinc-950">
	<!-- Title bar doubles as the project switcher. -->
	<div class="flex items-center gap-3 border-b border-white/10 px-4 py-2.5">
		<span class="hidden shrink-0 items-center gap-2 sm:flex">
			<span class="h-3 w-3 rounded-full bg-red-500/80"></span>
			<span class="h-3 w-3 rounded-full bg-amber-500/80"></span>
			<span class="h-3 w-3 rounded-full bg-lime-500/80"></span>
		</span>

		<div class="hide-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1" role="tablist">
			{#each demoRuns as project (project.id)}
				{@const selected = project.id === run.id}
				<button
					type="button"
					role="tab"
					aria-selected={selected}
					title="{project.repo} — {project.format}"
					onclick={() => (active = project.id)}
					class="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 {selected
						? 'bg-white/10 text-zinc-100'
						: 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}"
				>
					<!--
						Light plate behind every mark. CircleCI's is black on transparent
						and vanishes against the terminal otherwise -- the same reason
						LogoWall keeps its plates light in dark mode.
					-->
					<span
						class="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-white {selected
							? ''
							: 'opacity-70'}"
					>
						<img src={project.avatar} alt="" class="h-full w-full object-contain" loading="lazy" />
					</span>
					{project.name}
				</button>
			{/each}
		</div>
	</div>

	<!-- Output -->
	<!--
		Wrapping, not scrolling. Vale wraps its own output to the terminal width by
		default; `--no-wrap` was only used to capture it. A horizontal scrollbar
		here just hid the end of every message.
	-->
	<div
		class="px-4 py-4 font-mono text-[12px] leading-relaxed sm:text-[13px]"
		role="tabpanel"
		aria-label="{run.name} lint output"
	>
		<div class="break-all text-zinc-300">
			<span class="text-lime-400">$</span> vale {run.file}
		</div>

		<div class="mt-3 break-all text-zinc-100 underline underline-offset-4">{run.file}</div>

		<!--
			The prose, then what Vale said about it. Printing the alerts alone asked
			the reader to trust a judgement about a file they could not see -- "avoid
			first-person plural like 'we'" never said which sentence.
		-->
		<div class="mt-3 space-y-3">
			{#each groups as group (group.source.label)}
				<div class="rounded-md border border-white/[0.07] bg-white/[0.02] p-2.5">
					{#if group.source}
						{@const seg = segment(group.source)}
						<div class="flex gap-2.5">
							<span class="shrink-0 select-none text-zinc-600">{group.source.label}</span>
							<p class="min-w-0 break-words text-zinc-400">
								{#if seg.leading}<span class="text-zinc-600">…</span
									>{/if}{#each seg.parts as part}{#if part.marked}<mark
											class="rounded-[3px] bg-lime-400/20 px-0.5 text-zinc-100 decoration-lime-400/70 decoration-wavy underline-offset-4"
											>{part.text}</mark
										>{:else}{part.text}{/if}{/each}{#if seg.trailing}<span class="text-zinc-600"
										>…</span
									>{/if}
							</p>
						</div>
					{/if}

					<div class="mt-2 space-y-1 {group.source ? 'sm:ml-[calc(1.5rem+0.625rem)]' : ''}">
						{#each group.alerts as alert (alert.loc + alert.rule)}
							<div class="flex flex-col gap-x-3 sm:flex-row">
								<span class="flex gap-3">
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
				</div>
			{/each}
		</div>

		<div class="mt-3 text-zinc-400">
			<span class={run.summary.startsWith('0 errors') ? 'text-amber-400' : 'text-red-400'}>✖</span>
			{run.summary}
		</div>
	</div>

	<!-- The same run, over the whole corpus, is written up on the speed page. -->
	<a
		href="/features/speed"
		class="group flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3 text-xs text-zinc-400 transition-colors hover:bg-white/[0.03] hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lime-500"
	>
		<span class="flex min-w-0 items-center gap-1.5 truncate">
			<span class="truncate font-mono text-zinc-300">{run.repo}</span>
			<span class="text-zinc-600">·</span>
			<!-- The markup Vale parsed before it could read the prose. -->
			<BrandIcon name={run.format} slug={run.formatIcon} size="h-3.5 w-3.5" />
			<span class="hidden sm:inline">{run.format}</span>
			<span class="text-zinc-600">·</span>
			<span class="font-mono">{run.commit}</span>
		</span>
		<span class="inline-flex shrink-0 items-center gap-1 font-medium text-zinc-200">
			See the full run
			<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
		</span>
	</a>
</div>
