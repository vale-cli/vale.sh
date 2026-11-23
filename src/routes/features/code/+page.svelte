<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import FeatureShell from '$lib/components/features/FeatureShell.svelte';
	import Section from '$lib/components/features/Section.svelte';
	import ExternalLink from '$lib/components/features/ExternalLink.svelte';
	import { features } from '$lib/features';
	import { languages } from '$lib/data/code-queries';
	import CodeBlock from '$lib/components/CodeBlock.svelte';

	let { data } = $props();

	const feature = features.find((f) => f.slug === 'code')!;

	// The language picker lives in $lib/data/code-queries, and the load
	// function highlights each query.

	let active = $state('go');
	const current = $derived(languages.find((l) => l.id === active)!);

	/*
		The decoration example, as data rather than markup. Svelte trims the
		leading and trailing whitespace of a text node, so ` * ` written straight
		into a <span> reaches the DOM as `*` — and `whitespace-pre` cannot bring
		back a space that was never emitted. Every column here is an expression.
	*/
	const decorated: { deco: string; text?: string }[] = [
		{ deco: '/**' },
		{ deco: ' * ', text: 'Reads the record and returns it.' },
		{ deco: ' *' },
		{ deco: ' * ', text: 'Pass `refresh` to bypass the cache:' },
		{ deco: ' *' },
		{ deco: ' * * ', text: '`refresh: true` re-reads from disk.' },
		{ deco: ' * * ', text: '`refresh: false` uses the cache.' },
		{ deco: ' */' }
	];

	const undecorated = [
		'Reads the record and returns it.',
		'',
		'Pass `refresh` to bypass the cache:',
		'',
		'* `refresh: true` re-reads from disk.',
		'* `refresh: false` uses the cache.'
	];

	const grammars = [
		'Go',
		'Rust',
		'Python',
		'Ruby',
		'JavaScript',
		'TypeScript',
		'TSX',
		'Java',
		'C',
		'C++',
		'Julia',
		'Protobuf',
		'CSS',
		'YAML'
	];

	const scanned = [
		'C#',
		'Haskell',
		'LESS',
		'Lua',
		'Perl',
		'PHP',
		'PowerShell',
		'R',
		'Sass',
		'Scala',
		'Swift'
	];

	// Not "never a regex": Vale's own rules are regex. The claim that holds is
	// about knowing where a comment ends, which a grammar does and a pattern
	// match over raw source does not.
	const description =
		'Vale extracts comments and docstrings with tree-sitter grammars, so it knows where each one ends, and can lint the Markdown inside them as if it were a standalone file.';
</script>

<MetaTags
	title="Code-aware linting — Vale"
	{description}
	canonical="https://vale.sh/features/code"
	openGraph={{
		url: 'https://vale.sh/features/code',
		title: 'Code-aware linting',
		description,
		images: [
			{
				url: 'https://vale.sh/media/og/code.png',
				width: 1200,
				height: 630,
				alt: 'Code-aware linting'
			}
		]
	}}
/>

<FeatureShell
	{feature}
	lede="Most of what a developer reads about your software is written inside the software. Vale treats comments and docstrings as first-class prose: it parses the source with a real grammar, pulls the prose out, lints it, and reports every alert at its line and column in the original file."
	docs={{ href: 'https://docs.vale.sh/formats/code', label: 'Source code reference' }}
>
	<Section
		title="A grammar draws the boundary"
		lede="Vale parses the file with tree-sitter and runs a query against the parse tree. A comment is whatever the language's own grammar calls a comment—which is why a delimiter inside a string literal stays where it belongs."
	>
		<div class="rounded-2xl border border-border bg-card">
			<div
				role="tablist"
				aria-label="Language"
				class="flex gap-1 overflow-x-auto border-b border-border px-3 py-2"
			>
				{#each languages as language}
					<button
						role="tab"
						aria-selected={active === language.id}
						onclick={() => (active = language.id)}
						class="whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 {active ===
						language.id
							? 'bg-lime-500/10 font-medium text-foreground'
							: 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}"
					>
						{language.label}
					</button>
				{/each}
			</div>

			<div class="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed sm:p-6">
				<div class="mb-3 text-xs text-muted-foreground/70">{current.file}</div>
				{#each current.lines as line}
					<div
						class="-mx-2 whitespace-pre rounded px-2 {line.prose
							? 'bg-lime-500/10 text-foreground/90'
							: 'text-muted-foreground/40'}"
					>
						{line.v || ' '}
					</div>
				{/each}
			</div>

			<div class="border-t border-border px-5 py-4 sm:px-6">
				<div class="text-xs uppercase tracking-wider text-muted-foreground/70">Query</div>
				<CodeBlock html={data.queryHtml[current.id]} bare class="mt-2" />
				<p class="mt-3 text-sm leading-relaxed text-foreground/85">{current.note}</p>
			</div>
		</div>

		<p class="mt-6 text-sm leading-relaxed text-foreground/85">
			Highlighted lines are handed to your rules. Everything dimmed is code—including the string
			literals that contain comment delimiters, which is exactly the case a pattern-matching
			extractor gets wrong.
		</p>

		<p class="mt-4 text-sm leading-relaxed text-foreground/85">
			The parsing is <ExternalLink href="https://tree-sitter.github.io/tree-sitter/"
				>tree-sitter</ExternalLink
			>, through the
			<ExternalLink href="https://github.com/smacker/go-tree-sitter">Go bindings</ExternalLink>,
			with one grammar per language and a
			<ExternalLink
				href="https://tree-sitter.github.io/tree-sitter/using-parsers/queries/index.html"
				>query</ExternalLink
			> naming the nodes to collect. It is the same machinery your editor uses to highlight the file.
		</p>
	</Section>

	<Section
		title="Markdown, inside a comment"
		lede="Doc comments are rarely plain text. Associate a markup format with a file extension and Vale parses the comment body with that format's parser, so everything on the markup page applies inside your source files."
	>
		<div
			class="overflow-x-auto rounded-2xl border border-border bg-card p-5 font-mono text-[13px] leading-relaxed sm:p-6"
		>
			<div class="text-xs text-muted-foreground/70">.vale.ini</div>
			<div class="mt-3 whitespace-pre text-lime-600 dark:text-lime-400">[formats]</div>
			<div class="whitespace-pre text-muted-foreground/60"># Rust source, Markdown comments</div>
			<div class="whitespace-pre"><span class="text-muted-foreground">rs</span> = md</div>
			<div class="mt-3 whitespace-pre text-lime-600 dark:text-lime-400">[*.{'{rs,md}'}]</div>
			<div class="whitespace-pre">
				<span class="text-muted-foreground">BasedOnStyles</span> = Vale, Microsoft
			</div>
		</div>

		<!--
			Built in markup rather than dropped in as an SVG: an <img> reads the OS
			color scheme, not the site's own theme toggle, so an inline diagram is
			the only kind that follows the reader's choice.
		-->
		<ol class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{#each [{ n: 1, title: 'Find', body: 'tree-sitter locates every comment in the source file.' }, { n: 2, title: 'Undecorate', body: 'Per-line markers come off, and the body is dedented.' }, { n: 3, title: 'Parse', body: "The remaining text goes through the markup format's own parser." }, { n: 4, title: 'Map back', body: 'Each alert is reported at its position in the source file.' }] as step}
				<li class="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
					<span
						class="flex h-7 w-7 items-center justify-center rounded-full bg-lime-500/10 font-mono text-xs font-medium text-lime-600 dark:text-lime-400"
						>{step.n}</span
					>
					<h3 class="text-sm font-medium text-foreground">{step.title}</h3>
					<p class="text-sm leading-relaxed text-foreground/85">{step.body}</p>
				</li>
			{/each}
		</ol>

		<p class="mt-6 text-sm leading-relaxed text-foreground/85">
			Once a format is associated, its features come with it—including
			<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">TokenIgnores</code> and
			<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">BlockIgnores</code>, which
			are otherwise unavailable in source code because they work by wrapping a match in the format's
			code delimiter.
		</p>
	</Section>

	<Section
		title="Decoration is not markup"
		lede="A C-style block comment decorates every line with an asterisk. Markdown reads that asterisk as a list marker. Vale removes the decoration first, so a comment parses as what its author meant."
	>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="flex flex-col rounded-2xl border border-border bg-card p-5 sm:p-6">
				<div class="text-xs uppercase tracking-wider text-muted-foreground/70">Source</div>
				<div class="mt-3 overflow-x-auto font-mono text-[13px] leading-relaxed">
					{#each decorated as row}
						<div class="whitespace-pre">
							<span class="text-muted-foreground/50">{row.deco}</span><span
								class="text-foreground/90">{row.text ?? ''}</span
							>
						</div>
					{/each}
				</div>
			</div>

			<div class="flex flex-col rounded-2xl border border-lime-500/30 bg-lime-500/5 p-5 sm:p-6">
				<div class="text-xs uppercase tracking-wider text-muted-foreground/70">
					What the parser gets
				</div>
				<div class="mt-3 overflow-x-auto font-mono text-[13px] leading-relaxed text-foreground/90">
					{#each undecorated as line}
						<div class="whitespace-pre">{line || ' '}</div>
					{/each}
				</div>
				<p class="mt-4 text-sm leading-relaxed text-foreground/85">
					A paragraph followed by a two-item list—not one seven-item list, which is what the
					decoration would otherwise produce.
				</p>
			</div>
		</div>

		<div class="mt-6 rounded-xl border border-border bg-muted p-5">
			<p class="text-sm leading-relaxed text-foreground/85">
				An asterisk counts as decoration only when whitespace or the end of the line follows it, so
				a line that starts <code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]"
					>*emphasis*</code
				>
				keeps its markup. Relative indentation survives too, which is what makes an indented fenced block
				inside a comment still read as code.
			</p>
			<p class="mt-3 text-xs text-muted-foreground/70">Requires Vale v3.17.0 or later.</p>
		</div>
	</Section>

	<Section
		title="Beyond comments"
		lede="Comments are where Vale looks by default. A View replaces that with a query of your own, so the string literals a user reads, or the docstrings a grammar can name, are prose too."
	>
		<a
			href="/features/views"
			class="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-lime-500/50 sm:flex-row sm:items-center sm:justify-between"
		>
			<span>
				<span class="block text-lg font-medium text-foreground">Views</span>
				<span class="mt-1 block text-sm leading-relaxed text-foreground/85"
					>Prose inside files that aren't prose: API specs, notebooks, commit messages, and your own
					tree-sitter queries.</span
				>
			</span>
			<span
				class="shrink-0 text-sm font-medium text-foreground underline decoration-lime-500/40 underline-offset-4 group-hover:text-lime-600 dark:group-hover:text-lime-400"
				>Read about Views →</span
			>
		</a>
	</Section>

	<Section title="Languages" lede="Fourteen have a tree-sitter grammar built in." wide>
		<div class="flex flex-wrap gap-2">
			{#each grammars as name}
				<span
					class="inline-flex rounded-md bg-lime-500/10 px-2.5 py-1 text-sm font-medium text-lime-700 ring-1 ring-inset ring-lime-500/30 dark:text-lime-300"
				>
					{name}
				</span>
			{/each}
		</div>

		<p class="mt-8 text-sm leading-relaxed text-foreground/85">
			The rest are handled by delimiter scanning—still comment-aware, but without a parse tree
			behind it:
		</p>
		<div class="mt-4 flex flex-wrap gap-2">
			{#each scanned as name}
				<span
					class="inline-flex rounded-md bg-muted px-2.5 py-1 text-sm font-medium text-muted-foreground ring-1 ring-inset ring-border"
				>
					{name}
				</span>
			{/each}
		</div>
	</Section>
</FeatureShell>
