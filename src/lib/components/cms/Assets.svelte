<script lang="ts">
	// Four cards rather than three, because the argument of this section is
	// scope, and scope is felt by enumeration. Hunspell in particular used to be
	// four words inside a wider "Assets" card — editing .dic and .aff files in a
	// browser, with validation, is the hardest thing on this list and nothing
	// else does it, so it gets its own card and says so.
	const assets = [
		{
			tag: '.vale.ini',
			title: 'Config',
			body: 'Edit as a guided form or as raw text, with autocomplete and diagnostics for every key the engine actually recognizes. See which styles run, and what gets skipped.'
		},
		{
			tag: '.yml',
			title: 'Rules',
			body: 'All twelve check types, each with a form that knows its fields — including sequence rules with part-of-speech tags, and scripted checks that run in a sandbox.'
		},
		{
			tag: '.dic · .aff',
			title: 'Dictionaries',
			body: 'Hunspell dictionaries and affix files, edited in the browser and validated before they ship. This is the part everything else makes you do by hand.'
		},
		{
			tag: 'accept.txt · .tmpl',
			title: 'Everything else',
			body: 'Vocabularies, filters, views, and output templates — the whole tree, checked against the engine rather than against a guess at its schema.'
		}
	];
</script>

<section class="border-b border-border/60 py-16 sm:py-20">
	<div class="mx-auto max-w-6xl px-6 lg:px-8">
		<div class="max-w-2xl">
			<h2 class="text-base font-semibold text-lime-500">Not a rule editor</h2>
			<p class="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
				The whole Vale project, in one place
			</p>
			<p class="mt-5 text-pretty text-lg leading-8 text-muted-foreground">
				A mature Vale setup is an editorial system — rule logic, exceptions, package dependencies,
				scopes, ignore patterns. Every part of it gets the same edit, test, and ship loop, grounded
				in what the engine recognizes rather than a best guess at it.
			</p>
		</div>

		<div class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{#each assets as asset (asset.title)}
				<div class="rounded-2xl border border-border/60 bg-card p-6">
					<span
						class="inline-block rounded-md bg-lime-500/10 px-2 py-0.5 font-mono text-[11.5px] text-lime-600 dark:text-lime-400"
					>
						{asset.tag}
					</span>
					<h3 class="mt-4 text-lg font-semibold">{asset.title}</h3>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">{asset.body}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
