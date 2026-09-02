<script lang="ts">
	import adopters from '$lib/data/adopters.json';
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

	let query = $state('');
	let input: HTMLInputElement | undefined = $state();

	/*
		Open on a real category rather than on all ninety. The largest one is
		chosen from the data, so this keeps working as the list grows instead of
		hardcoding a name that may stop being the biggest.
	*/
	const largestCategory = Object.entries(
		all.reduce<Record<string, number>>((acc, a) => {
			acc[a.category] = (acc[a.category] ?? 0) + 1;
			return acc;
		}, {})
	).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];

	let activeCategory = $state(largestCategory);

	const categories = $derived(['All', ...Array.from(new Set(all.map((a) => a.category))).sort()]);

	const countFor = (category: string) =>
		category === 'All' ? all.length : all.filter((a) => a.category === category).length;

	const results = $derived(
		all
			.filter((a) => activeCategory === 'All' || a.category === activeCategory)
			.filter((a) => {
				const q = query.trim().toLowerCase();
				if (!q) return true;
				return (
					a.name.toLowerCase().includes(q) ||
					a.context.toLowerCase().includes(q) ||
					a.category.toLowerCase().includes(q)
				);
			})
			.sort((a, b) => a.name.localeCompare(b.name))
	);

	/*
		Ninety cards in one alphabetical run is a wall. Grouping them by category
		gives the eye somewhere to stop, and only a few of each show until someone
		asks for the rest -- capped per category rather than overall, so every
		category still appears on arrival. Filtering or searching is already a
		deliberate act, so those show everything they match.

		Headings and cards share a single keyed list rather than sitting in one
		list per category, so `animate:flip` can move every surviving element to
		its new place when the filter changes. Separate lists would unmount the
		cards instead, and the reshape would be a blink.
	*/
	const PREVIEW_PER_CATEGORY = 4;

	let expanded = $state(false);

	const previewing = $derived(!expanded && activeCategory === 'All' && !query.trim());

	const rows = $derived.by(() => {
		const shown = activeCategory === 'All' ? categories.slice(1) : [activeCategory];
		const out: Array<
			| { kind: 'heading'; key: string; category: string; count: number }
			| { kind: 'item'; key: string; adopter: Adopter }
		> = [];

		for (const category of shown) {
			const items = results.filter((a) => a.category === category);
			if (!items.length) continue;
			out.push({ kind: 'heading', key: `heading:${category}`, category, count: items.length });
			const visible = previewing ? items.slice(0, PREVIEW_PER_CATEGORY) : items;
			for (const adopter of visible) out.push({ kind: 'item', key: adopter.name, adopter });
		}
		return out;
	});

	const hidden = $derived(
		previewing ? results.length - rows.filter((r) => r.kind === 'item').length : 0
	);

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

<Section id="adopters" eyebrow="Adopters" title="Teams running Vale" lede={adopterLede}>
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
				onclick={() => (activeCategory = category)}
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

	<p class="sr-only" aria-live="polite">
		{results.length}
		{results.length === 1 ? 'team' : 'teams'} shown
	</p>

	<!-- Results -->
	{#if results.length}
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
						<a
							href={user.url}
							target="_blank"
							rel="noreferrer"
							class="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-lime-500/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
						>
							<div class="flex items-start justify-between gap-3">
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
							</div>
							<p class="mt-2 grow text-sm leading-6 text-muted-foreground">{user.context}</p>
						</a>
					{/if}
				</li>
			{/each}
		</ul>

		{#if hidden > 0}
			<div class="mt-8 flex justify-center">
				<button
					type="button"
					onclick={() => (expanded = true)}
					class="group inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
				>
					Show {hidden} more
					<ChevronDown class="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
				</button>
			</div>
		{/if}
	{:else}
		<div class="mt-10 rounded-xl border border-dashed border-border py-12 text-center">
			<p class="text-sm text-muted-foreground">
				No teams match <span class="font-medium text-foreground">"{query}"</span>.
			</p>
			<button
				type="button"
				onclick={() => {
					query = '';
					activeCategory = 'All';
				}}
				class="mt-3 text-sm font-medium text-lime-600 hover:text-lime-600 dark:text-lime-400 dark:hover:text-lime-400"
			>
				Reset filters
			</button>
		</div>
	{/if}
</Section>
