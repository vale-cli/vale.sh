<script lang="ts">
	import InlineCode from '$lib/components/features/InlineCode.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import FeatureShell from '$lib/components/features/FeatureShell.svelte';
	import Section from '$lib/components/features/Section.svelte';
	import ExternalLink from '$lib/components/features/ExternalLink.svelte';
	import { features } from '$lib/features';
	import { ruleExamples } from '$lib/data/rule-examples';
	import CodeBlock from '$lib/components/CodeBlock.svelte';

	let { data } = $props();

	const feature = features.find((f) => f.slug === 'extensible')!;

	// The gallery is the argument for this page; its rules live in
	// $lib/data/rule-examples, and the load function highlights them.
	const points = ruleExamples;

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

				<CodeBlock html={data.yamlHtml[current.id]} code={current.yaml} />

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
					of which Go's standard <InlineCode>regexp</InlineCode> rejects outright.
				</p>
			</div>
			<div class="rounded-xl border border-border/60 bg-card p-5">
				<h3 class="text-sm font-semibold text-foreground">
					<ExternalLink href="https://github.com/jdkato/prose">prose</ExternalLink>
				</h3>
				<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
					Sentence segmentation and part-of-speech tagging. It is what lets a
					<InlineCode>sequence</InlineCode> rule match on grammar rather than on words.
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
					<InlineCode>.vale.ini</InlineCode> to start from.
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
