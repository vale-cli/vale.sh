<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import generated from '$lib/data/packages.json';
	import { copyStringToClipboard } from '$lib/utils.js';
	import Search from 'lucide-svelte/icons/search';
	import Plus from 'lucide-svelte/icons/plus';
	import Copy from 'lucide-svelte/icons/copy';
	import Check from 'lucide-svelte/icons/check';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import Star from 'lucide-svelte/icons/star';
	import Download from 'lucide-svelte/icons/download';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import Globe from 'lucide-svelte/icons/globe';
	import BrandIcon from '$lib/components/landing/BrandIcon.svelte';
	import { Icons } from '$lib/components/icons';
	import Tabs from '$lib/components/explorer/Tabs.svelte';

	type Pkg = {
		name: string;
		description: string;
		homepage: string;
		url: string;
		logo: string;
		valeVersion?: string;
		/** `owner/name` of the GitHub repository the archive is released from. */
		repo?: string;
		/** Where the homepage lives: a forge, or a website of its own. */
		host?: string;
		/** The homepage, shortened for a card: a repository path or a host. */
		site?: string;
		stars?: number;
		/** Downloads of the archive, summed over every release. */
		downloads?: number;
		/** The tag of the newest release that ships the archive. */
		version?: string;
		/** When that release was published, as YYYY-MM-DD. */
		released?: string;
		tags: string[];
		rules: {
			name: string;
			extends: string;
			level: string;
			scope: string;
			message: string;
			link: string;
		}[];
		assets?: { kind: string; name: string }[];
	};

	const addURL = 'https://github.com/vale-cli/vale.sh#share-a-package-or-configuration';

	// A package's meta.json can declare the Vale version its rules need.
	// `>=1.0.0` is the legacy "any version" idiom, so only a real floor is
	// worth a reader's attention.
	const requires = (p: Pkg) => {
		if (!p.valeVersion || p.valeVersion === '>=1.0.0') return '';
		return p.valeVersion.replace(/^>=\s*/, 'Vale ≥ ');
	};

	// A release date, for a title: the month and year are what a reader
	// wants to know about how current a package is.
	const released = (iso: string) =>
		new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			timeZone: 'UTC'
		});

	const packages: Pkg[] = generated;
	let query = $state('');
	let activeTag = $state('all');

	// The library's own order, or by the numbers. Ties and packages without a
	// count keep their library position.
	type Sort = 'library' | 'stars' | 'downloads';
	let sort = $state<Sort>('downloads');
	const sorts: { id: Sort; label: string }[] = [
		{ id: 'downloads', label: 'Most downloads' },
		{ id: 'stars', label: 'Most stars' },
		{ id: 'library', label: 'Library order' }
	];

	const tags = $derived(['all', ...Array.from(new Set(packages.flatMap((p) => p.tags))).sort()]);

	const filtered = $derived.by(() => {
		const list = packages.filter((p) => {
			const matchesTag = activeTag === 'all' || p.tags.includes(activeTag);
			const q = query.trim().toLowerCase();
			const matchesQuery =
				!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
			return matchesTag && matchesQuery;
		});
		if (sort === 'library') return list;
		const key = sort;
		return list.slice().sort((a, b) => (b[key] ?? -1) - (a[key] ?? -1));
	});

	const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

	const fmt = (t: string) =>
		t === 'all'
			? 'All'
			: t === 'ai'
				? 'AI'
				: t.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

	let copied = $state('');
	let copyTimeout: ReturnType<typeof setTimeout>;
	function copyName(name: string) {
		copyStringToClipboard(name);
		copied = name;
		clearTimeout(copyTimeout);
		copyTimeout = setTimeout(() => (copied = ''), 1500);
	}
</script>

<MetaTags
	title="Package Explorer"
	description="The Package Explorer allows you to browse and install Vale packages and configurations."
	canonical="https://vale.sh/explorer"
	openGraph={{
		url: 'https://vale.sh/explorer',
		title: 'Vale Package Explorer',
		description:
			'Browse ready-made Vale styles and configurations, and install them with `vale sync`.'
	}}
/>

<div class="mx-auto max-w-6xl px-6 py-14 lg:px-8">
	<Tabs active="packages" />

	<!-- Header -->
	<div class="mx-auto mt-10 max-w-2xl text-center">
		<p class="text-base font-semibold text-lime-600 dark:text-lime-400">Package Explorer</p>
		<h1 class="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
			Styles &amp; configurations
		</h1>
		<p class="mx-auto mt-4 text-pretty text-lg leading-8 text-muted-foreground">
			Ready-made packages you can add to <code class="font-mono text-sm text-foreground"
				>BasedOnStyles</code
			>
			and install with
			<code class="rounded bg-muted px-1 py-0.5 font-mono text-sm text-foreground">vale sync</code>.
		</p>
	</div>

	<!--
		The wider ecosystem, up top rather than as a footnote: this page lists the
		curated packages, and the tag is where everyone else's live.
	-->
	<a
		href="https://github.com/topics/vale-linter-style"
		target="_blank"
		rel="noreferrer"
		class="group mx-auto mt-10 flex max-w-3xl items-center gap-4 rounded-xl border border-lime-500/30 bg-gradient-to-r from-lime-500/10 to-emerald-500/10 p-4 transition-colors hover:border-lime-500/60 hover:from-lime-500/15 hover:to-emerald-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 sm:p-5"
	>
		<span
			class="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-lime-500/25 bg-lime-500/10 text-lime-600 dark:text-lime-400 sm:inline-flex"
		>
			<Icons.GitHub class="h-5 w-5" />
		</span>

		<span class="min-w-0 flex-1">
			<span class="block text-sm font-semibold text-foreground sm:text-base">
				Looking for more? Browse the community tag
			</span>
			<span class="mt-0.5 block text-sm text-muted-foreground">
				Every package published under
				<code class="font-mono text-[13px] text-foreground">vale-linter-style</code> on GitHub.
			</span>
		</span>

		<ArrowRight
			class="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
		/>
	</a>

	<!-- Toolbar -->
	<div class="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
		<div class="relative flex-1">
			<Search
				class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
			/>
			<input
				type="text"
				bind:value={query}
				placeholder="Search packages…"
				class="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-lime-500/50 focus:outline-none focus:ring-2 focus:ring-lime-500/20"
			/>
		</div>
		<label class="relative">
			<span class="sr-only">Sort packages</span>
			<select
				bind:value={sort}
				class="h-10 appearance-none rounded-lg border border-border bg-background pl-3 pr-9 text-sm text-foreground transition-colors hover:border-lime-500/40 focus:border-lime-500/50 focus:outline-none focus:ring-2 focus:ring-lime-500/20"
			>
				{#each sorts as s (s.id)}
					<option value={s.id}>{s.label}</option>
				{/each}
			</select>
			<ArrowRight
				class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted-foreground"
			/>
		</label>
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

	<!-- Tag filters -->
	<div class="mt-4 flex flex-wrap items-center gap-2">
		{#each tags as tag}
			<button
				type="button"
				onclick={() => (activeTag = tag)}
				class="rounded-full border px-3 py-1 text-sm font-medium transition-colors {activeTag ===
				tag
					? 'border-lime-500/50 bg-lime-500/10 text-lime-600 dark:text-lime-400'
					: 'border-border text-muted-foreground hover:border-lime-500/40 hover:text-foreground'}"
			>
				{fmt(tag)}
			</button>
		{/each}
		<span class="ml-auto text-sm text-muted-foreground">
			{filtered.length}
			{filtered.length === 1 ? 'package' : 'packages'}
		</span>
	</div>

	<!-- Content -->
	<div class="mt-8">
		{#if filtered.length === 0}
			<div class="rounded-xl border border-border bg-muted/30 p-10 text-center">
				<p class="text-muted-foreground">No packages match your search.</p>
			</div>
		{:else}
			<ul class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{#each filtered as pkg}
					<li
						class="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-colors focus-within:border-lime-500/40 hover:border-lime-500/40"
					>
						<div class="flex items-start gap-3">
							<img
								src={pkg.logo}
								alt=""
								class="h-11 w-11 shrink-0 rounded-lg bg-white object-contain p-1 ring-1 ring-black/5"
								loading="lazy"
							/>
							<div class="min-w-0 flex-1">
								<h3 class="truncate font-semibold text-foreground">
									<!-- Stretched link: makes the whole card open the package's page -->
									<a
										href="/explorer/{pkg.name}"
										class="transition-colors after:absolute after:inset-0 after:rounded-xl focus:outline-none focus-visible:underline group-hover:text-lime-600 dark:group-hover:text-lime-400"
									>
										{pkg.name}
									</a>
								</h3>
								<div class="mt-1.5 flex flex-wrap gap-1">
									{#each pkg.tags as t}
										<span
											class="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
											>{fmt(t)}</span
										>
									{/each}
									{#if requires(pkg)}
										<span
											class="rounded-full border border-lime-500/40 px-2 py-0.5 font-mono text-[11px] font-medium text-lime-600 dark:text-lime-400"
											>{requires(pkg)}</span
										>
									{/if}
									{#if pkg.version}
										<span
											class="rounded-full border border-border px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground"
											title={pkg.released
												? `Latest release, ${released(pkg.released)}`
												: 'Latest release'}>{pkg.version}</span
										>
									{/if}
								</div>
							</div>
							<ArrowRight
								class="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
							/>
						</div>

						<p class="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
							{pkg.description}
						</p>

						<!-- Counts: what's in the package, then how it has traveled. -->
						<p
							class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"
						>
							{#if pkg.rules?.length}<span>{pkg.rules.length} rules</span>{/if}
							{#if pkg.assets?.length}<span>{pkg.assets.length} assets</span>{/if}
							{#if pkg.stars !== undefined}
								<span
									class="inline-flex items-center gap-1"
									title="{pkg.stars.toLocaleString('en-US')} stars"
								>
									<Star class="h-3 w-3" aria-hidden="true" />
									<span class="tabular-nums">{compact.format(pkg.stars)}</span>
									<span class="sr-only">stars</span>
								</span>
							{/if}
							{#if pkg.downloads !== undefined}
								<span
									class="inline-flex items-center gap-1"
									title="{pkg.downloads.toLocaleString('en-US')} downloads across every release"
								>
									<Download class="h-3 w-3" aria-hidden="true" />
									<span class="tabular-nums">{compact.format(pkg.downloads)}</span>
									<span class="sr-only">downloads</span>
								</span>
							{/if}
						</p>

						<div class="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
							<button
								type="button"
								onclick={() => copyName(pkg.name)}
								class="relative z-10 inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-lime-500/40 hover:text-foreground"
								aria-label="Copy package name"
							>
								{#if copied === pkg.name}
									<Check class="h-3.5 w-3.5 text-lime-600 dark:text-lime-400" /> Copied
								{:else}
									<Copy class="h-3.5 w-3.5" /> Copy name
								{/if}
							</button>
							{#if pkg.site}
								<a
									href={pkg.homepage}
									target="_blank"
									rel="noreferrer"
									class="relative z-10 flex min-w-0 flex-1 items-center justify-end gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
								>
									{#if pkg.host === 'web'}
										<Globe class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
									{:else}
										<BrandIcon name={pkg.host ?? ''} slug={pkg.host} size="h-3.5 w-3.5" mono />
									{/if}
									<span class="truncate">{pkg.site}</span>
									<ArrowUpRight class="h-3 w-3 shrink-0" aria-hidden="true" />
								</a>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
