<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import FeatureShell from '$lib/components/features/FeatureShell.svelte';
	import Section from '$lib/components/features/Section.svelte';
	import ExternalLink from '$lib/components/features/ExternalLink.svelte';
	import InlineCode from '$lib/components/features/InlineCode.svelte';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import { features } from '$lib/features';

	let { data } = $props();

	const feature = features.find((f) => f.slug === 'views')!;

	/*
		Three engines, one idea: a list of queries that say where the prose is.
		The file kinds named on each card are the ones the docs show a View
		for, not a catalogue of what might work.
	*/
	const engines = [
		{
			id: 'dasel',
			name: 'Data',
			engine: 'dasel',
			href: 'https://github.com/TomWright/dasel',
			reads: 'JSON, YAML, and TOML, by extension.',
			query: 'A selector over the parsed document. Every string it lands on is one value.',
			kinds: ['OpenAPI', 'Jupyter', 'Helm values', 'Actions workflows']
		},
		{
			id: 'textfsm',
			name: 'Text',
			engine: 'TextFSM',
			href: 'https://github.com/google/textfsm/wiki/TextFSM',
			reads: 'Any plain-text file with a convention.',
			query: 'A template of named values and a state machine of regular expressions.',
			kinds: ['Commit messages', 'Transcripts', 'Changelogs', 'Logs']
		},
		{
			id: 'tree-sitter',
			name: 'Code',
			engine: 'tree-sitter',
			href: 'https://tree-sitter.github.io/tree-sitter/',
			reads: 'The nineteen languages Vale has a grammar for.',
			query: 'A query against the syntax tree, replacing the built-in comment query.',
			kinds: ['Docstrings', 'String literals', 'Comments']
		}
	];

	/*
		The OpenAPI document, with the fields a reader actually reads marked.
		The selectors in the View beside it are the ones Vale's own test
		fixture uses, so the example is a working View rather than a picture
		of one.
	*/
	type Line = { v: string; prose?: boolean; scope?: string };
	const spec: Line[] = [
		{ v: 'openapi: 3.1.0' },
		{ v: 'info:' },
		{ v: '  title: Pet Store API', prose: true, scope: 'title' },
		{ v: '  version: 1.0.0' },
		{ v: '  description: |-' },
		{ v: '    Manage pets, orders, and users.', prose: true, scope: 'description' },
		{ v: '' },
		{ v: '    See [the guide](/guide) to get started.', prose: true, scope: 'description' },
		{ v: 'paths:' },
		{ v: '  /pet:' },
		{ v: '    post:' },
		{ v: '      description: Add a new pet to the store', prose: true, scope: 'description' },
		{ v: '      operationId: addPet' }
	];

	// The commit message from the TextFSM guide, one scope per part.
	const commit: Line[] = [
		{ v: 'fix: report the shortfall at the scope that fell short.', prose: true, scope: 'subject' },
		{ v: '' },
		{
			v: 'Zero matches leave no occurence to point at, but the scope has a',
			prose: true,
			scope: 'body'
		},
		{ v: 'position of its own.', prose: true, scope: 'body' },
		{ v: '' },
		{ v: 'Signed-off-by: Joseph Kato <j@example.com>', prose: true, scope: 'trailer' },
		{ v: '# Please enter the commit message for your changes.' }
	];

	const transcript: Line[] = [
		{ v: 'user: Summarize the change in one line.' },
		{
			v: 'assistant: The linter now reports where a scope fell short.',
			prose: true,
			scope: 'assistant'
		},
		{
			v: "It's worth noting that this only affects occurence rules.",
			prose: true,
			scope: 'assistant'
		},
		{ v: "user: Thanks, that's clear enuf." }
	];

	const python: Line[] = [
		{ v: 'def hello(name: str) -> str:' },
		{ v: '    """Greet someone by name."""', prose: true, scope: 'docstring' },
		{ v: '    return f"Hello, {name}!"' }
	];

	const description =
		'A Vale View names where the prose is in a file that isn’t a document—an OpenAPI description, a notebook cell, a commit body, a docstring—so it can be linted, and a rule can target any one part by name.';
</script>

<MetaTags
	title="Views — Vale"
	{description}
	canonical="https://vale.sh/features/views"
	openGraph={{
		url: 'https://vale.sh/features/views',
		title: 'Views',
		description,
		images: [{ url: 'https://vale.sh/media/og/views.png', width: 1200, height: 630, alt: 'Views' }]
	}}
/>

<!-- A file with the linted lines tinted and, where a scope names them, labeled. -->
{#snippet file(name: string, lines: Line[])}
	<div class="overflow-hidden rounded-xl border border-border bg-card">
		<div
			class="border-b border-border bg-muted px-4 py-2 font-mono text-[11px] text-muted-foreground"
		>
			{name}
		</div>
		<div class="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed sm:p-5">
			{#each lines as line}
				<div
					class="-mx-2 flex items-baseline justify-between gap-4 whitespace-pre rounded px-2 {line.prose
						? 'bg-lime-500/10 text-foreground'
						: 'text-muted-foreground/50'}"
				>
					<span>{line.v || ' '}</span>
					{#if line.scope}
						<span
							class="shrink-0 font-sans text-[10px] uppercase tracking-wider text-lime-600 dark:text-lime-400"
							>{line.scope}</span
						>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/snippet}

{#snippet code(title: string, html: string)}
	<div class="overflow-hidden rounded-xl border border-border bg-card">
		<div
			class="border-b border-border bg-muted px-4 py-2 font-mono text-[11px] text-muted-foreground"
		>
			{title}
		</div>
		<CodeBlock {html} bare class="p-4 sm:p-5" />
	</div>
{/snippet}

<FeatureShell
	{feature}
	lede="A markup file is a document, and Vale parses it into the blocks its rules see. A data file, a source file, or a plain-text file with a convention has prose in it too—in the descriptions of an API specification, the docstrings of a module, the body of a commit message—but nothing marks where. A View says where: a list of queries that pull named pieces out of the file, so Vale lints those and passes over the rest."
	docs={{ href: 'https://docs.vale.sh/topics/views', label: 'Views reference' }}
>
	<Section
		title="Three engines, one idea"
		lede="A View is a YAML file in your styles directory. It names an engine and a list of scopes, each a query the engine evaluates. What a query finds becomes a block with the scope's name, placed at the line and column it came from."
		wide
	>
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
			{#each engines as engine}
				<div class="flex flex-col rounded-2xl border border-border bg-card p-6">
					<div class="flex items-baseline justify-between gap-3">
						<h3 class="text-lg font-medium text-foreground">{engine.name}</h3>
						<ExternalLink href={engine.href}>{engine.engine}</ExternalLink>
					</div>
					<p class="mt-3 text-sm leading-relaxed text-foreground/85">{engine.reads}</p>
					<p class="mt-2 text-sm leading-relaxed text-foreground/85">{engine.query}</p>
					<ul class="mt-5 flex flex-wrap gap-1.5">
						{#each engine.kinds as kind}
							<li
								class="rounded-md border border-border bg-muted px-2 py-1 text-xs text-muted-foreground"
							>
								{kind}
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>

		<p class="mt-6 text-sm leading-relaxed text-foreground/85">
			The <InlineCode>View</InlineCode> key names a View under a section of your config, so the files
			it applies to are whichever that section matches. A name that isn't there is an error when the
			configuration loads, and a query that fails is an error that points at the section.
		</p>
	</Section>

	<Section
		title="An API spec is documentation"
		lede="Every description in an OpenAPI document is published prose—it becomes your API reference. Two selectors reach all of them, and a description written in Markdown is parsed as Markdown, so the link target inside it is skipped as it would be on a page."
	>
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			{@render file('openapi.yaml', spec)}
			<div class="flex flex-col gap-4">
				{@render code('config/views/OpenAPI.yml', data.html.openapiView)}
				{@render code('.vale.ini', data.html.openapiIni)}
			</div>
		</div>

		<p class="mt-6 text-sm leading-relaxed text-foreground/85">
			Tinted lines are linted. Version numbers, operation IDs, and path keys are structure, and a
			rule never sees them. A selector may land on one string or many; every string it selects is a
			value, and anything that isn't a string is dropped.
		</p>
	</Section>

	<Section
		title="A notebook is a document"
		lede="A Jupyter notebook keeps each Markdown cell's source as a list of lines. A scope's join puts a list back together, so the cell is one value, placed where its first line is."
	>
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			{@render code('config/views/Notebook.yml', data.html.notebookView)}
			{@render code('.vale.ini', data.html.notebookIni)}
		</div>
	</Section>

	<Section
		title="A commit message has three parts"
		lede="The subject, the body, and the trailers each deserve rules of their own. A TextFSM template declares the values to capture and a state machine that fills them, line by line, in the same regular-expression dialect every rule uses."
	>
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
			<div class="flex flex-col gap-4">
				{@render file('COMMIT_EDITMSG', commit)}
				{@render code('.vale.ini', data.html.commitIni)}
			</div>
			{@render code('config/views/Commit.yml', data.html.commitView)}
		</div>

		<p class="mt-6 text-sm leading-relaxed text-foreground/85">
			Reading begins in <InlineCode>Start</InlineCode>: the first line is the subject, and reading
			moves to <InlineCode>Body</InlineCode>. There, each line is tried against the rules in order.
			A line starting with <InlineCode>#</InlineCode> is Git's own commentary and is read past; a line
			shaped like <InlineCode>Word: text</InlineCode> is a trailer; anything else is body. Point a <InlineCode
				>commit-msg</InlineCode
			> hook at the file and the message is checked before the commit lands.
		</p>
	</Section>

	<Section
		title="A rule can aim at one part"
		lede="A scope's name is how a rule reaches what the query found. It's appended to the scope of every block the value produces, so a rule that names it runs there and nowhere else."
	>
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			{@render code('House/Subject.yml', data.html.subjectRule)}
			<div class="flex flex-col gap-4 rounded-2xl border border-border bg-muted p-6">
				<p class="text-sm leading-relaxed text-foreground/85">
					<InlineCode>scope: subject</InlineCode> runs on the first line of a commit message and nowhere
					else. A rule with the usual <InlineCode>scope: text</InlineCode> runs on everything the View
					extracted, and a query without a name is linted but reachable only by the scopes its format
					gives it.
				</p>
				<p class="text-sm leading-relaxed text-foreground/85">
					A scope's <InlineCode>type</InlineCode> is the format the extracted text is parsed as:
					<InlineCode>md</InlineCode>, <InlineCode>rst</InlineCode>, <InlineCode>html</InlineCode>,
					<InlineCode>org</InlineCode>, or <InlineCode>adoc</InlineCode>. Without one, the text is
					read as plain lines, which is right for a subject and wrong for a body written in
					Markdown.
				</p>
			</div>
		</div>
	</Section>

	<Section
		title="One side of a conversation"
		lede="A transcript alternates between a user and a model, and only one side is yours to lint. A turn runs until the next label, so each state needs to know when the turn is over before it knows whose turn comes next."
	>
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
			<div class="flex flex-col gap-4">
				{@render file('transcript.txt', transcript)}
				{@render code('vale transcript.txt', data.html.transcriptOut)}
			</div>
			{@render code('config/views/Transcript.yml', data.html.transcriptView)}
		</div>

		<p class="mt-6 text-sm leading-relaxed text-foreground/85">
			The first rule in each state is the trick: it matches any label, captures nothing, emits the
			turn in hand as a record, and continues, so the rules below it capture the new turn into a
			fresh record. The user's lines are captured so they have somewhere to go, but no scope names
			them, so the misspelling on the last line goes unreported. The column is the column of the
			capture, so an alert on the first line of a turn points past the label.
		</p>
	</Section>

	<Section
		title="Your own query, in source"
		lede="Vale reads source code by its comments. A tree-sitter View replaces that with queries of your own, run against the file's syntax tree, so you decide what counts as prose in a language."
	>
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			{@render file('greet.py', python)}
			{@render code('config/views/Docstrings.yml', data.html.docstringView)}
		</div>

		<p class="mt-6 text-sm leading-relaxed text-foreground/85">
			Each capture is one value. Its scope is <InlineCode>text.comment</InlineCode>, then the
			query's name, so the docstrings answer to <InlineCode
				>scope: text.comment.docstring</InlineCode
			>
			and a plain <InlineCode>scope: comment</InlineCode> reaches both queries. Delimiters and per-line
			decoration are stripped before linting, and <InlineCode>#offset!</InlineCode> trims a capture by
			rows and columns from each end, which is how the docstring loses its quotes. The same shape lints
			string literals, a UI's user-facing text, or anything else a grammar can name.
		</p>
	</Section>
</FeatureShell>
