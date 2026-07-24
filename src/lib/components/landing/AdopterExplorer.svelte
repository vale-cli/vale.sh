<script lang="ts">
	import adopters from '$lib/data/adopters.json';
	import BrandIcon from './BrandIcon.svelte';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import Search from 'lucide-svelte/icons/search';
	import X from 'lucide-svelte/icons/x';

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
	let activeCategory = $state('All');
	let input: HTMLInputElement | undefined = $state();

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

<section id="adopters" class="border-b border-border/60 py-14 sm:py-16">
	<div class="mx-auto max-w-6xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-base/7 font-semibold text-lime-500">Adopters</h2>
			<p class="mt-2 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">
				Teams running Vale
			</p>
			<p class="mt-4 text-pretty text-lg/8 text-muted-foreground">
				Every entry links to a public <code class="rounded bg-muted px-1.5 py-0.5 text-base"
					>.vale.ini</code
				>, style package, or write-up.
			</p>
		</div>

		<!-- Search -->
		<div class="relative mx-auto mt-10 max-w-md">
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
				{#each results as user (user.name)}
					<li>
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
										class="text-foreground/70 transition-colors group-hover:text-lime-500"
									/>
									<span class="font-semibold tracking-tight text-foreground">{user.name}</span>
								</span>
								<ArrowUpRight
									class="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-lime-500"
								/>
							</div>
							<p class="mt-2 grow text-sm leading-6 text-muted-foreground">{user.context}</p>
							<span
								class="mt-4 inline-flex w-fit rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border"
							>
								{user.category}
							</span>
						</a>
					</li>
				{/each}
			</ul>
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
					class="mt-3 text-sm font-medium text-lime-500 hover:text-lime-600"
				>
					Reset filters
				</button>
			</div>
		{/if}
	</div>
</section>
