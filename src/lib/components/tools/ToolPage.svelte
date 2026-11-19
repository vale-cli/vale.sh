<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import ShieldCheck from 'lucide-svelte/icons/shield-check';
	import { otherTools, type Tool } from '$lib/tools';
	import type { Snippet } from 'svelte';

	/**
	 * The frame every page under /tools shares.
	 *
	 * These pages are found by search, by people who have never heard of Vale
	 * and want a word count. So the order is fixed: the name of the thing and
	 * the tool itself come first, with nothing to scroll past; the explanation,
	 * the questions people ask, and the other tools come after. Vale is one
	 * line at the end, for the reader who wants this on every draft.
	 *
	 * The structured data is what lets a search result show the questions and
	 * the breadcrumb, so `faq` here is both the visible section and its markup:
	 * one list, and the two can't disagree.
	 */
	let {
		tool,
		lede,
		faq,
		wide = false,
		children,
		about
	}: {
		tool: Tool;
		/** One or two sentences under the title. What it does, plainly. */
		lede: string;
		faq: { q: string; a: string }[];
		/** Use the wider column, for a tool that is a table. */
		wide?: boolean;
		/** The tool. */
		children: Snippet;
		/** The explanation under it: how it works, what the numbers mean. */
		about?: Snippet;
	} = $props();

	const url = $derived(`https://vale.sh/tools/${tool.slug}`);
	const rest = $derived(otherTools(tool.slug));

	const jsonLd = $derived(
		JSON.stringify([
			{
				'@context': 'https://schema.org',
				'@type': 'WebApplication',
				name: tool.title,
				url,
				description: tool.description,
				applicationCategory: 'UtilitiesApplication',
				operatingSystem: 'Any',
				browserRequirements: 'Requires JavaScript',
				isAccessibleForFree: true,
				offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
				publisher: { '@type': 'Organization', name: 'Vale', url: 'https://vale.sh' }
			},
			{
				'@context': 'https://schema.org',
				'@type': 'BreadcrumbList',
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Vale', item: 'https://vale.sh' },
					{ '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://vale.sh/tools' },
					{ '@type': 'ListItem', position: 3, name: tool.title, item: url }
				]
			},
			{
				'@context': 'https://schema.org',
				'@type': 'FAQPage',
				mainEntity: faq.map((f) => ({
					'@type': 'Question',
					name: f.q,
					acceptedAnswer: { '@type': 'Answer', text: f.a }
				}))
			}
			// A closing script tag inside an answer would end the block early.
		]).replace(/</g, '\\u003c')
	);

	const width = $derived(wide ? 'max-w-6xl' : 'max-w-4xl');
</script>

<MetaTags
	title={tool.metaTitle}
	description={tool.description}
	canonical={url}
	openGraph={{ url, title: tool.metaTitle, description: tool.description, type: 'website' }}
	twitter={{ cardType: 'summary_large_image' }}
/>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<script type="application/ld+json">${jsonLd}</` + `script>`}
</svelte:head>

<article>
	<header class="mx-auto px-6 pt-8 lg:px-8 {width}">
		<nav aria-label="Breadcrumb" class="flex items-center gap-1.5 text-sm text-muted-foreground">
			<a href="/tools" class="transition-colors hover:text-foreground">Tools</a>
			<ChevronRight class="h-3.5 w-3.5" aria-hidden="true" />
			<span class="text-foreground">{tool.name}</span>
		</nav>

		<h1 class="mt-5 text-balance text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
			{tool.title}
		</h1>
		<p class="mt-3 max-w-2xl text-pretty leading-7 text-foreground/85">{lede}</p>
	</header>

	<div class="mx-auto px-6 pb-14 pt-6 lg:px-8 {width}">
		{@render children()}

		<p class="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
			<ShieldCheck
				class="h-3.5 w-3.5 shrink-0 text-lime-600 dark:text-lime-400"
				aria-hidden="true"
			/>
			Runs in your browser. Your text is never uploaded or stored on a server.
		</p>
	</div>

	{#if about}
		<section class="border-t border-border">
			<div class="tool-prose mx-auto max-w-4xl px-6 py-14 lg:px-8">
				{@render about()}
			</div>
		</section>
	{/if}

	<section class="border-t border-border">
		<div class="mx-auto max-w-4xl px-6 py-14 lg:px-8">
			<h2 class="text-2xl font-medium tracking-tight">Questions</h2>
			<dl class="mt-8 divide-y divide-border border-y border-border">
				{#each faq as item (item.q)}
					<div class="py-5">
						<dt class="font-medium text-foreground">{item.q}</dt>
						<dd class="mt-2 leading-7 text-foreground/85">{item.a}</dd>
					</div>
				{/each}
			</dl>
		</div>
	</section>

	<section class="border-t border-border bg-muted">
		<div class="mx-auto max-w-6xl px-6 py-14 lg:px-8">
			<h2
				class="font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-lime-600 dark:text-lime-400"
			>
				More writing tools
			</h2>
			<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
				{#each rest as other (other.slug)}
					{@const Icon = other.icon}
					<a
						href="/tools/{other.slug}"
						class="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-lime-500/40"
					>
						<Icon class="h-5 w-5 text-lime-600 dark:text-lime-400" aria-hidden="true" />
						<h3 class="font-medium text-foreground">{other.name}</h3>
						<p class="text-sm leading-relaxed text-foreground/85">{other.blurb}</p>
					</a>
				{/each}
			</div>

			<p class="mt-10 max-w-2xl text-sm leading-6 text-foreground/85">
				These tools come from
				<a
					href="/"
					class="font-medium text-foreground underline decoration-lime-500 decoration-2 underline-offset-4"
					>Vale</a
				>, the open-source linter that checks writing against a style guide on every commit.
				<a
					href="https://docs.vale.sh/topics/quickstart"
					class="inline-flex items-center gap-1 font-medium text-foreground underline decoration-lime-500 decoration-2 underline-offset-4"
				>
					Set it up
					<ArrowRight class="h-3.5 w-3.5" aria-hidden="true" />
				</a>
			</p>
		</div>
	</section>
</article>

<style>
	/* The explanation is written as plain headings and paragraphs on each page;
	   this is their type, kept here so five pages can't drift apart. */
	.tool-prose :global(h2) {
		font-size: 1.5rem;
		line-height: 2rem;
		font-weight: 500;
		letter-spacing: -0.025em;
	}
	.tool-prose :global(h2:not(:first-child)) {
		margin-top: 3rem;
	}
	.tool-prose :global(h3) {
		margin-top: 2rem;
		font-weight: 500;
	}
	.tool-prose :global(p),
	.tool-prose :global(ul),
	.tool-prose :global(ol) {
		margin-top: 1rem;
		max-width: 42rem;
		line-height: 1.75rem;
		color: hsl(var(--foreground) / 0.85);
	}
	.tool-prose :global(ul) {
		list-style: disc;
		padding-left: 1.25rem;
	}
	.tool-prose :global(ol) {
		list-style: decimal;
		padding-left: 1.25rem;
	}
	.tool-prose :global(li) {
		margin-top: 0.375rem;
	}
	.tool-prose :global(a) {
		font-weight: 500;
		color: hsl(var(--foreground));
		text-decoration: underline;
		text-decoration-color: hsl(var(--primary));
		text-decoration-thickness: 2px;
		text-underline-offset: 4px;
	}
	.tool-prose :global(strong) {
		font-weight: 500;
		color: hsl(var(--foreground));
	}
</style>
