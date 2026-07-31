<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import FeatureShell from '$lib/components/features/FeatureShell.svelte';
	import Section from '$lib/components/features/Section.svelte';
	import ExternalLink from '$lib/components/features/ExternalLink.svelte';
	import { features } from '$lib/features';

	const feature = features.find((f) => f.slug === 'extensible')!;

	/*
		The twelve `extends` values Vale accepts, each with a real rule body. The
		gallery is the argument for this page, so every example is something you
		could paste into a file and run — not a schematic.
	*/
	const points = [
		{
			id: 'existence',
			summary: 'Flag anything that matches',
			body: 'The workhorse. A list of tokens—literal or regular expressions—that should not appear.',
			yaml: `extends: existence
message: "Consider removing '%s'"
level: warning
ignorecase: true
tokens:
  - actually
  - basically
  - essentially
  - clearly`,
			alert: "warning  Consider removing 'basically'"
		},
		{
			id: 'substitution',
			summary: 'Prefer this over that',
			body: 'A mapping from what people write to what your style guide wants. The message names both.',
			yaml: `extends: substitution
message: "Use '%s' instead of '%s'."
level: error
ignorecase: true
swap:
  Javascript: JavaScript
  utilize: use
  in order to: to`,
			alert: "error  Use 'JavaScript' instead of 'Javascript'."
		},
		{
			id: 'capitalization',
			summary: 'Enforce a heading style',
			body: 'Title case, sentence case, or a pattern of your own—with AP or Chicago rules for title case, and an exception list.',
			yaml: `extends: capitalization
message: "'%s' should be in sentence case"
level: warning
scope: heading
match: $sentence
exceptions:
  - Vale
  - Markdown`,
			alert: "warning  'Getting Started With Vale' should be in sentence case"
		},
		{
			id: 'occurrence',
			summary: 'Count, then complain',
			body: 'How many times a pattern may appear in a scope. Sentence-level limits are where this earns its keep.',
			yaml: `extends: occurrence
message: 'More than 3 commas!'
level: error
scope: sentence
max: 3
token: ','`,
			alert: 'error  More than 3 commas!'
		},
		{
			id: 'repetition',
			summary: 'Catch the the duplicates',
			body: 'Repeated tokens, with an action attached so an editor can offer the fix.',
			yaml: `extends: repetition
message: "'%s' is repeated!"
level: error
alpha: true
action:
  name: edit
  params: [truncate, ' ']
tokens:
  - '[^\\s.!?]+'`,
			alert: "error  'the' is repeated!"
		},
		{
			id: 'consistency',
			summary: 'Pick one and stick to it',
			body: 'Two spellings that are both fine, but not in the same document. Vale flags whichever showed up second.',
			yaml: `extends: consistency
message: "Inconsistent spelling of '%s'."
level: error
ignorecase: true
either:
  advisor: adviser
  centre: center`,
			alert: "error  Inconsistent spelling of 'adviser'."
		},
		{
			id: 'conditional',
			summary: 'If this, then that',
			body: 'The existence of one pattern requires the existence of another—the standard way to enforce that an acronym is defined before it is used.',
			yaml: `extends: conditional
message: "'%s' has no definition"
level: error
scope: text
# An acronym ...
first: '\\b([A-Z]{3,5})\\b'
# ... requires an expansion.
second: '(?:\\b[A-Z][a-z]+ )+\\(([A-Z]{3,5})\\)'
exceptions:
  - API
  - CLI`,
			alert: "error  'HTTP' has no definition"
		},
		{
			id: 'sequence',
			summary: 'Match on grammar',
			body: 'Patterns over part-of-speech tags, not just words. This is how you catch a construction rather than a phrase.',
			yaml: `extends: sequence
message: |
  The infinitive '%[4]s' after 'be' requires 'to'.
  Did you mean '%[2]s %[3]s *to* %[4]s'?
tokens:
  - tag: MD
  - pattern: be
  - tag: JJ
  - tag: VB|VBN`,
			alert: "error  The infinitive 'use' after 'be' requires 'to'."
		},
		{
			id: 'spelling',
			summary: 'Spell-check with your words',
			body: 'Hunspell dictionaries, plus your own vocabulary. Suggestions are computed at alert time, so an editor can offer them.',
			yaml: `extends: spelling
message: "Did you really mean '%s'?"
level: error
action:
  name: suggest
  params: [spellings]
ignore:
  - vocab.txt`,
			alert: "error  Did you really mean 'recieve'?"
		},
		{
			id: 'readability',
			summary: 'Score the whole document',
			body: 'Five named metrics—Flesch-Kincaid, Gunning Fog, Coleman-Liau, SMOG, and Automated Readability—averaged across the ones you list, with a grade-level ceiling.',
			yaml: `extends: readability
message: "Grade level (%s) too high!"
level: warning
grade: 8
metrics:
  - Flesch-Kincaid
  - Gunning Fog`,
			alert: 'warning  Grade level (12.4) too high!'
		},
		{
			id: 'metric',
			summary: 'Write your own formula',
			body: 'Document-level counts—words, sentences, syllables, paragraphs—combined however you like, with a condition to test.',
			yaml: `extends: metric
message: 'Keep the grade level (%s) below 8.'
formula: |
  (0.39 * (words / sentences)) +
  (11.8 * (syllables / words)) - 15.59
condition: '> 8.0'`,
			alert: 'warning  Keep the grade level (9.1) below 8.'
		},
		{
			id: 'script',
			summary: 'Drop down to code',
			body: 'When a rule needs real logic, write it in Tengo. The script is compiled once and cloned per block, so it stays cheap.',
			yaml: `extends: script
message: 'Consider a new section heading here.'
link: https://tengolang.com
scope: raw
script: LongSection.tengo`,
			alert: 'suggestion  Consider a new section heading here.'
		}
	];

	let active = $state('existence');
	const current = $derived(points.find((p) => p.id === active)!);

	const actions = [
		{ name: 'replace', body: 'A fixed suggestion you already know—the default for substitutions.' },
		{
			name: 'suggest',
			body: 'Computed at alert time, like spelling candidates for a misspelling.'
		},
		{ name: 'remove', body: 'Delete the match outright.' },
		{
			name: 'edit',
			body: 'Transform the match: trim, truncate, split, or run a regular expression.'
		}
	];

	const description =
		'Vale rules are YAML files: twelve extension points, no plugin API, and no compile step. Write one in a text editor and share it as a package.';
</script>

<MetaTags
	title="Extensible by design — Vale"
	{description}
	canonical="https://vale.sh/features/extensible"
	openGraph={{
		url: 'https://vale.sh/features/extensible',
		title: 'Extensible by design',
		description
	}}
/>

<FeatureShell
	{feature}
	lede="Every style guide has a rule no linter shipped with. Vale's answer is that rules are just files—a few lines of YAML in a directory, with no plugin API to learn, nothing to compile, and no release to wait for. Twelve extension points cover the shapes those rules take."
	docs={{ href: 'https://docs.vale.sh/checks/existence', label: 'Extension point reference' }}
>
	<Section
		title="A rule is a file"
		lede="Styles are directories of YAML. Vale finds them through your configuration, and the rule's name in a report is just its path: directory, then filename."
	>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div
				class="overflow-x-auto rounded-2xl border border-border/60 bg-card p-5 font-mono text-[13px] leading-relaxed sm:p-6"
			>
				<div class="whitespace-pre text-muted-foreground">styles/</div>
				<div class="whitespace-pre text-muted-foreground">└── Brand/</div>
				<div class="whitespace-pre">
					<span class="text-muted-foreground">{'    ├── '}</span><span class="text-foreground/90"
						>Terms.yml</span
					>
				</div>
				<div class="whitespace-pre">
					<span class="text-muted-foreground">{'    ├── '}</span><span class="text-foreground/90"
						>Headings.yml</span
					>
				</div>
				<div class="whitespace-pre">
					<span class="text-muted-foreground">{'    └── '}</span><span class="text-foreground/90"
						>Contractions.yml</span
					>
				</div>
				<div class="mt-4 whitespace-pre text-muted-foreground/60">
					# Brand/Terms.yml is Brand.Terms
				</div>
			</div>

			<div
				class="overflow-x-auto rounded-2xl border border-border/60 bg-card p-5 font-mono text-[13px] leading-relaxed sm:p-6"
			>
				<div class="text-xs text-muted-foreground/70">.vale.ini</div>
				<div class="mt-3 whitespace-pre">
					<span class="text-muted-foreground">StylesPath</span> = styles
				</div>
				<div class="whitespace-pre">
					<span class="text-muted-foreground">MinAlertLevel</span> = suggestion
				</div>
				<div class="mt-3 whitespace-pre text-lime-600 dark:text-lime-400">[*.md]</div>
				<div class="whitespace-pre">
					<span class="text-muted-foreground">BasedOnStyles</span> = Vale, Brand
				</div>
				<div class="mt-3 whitespace-pre text-muted-foreground/60"># Turn one rule off here.</div>
				<div class="whitespace-pre">
					<span class="text-muted-foreground">Brand.Contractions</span> = NO
				</div>
			</div>
		</div>
	</Section>

	<Section
		title="Twelve extension points"
		lede="Each one takes the same base keys—message, level, scope, link—and adds the few that describe its own shape. Pick one to see a rule you could run today."
		wide
	>
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
			<div class="flex flex-row flex-wrap gap-1.5 lg:flex-col lg:flex-nowrap">
				{#each points as point}
					<button
						aria-pressed={active === point.id}
						onclick={() => (active = point.id)}
						class="rounded-lg px-3 py-2 text-left font-mono text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 {active ===
						point.id
							? 'bg-lime-500/15 font-medium text-lime-700 ring-1 ring-inset ring-lime-500/40 dark:text-lime-300'
							: 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}"
					>
						{point.id}
					</button>
				{/each}
			</div>

			<div class="flex min-w-0 flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6">
				<div>
					<h3 class="text-lg font-semibold text-foreground">{current.summary}</h3>
					<p class="mt-2 text-sm leading-relaxed text-muted-foreground">{current.body}</p>
				</div>

				<pre
					class="overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-4 font-mono text-[13px] leading-relaxed text-foreground/90">{current.yaml}</pre>

				<div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-[13px]">
					<span class="text-xs uppercase tracking-wider text-muted-foreground/70">Reports</span>
					<span class="text-foreground/80">{current.alert}</span>
				</div>
			</div>
		</div>
	</Section>

	<Section
		title="What the rules are built on"
		lede="The pieces a rule reaches for are not Vale's own inventions. Each is a project you can read, and each brings capabilities a hand-rolled matcher would not have."
	>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div class="rounded-xl border border-border/60 bg-card p-5">
				<h3 class="text-sm font-semibold text-foreground">
					<ExternalLink href="https://github.com/dlclark/regexp2">regexp2</ExternalLink>
				</h3>
				<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
					A backtracking engine, so patterns can use lookahead, lookbehind, and backreferences—all
					of which Go's standard <code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]"
						>regexp</code
					> rejects outright.
				</p>
			</div>
			<div class="rounded-xl border border-border/60 bg-card p-5">
				<h3 class="text-sm font-semibold text-foreground">
					<ExternalLink href="https://github.com/jdkato/prose">prose</ExternalLink>
				</h3>
				<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
					Sentence segmentation and part-of-speech tagging. It is what lets a
					<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">sequence</code> rule match
					on grammar rather than on words.
				</p>
			</div>
			<div class="rounded-xl border border-border/60 bg-card p-5">
				<h3 class="text-sm font-semibold text-foreground">
					<ExternalLink href="https://hunspell.github.io/">Hunspell</ExternalLink>
				</h3>
				<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
					The dictionary format behind LibreOffice and Firefox, so any language with a Hunspell
					dictionary already has a Vale spell-checker.
				</p>
			</div>
			<div class="rounded-xl border border-border/60 bg-card p-5">
				<h3 class="text-sm font-semibold text-foreground">
					<ExternalLink href="https://github.com/d5/tengo">Tengo</ExternalLink>
				</h3>
				<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
					A small embedded language for the rules that need real logic—compiled once when the rule
					loads, then cloned per block.
				</p>
			</div>
		</div>
	</Section>

	<Section
		title="Rules can carry their fix"
		lede="An alert that only says what's wrong makes the reader do the work twice. Attach an action and the fix travels with the alert—into the CLI, and into any editor speaking the language server protocol."
	>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			{#each actions as action}
				<div class="rounded-xl border border-border/60 bg-card p-5">
					<code class="font-mono text-sm font-semibold text-lime-600 dark:text-lime-400"
						>{action.name}</code
					>
					<p class="mt-2 text-sm leading-relaxed text-muted-foreground">{action.body}</p>
				</div>
			{/each}
		</div>
	</Section>

	<Section
		title="Write it, then hand it around"
		lede="A style is a directory, so sharing one is packaging a directory. Vale fetches packages by name, resolves what they depend on, and keeps them out of your repository."
	>
		<div
			class="overflow-x-auto rounded-2xl border border-border/60 bg-card p-5 font-mono text-[13px] leading-relaxed sm:p-6"
		>
			<div class="whitespace-pre">
				<span class="text-muted-foreground">Packages</span> = Microsoft, Google, write-good
			</div>
			<div class="mt-4 whitespace-pre">
				<span class="text-lime-600 dark:text-lime-400">$</span> vale sync
			</div>
			<div class="mt-3 whitespace-pre text-muted-foreground/60">
				# Fetched into StylesPath. Add it to .gitignore.
			</div>
		</div>

		<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
			<a
				href="/library"
				class="group flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-lime-500/40"
			>
				<h3 class="font-semibold text-foreground">Package library</h3>
				<p class="text-sm leading-relaxed text-muted-foreground">
					Browse what the community has already published, from full style guides to single-purpose
					vocabularies.
				</p>
				<span
					class="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-lime-600 dark:text-lime-400"
				>
					Browse
					<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
				</span>
			</a>

			<a
				href="/generator"
				class="group flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-lime-500/40"
			>
				<h3 class="font-semibold text-foreground">Config generator</h3>
				<p class="text-sm leading-relaxed text-muted-foreground">
					Answer a few questions and get a working
					<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">.vale.ini</code> to start
					from.
				</p>
				<span
					class="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-lime-600 dark:text-lime-400"
				>
					Generate
					<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
				</span>
			</a>
		</div>
	</Section>
</FeatureShell>
