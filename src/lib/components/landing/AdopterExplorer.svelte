<script lang="ts">
	import adopters from '$lib/data/adopters.json';
	import { sectors } from '$lib/data/sectors';
	import { usageGroups, usageOf, facetLabel, linksOf } from '$lib/data/usage';
	import BrandIcon from './BrandIcon.svelte';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import Search from 'lucide-svelte/icons/search';
	import X from 'lucide-svelte/icons/x';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import Section from './Section.svelte';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	type Adopter = {
		name: string;
		category: string;
		context: string;
		url: string;
		logo?: string;
		icon?: string;
		avatar?: string;
	};

	const all = adopters as Adopter[];

	/*
		The sector is bindable so the overview above the directory can narrow
		it: a tile there sets the category and the anchor scrolls here. It opens
		on every sector, a few teams each, because the preview cap below keeps
		that from being a wall and the overview has already shown the shape.
	*/
	let {
		activeCategory = $bindable('All'),
		studied = {}
	}: {
		activeCategory?: string;
		/** Adopter name -> post slug, for the teams with a case study. */
		studied?: Record<string, string>;
	} = $props();

	let query = $state('');
	let input: HTMLInputElement | undefined = $state();

	/*
		The second axis: how a team uses Vale, from the data behind each entry
		rather than a hand-written tag. Facets combine with AND, so "Runs in CI"
		plus "Google style" means both, and each chip's count says how many of
		the teams already in view it would leave.
	*/
	let facets = $state<string[]>([]);
	const toggleFacet = (id: string) => {
		facets = facets.includes(id) ? facets.filter((f) => f !== id) : [...facets, id];
	};
	// One facet the data script does not know: whether a post reads the team's
	// setup end to end. It comes from the route, so it is tested here.
	const STUDIED = 'studied';
	const matchesFacets = (name: string, ids: string[]) => {
		const has = usageOf(name);
		return ids.every((id) => (id === STUDIED ? name in studied : has.has(id)));
	};
	const groups = $derived([
		{ name: 'Read', facets: [{ id: STUDIED, label: 'Case study' }] },
		...usageGroups
	]);

	// The order sectors.ts gives them, so the chips match the overview tiles.
	const categories = $derived(['All', ...sectors.map((s) => s.name)]);

	const countFor = (category: string) =>
		category === 'All' ? all.length : all.filter((a) => a.category === category).length;

	// Sector and search, before the facets: what the facet counts are taken over.
	const inView = $derived(
		all
			.filter((a) => activeCategory === 'All' || a.category === activeCategory)
			.filter((a) => {
				const q = query.trim().toLowerCase();
				if (!q) return true;
				return (
					a.name.toLowerCase().includes(q) ||
					a.context.toLowerCase().includes(q) ||
					a.category.toLowerCase().includes(q) ||
					Array.from(usageOf(a.name)).some((id) => facetLabel.get(id)?.toLowerCase().includes(q))
				);
			})
	);

	const results = $derived(
		inView.filter((a) => matchesFacets(a.name, facets)).sort((a, b) => a.name.localeCompare(b.name))
	);

	// How many teams a chip would leave, given the other chips already on.
	const facetCount = (id: string) =>
		inView.filter((a) => matchesFacets(a.name, [...facets.filter((f) => f !== id), id])).length;

	// The first few facets a card wears, so the "how" shows without a filter.
	const TAGS = [
		'valeaction',
		'action',
		'gitlabci',
		'precommit',
		'agents',
		'house',
		'google',
		'microsoft',
		'redhat',
		'mdx',
		'rst',
		'adoc'
	];
	// The integration facets get the accent; the rest stay neutral, so a
	// glance separates "how it runs" from "what it runs".
	const ACCENTED = new Set(['valeaction', 'action', 'gitlabci', 'precommit', 'agents']);
	const tagsFor = (name: string) => {
		const has = usageOf(name);
		return TAGS.filter((id) => has.has(id))
			.slice(0, 3)
			.map((id) => ({ id, label: facetLabel.get(id) ?? id, accent: ACCENTED.has(id) }));
	};

	/*
		The sector bands above have already shown every team, so the directory
		opens on its controls alone: search, sectors, and facets. Cards appear
		once someone picks a sector, turns on a chip, types, or asks for the
		whole list. Grouped by sector when they do, so the eye has somewhere to
		stop in a long run.

		Headings and cards share a single keyed list rather than sitting in one
		list per category, so `animate:flip` can move every surviving element to
		its new place when the filter changes. Separate lists would unmount the
		cards instead, and the reshape would be a blink.
	*/
	let expanded = $state(false);

	const idle = $derived(
		!expanded && activeCategory === 'All' && !query.trim() && facets.length === 0
	);

	const rows = $derived.by(() => {
		if (idle) return [];
		const shown = activeCategory === 'All' ? categories.slice(1) : [activeCategory];
		const out: Array<
			| { kind: 'heading'; key: string; category: string; count: number }
			| { kind: 'item'; key: string; adopter: Adopter }
		> = [];

		for (const category of shown) {
			const items = results.filter((a) => a.category === category);
			if (!items.length) continue;
			out.push({ kind: 'heading', key: `heading:${category}`, category, count: items.length });
			for (const adopter of items) out.push({ kind: 'item', key: adopter.name, adopter });
		}
		return out;
	});

	// "/" focuses the search box, Escape clears it — same shortcut the docs search uses.
	function onKeydown(event: KeyboardEvent) {
		const target = event.target as HTMLElement | null;
		const typing =
			target instanceof HTMLInputElement ||
			target instanceof HTMLTextAreaElement ||
			target?.isContentEditable;

		if (event.key === '/' && !typing) {
			event.preventDefault();
			input?.focus();
		} else if (event.key === 'Escape' && target === input) {
			query = '';
		}
	}
</script>

<svelte:window on:keydown={onKeydown} />

{#snippet adopterLede()}
	Every entry links to a public <code class="rounded bg-muted px-1.5 py-0.5 text-base"
		>.vale.ini</code
	>, style package, or write-up.
{/snippet}

<Section id="adopters" eyebrow="Directory" title="Every team, by sector" lede={adopterLede}>
	<!-- Search -->
	<div class="relative mx-auto max-w-md">
		<Search
			class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
		/>
		<input
			bind:this={input}
			bind:value={query}
			type="search"
			placeholder="Search teams, tools, or use cases"
			aria-label="Search adopters"
			class="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-16 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-lime-500/60 focus:ring-2 focus:ring-lime-500/20"
		/>
		{#if query}
			<button
				type="button"
				onclick={() => {
					query = '';
					input?.focus();
				}}
				aria-label="Clear search"
				class="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
			>
				<X class="h-4 w-4" />
			</button>
		{:else}
			<kbd
				class="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block"
			>
				/
			</kbd>
		{/if}
	</div>

	<!-- Category filters -->
	<div class="mt-6 flex flex-wrap items-center justify-center gap-2">
		{#each categories as category}
			<button
				type="button"
				onclick={() => {
					activeCategory = category;
					// "All" asked for on purpose means the whole list, not the idle state.
					if (category === 'All') expanded = true;
				}}
				aria-pressed={activeCategory === category}
				class="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 {activeCategory ===
				category
					? 'border-lime-500/50 bg-lime-500/10 font-medium text-foreground'
					: 'border-border text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground'}"
			>
				{category}
				<span class="text-xs text-muted-foreground">{countFor(category)}</span>
			</button>
		{/each}
	</div>

	<!--
		How it's used: one row per group, chips toggle and combine. A chip that
		would leave no teams is not shown at all, rather than shown greyed, and
		a group with nothing to offer goes with it -- a chip still on stays, so
		it can be turned off.
	-->
	<div class="mx-auto mt-5 flex max-w-3xl flex-col gap-2">
		{#each groups as group (group.name)}
			{@const visible = group.facets.filter((f) => facets.includes(f.id) || facetCount(f.id) > 0)}
			{#if visible.length}
				<div class="flex flex-wrap items-center justify-center gap-1.5">
					<span class="mr-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
						>{group.name}</span
					>
					{#each visible as facet (facet.id)}
						{@const on = facets.includes(facet.id)}
						{@const n = facetCount(facet.id)}
						<button
							type="button"
							onclick={() => toggleFacet(facet.id)}
							aria-pressed={on}
							class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 {on
								? 'border-lime-500/50 bg-lime-500/10 font-medium text-foreground'
								: 'border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground'}"
						>
							{facet.label}
							<span class="font-mono text-[10px] text-muted-foreground">{n}</span>
						</button>
					{/each}
				</div>
			{/if}
		{/each}
	</div>

	<p class="sr-only" aria-live="polite">
		{results.length}
		{results.length === 1 ? 'team' : 'teams'} shown
	</p>

	<!-- Results -->
	{#if idle}
		<div
			class="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-10 text-center"
		>
			<p class="text-sm text-muted-foreground">
				Pick a sector or a chip, or search, to open the cards: each one carries the team's context
				and links to the files in its repo.
			</p>
			<button
				type="button"
				onclick={() => (expanded = true)}
				class="group inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
			>
				Show all {all.length} teams
				<ChevronDown class="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
			</button>
		</div>
	{:else if results.length}
		<ul class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each rows as row (row.key)}
				<li
					class={row.kind === 'heading' ? 'col-span-full' : ''}
					animate:flip={{ duration: 340, easing: cubicOut }}
					in:fade={{ duration: 160 }}
					out:fade={{ duration: 90 }}
				>
					{#if row.kind === 'heading'}
						<h3
							class="flex items-baseline gap-2 border-b border-border/60 pb-2 pt-2 text-sm font-medium text-foreground"
						>
							{row.category}
							<span class="font-mono text-xs text-muted-foreground">{row.count}</span>
						</h3>
					{:else}
						{@const user = row.adopter}
						{@const links = linksOf(user.name)}
						<!--
							The card is a box, not one big link, because it holds several:
							the title goes to the entry's proof, and the footer goes to the
							files in the repo a newcomer would copy from.
						-->
						<div
							class="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-lime-500/40 hover:shadow-md"
						>
							<a
								href={user.url}
								target="_blank"
								rel="noreferrer"
								class="flex items-start justify-between gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
							>
								<span class="flex items-center gap-2.5">
									<BrandIcon
										name={user.name}
										slug={user.icon}
										avatar={user.avatar}
										class="text-foreground/70 transition-colors group-hover:text-lime-600 dark:group-hover:text-lime-400"
									/>
									<span class="font-semibold tracking-tight text-foreground">{user.name}</span>
								</span>
								<ArrowUpRight
									class="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-lime-600 dark:group-hover:text-lime-400"
								/>
							</a>
							<p class="mt-2 grow text-sm leading-6 text-muted-foreground">{user.context}</p>
							{#if studied[user.name]}
								<a
									href="/blog/{studied[user.name]}"
									class="mt-3 inline-flex items-center gap-1 self-start text-sm font-medium text-lime-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 dark:text-lime-400"
								>
									Read how they use it
									<ArrowUpRight class="h-3.5 w-3.5" />
								</a>
							{/if}
							{#if tagsFor(user.name).length}
								<!-- Badges rather than a line of text, so the facets scan across a grid. -->
								<ul class="mt-3 flex flex-wrap gap-1.5" aria-label="How {user.name} uses Vale">
									{#each tagsFor(user.name) as tag (tag.id)}
										<li
											class="rounded-md border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] {tag.accent
												? 'border-lime-500/40 bg-lime-500/10 text-lime-700 dark:text-lime-300'
												: 'border-border bg-muted/60 text-muted-foreground'}"
										>
											{tag.label}
										</li>
									{/each}
								</ul>
							{/if}
							{#if links.length}
								<ul class="mt-3 flex flex-wrap gap-1.5" aria-label="Files in the repo">
									{#each links as link (link.url)}
										<li>
											<a
												href={link.url}
												target="_blank"
												rel="noreferrer"
												class="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-lime-500/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
											>
												{link.label}
												<ArrowUpRight class="h-3 w-3" />
											</a>
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<div class="mt-10 rounded-xl border border-dashed border-border py-12 text-center">
			<p class="text-sm text-muted-foreground">
				No teams match{#if query}
					<span class="font-medium text-foreground">"{query}"</span>{:else}
					those filters{/if}.
			</p>
			<button
				type="button"
				onclick={() => {
					query = '';
					activeCategory = 'All';
					facets = [];
				}}
				class="mt-3 text-sm font-medium text-lime-600 hover:text-lime-600 dark:text-lime-400 dark:hover:text-lime-400"
			>
				Reset filters
			</button>
		</div>
	{/if}
</Section>
