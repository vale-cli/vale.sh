<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import { ruleTitle } from '$lib/tools/topics';

	let { data } = $props();
	const term = $derived(data.term);

	const TONES: Record<string, string> = { suggestion: 'sky', warning: 'amber', error: 'rose' };
	// US style: a period or comma goes inside the closing quote.
	const quote = (s: string, end = '') => `“${s}${end}”`;
	const name = $derived(term.variants[0]);
	const spellings = $derived(term.variants.map((v) => quote(v)).join(' or '));
	const ruled = $derived(new Set(term.rulings.map((r) => r.guide)).size);
	const top = $derived(term.answers[0]);

	/** The page's answer, in a sentence. Also its description and its FAQ. */
	const verdict = $derived.by(() => {
		const last = term.variants.length - 1;
		const named = term.variants.map((v, i) => quote(v, i === last ? '.' : '')).join(' or ');
		const lead = `${ruled} of ${data.total} open style guides have a rule about ${named}`;
		if (term.verdict === 'avoid') {
			return `${lead} None of them names a replacement: the advice is to cut it or rephrase.`;
		}
		if (term.verdict === 'agree') {
			const n = top.guides.length;
			return `${lead} ${n === ruled ? (n === 2 ? 'Both' : `All ${n}`) : `${n} of them`} say to write ${quote(top.use)} instead.`;
		}
		return `${lead} They don’t agree on what to write instead: ${top.guides.length} say ${quote(top.use, ',')} and the rest give ${term.answers.length - 1 === 1 ? 'a different answer' : 'other answers'}.`;
	});

	const title = $derived(
		term.verdict === 'agree'
			? `${quote(name)} or ${quote(top.use)}? What ${ruled} Style Guides Say`
			: `${quote(name)}: What ${ruled} Style Guides Say`
	);
	const url = $derived(`https://vale.sh/guides/term/${term.slug}`);

	const jsonLd = $derived(
		JSON.stringify([
			{
				'@context': 'https://schema.org',
				'@type': 'FAQPage',
				mainEntity: [
					{
						'@type': 'Question',
						name: `What do style guides say about ${quote(name)}?`,
						acceptedAnswer: { '@type': 'Answer', text: verdict }
					}
				]
			},
			{
				'@context': 'https://schema.org',
				'@type': 'BreadcrumbList',
				itemListElement: [
					{
						'@type': 'ListItem',
						position: 1,
						name: 'Style guides',
						item: 'https://vale.sh/guides'
					},
					{
						'@type': 'ListItem',
						position: 2,
						name: 'Terms',
						item: 'https://vale.sh/guides/terms'
					},
					{ '@type': 'ListItem', position: 3, name, item: url }
				]
			}
		]).replace(/</g, '\\u003c')
	);
</script>

<MetaTags
	{title}
	description={verdict}
	canonical={url}
	openGraph={{ url, title, description: verdict, type: 'article' }}
	twitter={{ cardType: 'summary_large_image' }}
/>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<script type="application/ld+json">${jsonLd}</` + `script>`}
</svelte:head>

<article class="mx-auto max-w-4xl px-6 pb-20 pt-8 lg:px-8">
	<nav aria-label="Breadcrumb" class="flex items-center gap-1.5 text-sm text-muted-foreground">
		<a href="/guides" class="transition-colors hover:text-foreground">Style guides</a>
		<ChevronRight class="h-3.5 w-3.5" aria-hidden="true" />
		<a href="/guides/terms" class="transition-colors hover:text-foreground">Terms</a>
		<ChevronRight class="h-3.5 w-3.5" aria-hidden="true" />
		<span class="truncate text-foreground">{name}</span>
	</nav>

	<header class="mt-6">
		<p
			class="font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-lime-600 dark:text-lime-400"
		>
			What the style guides say
		</p>
		<h1 class="mt-3 text-balance text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
			{spellings}
		</h1>
		<p class="mt-5 max-w-2xl text-pretty text-lg leading-8 text-foreground/85">{verdict}</p>
	</header>

	<!-- The answer -->
	<section class="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6" aria-label="Answer">
		{#if term.verdict === 'avoid'}
			<p class="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
				The advice
			</p>
			<p class="mt-2 text-2xl font-medium tracking-tight">Leave it out, or rephrase</p>
		{:else}
			<p class="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
				{term.verdict === 'agree' ? 'Write this instead' : 'What to write instead, by guide'}
			</p>
			<ul class="mt-3 space-y-3">
				{#each term.answers as a (a.use)}
					<li>
						<div class="flex items-baseline justify-between gap-3">
							<span class="text-xl font-medium tracking-tight">{a.use}</span>
							<span class="shrink-0 text-sm tabular-nums text-muted-foreground">
								{a.guides.length} guide{a.guides.length === 1 ? '' : 's'}
							</span>
						</div>
						<div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
							<div
								class="h-full rounded-full bg-lime-500"
								style="width: {(a.guides.length / ruled) * 100}%"
							></div>
						</div>
						<p class="mt-1.5 text-sm text-muted-foreground">{a.guides.join(', ')}</p>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<!-- Guide by guide -->
	<section class="mt-12" aria-labelledby="rulings">
		<h2 id="rulings" class="text-2xl font-medium tracking-tight">Guide by guide</h2>
		<ul
			class="mt-4 divide-y divide-border/70 overflow-hidden rounded-2xl border border-border bg-card"
		>
			{#each term.rulings as r (r.guide + r.find)}
				<li
					class="vt-{TONES[
						r.level
					]} grid grid-cols-[7rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1 px-5 py-3 text-sm sm:grid-cols-[9rem_minmax(0,1fr)_auto]"
				>
					<a href="/guides/{r.guide}" class="font-medium hover:underline">{r.name}</a>
					<span class="min-w-0">
						{#if term.variants.length > 1}
							<span class="text-foreground/70 line-through decoration-1">{r.find}</span>
							<span class="mx-1 text-muted-foreground">→</span>
						{/if}
						{#if r.use}
							<span class="text-muted-foreground">Write</span>
							<span class="font-medium">{r.use}</span>
						{:else if r.note}
							<span class="text-foreground/85">{r.note}</span>
						{:else}
							<span class="text-foreground/85">Avoid it</span>
						{/if}
					</span>
					<span
						class="col-start-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground sm:col-start-3"
					>
						<span class="h-1.5 w-1.5 rounded-full" style="background: hsl(var(--vt))"></span>
						{ruleTitle(r.rule)} · {r.level}
					</span>
				</li>
			{/each}
		</ul>
		{#if data.silent.length}
			<p class="mt-4 text-sm leading-6 text-muted-foreground">
				No rule names it in
				{#each data.silent as g, i (g.id)}<a href="/guides/{g.id}" class="hover:underline"
						>{g.name}</a
					>{i < data.silent.length - 1 ? ', ' : ''}{/each}. That doesn’t mean those guides approve
				of it, only that no rule lists it.
			</p>
		{/if}
	</section>

	{#if term.endorsed.length}
		<section class="mt-12" aria-labelledby="endorsed">
			<h2 id="endorsed" class="text-2xl font-medium tracking-tight">Guides that ask for it</h2>
			<p class="mt-3 leading-7 text-foreground/85">
				One guide’s fix can be another guide’s error. These rules tell writers to use {quote(name)}.
			</p>
			<ul class="mt-4 space-y-2 text-sm">
				{#each term.endorsed as e (e.guide)}
					<li class="rounded-xl border border-border bg-card px-4 py-2.5">
						<a href="/guides/{e.guide}" class="font-medium hover:underline">{e.name}</a>
						<span class="text-muted-foreground">says to write it instead of</span>
						<span class="font-medium">{e.instead}</span>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if data.related.length}
		<section class="mt-12" aria-labelledby="related">
			<h2 id="related" class="text-2xl font-medium tracking-tight">
				Also replaced with {quote(top.use)}
			</h2>
			<ul class="mt-4 flex flex-wrap gap-2 text-sm">
				{#each data.related as t (t.slug)}
					<li>
						<a
							href="/guides/term/{t.slug}"
							class="inline-block rounded-full border border-border bg-card px-3 py-1 transition-colors hover:border-lime-500/50 hover:bg-lime-500/10"
							>{t.term}</a
						>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<section class="mt-12 max-w-2xl">
		<h2 class="text-2xl font-medium tracking-tight">Catch it in every draft</h2>
		<p class="mt-3 leading-7 text-foreground/85">
			Each line above is a rule one of these organizations publishes for
			<a
				href="/"
				class="font-medium text-foreground underline decoration-lime-500 decoration-2 underline-offset-4"
				>Vale</a
			>, an open-source linter for prose. Install a guide’s rules and Vale flags the term wherever
			it appears, in your editor and on every pull request.
		</p>
	</section>

	<nav class="mt-12 flex items-center justify-between gap-4 border-t border-border pt-6 text-sm">
		{#if data.previous}
			<a href="/guides/term/{data.previous.slug}" class="group inline-flex items-center gap-2">
				<ArrowLeft class="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
				<span class="group-hover:underline">{data.previous.term}</span>
			</a>
		{:else}<span></span>{/if}
		<a href="/guides/terms" class="text-muted-foreground hover:text-foreground">All terms</a>
		{#if data.next}
			<a href="/guides/term/{data.next.slug}" class="group inline-flex items-center gap-2">
				<span class="group-hover:underline">{data.next.term}</span>
				<ArrowRight class="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
			</a>
		{:else}<span></span>{/if}
	</nav>
</article>

<style>
	:global(.vt-rose) {
		--vt: 350 85% 58%;
	}
	:global(.vt-amber) {
		--vt: 38 92% 50%;
	}
	:global(.vt-sky) {
		--vt: 205 90% 52%;
	}
</style>
