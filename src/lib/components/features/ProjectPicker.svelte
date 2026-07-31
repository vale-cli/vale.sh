<script lang="ts">
	import ExternalLink from './ExternalLink.svelte';
	import BrandIcon from '$lib/components/landing/BrandIcon.svelte';

	export type Project = {
		id: string;
		name: string;
		/** Where the documentation lives. */
		docs: string;
		/** Simple Icons slug for the project mark, when one exists. */
		icon?: string;
		/** GitHub org avatar, for brands Simple Icons does not carry. */
		avatar?: string;
		/** The markup format its documentation is written in. */
		format: string;
		/** Simple Icons slug for that format's own mark, where one exists. */
		formatIcon?: string;
		/** The configuration the run used. Omitted when it is not the project's own. */
		config?: string;
		/** Commit the corpus was pinned at. */
		commit: string;
		pages: number;
		mb: number;
		rules: number;
		/** Wall-clock seconds, mean of three runs from cold. */
		seconds: number;
		/** One line explaining what is distinctive about this project's setup. */
		note: string;
		/** Alerts by level from the same run. */
		levels: { suggestion: number; warning: number; error: number };
	};

	let { projects, active = $bindable(projects[0].id) }: { projects: Project[]; active?: string } =
		$props();

	const current = $derived(projects.find((p) => p.id === active)!);

	const rate = $derived(Math.round(current.pages / current.seconds));

	// Bars are relative to the largest corpus, so the selector doubles as a
	// sense of how these projects compare in size.
	const maxPages = Math.max(...projects.map((p) => p.pages));

	const fmt = new Intl.NumberFormat('en-US');
</script>

<div class="rounded-2xl border border-border/60 bg-card">
	<div
		role="tablist"
		aria-label="Project"
		class="flex gap-1 overflow-x-auto border-b border-border/60 px-3 py-2"
	>
		{#each projects as project}
			<button
				role="tab"
				aria-selected={active === project.id}
				onclick={() => (active = project.id)}
				class="whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 {active ===
				project.id
					? 'bg-lime-500/10 font-medium text-foreground'
					: 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}"
			>
				<span class="inline-flex items-center gap-2">
					{#if project.icon || project.avatar}
						<span
							class="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white/90 p-0.5 ring-1 ring-inset ring-black/10"
						>
							<BrandIcon
								name={project.name}
								slug={project.icon}
								avatar={project.avatar}
								class="h-full w-full rounded-none"
							/>
						</span>
					{/if}
					{project.name}
					{#if project.formatIcon}
						<BrandIcon
							name={project.format}
							slug={project.formatIcon}
							class="h-3.5 w-3.5 text-muted-foreground"
						/>
					{/if}
				</span>
			</button>
		{/each}
	</div>

	<div class="p-6 sm:p-8">
		<div class="flex flex-wrap items-end gap-x-10 gap-y-4">
			{#if current.icon || current.avatar}
				<span
					class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/90 p-1 ring-1 ring-inset ring-black/10"
				>
					<BrandIcon
						name={current.name}
						slug={current.icon}
						avatar={current.avatar}
						class="h-full w-full rounded-none"
					/>
				</span>
			{/if}
			<div>
				<div
					class="font-mono text-4xl font-semibold tracking-tight text-lime-600 dark:text-lime-400"
				>
					{rate}
				</div>
				<div class="mt-1 text-sm font-medium text-foreground">pages a second</div>
			</div>
			<div>
				<div class="font-mono text-4xl font-semibold tracking-tight text-foreground">
					{current.seconds < 10 ? current.seconds.toFixed(2) : current.seconds.toFixed(1)}<span
						class="text-2xl text-muted-foreground">s</span
					>
				</div>
				<div class="mt-1 text-sm font-medium text-muted-foreground">for the whole corpus</div>
			</div>
		</div>

		<!--
			Rule count sits beside the rate deliberately. Projects differ more in
			how many rules they run than in how large they are, and without it a
			reader would read a faster project as a better one.
		-->
		<!--
			Six tracks, not five: "reStructuredText" is one unbreakable word and
			does not fit a fifth of this row, so Format takes two of them.
		-->
		<dl class="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-6">
			<div>
				<dt class="text-xs uppercase tracking-wider text-muted-foreground/70">Pages</dt>
				<dd class="mt-1 font-mono text-lg tabular-nums text-foreground">
					{fmt.format(current.pages)}
				</dd>
			</div>
			<div>
				<dt class="text-xs uppercase tracking-wider text-muted-foreground/70">Prose</dt>
				<dd class="mt-1 font-mono text-lg tabular-nums text-foreground">{current.mb} MB</dd>
			</div>
			<div>
				<dt class="text-xs uppercase tracking-wider text-muted-foreground/70">Rules</dt>
				<dd class="mt-1 font-mono text-lg tabular-nums text-foreground">{current.rules}</dd>
			</div>
			<div class="col-span-2 min-w-0">
				<dt class="text-xs uppercase tracking-wider text-muted-foreground/70">Format</dt>
				<dd class="mt-1 flex items-center gap-1.5 text-lg text-foreground">
					{#if current.formatIcon}
						<BrandIcon
							name={current.format}
							slug={current.formatIcon}
							class="h-4 w-4 shrink-0"
						/>
					{/if}
					<span class="truncate">{current.format}</span>
				</dd>
			</div>
			<div>
				<dt class="text-xs uppercase tracking-wider text-muted-foreground/70">Commit</dt>
				<dd class="mt-1 font-mono text-lg text-foreground">{current.commit}</dd>
			</div>
		</dl>

		<div class="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-muted">
			<div
				class="h-full rounded-full bg-lime-500 transition-all"
				style="width: {Math.max((current.pages / maxPages) * 100, 1.5)}%"
			></div>
		</div>
		<p class="mt-2 text-xs text-muted-foreground/70">Corpus size, relative to the largest here.</p>

		<p class="mt-6 text-sm leading-relaxed text-muted-foreground">{current.note}</p>

		<p class="mt-4 text-sm leading-relaxed text-muted-foreground">
			<ExternalLink href={current.docs}>docs</ExternalLink>
			{#if current.config}
				· <ExternalLink href={current.config}>their config</ExternalLink>
			{/if}
		</p>
	</div>
</div>
