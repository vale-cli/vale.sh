<script lang="ts">
	import { onMount } from 'svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import { copyStringToClipboard } from '$lib/utils.js';
	import Search from 'lucide-svelte/icons/search';
	import Plus from 'lucide-svelte/icons/plus';
	import Copy from 'lucide-svelte/icons/copy';
	import Check from 'lucide-svelte/icons/check';
	import ExternalLink from 'lucide-svelte/icons/external-link';

	type Pkg = {
		name: string;
		description: string;
		homepage: string;
		url: string;
		logo: string;
		tags: string[];
	};

	const library =
		'https://raw.githubusercontent.com/vale-cli/packages/refs/heads/master/library.json';
	const addURL = 'https://github.com/vale-cli/vale.sh#share-a-package-or-configuration';

	let packages = $state<Pkg[]>([]);
	let loading = $state(true);
	let failed = $state(false);
	let query = $state('');
	let activeTag = $state('all');

	// Repair common UTF-8 mojibake (e.g. â€™ → ’) that exists in some upstream
	// library.json entries, so the copy always renders cleanly.
	const fixEncoding = (s: string) =>
		s
			.replace(/â€™/g, '’')
			.replace(/â€˜/g, '‘')
			.replace(/â€œ/g, '“')
			.replace(/â€”/g, '—')
			.replace(/â€“/g, '–')
			.replace(/â€/g, '”');

	onMount(async () => {
		try {
			const res = await fetch(library);
			const raw: Pkg[] = await res.json();
			packages = raw.map((p) => ({
				...p,
				name: fixEncoding(p.name),
				description: fixEncoding(p.description)
			}));
		} catch (e) {
			failed = true;
		} finally {
			loading = false;
		}
	});

	const tags = $derived(['all', ...Array.from(new Set(packages.flatMap((p) => p.tags))).sort()]);

	const filtered = $derived(
		packages.filter((p) => {
			const matchesTag = activeTag === 'all' || p.tags.includes(activeTag);
			const q = query.trim().toLowerCase();
			const matchesQuery =
				!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
			return matchesTag && matchesQuery;
		})
	);

	const fmt = (t: string) =>
		t === 'all' ? 'All' : t.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

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
			'Browse ready-made Vale styles and configurations, and install them with `vale sync`.',
		images: [
			{
				url: '/media/mac.png',
				width: 800,
				height: 600,
				alt: 'Example Vale output'
			}
		]
	}}
/>

<div class="mx-auto max-w-6xl px-6 py-14 lg:px-8">
	<!-- Header -->
	<div class="mx-auto max-w-2xl text-center">
		<p class="text-base font-semibold text-lime-500">Package Explorer</p>
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

	<!-- Toolbar -->
	<div class="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
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
	{#if !loading && !failed}
		<div class="mt-4 flex flex-wrap items-center gap-2">
			{#each tags as tag}
				<button
					type="button"
					onclick={() => (activeTag = tag)}
					class="rounded-full border px-3 py-1 text-sm font-medium transition-colors {activeTag ===
					tag
						? 'border-lime-500/50 bg-lime-500/10 text-lime-600'
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
	{/if}

	<!-- Content -->
	<div class="mt-8">
		{#if loading}
			<ul class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{#each Array(6) as _}
					<li class="h-52 animate-pulse rounded-xl border border-border bg-muted/40"></li>
				{/each}
			</ul>
		{:else if failed}
			<div class="rounded-xl border border-border bg-muted/30 p-10 text-center">
				<p class="text-muted-foreground">
					Couldn't load the package library. You can browse it directly on
					<a
						href="https://github.com/vale-cli/packages"
						target="_blank"
						rel="noreferrer"
						class="font-medium text-lime-500 hover:underline">GitHub</a
					>.
				</p>
			</div>
		{:else if filtered.length === 0}
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
										href={pkg.homepage}
										target="_blank"
										rel="noreferrer"
										class="transition-colors after:absolute after:inset-0 after:rounded-xl focus:outline-none focus-visible:underline group-hover:text-lime-500"
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
								</div>
							</div>
							<ExternalLink
								class="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
							/>
						</div>

						<p class="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
							{pkg.description}
						</p>

						<div class="mt-5 border-t border-border pt-4">
							<button
								type="button"
								onclick={() => copyName(pkg.name)}
								class="relative z-10 inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-lime-500/40 hover:text-foreground"
								aria-label="Copy package name"
							>
								{#if copied === pkg.name}
									<Check class="h-3.5 w-3.5 text-lime-500" /> Copied
								{:else}
									<Copy class="h-3.5 w-3.5" /> Copy name
								{/if}
							</button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<p class="mt-10 text-center text-sm text-muted-foreground">
		Looking for more? Browse the
		<a
			href="https://github.com/topics/vale-linter-style"
			target="_blank"
			rel="noreferrer"
			class="font-medium text-lime-500 hover:underline">vale-linter-style</a
		> tag on GitHub.
	</p>
</div>
