<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import Search from 'lucide-svelte/icons/search';
	import Plus from 'lucide-svelte/icons/plus';
	import { assets, kindInfo, requires, type Asset } from '$lib/data/assets';
	import Tabs from '$lib/components/explorer/Tabs.svelte';

	const addURL = 'https://github.com/vale-cli/packages#sharing-an-asset';

	let query = $state('');
	let activeKind = $state<'all' | Asset['kind']>('all');

	const kinds = $derived([
		'all',
		...(Array.from(new Set(assets.map((a) => a.kind))).sort() as Asset['kind'][])
	]);

	const filtered = $derived(
		assets.filter((a) => {
			const matchesKind = activeKind === 'all' || a.kind === activeKind;
			const q = query.trim().toLowerCase();
			const matchesQuery =
				!q ||
				a.name.toLowerCase().includes(q) ||
				a.description.toLowerCase().includes(q) ||
				a.tags.some((t) => t.includes(q));
			return matchesKind && matchesQuery;
		})
	);

	const label = (k: string) => (k === 'all' ? 'All' : kindInfo[k as Asset['kind']].plural);
</script>

<MetaTags
	title="Asset Explorer"
	description="Views, filters, and output templates: single-file assets to copy into a Vale StylesPath."
	canonical="https://vale.sh/explorer/assets"
	openGraph={{
		url: 'https://vale.sh/explorer/assets',
		title: 'Vale Asset Explorer',
		description: 'Ready-made views, filters, and output templates, each one file to copy.'
	}}
/>

<div class="mx-auto max-w-6xl px-6 py-14 lg:px-8">
	<!-- Header -->
	<div class="mx-auto max-w-2xl text-center">
		<p class="text-base font-semibold text-lime-600 dark:text-lime-400">Asset Explorer</p>
		<h1 class="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
			Views, filters &amp; templates
		</h1>
		<p class="mx-auto mt-4 text-pretty text-lg leading-8 text-muted-foreground">
			Single files to copy into your
			<code class="rounded bg-muted px-1 py-0.5 font-mono text-sm text-foreground">StylesPath</code
			>. A view names the parts of a file Vale can’t otherwise parse, a filter picks the rules a run
			applies, and a template shapes what a run prints.
		</p>
	</div>

	<Tabs active="assets" />

	<!-- Toolbar -->
	<div class="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
		<div class="relative flex-1">
			<Search
				class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
			/>
			<input
				type="text"
				bind:value={query}
				placeholder="Search assets…"
				class="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-lime-500/50 focus:outline-none focus:ring-2 focus:ring-lime-500/20"
			/>
		</div>
		<a
			href={addURL}
			target="_blank"
			rel="noreferrer"
			class="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-lime-500/40 hover:bg-muted/60"
		>
			<Plus class="h-4 w-4" />
			Add your own
		</a>
	</div>

	<!-- Kind filters -->
	<div class="mt-4 flex flex-wrap items-center gap-2">
		{#each kinds as kind}
			<button
				type="button"
				onclick={() => (activeKind = kind as typeof activeKind)}
				class="rounded-full border px-3 py-1 text-sm font-medium transition-colors {activeKind ===
				kind
					? 'border-lime-500/50 bg-lime-500/10 text-lime-600 dark:text-lime-400'
					: 'border-border text-muted-foreground hover:border-lime-500/40 hover:text-foreground'}"
			>
				{label(kind)}
			</button>
		{/each}
		<span class="ml-auto text-sm text-muted-foreground">
			{filtered.length}
			{filtered.length === 1 ? 'asset' : 'assets'}
		</span>
	</div>

	<!-- Content -->
	<div class="mt-8">
		{#if filtered.length === 0}
			<div class="rounded-xl border border-border bg-muted/30 p-10 text-center">
				<p class="text-muted-foreground">No assets match your search.</p>
			</div>
		{:else}
			<ul class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{#each filtered as asset}
					<li
						class="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-colors focus-within:border-lime-500/40 hover:border-lime-500/40"
					>
						<div class="flex items-start justify-between gap-3">
							<h3 class="min-w-0 truncate font-semibold text-foreground">
								<a
									href="/explorer/assets/{asset.name}"
									class="transition-colors after:absolute after:inset-0 after:rounded-xl focus:outline-none focus-visible:underline group-hover:text-lime-600 dark:group-hover:text-lime-400"
								>
									{asset.name}
								</a>
							</h3>
							<span
								class="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
								>{asset.kind}</span
							>
						</div>

						<p class="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
							{asset.description}
						</p>

						<div class="mt-4 flex flex-wrap gap-1">
							{#each asset.tags as t}
								<span
									class="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
									>{t}</span
								>
							{/each}
							{#if requires(asset)}
								<span
									class="rounded-full border border-lime-500/40 px-2 py-0.5 font-mono text-[11px] font-medium text-lime-600 dark:text-lime-400"
									>{requires(asset)}</span
								>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
