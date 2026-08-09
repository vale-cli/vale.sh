<script lang="ts">
	/*
		A recreation of a Vale session, tabbed by what the CLI can do with one run.

		The files are invented; the formats are not. Every shape here was checked
		against the real binary: the default report, `--filter`, `--output=line`
		(path:line:col:rule:message), and the SARIF template documented in
		docs/topics/templates.md. Flags and their spellings come from
		docs/topics/cli.md.

		One alert set feeds all four tabs, so they cannot drift apart -- the
		filtered view is the same run with the levels dropped, and the machine
		formats are the same alerts written out differently. That is also the
		point being made: one engine, whatever your editor or your pipeline
		wants to read.

		Everything except the `Docs.*` rule came from running Vale over a two-file
		directory with `BasedOnStyles = Vale, Microsoft`. `Docs.Terms` stands in
		for a rule a team wrote themselves and follows the `substitution`
		extension's message format; nothing ships a rule by that name, which is
		the point of it being there.
	*/
	type Sev = 'error' | 'warning' | 'suggestion';
	type Alert = { loc: string; sev: Sev; msg: string; rule: string };
	type File = { path: string; alerts: Alert[] };

	const files: File[] = [
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

	const tabs = [
		{ id: 'lint', label: 'Lint', cmd: 'vale docs/' },
		{ id: 'filter', label: 'Filter', cmd: 'vale --filter=\'.Level == "error"\' docs/' },
		{ id: 'line', label: 'Editors', cmd: 'vale --output=line docs/' },
		{ id: 'sarif', label: 'CI', cmd: 'vale --output=sarif.tmpl docs/ > vale.sarif' }
	];

	let active = $state(tabs[0].id);
	const tab = $derived(tabs.find((t) => t.id === active) ?? tabs[0]);

	/** The filter tab is the same run with everything below error dropped. */
	const shown = $derived(
		active === 'filter'
			? files
					.map((f) => ({ ...f, alerts: f.alerts.filter((a) => a.sev === 'error') }))
					.filter((f) => f.alerts.length)
			: files
	);

	/** Vale's own summary wording, recounted for whatever the tab shows. */
	const summary = $derived.by(() => {
		const all = shown.flatMap((f) => f.alerts);
		const n = (s: Sev) => all.filter((a) => a.sev === s).length;
		const plural = (c: number, w: string) => `${c} ${w}${c === 1 ? '' : 's'}`;
		return `${plural(n('error'), 'error')}, ${plural(n('warning'), 'warning')} and ${plural(
			n('suggestion'),
			'suggestion'
		)} in ${plural(shown.length, 'file')}.`;
	});

	/** `--output=line`: path:line:col:rule:message, one alert per line. */
	const lineOutput = $derived(
		files.flatMap((f) => f.alerts.map((a) => `${f.path}:${a.loc}:${a.rule}:${a.msg}`))
	);

	/**
	 * The head of the SARIF the documented template produces.
	 *
	 * Trimmed to the driver block: enough to recognise the format, short enough
	 * that switching tabs does not move the page much.
	 */
	const sarif = [
		'{',
		'  "$schema": "https://json.schemastore.org/sarif-2.1.0.json",',
		'  "version": "2.1.0",',
		'  "runs": [{',
		'    "tool": { "driver": {',
		'      "name": "Vale",',
		'      "informationUri": "https://vale.sh",',
		'      "rules": [{ "id": "Docs.Terms" }, … ]'
	];

	const sevColor: Record<Sev, string> = {
		error: 'text-red-600 dark:text-red-400',
		warning: 'text-amber-600 dark:text-amber-400',
		suggestion: 'text-sky-600 dark:text-sky-400'
	};
</script>

<div class="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
	<!-- Title bar doubles as the output switcher. -->
	<div class="flex items-center gap-3 border-b border-border/60 bg-muted/40 px-4 py-2.5">
		<span class="hidden shrink-0 items-center gap-2 sm:flex">
			<span class="h-3 w-3 rounded-full bg-red-500/80"></span>
			<span class="h-3 w-3 rounded-full bg-amber-500/80"></span>
			<span class="h-3 w-3 rounded-full bg-lime-500/80"></span>
		</span>

		<div class="hide-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1" role="tablist">
			{#each tabs as t (t.id)}
				{@const selected = t.id === tab.id}
				<button
					type="button"
					role="tab"
					aria-selected={selected}
					title={t.cmd}
					onclick={() => (active = t.id)}
					class="shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 {selected
						? 'bg-background text-foreground shadow-sm'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					{t.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Body -->
	<div
		class="min-h-[19.5rem] overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed"
		role="tabpanel"
		aria-label="{tab.label} output"
	>
		{#if active === 'lint'}
			<div class="whitespace-pre text-foreground">
				<span class="text-lime-600 dark:text-lime-400">$</span> vale sync
			</div>
			<div class="mt-1 whitespace-pre">
				<span
					class="rounded-sm bg-lime-600/15 px-1.5 py-0.5 font-semibold text-lime-700 dark:text-lime-400"
					>SUCCESS</span
				>
				<span class="text-muted-foreground"> Synced 2 package(s) to 'styles'.</span>
			</div>
		{/if}

		<div class="{active === 'lint' ? 'mt-4' : ''} whitespace-pre text-foreground">
			<span class="text-lime-600 dark:text-lime-400">$</span>
			{tab.cmd}
		</div>

		{#if active === 'line'}
			{#each lineOutput as line (line)}
				<div class="mt-1 whitespace-pre text-muted-foreground">{line}</div>
			{/each}
		{:else if active === 'sarif'}
			{#each sarif as line, i (i)}
				<div class="whitespace-pre text-muted-foreground {i === 0 ? 'mt-3' : ''}">{line}</div>
			{/each}
			<div class="mt-1 whitespace-pre text-muted-foreground/60">…</div>
			<div class="mt-4 whitespace-pre text-muted-foreground/70">
				# Upload with github/codeql-action/upload-sarif.
			</div>
		{:else}
			{#each shown as file (file.path)}
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
			{/each}

			<div class="mt-4 whitespace-pre text-muted-foreground">
				<span class="text-red-600 dark:text-red-400">✖</span>
				{summary}
			</div>
		{/if}
	</div>
</div>
