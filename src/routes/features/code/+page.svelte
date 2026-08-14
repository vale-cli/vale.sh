<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import FeatureShell from '$lib/components/features/FeatureShell.svelte';
	import Section from '$lib/components/features/Section.svelte';
	import ExternalLink from '$lib/components/features/ExternalLink.svelte';
	import { features } from '$lib/features';

	const feature = features.find((f) => f.slug === 'code')!;

	/*
		The language picker. `prose: true` marks the lines a rule actually sees —
		which is the argument: the boundary is drawn by the grammar, not by
		looking for a `#` or a `//`.
	*/
	type Line = { v: string; prose?: boolean };

	const languages: {
		id: string;
		label: string;
		file: string;
		query: string;
		note: string;
		lines: Line[];
	}[] = [
		{
			id: 'go',
			label: 'Go',
			file: 'store.go',
			query: '(comment) @comment',
			note: 'One query covers line and block comments alike—the grammar already knows the difference.',
			lines: [
				{ v: 'package store' },
				{ v: '' },
				{ v: '// Get returns the record for id.', prose: true },
				{ v: '//', prose: true },
				{ v: '// It can utilize the cache when possible.', prose: true },
				{ v: 'func Get(id string) (*Record, error) {' },
				{ v: '\tkey := "// not a comment"' },
				{ v: '\treturn s.lookup(key + id)' },
				{ v: '}' }
			]
		},
		{
			id: 'py',
			label: 'Python',
			file: 'store.py',
			query: `((function_definition
  body: (block . (expression_statement (string) @docstring)))
 (#offset! @docstring 0 3 0 -3))`,
			note: 'Docstrings are string literals, not comments. Only a grammar can tell one apart from a string that happens to sit at the top of a function.',
			lines: [
				{ v: 'def get(id):' },
				{ v: '    """Return the record for id.', prose: true },
				{ v: '', prose: true },
				{ v: '    It can utilize the cache when possible.', prose: true },
				{ v: '    """', prose: true },
				{ v: '    marker = """not a docstring"""' },
				{ v: '    return lookup(marker + id)' }
			]
		},
		{
			id: 'rs',
			label: 'Rust',
			file: 'store.rs',
			query: '(line_comment)+ @comment',
			note: "Rust's grammar calls `///` and `//!` line comments, so doc comments come along without a special case. The trailing `+` groups a run of adjacent comments into one block, so a rule sees the whole passage rather than each line alone.",
			lines: [
				{ v: '/// Returns the record for `id`.', prose: true },
				{ v: '///', prose: true },
				{ v: '/// It can utilize the cache when possible.', prose: true },
				{ v: 'pub fn get(id: &str) -> Option<Record> {' },
				{ v: '    let key = "/// not a comment";' },
				{ v: '    lookup(&format!("{key}{id}"))' },
				{ v: '}' }
			]
		},
		{
			id: 'js',
			label: 'JavaScript',
			file: 'store.js',
			query: '(comment) @comment',
			note: 'JSDoc blocks are comments too. The leading asterisks are stripped before the body reaches a rule.',
			lines: [
				{ v: '/**', prose: true },
				{ v: ' * Returns the record for `id`.', prose: true },
				{ v: ' *', prose: true },
				{ v: ' * It can utilize the cache when possible.', prose: true },
				{ v: ' */', prose: true },
				{ v: 'export function get(id) {' },
				{ v: '  const key = "/* not a comment */";' },
				{ v: '  return lookup(key + id);' },
				{ v: '}' }
			]
		}
	];

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

	/*
		An OpenAPI document, with the fields a reader actually reads marked. The
		expressions below are the ones Vale's own test fixture uses, so the
		example is a working view rather than an illustration of one.
	*/
	const spec: Line[] = [
		{ v: 'openapi: 3.1.0' },
		{ v: 'info:' },
		{ v: '  title: Pet Store API', prose: true },
		{ v: '  version: 1.0.0' },
		{ v: '  description: |-' },
		{ v: '    Manage pets, orders, and users.', prose: true },
		{ v: '' },
		{ v: '    See [the guide](/guide) to get started.', prose: true },
		{ v: 'paths:' },
		{ v: '  /pet:' },
		{ v: '    post:' },
		{ v: '      summary: Add a new pet to the store', prose: true },
		{ v: '      operationId: addPet' }
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

	// Not "never a regex": Vale's own rules are regex -- `existence` takes
	// literal tokens or regular expressions, and /features/extensible documents
	// that and links to regexp2. The claim that holds is about knowing where a
	// comment ends, which a grammar does and a pattern match over raw source
	// does not.
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
		description
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
		<div class="rounded-2xl border border-border/60 bg-card">
			<div
				role="tablist"
				aria-label="Language"
				class="flex gap-1 overflow-x-auto border-b border-border/60 px-3 py-2"
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

			<div class="border-t border-border/60 px-5 py-4 sm:px-6">
				<div class="text-xs uppercase tracking-wider text-muted-foreground/70">Query</div>
				<pre
					class="mt-2 overflow-x-auto font-mono text-[13px] leading-relaxed text-foreground/90">{current.query}</pre>
				<p class="mt-3 text-sm leading-relaxed text-muted-foreground">{current.note}</p>
			</div>
		</div>

		<p class="mt-6 text-sm leading-relaxed text-muted-foreground">
			Highlighted lines are handed to your rules. Everything dimmed is code—including the string
			literals that contain comment delimiters, which is exactly the case a pattern-matching
			extractor gets wrong.
		</p>

		<p class="mt-4 text-sm leading-relaxed text-muted-foreground">
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
			class="overflow-x-auto rounded-2xl border border-border/60 bg-card p-5 font-mono text-[13px] leading-relaxed sm:p-6"
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
				<li class="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-5">
					<span
						class="flex h-7 w-7 items-center justify-center rounded-full bg-lime-500/10 font-mono text-xs font-semibold text-lime-600 dark:text-lime-400"
						>{step.n}</span
					>
					<h3 class="text-sm font-semibold text-foreground">{step.title}</h3>
					<p class="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
				</li>
			{/each}
		</ol>

		<p class="mt-6 text-sm leading-relaxed text-muted-foreground">
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
			<div class="flex flex-col rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
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
				<p class="mt-4 text-sm leading-relaxed text-muted-foreground">
					A paragraph followed by a two-item list—not one seven-item list, which is what the
					decoration would otherwise produce.
				</p>
			</div>
		</div>

		<div class="mt-6 rounded-xl border border-border/60 bg-muted/30 p-5">
			<p class="text-sm leading-relaxed text-muted-foreground">
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
		title="An API spec is documentation"
		lede="Every summary and description in an OpenAPI document is published prose—it becomes your API reference. Vale reads structured data through a second engine, so those fields can be linted by the same rules as the rest of your docs."
	>
		<div class="rounded-2xl border border-border/60 bg-card">
			<div class="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed sm:p-6">
				<div class="mb-3 text-xs text-muted-foreground/70">openapi.yaml</div>
				{#each spec as line}
					<div
						class="-mx-2 whitespace-pre rounded px-2 {line.prose
							? 'bg-lime-500/10 text-foreground/90'
							: 'text-muted-foreground/40'}"
					>
						{line.v || ' '}
					</div>
				{/each}
			</div>
			<div class="border-t border-border/60 px-5 py-4 sm:px-6">
				<p class="text-sm leading-relaxed text-muted-foreground">
					Highlighted lines are linted. Version numbers, operation IDs, and path keys are structure,
					and a rule never sees them.
				</p>
			</div>
		</div>

		<div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="rounded-2xl border border-border/60 bg-card p-6">
				<h3 class="text-sm font-semibold text-foreground">Name the fields</h3>
				<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
					A view is a list of <ExternalLink href="https://github.com/TomWright/dasel"
						>dasel</ExternalLink
					> selectors. Give one a name and it becomes a scope you can target.
				</p>
				<div
					class="mt-4 overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-4 font-mono text-[13px] leading-relaxed"
				>
					<div class="whitespace-pre text-muted-foreground/60">
						# styles/config/views/OpenAPI.yml
					</div>
					<div class="mt-2 whitespace-pre">
						<span class="text-muted-foreground">engine:</span> dasel
					</div>
					<div class="whitespace-pre"><span class="text-muted-foreground">scopes:</span></div>
					<div class="whitespace-pre">
						<span class="text-muted-foreground/60">{'  - '}</span><span
							class="text-muted-foreground">name:</span
						> title
					</div>
					<div class="whitespace-pre">
						<span class="text-muted-foreground/60">{'    '}</span><span
							class="text-muted-foreground">expr:</span
						>
						<span class="text-lime-600 dark:text-lime-400">info.title</span>
					</div>
					<div class="mt-2 whitespace-pre">
						<span class="text-muted-foreground/60">{'  - '}</span><span
							class="text-muted-foreground">expr:</span
						>
						<span class="text-lime-600 dark:text-lime-400">info.description</span>
					</div>
					<div class="whitespace-pre">
						<span class="text-muted-foreground/60">{'    '}</span><span
							class="text-muted-foreground">type:</span
						> md
					</div>
					<div class="mt-2 whitespace-pre">
						<span class="text-muted-foreground/60">{'  - '}</span><span
							class="text-muted-foreground">expr:</span
						>
						<span class="text-lime-600 dark:text-lime-400"
							>{'paths.all().all().property(summary,description)'}</span
						>
					</div>
				</div>
			</div>

			<div class="flex flex-col gap-4">
				<div class="rounded-2xl border border-border/60 bg-card p-6">
					<h3 class="text-sm font-semibold text-foreground">Point it at the file</h3>
					<div
						class="mt-4 overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-4 font-mono text-[13px] leading-relaxed"
					>
						<div class="whitespace-pre text-lime-600 dark:text-lime-400">[*.{'{yaml,json}'}]</div>
						<div class="whitespace-pre">
							<span class="text-muted-foreground">BasedOnStyles</span> = Vale, Microsoft
						</div>
						<div class="whitespace-pre">
							<span class="text-muted-foreground">View</span> = OpenAPI
						</div>
					</div>
				</div>

				<div class="rounded-2xl border border-border/60 bg-card p-6">
					<h3 class="text-sm font-semibold text-foreground">
						<code class="font-mono text-sm">type: md</code> matters
					</h3>
					<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
						A description written in Markdown is parsed as Markdown, so the link target and the code
						span inside it are skipped exactly as they would be in a documentation page. Any markup
						format works—<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]"
							>adoc</code
						>,
						<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">rst</code>,
						<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">html</code>, or
						<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">org</code>.
					</p>
				</div>
			</div>
		</div>

		<p class="mt-6 text-sm leading-relaxed text-muted-foreground">
			The same approach covers anything with prose in it: a Kubernetes chart's descriptions, an
			Ansible playbook's task names, a GitHub Actions workflow's step names. JSON, YAML, and TOML
			are all handled by the one engine.
		</p>
	</Section>

	<Section
		title="Bring your own query"
		lede="Views work the other way too. Swap the engine for tree-sitter and the same mechanism replaces the built-in comment query, so you can lint whatever part of a source file you consider prose."
	>
		<div class="grid grid-cols-1 gap-4">
			<div class="rounded-2xl border border-border/60 bg-card p-6">
				<h3 class="text-sm font-semibold text-foreground">Lint the string literals</h3>
				<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
					User-facing strings are prose your readers see more often than your docs.
				</p>
				<div
					class="mt-4 overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-4 font-mono text-[13px] leading-relaxed"
				>
					<div class="whitespace-pre text-muted-foreground/60">
						# styles/config/views/Strings.yml
					</div>
					<div class="mt-2 whitespace-pre">
						<span class="text-muted-foreground">engine:</span> tree-sitter
					</div>
					<div class="whitespace-pre"><span class="text-muted-foreground">scopes:</span></div>
					<div class="whitespace-pre">
						<span class="text-muted-foreground/60">{'  - '}</span><span
							class="text-muted-foreground">expr:</span
						>
						<span class="text-lime-600 dark:text-lime-400">(string_literal)+ @string</span>
					</div>
					<div class="whitespace-pre">
						<span class="text-muted-foreground/60">{'    '}</span><span
							class="text-muted-foreground">name:</span
						> java
					</div>
				</div>
			</div>
		</div>
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

		<p class="mt-8 text-sm leading-relaxed text-muted-foreground">
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
