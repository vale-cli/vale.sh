<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Search from 'lucide-svelte/icons/search';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';

	let { data } = $props();

	const title = $derived(`${data.terms.length} Terms Style Guides Rule On, A to Z`);
	const description = $derived(
		`Every word and phrase that two or more of ${data.total} open style guides have a rule about, from “abort” to “whitelist,” with what each guide says to write instead.`
	);
	const url = 'https://vale.sh/guides/terms';

	let query = $state('');
	// The explorer's search lands here with ?q=; read it once the page is up.
	onMount(() => {
		query = new URLSearchParams(location.search).get('q') ?? '';
	});
	afterNavigate(() => {
		query = new URLSearchParams(location.search).get('q') ?? query;
	});
	const q = $derived(query.trim().toLowerCase());
	const shown = $derived(q ? data.terms.filter((t) => t.term.includes(q)) : data.terms);

	/** Terms under their first letter; digits and symbols share "#". */
	const groups = $derived.by(() => {
		const by = new Map<string, typeof data.terms>();
		for (const t of shown) {
			const c = t.term[0].toUpperCase();
			const key = /[A-Z]/.test(c) ? c : '#';
			if (!by.has(key)) by.set(key, []);
			by.get(key)!.push(t);
		}
		return [...by.entries()].sort((a, b) => a[0].localeCompare(b[0]));
	});
</script>

<MetaTags
	{title}
	{description}
	canonical={url}
	openGraph={{ url, title, description, type: 'website' }}
	twitter={{ cardType: 'summary_large_image' }}
/>

<div class="mx-auto max-w-6xl px-6 pb-20 pt-8 lg:px-8">
	<nav aria-label="Breadcrumb" class="flex items-center gap-1.5 text-sm text-muted-foreground">
		<a href="/guides" class="transition-colors hover:text-foreground">Style guides</a>
		<ChevronRight class="h-3.5 w-3.5" aria-hidden="true" />
		<span class="text-foreground">Terms</span>
	</nav>

	<header class="mt-6 max-w-3xl">
		<h1 class="text-balance text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
			Terms the style guides rule on
		</h1>
		<p class="mt-5 text-pretty text-lg leading-8 text-foreground/85">
			{data.terms.length} words and phrases that two or more of {data.total} open style guides have a
			rule about. Each has a page with every guide’s answer. Where they differ, see
			<a
				href="/guides/disagreements"
				class="font-medium text-foreground underline decoration-lime-500 decoration-2 underline-offset-4"
				>where the guides disagree</a
			>.
		</p>
	</header>

	<div class="relative mt-8 max-w-md">
		<Search
			class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
			aria-hidden="true"
		/>
		<input
			type="search"
			bind:value={query}
			placeholder="Filter the list…"
			aria-label="Filter terms"
			class="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-base focus:border-lime-500/60 focus:outline-none focus:ring-2 focus:ring-lime-500/30"
		/>
	</div>

	{#if !q}
		<nav class="mt-6 flex flex-wrap gap-1 text-sm" aria-label="Letters">
			{#each groups as [letter] (letter)}
				<a
					href="#{letter === '#' ? 'other' : letter}"
					class="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card font-medium transition-colors hover:border-lime-500/50"
					>{letter}</a
				>
			{/each}
		</nav>
	{/if}

	<div class="mt-8 space-y-10" aria-live="polite">
		{#each groups as [letter, terms] (letter)}
			<section id={letter === '#' ? 'other' : letter} class="scroll-mt-24">
				<h2 class="text-sm font-medium text-muted-foreground">{letter}</h2>
				<ul class="mt-3 grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
					{#each terms as t (t.slug)}
						<li class="border-b border-border/60">
							<a href="/guides/term/{t.slug}" class="group flex items-baseline gap-2 py-2 text-sm">
								<span class="min-w-0 truncate">
									<span class="font-medium group-hover:underline">{t.term}</span>
									{#if t.use}
										<span class="mx-0.5 text-muted-foreground">→</span>
										<span class="text-foreground/80">{t.use}</span>
									{:else if t.verdict === 'split'}
										<span class="ml-1 text-amber-700 dark:text-amber-400">guides differ</span>
									{/if}
								</span>
								<span class="ml-auto shrink-0 tabular-nums text-muted-foreground">{t.guides}</span>
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{:else}
			<p class="text-sm text-muted-foreground">
				No term here matches “{query.trim()}”. The
				<a href="/guides#lookup" class="underline">lookup</a> also searches terms only one guide names.
			</p>
		{/each}
	</div>
</div>
