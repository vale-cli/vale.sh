<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Search from 'lucide-svelte/icons/search';
	import { topics, type RuleSummary } from '$lib/tools/topics';
	import GuideLogo from '$lib/components/guides/GuideLogo.svelte';

	let { data } = $props();

	const guide = $derived(data.guide);
	/** The guide's rules by topic, leaving out topics it has nothing on. */
	const groups = $derived(
		topics
			.map((t) => ({ ...t, rules: guide.rules.filter((r) => r.topic === t.id) }))
			.filter((t) => t.rules.length)
	);

	const url = $derived(`https://vale.sh/guides/${guide.id}`);
	const title = $derived(`${guide.full}: ${guide.rules.length} Rules, Explored`);
	const description = $derived(
		`Explore the ${guide.full} as ${guide.rules.length} rules across ${groups.length} topics, with ${data.terms.length.toLocaleString('en-US')} terms it flags and what it says to write instead.`
	);

	const LEVELS = ['error', 'warning', 'suggestion'] as const;
	const tone = (level: string) =>
		level === 'error' ? 'rose' : level === 'warning' ? 'amber' : 'sky';
	const quote = (message: string) => message.replace(/'([^']+)'/g, '“$1”');

	const bySeverity = $derived(
		LEVELS.map((level) => ({ level, n: guide.rules.filter((r) => r.level === level).length }))
	);

	let selected = $state<string | null>(null);
	// A new guide shouldn't keep the last one's rule open.
	$effect(() => {
		void guide.id;
		selected = null;
		filter = '';
	});
	const rule = $derived(guide.rules.find((r) => r.id === selected) ?? null);
	const short = (id: string) => id.slice(id.indexOf('.') + 1);

	/** A rule's own terms, for its panel: all of them, not the first few. */
	const ruleTerms = $derived(rule ? data.terms.filter((t) => t.rule === short(rule.id)) : []);

	function open(r: RuleSummary) {
		selected = selected === r.id ? null : r.id;
	}

	/* ---- The word list ------------------------------------------------------ */

	let filter = $state('');
	let shown = $state(60);
	const matches = $derived.by(() => {
		const q = filter.trim().toLowerCase();
		if (!q) return data.terms;
		return data.terms.filter(
			(t) => t.find.toLowerCase().includes(q) || t.use.toLowerCase().includes(q)
		);
	});

	const sourceHost = $derived(guide.guide || guide.guideHost);
	const license: Record<string, string> = {
		MIT: 'https://opensource.org/license/mit',
		'Apache-2.0': 'https://www.apache.org/licenses/LICENSE-2.0',
		'CC-BY-SA-4.0': 'https://creativecommons.org/licenses/by-sa/4.0/'
	};
	const most = $derived(Math.max(1, ...data.overlap.map((o) => o.shared)));
</script>

<MetaTags
	{title}
	{description}
	canonical={url}
	openGraph={{ url, title, description, type: 'article' }}
	twitter={{ cardType: 'summary_large_image' }}
/>

<article class="mx-auto max-w-6xl px-6 pb-20 pt-8 lg:px-8">
	<nav aria-label="Breadcrumb" class="flex items-center gap-1.5 text-sm text-muted-foreground">
		<a href="/guides" class="transition-colors hover:text-foreground">Style guides</a>
		<ChevronRight class="h-3.5 w-3.5" aria-hidden="true" />
		<span class="text-foreground">{guide.name}</span>
	</nav>

	<header class="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
		<div>
			<p
				class="font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-lime-600 dark:text-lime-400"
			>
				{guide.kind}
			</p>
			<h1
				class="mt-3 flex items-center gap-4 text-balance text-4xl font-medium tracking-[-0.03em] sm:text-5xl"
			>
				<GuideLogo id={guide.id} name={guide.name} size="h-10 w-10 sm:h-12 sm:w-12" />
				<span>{guide.full}</span>
			</h1>
			<p class="mt-5 max-w-2xl text-pretty text-lg leading-8 text-foreground/85">
				{guide.rules.length} rules across {groups.length} topics, naming
				{data.terms.length.toLocaleString('en-US')} terms.
				{#if guide.note}{guide.note}{/if}
			</p>

			<!-- How firmly the guide speaks: its rules by severity. -->
			<div class="mt-6 max-w-md">
				<div class="flex h-2.5 overflow-hidden rounded-full bg-muted">
					{#each bySeverity as s (s.level)}
						{#if s.n}
							<span
								class="vt-{tone(s.level)} h-full"
								style="width: {(s.n / guide.rules.length) * 100}%; background: hsl(var(--vt))"
							></span>
						{/if}
					{/each}
				</div>
				<ul class="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
					{#each bySeverity as s (s.level)}
						<li class="vt-{tone(s.level)} inline-flex items-center gap-1.5">
							<span class="h-2 w-2 rounded-full" style="background: hsl(var(--vt))"></span>
							<span class="font-medium tabular-nums text-foreground">{s.n}</span>
							{s.level}{s.n === 1 ? '' : 's'}
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<dl class="self-start rounded-2xl border border-border bg-card p-5 text-sm">
			{#if sourceHost}
				<div class="flex items-baseline justify-between gap-4 py-1.5">
					<dt class="text-muted-foreground">The guide</dt>
					<dd class="min-w-0 truncate">
						<a
							href={sourceHost}
							target="_blank"
							rel="noreferrer"
							class="inline-flex items-center gap-1 font-medium hover:underline"
						>
							{new URL(sourceHost).host.replace(/^www\./, '')}
							<ArrowUpRight class="h-3 w-3" aria-hidden="true" />
						</a>
					</dd>
				</div>
			{/if}
			<div class="flex items-baseline justify-between gap-4 py-1.5">
				<dt class="text-muted-foreground">Rules from</dt>
				<dd class="min-w-0 truncate">
					<a
						href={guide.repo}
						target="_blank"
						rel="noreferrer"
						class="inline-flex items-center gap-1 font-medium hover:underline"
					>
						{guide.repo.replace('https://github.com/', '')}
						<ArrowUpRight class="h-3 w-3" aria-hidden="true" />
					</a>
				</dd>
			</div>
			<div class="flex items-baseline justify-between gap-4 py-1.5">
				<dt class="text-muted-foreground">Read at</dt>
				<dd class="font-mono text-xs">{guide.commit}</dd>
			</div>
			<div class="flex items-baseline justify-between gap-4 py-1.5">
				<dt class="text-muted-foreground">License</dt>
				<dd>
					{#if license[guide.license]}
						<a
							href={license[guide.license]}
							target="_blank"
							rel="noreferrer"
							class="hover:underline">{guide.license}</a
						>
					{:else}
						{guide.license || 'See the repository'}
					{/if}
				</dd>
			</div>
			{#if data.usedBy}
				<div class="flex items-baseline justify-between gap-4 py-1.5">
					<dt class="text-muted-foreground">Used by</dt>
					<dd>
						<span class="font-medium tabular-nums">{data.usedBy}</span> of {data.sampleSize} public configs
					</dd>
				</div>
			{/if}
		</dl>
	</header>

	<!-- The map -->
	<section class="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]" aria-labelledby="map">
		<div>
			<h2 id="map" class="text-2xl font-medium tracking-tight">The guide, by topic</h2>
			<p class="mt-2 text-sm text-muted-foreground">Select a rule to see what it asks for.</p>
			<nav class="mt-4 flex flex-wrap gap-1.5 text-sm" aria-label="Topics">
				{#each groups as t (t.id)}
					<a
						href="#{t.id}"
						class="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 transition-colors hover:border-lime-500/50 hover:bg-lime-500/10"
						>{t.label}<span class="tabular-nums text-muted-foreground">{t.rules.length}</span></a
					>
				{/each}
				<a
					href="#word-list"
					class="inline-flex h-8 items-center rounded-full border border-border bg-card px-3 transition-colors hover:border-lime-500/50 hover:bg-lime-500/10"
					>Word list</a
				>
			</nav>

			<div class="mt-6 space-y-7">
				{#each groups as t (t.id)}
					<section id={t.id} class="scroll-mt-24">
						<div class="flex items-baseline justify-between gap-3">
							<h3 class="font-medium">{t.label}</h3>
							<span class="text-xs text-muted-foreground">
								{t.rules.length} rule{t.rules.length === 1 ? '' : 's'} · {t.blurb.toLowerCase()}
							</span>
						</div>
						<ul class="mt-3 flex flex-wrap gap-1.5">
							{#each t.rules as r (r.id)}
								{@const on = selected === r.id}
								<li>
									<button
										type="button"
										onclick={() => open(r)}
										aria-pressed={on}
										title={quote(r.message)}
										class="vt-{tone(
											r.level
										)} inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm transition-all hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
										style="border-color: hsl(var(--vt) / {on
											? 0.9
											: 0.35}); background: hsl(var(--vt) / {on ? 0.22 : 0.07}); {on
											? 'box-shadow: 0 0 0 2px hsl(var(--vt) / 0.25)'
											: ''}"
									>
										<span
											class="h-1.5 w-1.5 shrink-0 rounded-full"
											style="background: hsl(var(--vt))"
										></span>
										{r.title}
										{#if r.size > 1}
											<span class="text-xs tabular-nums text-muted-foreground">{r.size}</span>
										{/if}
									</button>
								</li>
							{/each}
						</ul>
					</section>
				{/each}
			</div>
		</div>

		<aside class="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
			{#if rule}
				<section
					class="vt-{tone(rule.level)} rounded-2xl border bg-card p-5 shadow-sm"
					style="border-color: hsl(var(--vt) / 0.45)"
					aria-live="polite"
				>
					<div
						class="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em]"
						style="color: hsl(var(--vt))"
					>
						<span class="h-2 w-2 rounded-full" style="background: hsl(var(--vt))"></span>
						{rule.level}
					</div>
					<h3 class="mt-1 text-xl font-medium leading-tight">{rule.title}</h3>
					<p class="font-mono text-xs text-muted-foreground">{short(rule.id)}</p>

					<p class="mt-4 leading-6 text-foreground/90">{quote(rule.message)}</p>
					<p class="mt-1 text-xs text-muted-foreground">{rule.kind}.</p>

					{#if ruleTerms.length}
						<ul class="mt-4 flex max-h-72 flex-wrap gap-1.5 overflow-y-auto">
							{#each ruleTerms.slice(0, 80) as t (t.find)}
								<li
									class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm"
									style="background: hsl(var(--vt) / 0.12)"
								>
									<span class={t.use ? 'text-foreground/70 line-through decoration-1' : ''}
										>{t.find}</span
									>
									{#if t.use && t.use.length < 40}
										<ArrowRight class="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />
										<span class="font-medium">{t.use}</span>
									{/if}
								</li>
							{/each}
						</ul>
						{#if ruleTerms.length > 80}
							<p class="mt-2 text-xs text-muted-foreground">
								and {ruleTerms.length - 80} more, in the word list below.
							</p>
						{/if}
					{/if}

					{#if rule.link}
						<a
							href={rule.link}
							target="_blank"
							rel="noreferrer"
							class="mt-5 inline-flex items-center gap-1 text-sm font-medium underline decoration-lime-500 decoration-2 underline-offset-4"
						>
							Read it in the guide
							<ArrowUpRight class="h-3.5 w-3.5" aria-hidden="true" />
						</a>
					{/if}
				</section>
			{:else}
				<div
					class="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground"
				>
					Select a rule on the left to see what it flags, what it suggests, and where the guide
					explains it.
				</div>
			{/if}

			{#if data.overlap.length}
				<section class="mt-6">
					<h3 class="text-sm font-medium">Closest guides</h3>
					<p class="mt-1 text-xs text-muted-foreground">By how many of the same terms they flag.</p>
					<ul class="mt-3 space-y-2">
						{#each data.overlap as o (o.id)}
							<li>
								<a href="/guides/{o.id}" class="group block text-sm">
									<div class="flex items-baseline justify-between gap-3">
										<span class="inline-flex items-center gap-2 font-medium group-hover:underline"
											><GuideLogo id={o.id} name={o.name} size="h-4 w-4" />{o.name}</span
										>
										<span class="tabular-nums text-muted-foreground">{o.shared} shared</span>
									</div>
									<div class="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
										<div
											class="h-full rounded-full bg-lime-500"
											style="width: {(o.shared / most) * 100}%"
										></div>
									</div>
								</a>
							</li>
						{/each}
					</ul>
				</section>
			{/if}
		</aside>
	</section>

	<!-- The word list -->
	{#if data.terms.length}
		<section class="mt-16" aria-labelledby="word-list">
			<div class="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h2 id="word-list" class="text-2xl font-medium tracking-tight">The word list</h2>
					<p class="mt-2 text-sm text-muted-foreground">
						Every term this guide’s rules name, and what it says to write instead.
					</p>
				</div>
				<div class="relative w-full sm:w-72">
					<Search
						class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
						aria-hidden="true"
					/>
					<input
						type="search"
						bind:value={filter}
						placeholder="Filter {data.terms.length.toLocaleString('en-US')} terms…"
						aria-label="Filter the word list"
						class="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:border-lime-500/60 focus:outline-none focus:ring-2 focus:ring-lime-500/30"
					/>
				</div>
			</div>

			<div class="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
				<table class="w-full text-left text-sm">
					<thead class="border-b border-border bg-muted/40 text-xs text-muted-foreground">
						<tr>
							<th scope="col" class="px-4 py-2.5 font-medium">Instead of</th>
							<th scope="col" class="px-4 py-2.5 font-medium">Write</th>
							<th scope="col" class="hidden px-4 py-2.5 font-medium sm:table-cell">Rule</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border/70">
						{#each matches.slice(0, shown) as t (t.rule + t.find)}
							<tr class="vt-{tone(t.level)}">
								<td class="px-4 py-2">{t.find}</td>
								<td class="px-4 py-2">
									{#if t.use}
										<span class="font-medium">{t.use}</span>
									{:else}
										<span class="text-muted-foreground">Avoid it</span>
									{/if}
								</td>
								<td class="hidden px-4 py-2 sm:table-cell">
									<button
										type="button"
										class="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
										onclick={() => {
											selected = `${guide.id}.${t.rule}`;
											document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
										}}
									>
										<span class="h-1.5 w-1.5 rounded-full" style="background: hsl(var(--vt))"
										></span>
										{t.rule}
									</button>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="3" class="px-4 py-8 text-center text-muted-foreground">
									No term matches “{filter}”.
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
				{#if matches.length > shown}
					<button
						type="button"
						onclick={() => (shown += 200)}
						class="w-full border-t border-border py-3 text-sm font-medium hover:bg-muted/40"
					>
						Show more ({(matches.length - shown).toLocaleString('en-US')} left)
					</button>
				{/if}
			</div>
		</section>
	{/if}

	<section
		class="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8"
	>
		<p class="max-w-xl text-sm leading-6 text-foreground/85">
			These rules run in <a
				href="/"
				class="font-medium text-foreground underline decoration-lime-500 decoration-2 underline-offset-4"
				>Vale</a
			>, which checks a whole documentation set against a guide in your editor and on every pull
			request.
		</p>
		<a
			href="/guides"
			class="inline-flex items-center gap-1.5 text-sm font-medium underline decoration-lime-500 decoration-2 underline-offset-4"
		>
			All {data.others.length + 1} guides
			<ArrowRight class="h-4 w-4" aria-hidden="true" />
		</a>
	</section>
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
