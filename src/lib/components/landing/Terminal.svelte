<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import BrandIcon from './BrandIcon.svelte';
	import { demoRuns, type Severity } from '$lib/data/demo-runs';

	// Real output, captured per project. See src/lib/data/demo-runs.ts for the
	// commands that regenerate it.
	let active = $state(demoRuns[0].id);
	const run = $derived(demoRuns.find((r) => r.id === active) ?? demoRuns[0]);

	const sevColor: Record<Severity, string> = {
		error: 'text-red-400',
		warning: 'text-amber-400',
		suggestion: 'text-sky-400'
	};
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
			Columns are sized by content rather than by fixed widths: 'suggestion'
			is wider than the 62px the severity column used to reserve, so it ran
			into the message. `contents` flattens each alert into that grid so the
			three columns still line up across rows.

			Below `sm` there is no room for three columns at all -- 295px on a
			375px phone left the message about 19 characters and pushed the rule
			name off the right edge -- so the location and severity move to their
			own line and the message gets the full width.
		-->
		<div class="mt-1 sm:grid sm:grid-cols-[auto_auto_minmax(0,1fr)] sm:gap-x-4 sm:gap-y-1">
			{#each run.alerts as alert (alert.loc + alert.rule)}
				<div class="mt-2 flex flex-col sm:contents">
					<span class="flex gap-3 sm:contents">
						<span class="shrink-0 text-zinc-500">{alert.loc}</span>
						<span class="shrink-0 {sevColor[alert.sev]}">{alert.sev}</span>
					</span>
					<span class="min-w-0 break-words">
						<span class="text-zinc-200">{alert.msg}</span>
						<span class="text-zinc-500">&nbsp;{alert.rule}</span>
					</span>
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
