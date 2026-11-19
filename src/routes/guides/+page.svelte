<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import Search from 'lucide-svelte/icons/search';
	import { topics } from '$lib/tools/topics';

	let { data } = $props();

	const title = $derived(
		`Style Guide Explorer: ${data.totals.guides} Open Style Guides, Side by Side`
	);
	const description = $derived(
		`Explore ${data.totals.guides} open style guides from Google, Microsoft, GitLab, Red Hat, GOV.UK, and others: ${data.totals.rules} rules and ${data.totals.distinct.toLocaleString('en-US')} terms, by topic, and what each guide says about any word.`
	);
	const url = 'https://vale.sh/guides';
	const fmt = new Intl.NumberFormat('en-US');

	const jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Dataset',
			name: 'Open style guides as rules',
			description,
			url,
			creator: { '@type': 'Organization', name: 'Vale', url: 'https://vale.sh' },
			hasPart: data.cards.map((c) => ({
				'@type': 'CreativeWork',
				name: c.full,
				url: `${url}/${c.id}`
			}))
		}).replace(/</g, '\\u003c')
	);

	/* ---- Term lookup -------------------------------------------------------- */

	type Hit = { find: string; use: string; rule: string; level: number; guide: string };

	const LEVELS = ['suggestion', 'warning', 'error'];
	const TONES = ['sky', 'amber', 'rose'];
	const EXAMPLES = [
		'blacklist',
		'e.g.',
		'leverage',
		'simply',
		'click',
		'please',
		'utilize',
		'master'
	];

	let query = $state('');
	let all = $state<Hit[] | null>(null);
	let loading = false;

	/** The term list is one 260 KB file, fetched the first time it is needed. */
	function load() {
		if (all || loading) return;
		loading = true;
		import('$lib/data/guide-terms.json').then((m) => {
			const packed = m.default as unknown as {
				guides: string[];
				rows: [string, string, string, number, number][];
			};
			all = packed.rows.map(([find, use, rule, level, g]) => ({
				find,
				use,
				rule,
				level,
				guide: packed.guides[g]
			}));
		});
	}

	const q = $derived(query.trim().toLowerCase());

	/** Exact matches first, then terms that start with or contain the query. */
	const results = $derived.by(() => {
		if (!all || q.length < 2) return null;
		const rank = (h: Hit) => {
			const t = h.find.toLowerCase();
			return t === q ? 0 : t.startsWith(q) ? 1 : t.includes(q) ? 2 : 3;
		};
		const hits = all.filter((h) => rank(h) < 3).sort((a, b) => rank(a) - rank(b));

		// One block per term, each listing the guides that rule on it.
		const byTerm = new Map<string, { term: string; exact: boolean; hits: Hit[] }>();
		for (const h of hits) {
			const key = h.find.toLowerCase();
			if (!byTerm.has(key)) byTerm.set(key, { term: h.find, exact: key === q, hits: [] });
			const block = byTerm.get(key)!;
			if (!block.hits.some((x) => x.guide === h.guide)) block.hits.push(h);
		}
		return [...byTerm.values()]
			.sort((a, b) => Number(b.exact) - Number(a.exact) || b.hits.length - a.hits.length)
			.slice(0, 12);
	});

	function ask(term: string) {
		query = term;
		load();
	}

	/* ---- The matrix --------------------------------------------------------- */

	const most = $derived(Math.max(...data.cards.flatMap((c) => c.fingerprint)));
	/** Opacity for a cell: a square-root scale, so 2 rules still shows beside 20. */
	const shade = (n: number) => (n ? 0.14 + 0.86 * Math.sqrt(n / most) : 0);

	const kinds = $derived([...new Set(data.cards.map((c) => c.kind))]);
</script>

<MetaTags
	{title}
	{description}
	canonical={url}
	openGraph={{ url, title, description, type: 'website' }}
	twitter={{ cardType: 'summary_large_image' }}
/>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<script type="application/ld+json">${jsonLd}</` + `script>`}
</svelte:head>

<div class="mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8">
	<header class="max-w-3xl">
		<p
			class="font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-lime-600 dark:text-lime-400"
		>
			Style guide explorer
		</p>
		<h1 class="mt-4 text-balance text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
			{data.totals.guides} open style guides, side by side
		</h1>
		<p class="mt-5 text-pretty text-lg leading-8 text-foreground/85">
			What Google, Microsoft, GitLab, Red Hat, GOV.UK, and others tell their writers to do, read out
			of the rules each one publishes. Browse a guide by topic, or look up a word and see what every
			guide says about it.
		</p>
		<dl class="mt-8 flex flex-wrap gap-x-10 gap-y-4">
			{#each [{ n: data.totals.guides, l: 'guides' }, { n: data.totals.rules, l: 'rules' }, { n: data.totals.distinct, l: 'distinct terms' }] as s (s.l)}
				<div>
					<dd class="text-3xl font-medium tabular-nums tracking-tight">{fmt.format(s.n)}</dd>
					<dt class="text-sm text-muted-foreground">{s.l}</dt>
				</div>
			{/each}
		</dl>
	</header>

	<!-- Look up a word -->
	<section class="mt-14" aria-labelledby="lookup">
		<h2 id="lookup" class="text-2xl font-medium tracking-tight">What do the guides say about…</h2>
		<div class="relative mt-4 max-w-2xl">
			<Search
				class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
				aria-hidden="true"
			/>
			<input
				type="search"
				bind:value={query}
				onfocus={load}
				oninput={load}
				placeholder="a word or phrase"
				aria-label="Look up a word or phrase"
				autocomplete="off"
				spellcheck="false"
				class="w-full rounded-2xl border border-border bg-card py-3.5 pl-12 pr-4 text-lg shadow-sm placeholder:text-muted-foreground/60 focus:border-lime-500/60 focus:outline-none focus:ring-2 focus:ring-lime-500/30"
			/>
		</div>
		<div class="mt-3 flex flex-wrap items-center gap-1.5 text-sm">
			<span class="mr-1 text-muted-foreground">Try</span>
			{#each EXAMPLES as ex (ex)}
				<button
					type="button"
					onclick={() => ask(ex)}
					class="rounded-full border border-border bg-card px-2.5 py-0.5 transition-colors hover:border-lime-500/50 hover:bg-lime-500/10"
				>
					{ex}
				</button>
			{/each}
		</div>

		<div class="mt-6" aria-live="polite">
			{#if q.length >= 2 && !all}
				<p class="text-sm text-muted-foreground">Loading the term list…</p>
			{:else if results && results.length === 0}
				<p class="text-sm text-muted-foreground">
					None of the {data.totals.guides} guides has a rule that names “{query.trim()}”. That
					doesn’t mean they approve of it, only that no rule lists it.
				</p>
			{:else if results}
				<div class="space-y-4">
					{#each results as block (block.term)}
						<article class="overflow-hidden rounded-2xl border border-border bg-card">
							<header
								class="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/70 px-5 py-3"
							>
								<h3 class="text-lg font-medium">“{block.term}”</h3>
								<p class="text-sm text-muted-foreground">
									{block.hits.length} of {data.totals.guides} guides have a rule about it
								</p>
							</header>
							<ul class="divide-y divide-border/70">
								{#each block.hits as h (h.guide)}
									<li
										class="vt-{TONES[
											h.level
										]} grid grid-cols-[7rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1 px-5 py-2.5 text-sm sm:grid-cols-[8rem_minmax(0,1fr)_auto]"
									>
										<a href="/guides/{h.guide}" class="font-medium hover:underline"
											>{data.names[h.guide]}</a
										>
										<span class="min-w-0">
											{#if h.use}
												<span class="text-muted-foreground">Write</span>
												<span class="font-medium">{h.use}</span>
											{:else}
												<span class="text-foreground/85">Avoid it</span>
											{/if}
										</span>
										<span
											class="col-start-2 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground sm:col-start-3"
										>
											<span class="h-1.5 w-1.5 rounded-full" style="background: hsl(var(--vt))"
											></span>
											{h.rule} · {LEVELS[h.level]}
										</span>
									</li>
								{/each}
							</ul>
						</article>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<!-- The matrix -->
	<section class="mt-16" aria-labelledby="matrix">
		<h2 id="matrix" class="text-2xl font-medium tracking-tight">Where each guide puts its rules</h2>
		<p class="mt-3 max-w-2xl leading-7 text-foreground/85">
			Each square is a guide’s rules on one topic, darker for more. Read across to see what a guide
			cares about, and down to see which guides bother with a topic at all.
		</p>
		<div class="mt-6 overflow-x-auto rounded-2xl border border-border bg-card p-4 sm:p-5">
			<table class="w-full min-w-[46rem] border-separate border-spacing-1 text-sm">
				<thead>
					<tr>
						<th scope="col" class="w-36 text-left text-xs font-medium text-muted-foreground"
							>Guide</th
						>
						{#each topics as t (t.id)}
							<th
								scope="col"
								class="px-1 pb-1 text-center align-bottom text-[11px] font-medium leading-tight text-muted-foreground"
								>{t.label}</th
							>
						{/each}
						<th scope="col" class="pl-2 text-right text-xs font-medium text-muted-foreground"
							>Rules</th
						>
					</tr>
				</thead>
				<tbody>
					{#each data.cards as c (c.id)}
						<tr>
							<th scope="row" class="whitespace-nowrap pr-2 text-left font-medium">
								<a href="/guides/{c.id}" class="hover:underline">{c.name}</a>
							</th>
							{#each c.fingerprint as n, i (i)}
								<td class="p-0">
									{#if n}
										<a
											href="/guides/{c.id}#{topics[i].id}"
											title="{c.name}: {n} rule{n === 1 ? '' : 's'} on {topics[
												i
											].label.toLowerCase()}"
											class="flex h-9 items-center justify-center rounded-md text-xs tabular-nums transition-transform hover:scale-105"
											style="background: hsl(var(--primary) / {shade(n)}); color: hsl(var(--{shade(
												n
											) > 0.55
												? 'primary-foreground'
												: 'foreground'}))"
										>
											{n}
										</a>
									{:else}
										<!-- No rules here, so nothing on the guide's page to link to. -->
										<span
											class="block h-9 rounded-md bg-muted/40"
											title="{c.name}: no rules on {topics[i].label.toLowerCase()}"
										></span>
									{/if}
								</td>
							{/each}
							<td class="pl-2 text-right tabular-nums text-muted-foreground">{c.rules}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<!-- The guides -->
	<section class="mt-16" aria-labelledby="guides">
		<h2 id="guides" class="text-2xl font-medium tracking-tight">The guides</h2>
		{#each kinds as kind (kind)}
			<h3 class="mt-8 text-sm font-medium text-muted-foreground">
				{kind === 'Company'
					? 'Companies'
					: kind === 'Government'
						? 'Government'
						: 'Open-source projects'}
			</h3>
			<ul class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.cards.filter((c) => c.kind === kind) as c (c.id)}
					<li class="flex">
						<a
							href="/guides/{c.id}"
							class="group flex w-full flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-lime-500/40"
						>
							<div class="flex items-start justify-between gap-3">
								<div>
									<h4 class="text-lg font-medium">{c.name}</h4>
									<p class="mt-0.5 text-sm text-muted-foreground">{c.full}</p>
								</div>
								<ArrowRight
									class="mt-1.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
									aria-hidden="true"
								/>
							</div>

							<!-- The guide's shape: rules per topic. -->
							<div class="mt-5 flex h-10 items-end gap-1" aria-hidden="true">
								{#each c.fingerprint as n, i (i)}
									<span
										class="flex-1 rounded-sm {n ? 'bg-lime-500' : 'bg-muted'}"
										style="height: {n ? Math.max(12, (n / Math.max(...c.fingerprint)) * 100) : 6}%"
										title="{topics[i].label}: {n}"
									></span>
								{/each}
							</div>

							<dl class="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
								<div class="flex gap-1.5">
									<dd class="font-medium tabular-nums">{c.rules}</dd>
									<dt class="text-muted-foreground">rules</dt>
								</div>
								<div class="flex gap-1.5">
									<dd class="font-medium tabular-nums">{fmt.format(c.terms)}</dd>
									<dt class="text-muted-foreground">terms</dt>
								</div>
								{#if c.usedBy}
									<div class="flex gap-1.5">
										<dd class="font-medium tabular-nums">{c.usedBy}</dd>
										<dt class="text-muted-foreground">public configs</dt>
									</div>
								{/if}
							</dl>
						</a>
					</li>
				{/each}
			</ul>
		{/each}
	</section>

	<!-- Agreement and disagreement -->
	<section class="mt-16 grid gap-10 lg:grid-cols-2" aria-label="Agreement">
		<div>
			<h2 class="text-2xl font-medium tracking-tight">What most guides agree on</h2>
			<p class="mt-3 leading-7 text-foreground/85">
				The terms the most guides have a rule about, with the replacement when at least half of them
				give the same one. Select a term to see each guide’s answer.
			</p>
			<ul class="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
				{#each data.shared as s (s.term)}
					<li class="flex items-baseline gap-3 px-4 py-2.5 text-sm">
						<button
							type="button"
							class="min-w-0 flex-1 truncate text-left hover:underline"
							onclick={() => {
								ask(s.term);
								document.getElementById('lookup')?.scrollIntoView({ behavior: 'smooth' });
							}}
						>
							<span class="text-foreground/70 line-through decoration-1">{s.term}</span>
							{#if s.use}
								<span class="mx-1 text-muted-foreground">→</span>
								<span class="font-medium">{s.use}</span>
							{:else}
								<span class="ml-2 text-muted-foreground">avoid, or it depends on the guide</span>
							{/if}
						</button>
						<span class="shrink-0 tabular-nums text-muted-foreground">{s.count} guides</span>
					</li>
				{/each}
			</ul>
		</div>

		<div>
			<h2 class="text-2xl font-medium tracking-tight">Where they contradict each other</h2>
			<p class="mt-3 leading-7 text-foreground/85">
				Cases where one guide’s fix is another guide’s error: the same two wordings, preferred in
				opposite directions.
			</p>
			<ul class="mt-5 space-y-3">
				{#each data.splits as split, i (i)}
					<li class="rounded-2xl border border-border bg-card p-4 text-sm">
						<div class="flex flex-wrap gap-1.5">
							{#each split.pairs.slice(0, 5) as p (p.a + p.b)}
								<span class="rounded-md bg-muted px-2 py-0.5">
									{p.a} <span class="text-muted-foreground">or</span>
									{p.b}
								</span>
							{/each}
							{#if split.pairs.length > 5}
								<span class="px-1 py-0.5 text-muted-foreground">+{split.pairs.length - 5} more</span
								>
							{/if}
						</div>
						<dl class="mt-3 grid gap-2 sm:grid-cols-2">
							<div>
								<dt class="text-xs text-muted-foreground">
									Write “{split.pairs[0].b}”
								</dt>
								<dd class="mt-0.5 font-medium">
									{split.prefer.map((g) => data.names[g]).join(', ')}
								</dd>
							</div>
							<div>
								<dt class="text-xs text-muted-foreground">
									Write “{split.pairs[0].a}”
								</dt>
								<dd class="mt-0.5 font-medium">
									{split.avoid.map((g) => data.names[g]).join(', ')}
								</dd>
							</div>
						</dl>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<!-- Method -->
	<section class="mt-16 max-w-3xl">
		<h2 class="text-2xl font-medium tracking-tight">How this is built</h2>
		<p class="mt-4 leading-7 text-foreground/85">
			Each of these organizations publishes its style guide as rules for
			<a
				href="/"
				class="font-medium text-foreground underline decoration-lime-500 decoration-2 underline-offset-4"
				>Vale</a
			>, an open-source linter for prose. A rule is small and exact: flag this word, suggest that
			one, at this severity, for this reason. Read together, a guide’s rules are a picture of what
			the guide asks for, and that is what this explorer draws. Nothing here was summarized by hand.
		</p>
		<p class="mt-4 leading-7 text-foreground/85">
			That also sets its limits. A guide’s advice that nobody wrote a rule for isn’t here, and
			“terms” counts only rules that name plain words, so a guide written mostly as patterns looks
			smaller than it is. Each guide’s page names the repository, the commit it was read at, and its
			license.
		</p>
		<p class="mt-4 leading-7 text-foreground/85">
			“Public configs” is how many of {data.sampleSize} sampled open-source Vale configurations use that
			guide’s rules.
			<a
				href="/adopters"
				class="font-medium text-foreground underline decoration-lime-500 decoration-2 underline-offset-4"
				>See who uses Vale</a
			>.
		</p>
	</section>
</div>

<style>
	/* The severity hues, shared with the editor's highlights. */
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
