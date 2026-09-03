<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import Check from 'lucide-svelte/icons/check';
	import Copy from 'lucide-svelte/icons/copy';
	import Download from 'lucide-svelte/icons/download';
	import { siteConfig } from '$lib/config/site';
	import Terminal, { type Alert, type Sev } from '$lib/components/landing/Terminal.svelte';
	import { terminalSvg } from '$lib/terminal-svg';
	import press from '$lib/data/press.json';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const description =
		'Press resources for Vale: a boilerplate, project facts, the terms to use and the claims to avoid, recent coverage, and a link to the brand assets.';

	// Lifted as-is into a talk or an article, so it stays short and factual.
	const boilerplate =
		'Vale is an open-source, command-line linter for prose. It checks Markdown, HTML, reStructuredText, AsciiDoc, and other markup against a style guide expressed as rules, the way a code linter checks source. It runs offline, ships as a single binary, and is used by documentation teams at AWS, NVIDIA, Microsoft, GitLab, and Red Hat.';

	const compact = (v: number) =>
		new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v);

	const facts = [
		{ label: 'First release', value: 'February 2017' },
		{ label: 'License', value: 'MIT' },
		{ label: 'Written in', value: 'Go' },
		{ label: 'Maintainer', value: '@jdkato', href: siteConfig.links.jdkato },
		{ label: 'GitHub stars', value: compact(data.stats.stars), href: siteConfig.links.github },
		{
			label: 'Downloads',
			value: `${compact(data.stats.lifetime.value)}+`,
			href: siteConfig.links.releases
		},
		{
			label: 'Contributors',
			value: compact(data.stats.contributors),
			href: siteConfig.links.contributors
		},
		{ label: 'Source', value: 'github.com/vale-cli', href: siteConfig.links.org }
	];

	// The repositories a story links: the linter itself, then what ships
	// around it.
	const repos = [
		{ name: 'vale-cli/vale', blurb: 'The linter' },
		{ name: 'vale-cli/Std', blurb: 'The standard library' },
		{ name: 'vale-cli/packages', blurb: 'The package library' },
		{ name: 'vale-cli/Harper', blurb: 'Grammar, as 547 rules' },
		{ name: 'jdkato/voices', blurb: 'AI writing skills as rules' },
		{ name: 'vale-cli/agent-tools', blurb: 'The Claude Code plugin' }
	];

	/*
		The claims that keep coming back, each with the sentence to use instead.
		Grounded in the engine: internal/check has twelve check types, of which
		`existence` and `substitution` are the pattern ones; internal/lint has a
		parser per format.
	*/
	const corrections = [
		{
			claim: 'Vale is just regex.',
			fact: 'Vale parses each format it supports, Markdown, MDX, AsciiDoc, reStructuredText, HTML, XML, DITA, Org, Typst, and the comments in source code, into scopes, so a rule knows whether a match sits in a heading, a sentence, a link, or a code block, and reports the line and column in the original file. Two of its twelve check types match patterns. The others tag parts of speech, count occurrences, measure readability, check spelling against Hunspell dictionaries, enforce capitalization styles, and run scripts.'
		},
		{
			claim: 'Vale can’t check grammar.',
			fact: 'Grammar is a style you add, like any other. The Harper style ports Automattic’s Harper grammar checker into 547 Vale rules, each carrying its fix, and agrees with Harper on 99.8% of what it flags. It is at github.com/vale-cli/Harper.'
		},
		{
			claim: 'Vale sends your text somewhere.',
			fact: 'It is a single binary that runs offline. No account, no server, no model.'
		},
		{
			claim: 'Vale is opinionated.',
			fact: 'It ships almost no rules. The opinions come from the style you pick or write: Microsoft, Google, Red Hat, or your own.'
		}
	];

	const glossary = [
		{ term: 'Style', def: 'A folder of rules, usually one per style guide.' },
		{
			term: 'Rule',
			def: 'One YAML file that extends a check type, such as existence or spelling. Also called a check.'
		},
		{ term: 'Package', def: 'A style, or a bundle of them, that vale sync downloads.' },
		{ term: 'StylesPath', def: 'The directory the styles live in.' },
		{ term: 'Alert', def: 'One finding, at a level of suggestion, warning, or error.' },
		{
			term: 'Scope',
			def: 'The part of a document a rule applies to: headings, sentences, code, and so on.'
		},
		{ term: 'Vocabulary', def: 'A list of accepted and rejected terms layered over a style.' },
		{ term: 'Action', def: 'A fix a rule can propose, which editors apply.' }
	];

	// Recent coverage, newest first. The library is the full archive.
	type Item = {
		type: string;
		title: string;
		outlet: string;
		author?: string;
		year?: number;
		url: string;
	};
	const all = press as Item[];
	const book = all.find((i) => i.type === 'book');
	const coverage = all
		.filter((i) => i.type !== 'book')
		.sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
		.slice(0, 6);
	const typeLabel: Record<string, string> = {
		paper: 'Paper',
		talk: 'Talk',
		article: 'Article',
		video: 'Video',
		newsletter: 'Newsletter'
	};

	/*
		Every alert Vale reports over the demo's two files with all four styles on,
		tagged by style so the controls can leave some out. Produced by running
		Vale, not written: the messages, levels, and positions are its own.
		Docs.Terms is the one custom rule, a `substitution`.
	*/
	type Pooled = Alert & { style: string };
	const pool: { path: string; alerts: Pooled[] }[] = [
		{
			path: 'docs/configure.md',
			alerts: [
				{
					loc: '3:7',
					sev: 'suggestion',
					msg: "Consider using 'use' instead of 'utilize'.",
					rule: 'Microsoft.Wordiness',
					style: 'Microsoft'
				},
				{
					loc: '3:46',
					sev: 'suggestion',
					msg: "In general, use active voice instead of passive voice ('are loaded').",
					rule: 'Google.Passive',
					style: 'Google'
				},
				{
					loc: '3:46',
					sev: 'suggestion',
					msg: "'are loaded' looks like passive voice.",
					rule: 'Microsoft.Passive',
					style: 'Microsoft'
				},
				{
					loc: '8:13',
					sev: 'error',
					msg: "Use 'Vale CLI' instead of 'Vale cli'.",
					rule: 'Docs.Terms',
					style: 'Docs'
				},
				{
					loc: '8:18',
					sev: 'error',
					msg: "Did you really mean 'cli'?",
					rule: 'Vale.Spelling',
					style: 'Vale'
				},
				{
					loc: '8:22',
					sev: 'suggestion',
					msg: "Verify your use of 'against' with the A-Z word list.",
					rule: 'Microsoft.Vocab',
					style: 'Microsoft'
				}
			]
		},
		{
			path: 'docs/install.md',
			alerts: [
				{
					loc: '3:56',
					sev: 'warning',
					msg: "Use 'select' instead of the input-specific verb 'Click'.",
					rule: 'Microsoft.UIVerbs',
					style: 'Microsoft'
				},
				{
					loc: '4:46',
					sev: 'suggestion',
					msg: 'Use parentheses judiciously.',
					rule: 'Google.Parens',
					style: 'Google'
				},
				{
					loc: '4:47',
					sev: 'error',
					msg: "Use 'for example' instead of 'e.g.'.",
					rule: 'Google.Latin',
					style: 'Google'
				},
				{
					loc: '4:47',
					sev: 'error',
					msg: "Use 'for example' instead of 'e.g. '.",
					rule: 'Microsoft.Foreign',
					style: 'Microsoft'
				},
				{
					loc: '5:10',
					sev: 'error',
					msg: "Did you really mean 'existant'?",
					rule: 'Vale.Spelling',
					style: 'Vale'
				},
				{
					loc: '5:59',
					sev: 'warning',
					msg: "Try to avoid using first-person plural like 'We'.",
					rule: 'Google.We',
					style: 'Google'
				},
				{
					loc: '5:59',
					sev: 'warning',
					msg: "Try to avoid using first-person plural like 'We'.",
					rule: 'Microsoft.We',
					style: 'Microsoft'
				},
				{
					loc: '5:62',
					sev: 'suggestion',
					msg: "Use 'don't' instead of 'do not'.",
					rule: 'Google.Contractions',
					style: 'Google'
				},
				{
					loc: '5:62',
					sev: 'error',
					msg: "Use 'don't' instead of 'do not'.",
					rule: 'Microsoft.Contractions',
					style: 'Microsoft'
				}
			]
		}
	];

	// Google starts off, so the default matches the home page.
	const demoStyles = $state([
		{ name: 'Vale', note: 'spelling', on: true, pkg: false },
		{ name: 'Microsoft', note: 'package', on: true, pkg: true },
		{ name: 'Google', note: 'package', on: false, pkg: true },
		{ name: 'Docs', note: 'your own rule', on: true, pkg: false }
	]);
	let minLevel = $state<Sev>('suggestion');
	const rank: Record<Sev, number> = { suggestion: 0, warning: 1, error: 2 };

	const demoFiles = $derived(
		pool.map((f) => ({
			path: f.path,
			alerts: f.alerts.filter(
				(a) => demoStyles.some((s) => s.on && s.name === a.style) && rank[a.sev] >= rank[minLevel]
			)
		}))
	);
	const demoPackages = $derived(demoStyles.filter((s) => s.on && s.pkg).length);

	function save(blob: Blob, name: string) {
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = name;
		a.click();
		setTimeout(() => URL.revokeObjectURL(a.href), 1000);
	}

	// The export follows the page's theme, which is a class on <html>.
	function exportDemo(kind: 'svg' | 'png') {
		const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
		const blob = new Blob([terminalSvg(demoFiles, demoPackages, theme)], {
			type: 'image/svg+xml'
		});
		if (kind === 'svg') return save(blob, 'vale-demo.svg');

		// PNG at 2x, drawn through a canvas.
		const url = URL.createObjectURL(blob);
		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement('canvas');
			canvas.width = img.width * 2;
			canvas.height = img.height * 2;
			const ctx = canvas.getContext('2d')!;
			ctx.scale(2, 2);
			ctx.drawImage(img, 0, 0);
			URL.revokeObjectURL(url);
			canvas.toBlob((b) => b && save(b, 'vale-demo.png'), 'image/png');
		};
		img.src = url;
	}

	let copied = $state(false);
	let timer = 0;
	async function copyBoilerplate() {
		try {
			await navigator.clipboard.writeText(boilerplate);
		} catch {
			return;
		}
		copied = true;
		clearTimeout(timer);
		timer = window.setTimeout(() => (copied = false), 1600);
	}

	const button =
		'inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500';
	const link =
		'font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground';
</script>

<MetaTags
	title="Press — Vale"
	{description}
	canonical="https://vale.sh/press"
	openGraph={{
		url: 'https://vale.sh/press',
		title: 'Vale press resources',
		description,
		images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: 'The Vale logo' }]
	}}
/>

<article>
	<header class="border-b border-border/60 py-14 sm:py-20">
		<div class="mx-auto max-w-5xl px-6 lg:px-8">
			<h1 class="text-base/7 font-semibold text-lime-600 dark:text-lime-400">Press</h1>
			<p class="mt-2 max-w-2xl text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">
				Writing about Vale.
			</p>
			<p class="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
				A description to quote, the facts most often asked for, the words the project uses, and the
				claims to avoid. Logos, colors, and screenshots are on the
				<a href="/brand" class={link}>brand page</a>.
			</p>
			<div class="mt-8 flex flex-wrap items-center gap-3">
				<a
					href="/brand/vale-brand.zip"
					download
					class="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
				>
					<Download class="h-4 w-4" />
					Download the brand kit
				</a>
				<a
					href="/brand"
					class="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
				>
					Brand assets
					<ArrowRight class="h-4 w-4" />
				</a>
			</div>
		</div>
	</header>

	<section class="border-b border-border/60 py-14 sm:py-16">
		<div class="mx-auto max-w-5xl px-6 lg:px-8">
			<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">About Vale</h2>
			<p class="mt-4 max-w-2xl text-pretty leading-7 text-muted-foreground">
				The numbers are read from GitHub and the package registries at build time.
			</p>
			<div class="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
				<div class="flex flex-col rounded-2xl border border-border/60 bg-card p-6">
					<p class="text-pretty leading-7 text-foreground">{boilerplate}</p>
					<div class="mt-5 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
						<p class="text-xs text-muted-foreground">
							Boilerplate · {boilerplate.split(' ').length} words
						</p>
						<button type="button" class={button} onclick={copyBoilerplate}>
							{#if copied}
								<Check class="h-3.5 w-3.5 text-lime-600 dark:text-lime-400" />
								Copied
							{:else}
								<Copy class="h-3.5 w-3.5" />
								Copy
							{/if}
						</button>
					</div>
				</div>
				<dl
					class="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60"
				>
					{#each facts as fact (fact.label)}
						<div class="bg-card p-4">
							<dt class="text-xs text-muted-foreground">{fact.label}</dt>
							<dd class="mt-1 text-sm font-medium text-foreground">
								{#if fact.href}
									<a
										href={fact.href}
										target="_blank"
										rel="noreferrer"
										class="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
									>
										{fact.value}
									</a>
								{:else}
									{fact.value}
								{/if}
							</dd>
						</div>
					{/each}
				</dl>
			</div>
			<p class="mt-3 text-xs text-muted-foreground">Numbers updated {data.stats.updated}.</p>

			<ul class="mt-8 grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 sm:grid-cols-2 lg:grid-cols-3">
				{#each repos as repo (repo.name)}
					<li class="bg-card">
						<a
							href="https://github.com/{repo.name}"
							target="_blank"
							rel="noreferrer"
							class="group flex h-full flex-col p-4 transition-colors hover:bg-muted/40"
						>
							<span
								class="font-mono text-sm font-medium text-foreground group-hover:text-lime-600 dark:group-hover:text-lime-400"
								>{repo.name}</span
							>
							<span class="mt-1 text-xs text-muted-foreground">{repo.blurb}</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<section class="border-b border-border/60 py-14 sm:py-16">
		<div class="mx-auto max-w-5xl px-6 lg:px-8">
			<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Product</h2>
			<p class="mt-4 max-w-2xl text-pretty leading-7 text-muted-foreground">
				The session from the home page, with the styles you pick. Every line is Vale's own output
				over the same two files; nothing is typed in. Download it as it stands, for a slide or a
				post.
			</p>

			<div
				class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-border/60 bg-card px-5 py-4 text-sm"
			>
				<span class="font-medium text-foreground">Styles</span>
				{#each demoStyles as style (style.name)}
					<label class="inline-flex cursor-pointer items-center gap-2">
						<input
							type="checkbox"
							bind:checked={style.on}
							class="h-4 w-4 rounded border-input text-lime-600 focus:ring-lime-500 dark:text-lime-400"
						/>
						<span class="font-mono text-[13px]">{style.name}</span>
						<span class="text-xs text-muted-foreground">{style.note}</span>
					</label>
				{/each}
				<label class="ml-auto inline-flex items-center gap-2">
					<span class="font-medium text-foreground">Minimum level</span>
					<select
						bind:value={minLevel}
						class="h-8 rounded-md border-input bg-background py-0 pl-2 pr-8 font-mono text-[13px] focus:ring-lime-500"
					>
						<option value="suggestion">suggestion</option>
						<option value="warning">warning</option>
						<option value="error">error</option>
					</select>
				</label>
			</div>

			<div class="mt-4">
				<Terminal files={demoFiles} packages={demoPackages} />
			</div>

			<div class="mt-3 flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
				<span class="text-xs text-muted-foreground">Exports follow the page's theme.</span>
				<div class="flex items-center gap-1.5">
					<button type="button" class={button} onclick={() => exportDemo('svg')}>
						<Download class="h-3.5 w-3.5" />
						SVG
					</button>
					<button type="button" class={button} onclick={() => exportDemo('png')}>
						<Download class="h-3.5 w-3.5" />
						PNG
					</button>
				</div>
			</div>
		</div>
	</section>

	<section class="border-b border-border/60 py-14 sm:py-16">
		<div class="mx-auto max-w-5xl px-6 lg:px-8">
			<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Getting it right</h2>
			<p class="mt-4 max-w-2xl text-pretty leading-7 text-muted-foreground">
				The name is <em>Vale</em>, capital V, and <code class="font-mono text-[13px]">vale</code>
				when you mean the command. Not VALE, and not Vale.sh. Below, the claims that keep coming back,
				each with the sentence to use instead.
			</p>
			<ul class="mt-8 grid gap-4 md:grid-cols-2">
				{#each corrections as item (item.claim)}
					<li class="rounded-2xl border border-border/60 bg-card p-5">
						<p
							class="text-sm font-medium text-muted-foreground line-through decoration-destructive/60"
						>
							{item.claim}
						</p>
						<p class="mt-2 text-sm leading-6 text-foreground">{item.fact}</p>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<section class="border-b border-border/60 py-14 sm:py-16">
		<div class="mx-auto max-w-5xl px-6 lg:px-8">
			<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Glossary</h2>
			<p class="mt-4 max-w-2xl text-pretty leading-7 text-muted-foreground">
				The words the project uses for its own parts. The
				<a href="https://docs.vale.sh" target="_blank" rel="noreferrer" class={link}
					>documentation</a
				>
				has the full definitions.
			</p>
			<dl class="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
				{#each glossary as entry (entry.term)}
					<div class="border-l-2 border-lime-500/40 pl-4">
						<dt class="text-sm font-semibold text-foreground">{entry.term}</dt>
						<dd class="mt-1 text-sm leading-6 text-muted-foreground">{entry.def}</dd>
					</div>
				{/each}
			</dl>
		</div>
	</section>

	<section class="border-b border-border/60 py-14 sm:py-16">
		<div class="mx-auto max-w-5xl px-6 lg:px-8">
			<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Coverage</h2>
			<p class="mt-4 max-w-2xl text-pretty leading-7 text-muted-foreground">
				Recent writing and talks about Vale. The library holds all of it, searchable.
			</p>
			{#if book}
				<a
					href={book.url}
					target="_blank"
					rel="noreferrer"
					class="group mt-8 flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5 transition-colors hover:border-lime-500/40 sm:flex-row sm:items-center"
				>
					<div class="min-w-0 grow">
						<p class="text-sm text-muted-foreground">{book.outlet} · {book.year}</p>
						<h3 class="mt-0.5 text-lg font-semibold tracking-tight">{book.title}</h3>
						{#if book.author}
							<p class="mt-1 text-sm text-muted-foreground">by {book.author}</p>
						{/if}
					</div>
					<span
						class="inline-flex w-fit shrink-0 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border"
						>Book</span
					>
					<ArrowUpRight
						class="hidden h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-lime-600 dark:group-hover:text-lime-400 sm:block"
					/>
				</a>
			{/if}
			<ul class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{#each coverage as item (item.url)}
					<li>
						<a
							href={item.url}
							target="_blank"
							rel="noreferrer"
							class="group flex h-full flex-col rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-lime-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
						>
							<div class="flex items-start justify-between gap-3">
								<p class="text-sm text-muted-foreground">
									{item.outlet}{item.year ? ` · ${item.year}` : ''}
								</p>
								<ArrowUpRight
									class="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-lime-600 dark:group-hover:text-lime-400"
								/>
							</div>
							<h3 class="mt-1 grow text-sm font-semibold leading-6 tracking-tight text-foreground">
								{item.title}
							</h3>
							<span
								class="mt-3 inline-flex w-fit rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border"
							>
								{typeLabel[item.type] ?? item.type}
							</span>
						</a>
					</li>
				{/each}
			</ul>
			<div class="mt-6">
				<a
					href="/library"
					class="inline-flex items-center gap-1.5 text-sm font-medium text-lime-600 hover:underline dark:text-lime-400"
				>
					Browse the library
					<ArrowRight class="h-4 w-4" />
				</a>
			</div>

			<!-- The library is community-maintained: one JSON entry per item, by pull request. -->
			<div
				class="mt-8 flex flex-col gap-5 rounded-2xl border border-lime-500/30 bg-lime-500/5 p-6 sm:flex-row sm:items-center sm:justify-between"
			>
				<div class="max-w-xl">
					<h3 class="text-base font-semibold text-foreground">Written or spoken about Vale?</h3>
					<p class="mt-1.5 text-sm leading-6 text-muted-foreground">
						Add it to the library. It is one entry in a JSON file, by pull request, and the README
						shows the fields. Posts, talks, videos, papers, and newsletters all count.
					</p>
				</div>
				<div class="flex shrink-0 flex-wrap gap-2">
					<a
						href="https://github.com/errata-ai/vale.sh/edit/svelte/src/lib/data/press.json"
						target="_blank"
						rel="noreferrer"
						class="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
					>
						Add an entry
						<ArrowUpRight class="h-4 w-4" />
					</a>
					<a
						href="https://github.com/errata-ai/vale.sh#add-a-post-talk-or-video"
						target="_blank"
						rel="noreferrer"
						class="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
					>
						The fields
						<ArrowUpRight class="h-4 w-4" />
					</a>
				</div>
			</div>
		</div>
	</section>

	<section class="bg-muted/35 py-14 sm:py-16">
		<div class="mx-auto max-w-5xl px-6 lg:px-8">
			<div class="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
				<div>
					<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Contact</h2>
					<p class="mt-4 text-pretty leading-7 text-muted-foreground">
						Vale is built and maintained by
						<a href={siteConfig.links.jdkato} target="_blank" rel="noreferrer" class={link}
							>Joseph Kato</a
						>. For a quote, a correction, or a question the pages don’t answer, the fastest route is
						an issue or a message on Discord.
					</p>
				</div>
				<div class="rounded-2xl border border-border/60 bg-background p-6">
					<div class="flex flex-wrap gap-2">
						<a href={siteConfig.links.discord} target="_blank" rel="noreferrer" class={button}>
							Discord
							<ArrowUpRight class="h-3.5 w-3.5" />
						</a>
						<a
							href="https://github.com/errata-ai/vale.sh/issues"
							target="_blank"
							rel="noreferrer"
							class={button}
						>
							Open an issue
							<ArrowUpRight class="h-3.5 w-3.5" />
						</a>
						<a href={siteConfig.links.twitter} target="_blank" rel="noreferrer" class={button}>
							X
							<ArrowUpRight class="h-3.5 w-3.5" />
						</a>
					</div>
				</div>
			</div>
		</div>
	</section>
</article>
