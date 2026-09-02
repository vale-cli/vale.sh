<script lang="ts" module>
	export type Sev = 'error' | 'warning' | 'suggestion';
	export type Alert = { loc: string; sev: Sev; msg: string; rule: string };
	export type File = { path: string; alerts: Alert[] };

	/*
		A recreation of a Vale session. The files are invented; the rules are not.

		Everything here except the custom `Docs.*` rules was produced by running
		Vale over a two-file directory with `BasedOnStyles = Vale, Microsoft`, so
		the names, levels, messages, ordering and summary line are its own. Vale
		sorts files alphabetically and prints each under its own path, which is
		why configure.md comes first.

		`Docs.Terms` stands in for a rule a team wrote themselves -- the message
		follows the `substitution` extension's format. Nothing ships a rule by
		that name, and that is the point: the interesting rules on a real project
		are the ones nobody else has.

		One session rather than a single command, because `sync` is where the
		styles come from and a directory run is what anyone actually types.
	*/
	export const session: File[] = [
		{
			path: 'docs/configure.md',
			alerts: [
				{
					loc: '3:7',
					sev: 'suggestion',
					msg: "Consider using 'use' instead of 'utilize'.",
					rule: 'Microsoft.Wordiness'
				},
				{
					loc: '3:44',
					sev: 'suggestion',
					msg: "'are loaded' looks like passive voice.",
					rule: 'Microsoft.Passive'
				},
				{
					loc: '9:12',
					sev: 'error',
					msg: "Use 'Vale CLI' instead of 'Vale cli'.",
					rule: 'Docs.Terms'
				}
			]
		},
		{
			path: 'docs/install.md',
			alerts: [
				{
					loc: '3:40',
					sev: 'warning',
					msg: "Use 'select' instead of the input-specific verb 'Click'.",
					rule: 'Microsoft.UIVerbs'
				},
				{
					loc: '4:28',
					sev: 'error',
					msg: "Did you really mean 'existant'?",
					rule: 'Vale.Spelling'
				}
			]
		}
	];
</script>

<script lang="ts">
	// The home page shows the session above. /brand passes its own files, so
	// the summary and the sync line are computed rather than typed in.
	let { files = session, packages = 2 }: { files?: File[]; packages?: number } = $props();

	const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

	// Vale's own wording: "2 errors, 1 warning and 2 suggestions in 2 files."
	const summary = $derived.by(() => {
		const all = files.flatMap((f) => f.alerts);
		const n = (sev: Sev) => all.filter((a) => a.sev === sev).length;
		const shown = files.filter((f) => f.alerts.length > 0);
		return `${plural(n('error'), 'error')}, ${plural(n('warning'), 'warning')} and ${plural(n('suggestion'), 'suggestion')} in ${plural(shown.length, 'file')}.`;
	});
	const clean = $derived(files.every((f) => f.alerts.length === 0));

	// Both themes: the panel used to be permanently near-black, which sat as a
	// hole in the middle of an otherwise light page.
	const sevColor: Record<Sev, string> = {
		error: 'text-red-600 dark:text-red-400',
		warning: 'text-amber-600 dark:text-amber-400',
		suggestion: 'text-sky-600 dark:text-sky-400'
	};
</script>

<div class="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
	<!-- Title bar -->
	<div class="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-3">
		<span class="h-3 w-3 rounded-full bg-red-500/80"></span>
		<span class="h-3 w-3 rounded-full bg-amber-500/80"></span>
		<span class="h-3 w-3 rounded-full bg-lime-500/80"></span>
		<span class="ml-2 select-none font-mono text-xs text-muted-foreground">bash — vale</span>
	</div>

	<!-- Body -->
	<div class="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed">
		<div class="whitespace-pre text-foreground">
			<span class="text-lime-600 dark:text-lime-400">$</span> vale sync
		</div>
		<div class="mt-1 whitespace-pre">
			<span
				class="rounded-sm bg-lime-600/15 px-1.5 py-0.5 font-semibold text-lime-700 dark:text-lime-400"
				>SUCCESS</span
			>
			<span class="text-muted-foreground"> Synced {packages} package(s) to 'styles'.</span>
		</div>

		<div class="mt-4 whitespace-pre text-foreground">
			<span class="text-lime-600 dark:text-lime-400">$</span> vale docs/
		</div>

		{#each files as file (file.path)}
			{#if file.alerts.length > 0}
				<div class="mt-4 whitespace-pre font-medium text-foreground underline underline-offset-4">
					{file.path}
				</div>
				{#each file.alerts as a (a.loc + a.rule)}
					<div class="mt-1 flex gap-4 whitespace-pre">
						<span class="w-14 shrink-0 text-muted-foreground">{a.loc}</span>
						<span class="w-[76px] shrink-0 {sevColor[a.sev]}">{a.sev}</span>
						<span class="text-foreground">{a.msg}</span>
						<span class="text-muted-foreground/70">{a.rule}</span>
					</div>
				{/each}
			{/if}
		{/each}

		<!--
			One expression, not wrapped markup: `whitespace-pre` keeps whatever line
			break the formatter puts in the template.
		-->
		<div class="mt-4 whitespace-pre text-muted-foreground">
			{#if clean}
				<span class="text-lime-600 dark:text-lime-400">✔</span> 0 errors, 0 warnings and 0 suggestions
				in 0 files.
			{:else}
				<span class="text-red-600 dark:text-red-400">✖</span>
				{summary}
			{/if}
		</div>
	</div>
</div>
