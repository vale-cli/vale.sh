<script lang="ts">
	import BrandIcon from './BrandIcon.svelte';
	import FileText from 'lucide-svelte/icons/file-text';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import { features } from '$lib/features';
	import { markupFormats } from '$lib/data/markup-formats';
	import { codeLanguages } from '$lib/data/code-languages';
	import Section from './Section.svelte';

	const [markup, code, views, speed] = features;
	type Format = { name: string; slug?: string };
	const viewFormats: Format[] = [
		{ name: 'OpenAPI', slug: 'openapiinitiative' },
		{ name: 'Jupyter', slug: 'jupyter' },
		{ name: 'Commit messages', slug: 'git' },
		{ name: 'Transcripts' },
		{ name: 'Docstrings' },
		{ name: 'JSON', slug: 'json' },
		{ name: 'YAML', slug: 'yaml' },
		{ name: 'TOML', slug: 'toml' }
	];

	// A line is a list of segments, so the key in a YAML line or the `///`
	// on a Rust comment can stay muted while the prose beside it is lit. A
	// scope names what Vale calls the line; a muted one says why it's skipped.
	type Segment = { t: string; prose?: boolean };
	type Line = { segs: Segment[]; scope?: string; muted?: boolean };
	type Tab = { id: string; label: string; note: string; lines: Line[] };

	const prose = (t: string, scope: string): Line => ({ segs: [{ t, prose: true }], scope });
	const skip = (t: string, skipped?: string): Line => ({
		segs: [{ t }],
		scope: skipped,
		muted: true
	});
	const blank: Line = { segs: [] };

	const codeTabs: Tab[] = [
		{
			id: 'rust',
			label: 'Rust + Markdown',
			note: 'Markdown inside a doc comment',
			lines: [
				{
					segs: [{ t: '/// ' }, { t: 'Creates a person with the given name.', prose: true }],
					scope: 'paragraph'
				},
				skip('///'),
				{ segs: [{ t: '/// ' }, { t: '# Examples', prose: true }], scope: 'heading' },
				skip('/// ```', 'code skipped'),
				skip('/// let person = Person::new("name");'),
				skip('/// ```'),
				skip('pub fn new(name: &str) -> Person {', 'not a comment')
			]
		},
		{
			id: 'python',
			label: 'Python + rst',
			note: 'reStructuredText inside a docstring',
			lines: [
				skip('def connect(host):', 'not a comment'),
				{
					segs: [
						{ t: '    """' },
						{ t: 'Open a connection to ', prose: true },
						{ t: '``host``' },
						{ t: '.', prose: true }
					],
					scope: 'paragraph'
				},
				blank,
				{
					segs: [{ t: '    ' }, { t: 'Retries until the server answers, then', prose: true }],
					scope: 'paragraph'
				},
				{
					segs: [{ t: '    ' }, { t: 'returns a live session.', prose: true }],
					scope: 'paragraph'
				},
				skip('    """'),
				skip('    return Session(host)', 'not a comment')
			]
		}
	];

	const viewTabs: Tab[] = [
		{
			id: 'openapi',
			label: 'OpenAPI',
			note: 'Select the description',
			lines: [
				skip('openapi: 3.1.0'),
				skip('info:'),
				skip('  title: Example API'),
				skip('  version: 1.0.0'),
				{
					segs: [{ t: '  description: ' }, { t: 'Manage your projects.', prose: true }],
					scope: 'description'
				},
				skip('paths:'),
				skip('  /projects: {}')
			]
		},
		{
			id: 'commit',
			label: 'Commit',
			note: 'Subject, body, and trailers by name',
			lines: [
				prose('fix: keep the sidebar open on resize', 'subject'),
				blank,
				prose('The panel collapsed whenever the window', 'body'),
				prose('crossed a breakpoint, even when pinned.', 'body'),
				blank,
				skip('Reviewed-by: Sam Doe <sam@example.com>', 'trailer'),
				skip('# Please enter the commit message.', 'skipped')
			]
		},
		{
			id: 'notebook',
			label: 'Notebook',
			note: 'Markdown cells only',
			lines: [
				skip('{ "cells": ['),
				skip('  { "cell_type": "code",'),
				skip('    "source": ["df.describe()"] },'),
				skip('  { "cell_type": "markdown",'),
				skip('    "source": ['),
				{
					segs: [{ t: '      "' }, { t: '## Results', prose: true }, { t: '\\n",' }],
					scope: 'cell'
				},
				{
					segs: [
						{ t: '      "' },
						{ t: 'The model beats the baseline.', prose: true },
						{ t: '" ] } ] }' }
					],
					scope: 'cell'
				}
			]
		}
	];
	let codeTab = $state(codeTabs[0].id);
	let viewTab = $state(viewTabs[0].id);
</script>

{#snippet label(item: (typeof features)[number], number: string)}
	{@const Icon = item.icon}
	<p class="feature-label">
		<span>{number}</span><Icon class="size-4" aria-hidden="true" />{item.title}
	</p>
{/snippet}

{#snippet more(slug: string, text: string)}
	<a class="feature-link" href="/features/{slug}"
		>{text}<ArrowRight class="size-4" aria-hidden="true" /></a
	>
{/snippet}

{#snippet example(tabs: Tab[], active: string, select: (id: string) => void, name: string)}
	{@const current = tabs.find((t) => t.id === active) ?? tabs[0]}
	<figure class="small-example">
		<figcaption class="tabbed">
			<span class="tabs" role="tablist" aria-label={name}>
				{#each tabs as tab (tab.id)}
					<button
						type="button"
						role="tab"
						aria-selected={active === tab.id}
						onclick={() => select(tab.id)}>{tab.label}</button
					>
				{/each}
			</span>
			<span>{current.note}</span>
		</figcaption>
		<div class="lines">
			{#each current.lines as line, i (i)}
				<div class="line">
					<code
						>{#each line.segs as seg, j (j)}<span class={seg.prose ? 'prose-line' : 'excluded'}
								>{seg.t}</span
							>{/each}</code
					>
					{#if line.scope}<span class="scope" class:muted={line.muted}>{line.scope}</span>{/if}
				</div>
			{/each}
		</div>
	</figure>
{/snippet}

{#snippet formats(items: Format[])}
	<ul>
		{#each items as item (item.name)}
			<li>
				{#if item.slug}
					<BrandIcon name={item.name} slug={item.slug} size="size-3.5" />
				{:else}
					<FileText class="size-3.5 shrink-0" aria-hidden="true" />
				{/if}
				<span>{item.name}</span>
			</li>
		{/each}
	</ul>
{/snippet}

<Section
	id="features"
	editorial
	eyebrow="Why Vale"
	title="Most tools see text. Vale sees a document."
	lede="Check the writing in context. Target a heading, a comment, or a description, while leaving the code around it alone."
	accent
>
	<div class="feature-layout">
		<article class="document-feature">
			<div class="feature-copy">
				{@render label(markup, '01')}
				<h3>Your document has structure.<br />Your rules should too.</h3>
				<p>
					Apply different checks to headings, lists, and table cells. Vale parses the markup first,
					so code blocks and link URLs stay out of the way.
				</p>
				{@render more(markup.slug, 'Explore markup and scopes')}
			</div>
			<figure class="document-map">
				<figcaption><span>guide.md</span><span>What Vale sees</span></figcaption>
				<div class="source-line">
					<code><span class="syntax">#</span> Getting started</code><span class="scope"
						>heading</span
					>
				</div>
				<div class="source-line">
					<code>Write with your team’s voice.</code><span class="scope">paragraph</span>
				</div>
				<div class="source-line">
					<code><span class="syntax">-</span> Keep instructions clear.</code><span class="scope"
						>list</span
					>
				</div>
				<div class="source-line">
					<code>[Read the guide](<span class="excluded">https://example.com</span>)</code><span
						class="scope muted">URL skipped</span
					>
				</div>
				<div class="source-line code-region">
					<code>```sh<br />vale docs/<br />```</code><span class="scope muted">code skipped</span>
				</div>
				<p class="map-note"><span aria-hidden="true"></span>Check the prose. Preserve the code.</p>
			</figure>
			<div class="format-list">
				<p class="format-heading">{markupFormats.length} markup formats</p>
				{@render formats(markupFormats)}
			</div>
		</article>

		<div class="secondary-features">
			<article class="secondary-feature">
				{@render label(code, '02')}
				<h3>The comments count, too.</h3>
				<p>
					Extract comments with tree-sitter grammars, then check the Markdown inside them. A comment
					marker inside a string stays code.
				</p>
				{@render example(codeTabs, codeTab, (id) => (codeTab = id), 'Language')}
				<div class="format-list">
					<p class="format-heading">{codeLanguages.length} languages</p>
					{@render formats(codeLanguages)}
				</div>
				{@render more(code.slug, 'Explore code comments')}
			</article>

			<article class="secondary-feature">
				{@render label(views, '03')}
				<h3>Find prose in unexpected places.</h3>
				<p>
					A View selects the writing inside structured files. Check an API description, a notebook
					cell, or a commit message with rules for that context.
				</p>
				{@render example(viewTabs, viewTab, (id) => (viewTab = id), 'File')}
				<div class="format-list">
					<p class="format-heading">Beyond documents</p>
					{@render formats(viewFormats)}
				</div>
				{@render more(views.slug, 'Explore Views')}
			</article>
		</div>

		<article class="performance">
			<div>
				{@render label(speed, '04')}
				<h3>Built for the whole repository.</h3>
				<p>One Go binary. Parallel checks. No separate runtime.</p>
				{@render more(speed.slug, 'See the benchmark')}
			</div>
			<div class="benchmark">
				<p>GitLab documentation · one run</p>
				<dl>
					<div>
						<dt>Markdown pages</dt>
						<dd>2,826</dd>
					</div>
					<div>
						<dt>Rules applied</dt>
						<dd>82</dd>
					</div>
					<div>
						<dt>Start to finish</dt>
						<dd>&lt;20<span>s</span></dd>
					</div>
				</dl>
			</div>
		</article>
	</div>
</Section>

<style>
	.feature-layout {
		border-top: 1px solid hsl(var(--border));
	}
	.document-feature {
		display: grid;
		grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
		gap: 32px 48px;
		padding-block: 40px;
	}
	.feature-copy {
		align-self: center;
	}
	.feature-label {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 20px;
		font-size: 12px;
		font-weight: 500;
	}
	.feature-label > span {
		margin-right: 4px;
		font:
			11px ui-monospace,
			monospace;
		color: hsl(var(--muted-foreground));
	}
	h3 {
		font-size: clamp(1.5rem, 2.6vw, 2rem);
		font-weight: 500;
		letter-spacing: -0.035em;
		line-height: 1.2;
		text-wrap: balance;
	}
	h3 + p {
		margin-top: 16px;
		max-width: 48ch;
		font-size: 15px;
		line-height: 1.8;
		color: hsl(var(--muted-foreground));
	}
	.feature-link {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		margin-top: 24px;
		font-size: 13px;
		font-weight: 500;
		text-decoration: underline;
		text-decoration-color: hsl(var(--border));
		text-underline-offset: 5px;
	}
	.feature-link:hover {
		text-decoration-color: currentColor;
	}
	a:focus-visible {
		outline: 2px solid hsl(var(--ring));
		outline-offset: 5px;
		border-radius: 2px;
	}
	.document-map {
		min-width: 0;
		align-self: center;
		border: 1px solid hsl(var(--border));
		border-radius: 12px;
		background: hsl(var(--card));
		overflow: hidden;
		box-shadow: var(--shadow-sm);
	}
	figcaption {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 8px;
		padding: 14px 18px;
		border-bottom: 1px solid hsl(var(--border));
		font:
			11px/1.5 ui-monospace,
			monospace;
		color: hsl(var(--muted-foreground));
	}
	figcaption > :last-child {
		font-family: inherit;
	}
	.source-line {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 16px;
		align-items: baseline;
		padding: 12px 18px;
		border-bottom: 1px solid hsl(var(--border) / 0.5);
	}
	.source-line code {
		font:
			12px/1.8 ui-monospace,
			monospace;
		overflow-wrap: anywhere;
	}
	.scope {
		font:
			10px/1.6 ui-monospace,
			monospace;
		color: hsl(var(--accent-foreground));
		background: hsl(var(--accent));
		border-radius: 4px;
		padding: 2px 6px;
		white-space: nowrap;
	}
	.scope.muted {
		background: hsl(var(--muted));
		color: hsl(var(--muted-foreground));
	}
	.syntax,
	.excluded {
		color: hsl(var(--muted-foreground));
	}
	.code-region {
		background: hsl(var(--muted) / 0.4);
		color: hsl(var(--muted-foreground));
	}
	.map-note {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 14px 18px;
		font-size: 11px;
		color: hsl(var(--muted-foreground));
	}
	.map-note span {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: hsl(var(--primary));
	}
	.format-list {
		font-size: 12px;
	}
	.document-feature > .format-list {
		grid-column: 1 / -1;
	}
	.format-heading {
		font-weight: 500;
		color: hsl(var(--foreground));
		line-height: 1.8;
	}
	.format-list ul {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 24px;
		padding-top: 16px;
		color: hsl(var(--muted-foreground));
	}
	.format-list li {
		display: inline-flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px;
		line-height: 1.8;
	}
	.secondary-features {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		border-block: 1px solid hsl(var(--border));
	}
	.secondary-feature {
		display: flex;
		flex-direction: column;
		min-width: 0;
		padding: 36px 40px 36px 0;
	}
	.secondary-feature + .secondary-feature {
		padding-inline: 40px 0;
		border-left: 1px solid hsl(var(--border));
	}
	.small-example {
		margin-block: 24px 20px;
		border-radius: 8px;
		background: hsl(var(--muted));
		overflow: hidden;
	}
	.small-example .lines {
		padding: 14px 18px;
		overflow-x: auto;
		font:
			12px/1.9 ui-monospace,
			monospace;
	}
	.line {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 12px;
		align-items: baseline;
		min-height: 1.9em;
	}
	/* Wrap rather than run under the scope badge on narrow screens. */
	.line code {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.prose-line {
		color: hsl(var(--accent-foreground));
	}
	figcaption.tabbed {
		align-items: center;
		padding-block: 8px;
	}
	.tabs {
		display: flex;
		gap: 2px;
		margin-left: -8px;
	}
	.tabs button {
		padding: 3px 8px;
		border-radius: 999px;
		font:
			500 11px/1.6 ui-monospace,
			monospace;
		color: hsl(var(--muted-foreground));
		transition: color 150ms;
	}
	.tabs button:hover {
		color: hsl(var(--foreground));
	}
	.tabs button[aria-selected='true'] {
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		box-shadow: var(--shadow-sm);
	}
	.tabs button:focus-visible {
		outline: 2px solid hsl(var(--ring));
		outline-offset: 2px;
	}
	.secondary-feature .feature-link {
		align-self: flex-start;
		margin-top: auto;
		padding-top: 24px;
	}
	.performance {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		align-items: center;
		gap: 48px;
		padding-top: 36px;
	}
	.performance h3 {
		font-size: 24px;
	}
	.performance .feature-label {
		margin-bottom: 12px;
	}
	.performance h3 + p {
		margin-top: 10px;
		font-size: 13px;
	}
	.benchmark > p {
		margin-bottom: 20px;
		font:
			11px/1.6 ui-monospace,
			monospace;
		color: hsl(var(--muted-foreground));
	}
	dl {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 20px;
	}
	dl > div {
		display: flex;
		flex-direction: column-reverse;
		gap: 8px;
	}
	dt {
		font-size: 11px;
		color: hsl(var(--muted-foreground));
	}
	dd {
		font-size: clamp(1.75rem, 3vw, 2.5rem);
		line-height: 1;
		letter-spacing: -0.04em;
		font-variant-numeric: tabular-nums;
	}
	dd span {
		font-size: 0.65em;
	}
	@media (max-width: 900px) {
		.document-feature {
			grid-template-columns: 1fr;
			gap: 24px;
		}
		.document-map {
			width: 100%;
		}
		.performance {
			grid-template-columns: 1fr;
			gap: 32px;
		}
	}
	@media (max-width: 640px) {
		.secondary-features {
			grid-template-columns: 1fr;
		}
		.secondary-feature,
		.secondary-feature + .secondary-feature {
			padding: 28px 0;
			border-left: 0;
		}
		.secondary-feature + .secondary-feature {
			border-top: 1px solid hsl(var(--border));
		}
		.source-line {
			padding: 12px;
			gap: 8px;
		}
		.source-line code {
			font-size: 11px;
		}
		dl {
			gap: 12px;
		}
	}
</style>
