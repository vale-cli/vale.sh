<script lang="ts">
	import AffixShot from './AffixShot.svelte';

	// This used to be four cards naming the four asset types, which argued scope
	// by enumeration and stopped there. The problem with that argument is that a
	// text editor also handles all four — the reason to use this one is what it
	// does to each asset that a text editor can't, and none of that was on the
	// page.
	//
	// So: the asset types are now a strip, and the body of the section is the
	// specific tooling. Every item below is a real component in the CMS —
	// AffixAssist, CoverageSearch, GlobTool, FilterPreview, ViewPreview,
	// CompiledPattern, ConfigVisualizer, RuleTests/TestSuite. If one is removed,
	// this is a promise the product stops keeping.
	const kinds = [
		{ tag: '.vale.ini', label: 'Config' },
		{ tag: '.yml', label: 'Rules' },
		{ tag: '.dic · .aff', label: 'Dictionaries' },
		{ tag: 'accept.txt', label: 'Vocabularies' },
		{ tag: 'filters', label: 'Filters' },
		{ tag: 'views', label: 'Views' },
		{ tag: '.tmpl', label: 'Templates' }
	];

	const tools = [
		{
			title: 'It shows the regex the engine built',
			body: 'A rule is not the YAML you typed — it is the pattern the engine compiles out of it, word boundaries, alternation, wrapper and all. That compiled source is on screen, highlighted, with each construct explained on hover.',
			why: 'Most rules that "look right and never fire" are wrong in the part you never see.'
		},
		{
			title: 'It knows which affixes apply to a word',
			body: 'Type a word into a Hunspell dictionary and the affix classes that actually apply to it light up — conditions checked, not guessed — with a preview of the forms each flag buys. If a shorter stem already derives it, it offers that instead.',
			why: 'deploy/D looks fine and never produces "deployed". The condition excludes it.'
		},
		{
			title: 'It answers the reverse question too',
			body: 'Given a word, which dictionary entry generates it — and through which affix? A reverse lookup across the whole dictionary, including imported ones large enough that nothing precomputes an index for them.',
			why: 'The fastest way to find out why the spell-checker accepts something it should not.'
		},
		{
			title: 'It resolves the config instead of describing it',
			body: 'Styles, per-rule toggles and format sections cascade. The visualiser shows the state each rule ends up in, per glob, after all of it — beside a grounded preview of what your ignore patterns actually swallow.',
			why: 'The .vale.ini text cannot tell you which rules run in this file, at what level.'
		},
		{
			title: 'Filters, views and templates get live previews',
			body: 'A filter expression evaluated against your resolved rules, showing exactly which survive. A view run over a sample, showing what each scope extracts. A template rendered against real alerts — or the error it fails with.',
			why: 'All three are the kind of asset you otherwise write blind and debug in CI.'
		},
		{
			title: 'Rule tests are snapshots, not forms',
			body: 'Every field of an alert is machine-made — the check, the severity, the line and column nobody can predict without running. So you run the rule and accept the alerts it produced, and the suite tells you when a later edit changes them.',
			why: 'The edit that silently stops a rule firing is the one no one writes a test for.'
		}
	];
</script>

<section id="assets" class="scroll-mt-20 border-b border-border/60 py-16 sm:py-20">
	<div class="mx-auto max-w-6xl px-6 lg:px-8">
		<div class="max-w-3xl">
			<h2 class="text-base font-semibold text-lime-500">Not a rule editor</h2>
			<p class="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
				A text editor opens these files. It can't tell you what they do.
			</p>
			<p class="mt-5 text-pretty text-lg leading-8 text-muted-foreground">
				A mature Vale setup is an editorial system — rule logic, exceptions, package dependencies,
				scopes, ignore patterns, dictionaries. Vale CMS edits every part of it, and for each one it
				answers the question the file itself can't.
			</p>
		</div>

		<div class="mt-9 flex flex-wrap items-center gap-2">
			{#each kinds as kind (kind.tag)}
				<span
					class="inline-flex items-baseline gap-1.5 rounded-lg border border-border/60 bg-card px-2.5 py-1.5"
				>
					<code class="font-mono text-[11.5px] text-lime-600 dark:text-lime-400">{kind.tag}</code>
					<span class="text-xs text-muted-foreground">{kind.label}</span>
				</span>
			{/each}
		</div>

		<!--
			The dictionary shot sits beside the two dictionary cards, not off on its
			own: the claim and its evidence should be readable in one glance. The
			other four cards follow underneath.
		-->
		<div class="mt-10 grid items-start gap-5 lg:grid-cols-[1.05fr_0.95fr]">
			<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
				{#each tools.slice(1, 3) as tool (tool.title)}
					<div class="flex flex-col rounded-2xl border border-border/60 bg-card p-6">
						<h3 class="text-balance text-base font-semibold leading-6">{tool.title}</h3>
						<p class="mt-2.5 text-sm leading-6 text-muted-foreground">{tool.body}</p>
						<p
							class="mt-4 border-t border-border/60 pt-3.5 text-sm leading-6 text-foreground/80 [text-wrap:pretty]"
						>
							{tool.why}
						</p>
					</div>
				{/each}
			</div>
			<AffixShot />
		</div>

		<div class="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
			{#each [tools[0], ...tools.slice(3)] as tool (tool.title)}
				<div class="flex flex-col rounded-2xl border border-border/60 bg-card p-6">
					<h3 class="text-balance text-base font-semibold leading-6">{tool.title}</h3>
					<p class="mt-2.5 text-sm leading-6 text-muted-foreground">{tool.body}</p>
					<p
						class="mt-4 border-t border-border/60 pt-3.5 text-sm leading-6 text-foreground/80 [text-wrap:pretty]"
					>
						{tool.why}
					</p>
				</div>
			{/each}
		</div>
	</div>
</section>
