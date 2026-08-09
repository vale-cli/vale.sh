<script lang="ts">
	/*
		A recreation of Vale's default CLI output. The file is invented; the rules
		are not.

		Every alert below was produced by running Vale against a short README with
		`BasedOnStyles = Vale, Microsoft`, so each name, level and message is the
		real one. The previous version had `Microsoft.Vocab` reporting "Use 'use'
		instead of 'utilize'" as a warning -- that rule exists, but it is a
		suggestion and says "Verify your use of '%s' with the A-Z word list". The
		utilize/use call belongs to Microsoft.Wordiness. `write-good.Passive` was
		likewise shown as a suggestion with Google's phrasing, when it is a
		warning with its own.
	*/
	type Sev = 'error' | 'warning' | 'suggestion';
	interface Alert {
		loc: string;
		sev: Sev;
		msg: string;
		rule: string;
	}

	const alerts: Alert[] = [
		{
			loc: '3:31',
			sev: 'suggestion',
			msg: "Consider using 'use' instead of 'utilize'.",
			rule: 'Microsoft.Wordiness'
		},
		{
			loc: '6:1',
			sev: 'warning',
			msg: "Use 'select' instead of the input-specific verb 'Click'.",
			rule: 'Microsoft.UIVerbs'
		},
		{
			loc: '6:48',
			sev: 'suggestion',
			msg: "'are loaded' looks like passive voice.",
			rule: 'Microsoft.Passive'
		},
		{
			loc: '7:30',
			sev: 'error',
			msg: "Did you really mean 'existant'?",
			rule: 'Vale.Spelling'
		}
	];

	const summary = '1 error, 1 warning and 2 suggestions in 1 file.';

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
			<span class="text-lime-600 dark:text-lime-400">$</span> vale README.md
		</div>

		<div class="mt-3 whitespace-pre font-medium text-foreground">README.md</div>

		{#each alerts as a}
			<div class="mt-1 flex gap-4 whitespace-pre">
				<span class="w-16 shrink-0 text-muted-foreground">{a.loc}</span>
				<span class="w-[76px] shrink-0 {sevColor[a.sev]}">{a.sev}</span>
				<span class="text-foreground">{a.msg}</span>
				<span class="text-muted-foreground/70">{a.rule}</span>
			</div>
		{/each}

		<!--
			One expression, not wrapped markup: `whitespace-pre` keeps whatever line
			break the formatter puts in the template, which split this across two
			lines mid-sentence.
		-->
		<div class="mt-3 whitespace-pre text-muted-foreground">
			<span class="text-red-600 dark:text-red-400">✖</span>
			{summary}
		</div>
	</div>
</div>
