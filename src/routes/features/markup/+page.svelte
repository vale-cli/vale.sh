<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import FeatureShell from '$lib/components/features/FeatureShell.svelte';
	import Section from '$lib/components/features/Section.svelte';
	import ExternalLink from '$lib/components/features/ExternalLink.svelte';
	import { features } from '$lib/features';

	const feature = features.find((f) => f.slug === 'markup')!;

	/*
		Three syntaxes, one document. Each line is a token list so the markup
		characters can be dimmed independently of the prose — which is the whole
		point of the section: Vale reads the tokens on the left, and a rule only
		ever sees the tokens on the right.
	*/
	type Token = { t: 'syntax' | 'text' | 'flag'; v: string };

	const syntaxes: { id: string; label: string; ext: string; lines: Token[][] }[] = [
		{
			id: 'md',
			label: 'Markdown',
			ext: '.md',
			lines: [
				[
					{ t: 'syntax', v: '## ' },
					{ t: 'text', v: 'Getting started' }
				],
				[],
				[
					{ t: 'text', v: 'You can ' },
					{ t: 'flag', v: 'utilize' },
					{ t: 'text', v: ' the ' },
					{ t: 'syntax', v: '`' },
					{ t: 'text', v: '--output' },
					{ t: 'syntax', v: '`' },
					{ t: 'text', v: ' flag to' }
				],
				[
					{ t: 'text', v: 'change the ' },
					{ t: 'syntax', v: '[' },
					{ t: 'text', v: 'report format' },
					{ t: 'syntax', v: '](/docs/output)' },
					{ t: 'text', v: '.' }
				]
			]
		},
		{
			id: 'adoc',
			label: 'AsciiDoc',
			ext: '.adoc',
			lines: [
				[
					{ t: 'syntax', v: '== ' },
					{ t: 'text', v: 'Getting started' }
				],
				[],
				[
					{ t: 'text', v: 'You can ' },
					{ t: 'flag', v: 'utilize' },
					{ t: 'text', v: ' the ' },
					{ t: 'syntax', v: '`' },
					{ t: 'text', v: '--output' },
					{ t: 'syntax', v: '`' },
					{ t: 'text', v: ' flag to' }
				],
				[
					{ t: 'text', v: 'change the ' },
					{ t: 'syntax', v: 'link:/docs/output[' },
					{ t: 'text', v: 'report format' },
					{ t: 'syntax', v: ']' },
					{ t: 'text', v: '.' }
				]
			]
		},
		{
			id: 'rst',
			label: 'reStructuredText',
			ext: '.rst',
			lines: [
				[{ t: 'text', v: 'Getting started' }],
				[{ t: 'syntax', v: '---------------' }],
				[],
				[
					{ t: 'text', v: 'You can ' },
					{ t: 'flag', v: 'utilize' },
					{ t: 'text', v: ' the ' },
					{ t: 'syntax', v: '``' },
					{ t: 'text', v: '--output' },
					{ t: 'syntax', v: '``' },
					{ t: 'text', v: ' flag to' }
				],
				[
					{ t: 'text', v: 'change the ' },
					{ t: 'syntax', v: '`' },
					{ t: 'text', v: 'report format' },
					{ t: 'syntax', v: ' </docs/output>`_' },
					{ t: 'text', v: '.' }
				]
			]
		}
	];

	let active = $state('md');
	const current = $derived(syntaxes.find((s) => s.id === active)!);

	/*
		The scope explorer. Each block carries the scope Vale would assign it;
		selecting a selector runs the same subset test the engine does.
	*/
	const blocks = [
		{ scope: 'text.heading.h2.md', kind: 'h2', text: 'Getting started' },
		{
			scope: 'text.md',
			kind: 'p',
			text: 'Install the binary, then run it against a file you already have.'
		},
		{ scope: 'text.list.md', kind: 'li', text: 'Download a release for your platform.' },
		{ scope: 'text.list.md', kind: 'li', text: 'Add a .vale.ini to the project root.' },
		{
			scope: 'text.blockquote.md',
			kind: 'quote',
			text: 'Vale reads configuration from the closest .vale.ini it can find.'
		},
		{ scope: 'text.table.header.md', kind: 'th', text: 'Flag' },
		{ scope: 'text.table.cell.md', kind: 'td', text: 'Sets the reporting style.' }
	];

	const selectors = [
		{ value: 'text', label: 'text', note: 'The default: every block Vale extracts from the file.' },
		{ value: 'heading', label: 'heading', note: 'Any heading, at any level.' },
		{ value: 'heading.h2', label: 'heading.h2', note: 'Only second-level headings.' },
		{ value: 'list', label: 'list', note: 'List items, at any nesting depth.' },
		{ value: 'table', label: 'table', note: 'The whole table—header row included.' },
		{
			value: 'table.cell',
			label: 'table.cell',
			note: 'Body cells only. The header row has its own scope.'
		},
		{ value: 'blockquote', label: 'blockquote', note: 'Quoted material only.' },
		{
			value: '~table',
			label: '~table',
			note: 'Negated: everything except tables. Useful for rules about full sentences.'
		},
		{
			value: 'md',
			label: 'md',
			note: 'The file format is part of the scope, so rules can target it.'
		}
	];

	let selector = $state('text');
	const activeSelector = $derived(selectors.find((s) => s.value === selector)!);

	/**
	 * Scope matching is a subset test over dot-separated parts, and it does not
	 * care about order: `md.list` and `list.md` select the same thing. A leading
	 * `~` inverts the result.
	 */
	function matches(sel: string, scope: string): boolean {
		if (!sel) return true;
		const negated = sel.startsWith('~');
		const parts = scope.split('.');
		const hit = sel
			.replace(/^~/, '')
			.split('.')
			.every((p) => parts.includes(p));
		return negated ? !hit : hit;
	}

	const hits = $derived(blocks.filter((b) => matches(selector, b.scope)).length);

	/*
		Each format names the parser that actually handles it, and links to it.
		"Its own parser" is the claim the section makes, so it should be checkable.
	*/
	const formats = [
		{
			name: 'Markdown',
			ext: '.md, .markdown',
			parser: 'goldmark',
			href: 'https://github.com/yuin/goldmark'
		},
		{ name: 'MDX', ext: '.mdx', parser: 'mdx2vast', href: 'https://github.com/jdkato/mdx2vast' },
		{
			name: 'AsciiDoc',
			ext: '.adoc, .asciidoc',
			parser: 'Asciidoctor',
			href: 'https://asciidoctor.org/'
		},
		{
			name: 'reStructuredText',
			ext: '.rst, .rest',
			parser: 'Docutils',
			href: 'https://docutils.sourceforge.io/'
		},
		{
			name: 'HTML',
			ext: '.html, .htm',
			parser: 'x/net/html',
			href: 'https://pkg.go.dev/golang.org/x/net/html'
		},
		{
			name: 'Org',
			ext: '.org',
			parser: 'go-org',
			href: 'https://github.com/niklasfasching/go-org'
		},
		{ name: 'DITA', ext: '.dita', parser: 'DITA-OT', href: 'https://www.dita-ot.org/' },
		{
			name: 'XML',
			ext: '.xml',
			parser: 'xsltproc',
			href: 'https://manpages.debian.org/bookworm/xsltproc/xsltproc.1.en.html'
		}
	];

	/*
		Front matter, by delimiter. Every field becomes its own scope, which is
		the part worth showing: a rule can target `title` without touching `body`.
	*/
	const frontMatter = [
		{
			id: 'yaml',
			label: 'YAML',
			open: '---',
			close: '---',
			lines: [
				{ t: 'syntax', v: '---' },
				{ t: 'key', v: 'title: ', text: "'Getting started with Vale'" },
				{ t: 'key', v: 'description: ', text: "'Install it, then run it.'" },
				{ t: 'syntax', v: '---' }
			]
		},
		{
			id: 'toml',
			label: 'TOML',
			open: '+++',
			close: '+++',
			lines: [
				{ t: 'syntax', v: '+++' },
				{ t: 'key', v: 'title = ', text: '"Getting started with Vale"' },
				{ t: 'key', v: 'description = ', text: '"Install it, then run it."' },
				{ t: 'syntax', v: '+++' }
			]
		},
		{
			id: 'json',
			label: 'JSON',
			open: ';;;',
			close: ';;;',
			lines: [
				{ t: 'syntax', v: ';;;' },
				{ t: 'syntax', v: '{' },
				{ t: 'key', v: '  "title": ', text: '"Getting started with Vale",' },
				{ t: 'key', v: '  "description": ', text: '"Install it, then run it."' },
				{ t: 'syntax', v: '}' },
				{ t: 'syntax', v: ';;;' }
			]
		}
	];

	let matter = $state('yaml');
	const currentMatter = $derived(frontMatter.find((f) => f.id === matter)!);

	const skipped = [
		{ title: 'Fenced and indented code', body: 'Whole blocks, in every format that has them.' },
		{ title: 'Inline code spans', body: 'Backticks, ``literals``, and +passthroughs+ alike.' },
		{ title: 'URLs and link targets', body: 'The destination is skipped; the link text is not.' },
		{ title: 'Front matter', body: 'YAML and TOML headers, unless you ask for them by key.' },
		{ title: 'HTML attributes', body: 'Except the human-readable ones, like alt text.' },
		{ title: 'Directives and macros', body: 'Roles, shortcodes, and template tags.' }
	];

	const description =
		'Vale parses Markdown, AsciiDoc, reStructuredText, HTML, and more with real parsers—so rules can target headings, lists, or table cells, and skip code and URLs entirely.';
</script>

<MetaTags
	title="Markup-aware linting — Vale"
	{description}
	canonical="https://vale.sh/features/markup"
	openGraph={{
		url: 'https://vale.sh/features/markup',
		title: 'Markup-aware linting',
		description
	}}
/>

<FeatureShell
	{feature}
	lede="A prose linter that treats your source as plain text will flag your code samples, your URLs, and your syntax. Vale doesn't read the file—it parses it, the same way your site generator does, and then walks the result. Rules see prose. Everything else is structure."
	docs={{ href: 'https://docs.vale.sh/topics/scopes', label: 'Scopes reference' }}
>
	<Section
		title="One rule, every syntax"
		lede="These three files say the same thing in three markup languages. Vale parses each with its own parser and hands the linter the same prose, so a rule written once fires in all three."
	>
		<div class="rounded-2xl border border-border/60 bg-card">
			<div
				role="tablist"
				aria-label="Markup format"
				class="flex gap-1 overflow-x-auto border-b border-border/60 px-3 py-2"
			>
				{#each syntaxes as syntax}
					<button
						role="tab"
						aria-selected={active === syntax.id}
						onclick={() => (active = syntax.id)}
						class="whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 {active ===
						syntax.id
							? 'bg-lime-500/10 font-medium text-foreground'
							: 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}"
					>
						{syntax.label}
					</button>
				{/each}
			</div>

			<div class="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed sm:p-6">
				<div class="mb-3 text-xs text-muted-foreground/70">example{current.ext}</div>
				{#each current.lines as line}
					<div class="whitespace-pre">
						{#each line as token}
							{#if token.t === 'syntax'}
								<span class="text-muted-foreground/45">{token.v}</span>
							{:else if token.t === 'flag'}
								<span
									class="decoration-amber-500 underline-offset-4 [text-decoration:underline_wavy]"
									>{token.v}</span
								>
							{:else}
								<span class="text-foreground/90">{token.v}</span>
							{/if}
						{/each}{#if line.length === 0}&nbsp;{/if}
					</div>
				{/each}
			</div>

			<div
				class="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/60 px-5 py-4 font-mono text-[13px] sm:px-6"
			>
				<span class="text-amber-500">warning</span>
				<span class="text-foreground/80">Use 'use' instead of 'utilize'.</span>
				<span class="text-muted-foreground/60">Microsoft.Vocab</span>
			</div>
		</div>

		<p class="mt-6 text-sm leading-relaxed text-muted-foreground">
			The dimmed characters never reach a rule. Neither does <code
				class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">--output</code
			>
			or the link target—but <em>report format</em>, which a reader actually reads, does.
		</p>

		<p class="mt-4 text-sm leading-relaxed text-muted-foreground">
			Vale does not implement any of these syntaxes itself. Markdown goes through
			<ExternalLink href="https://github.com/yuin/goldmark">goldmark</ExternalLink>, AsciiDoc
			through
			<ExternalLink href="https://asciidoctor.org/">Asciidoctor</ExternalLink>, and reStructuredText
			through
			<ExternalLink href="https://docutils.sourceforge.io/">Docutils</ExternalLink>—the same tools
			your site generator is likely using. Whatever they call a heading is what a rule scoped to
			<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">heading</code> sees.
		</p>
	</Section>

	<Section
		title="Rules can aim at structure"
		lede="Because the document is a tree by the time rules run, a rule can restrict itself to part of it. Pick a selector and watch which blocks it claims."
	>
		<div class="flex flex-wrap gap-1.5">
			{#each selectors as option}
				<button
					aria-pressed={selector === option.value}
					onclick={() => (selector = option.value)}
					class="rounded-full px-3 py-1.5 font-mono text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 {selector ===
					option.value
						? 'bg-lime-500/15 font-medium text-lime-700 ring-1 ring-inset ring-lime-500/40 dark:text-lime-300'
						: 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}"
				>
					{option.label}
				</button>
			{/each}
		</div>

		<div class="mt-5 rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
			<div class="flex flex-col gap-3">
				{#each blocks as block}
					{@const on = matches(selector, block.scope)}
					<div
						class="rounded-lg border px-4 py-3 transition-all {on
							? 'border-lime-500/40 bg-lime-500/5'
							: 'border-transparent opacity-35'}"
					>
						<div class="flex items-baseline justify-between gap-4">
							<div class="min-w-0">
								{#if block.kind === 'h2'}
									<span class="text-lg font-semibold text-foreground">{block.text}</span>
								{:else if block.kind === 'li'}
									<span class="text-sm text-foreground/90">• {block.text}</span>
								{:else if block.kind === 'quote'}
									<span class="border-l-2 border-border pl-3 text-sm italic text-foreground/90"
										>{block.text}</span
									>
								{:else if block.kind === 'th'}
									<span class="text-sm font-semibold text-foreground">{block.text}</span>
								{:else}
									<span class="text-sm text-foreground/90">{block.text}</span>
								{/if}
							</div>
							<span class="shrink-0 font-mono text-[11px] text-muted-foreground/70"
								>{block.scope}</span
							>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div class="mt-5 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
			<p class="text-sm text-muted-foreground">{activeSelector.note}</p>
			<p class="shrink-0 font-mono text-[13px] text-lime-600 dark:text-lime-400">
				{hits} of {blocks.length} blocks
			</p>
		</div>

		<div class="mt-8 flex flex-col gap-4 rounded-xl border border-border/60 bg-muted/30 p-5">
			<p class="text-sm leading-relaxed text-muted-foreground">
				A selector matches when every part of it appears in the block's scope, in any order—so
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">md.list</code> and
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">list.md</code> select the
				same thing. Combine parts with
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">&amp;</code> to require
				both at once, or lead with
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">~</code> to invert the whole
				thing.
			</p>
			<p class="text-sm leading-relaxed text-muted-foreground">
				Inline spans—<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">link</code>,
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">strong</code>,
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">emphasis</code>,
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">code</code>—are scopes of
				their own, offered alongside the surrounding text rather than nested inside it. A rule that
				asks for
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">link</code> sees only link
				text; every other rule pays nothing for the privilege.
			</p>
		</div>
	</Section>

	<Section
		title="Front matter is content too"
		lede="A title and a description are read more often than the page they sit on—they land in search results, navigation, and social cards. Vale parses front matter in Markdown, AsciiDoc, reStructuredText, MDX, and Org, and gives every field a scope of its own."
	>
		<div class="rounded-2xl border border-border/60 bg-card">
			<div
				role="tablist"
				aria-label="Front matter format"
				class="flex gap-1 overflow-x-auto border-b border-border/60 px-3 py-2"
			>
				{#each frontMatter as fm}
					<button
						role="tab"
						aria-selected={matter === fm.id}
						onclick={() => (matter = fm.id)}
						class="whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 {matter ===
						fm.id
							? 'bg-lime-500/10 font-medium text-foreground'
							: 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}"
					>
						{fm.label}
					</button>
				{/each}
			</div>

			<div class="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed sm:p-6">
				{#each currentMatter.lines as line}
					<div class="whitespace-pre">
						{#if line.t === 'syntax'}
							<span class="text-muted-foreground/45">{line.v}</span>
						{:else}
							<span class="text-muted-foreground/70">{line.v}</span><span class="text-foreground/90"
								>{line.text}</span
							>
						{/if}
					</div>
				{/each}
				<div class="mt-2 whitespace-pre text-foreground/90">The body starts here.</div>
			</div>

			<div class="border-t border-border/60 px-5 py-4 sm:px-6">
				<div class="text-xs uppercase tracking-wider text-muted-foreground/70">Scopes produced</div>
				<div class="mt-2 flex flex-wrap gap-2 font-mono text-[13px]">
					<span
						class="rounded-md bg-lime-500/10 px-2 py-0.5 text-lime-700 ring-1 ring-inset ring-lime-500/30 dark:text-lime-300"
						>text.frontmatter.title.md</span
					>
					<span
						class="rounded-md bg-lime-500/10 px-2 py-0.5 text-lime-700 ring-1 ring-inset ring-lime-500/30 dark:text-lime-300"
						>text.frontmatter.description.md</span
					>
				</div>
			</div>
		</div>

		<div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="rounded-2xl border border-border/60 bg-card p-6">
				<h3 class="text-sm font-semibold text-foreground">Title case, titles only</h3>
				<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
					The field name is part of the scope, so a rule can pick out one key and ignore every
					other.
				</p>
				<div
					class="mt-4 overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-4 font-mono text-[13px] leading-relaxed"
				>
					<div class="whitespace-pre">
						<span class="text-muted-foreground">extends:</span> capitalization
					</div>
					<div class="whitespace-pre">
						<span class="text-muted-foreground">scope:</span>
						<span class="text-lime-600 dark:text-lime-400">text.frontmatter.title</span>
					</div>
					<div class="whitespace-pre">
						<span class="text-muted-foreground">match:</span> $title
					</div>
				</div>
			</div>

			<div class="rounded-2xl border border-border/60 bg-card p-6">
				<h3 class="text-sm font-semibold text-foreground">No filler in the description</h3>
				<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
					This is the sentence that lands in search results. It is the wrong place for words that
					carry no information.
				</p>
				<div
					class="mt-4 overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-4 font-mono text-[13px] leading-relaxed"
				>
					<div class="whitespace-pre">
						<span class="text-muted-foreground">extends:</span> existence
					</div>
					<div class="whitespace-pre">
						<span class="text-muted-foreground">scope:</span>
						<span class="text-lime-600 dark:text-lime-400">text.frontmatter.description</span>
					</div>
					<div class="whitespace-pre">
						<span class="text-muted-foreground">message:</span>
						<span class="text-foreground/90">"Drop '%s' from the description."</span>
					</div>
					<div class="whitespace-pre"><span class="text-muted-foreground">tokens:</span></div>
					<div class="whitespace-pre">
						<span class="text-muted-foreground/60">{'  - '}</span><span class="text-amber-500"
							>simply</span
						>
					</div>
					<div class="whitespace-pre">
						<span class="text-muted-foreground/60">{'  - '}</span><span class="text-amber-500"
							>easy to use</span
						>
					</div>
				</div>
			</div>
		</div>

		<p class="mt-6 text-sm leading-relaxed text-muted-foreground">
			Front matter is skipped entirely unless a rule asks for it, so nothing starts firing on your
			build configuration by accident.
		</p>
	</Section>

	<Section
		title="Scope a rule in three lines"
		lede="Every rule takes a scope. Set it, and the rule stops firing anywhere else."
	>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="rounded-2xl border border-border/60 bg-card p-6">
				<h3 class="text-sm font-semibold text-foreground">Headings only</h3>
				<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
					Enforce sentence case where it matters, and leave body text alone.
				</p>
				<div
					class="mt-4 overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-4 font-mono text-[13px] leading-relaxed"
				>
					<div class="whitespace-pre">
						<span class="text-muted-foreground">extends:</span> capitalization
					</div>
					<div class="whitespace-pre">
						<span class="text-muted-foreground">scope:</span>
						<span class="text-lime-600 dark:text-lime-400">heading</span>
					</div>
					<div class="whitespace-pre">
						<span class="text-muted-foreground">match:</span> $sentence
					</div>
				</div>
			</div>

			<div class="rounded-2xl border border-border/60 bg-card p-6">
				<h3 class="text-sm font-semibold text-foreground">Everything but tables</h3>
				<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
					Scopes negate. Terse table cells shouldn't trip a rule about full sentences.
				</p>
				<div
					class="mt-4 overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-4 font-mono text-[13px] leading-relaxed"
				>
					<div class="whitespace-pre">
						<span class="text-muted-foreground">extends:</span> existence
					</div>
					<div class="whitespace-pre">
						<span class="text-muted-foreground">scope:</span>
						<span class="text-lime-600 dark:text-lime-400">~table</span>
					</div>
					<div class="whitespace-pre"><span class="text-muted-foreground">tokens:</span></div>
					<div class="whitespace-pre text-muted-foreground/60">
						{'  - '}<span class="text-foreground/90">click here</span>
					</div>
				</div>
			</div>
		</div>
	</Section>

	<Section
		title="What a rule never sees"
		lede="Exclusions are structural, not a list of patterns you maintain. If the parser calls it code, it is code."
		wide
	>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each skipped as item}
				<div class="rounded-xl border border-border/60 bg-card p-5">
					<h3 class="text-sm font-semibold text-foreground">{item.title}</h3>
					<p class="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
				</div>
			{/each}
		</div>
	</Section>

	<Section
		title="Formats"
		lede="Each is handed to the parser that owns it, not to a shared approximation of all of them. Follow a tile to the project doing the work."
		wide
	>
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
			{#each formats as format}
				<a
					href={format.href}
					rel="noreferrer"
					target="_blank"
					class="group rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors hover:border-lime-500/40"
				>
					<div class="text-sm font-medium text-foreground">{format.name}</div>
					<div class="mt-0.5 font-mono text-xs text-muted-foreground">{format.ext}</div>
					<div
						class="mt-2 text-xs text-muted-foreground/70 group-hover:text-lime-600 dark:group-hover:text-lime-400"
					>
						{format.parser} ↗
					</div>
				</a>
			{/each}
		</div>
		<p class="mt-6 text-sm leading-relaxed text-muted-foreground">
			Source files are handled too—see <a
				href="/features/code"
				class="font-medium text-foreground underline decoration-lime-500 decoration-2 underline-offset-4"
				>code-aware linting</a
			>, which can parse the Markdown inside a comment using everything on this page.
		</p>
	</Section>
</FeatureShell>
