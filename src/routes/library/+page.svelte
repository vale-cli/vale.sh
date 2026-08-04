<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import * as Popover from '$lib/components/ui/popover';
	import { onMount } from 'svelte';
	import data from '$lib/data/media.json';
	import { search as searchLambda } from '$lib/api';
	import FileText from 'lucide-svelte/icons/file-text';
	import Play from 'lucide-svelte/icons/play';
	import Presentation from 'lucide-svelte/icons/presentation';

	type Media = {
		title: string;
		url: string;
		author: string;
		year: number;
		type: string;
		description: string;
		image: string;
		site: string;
	};

	const media = data as Media[];

	let activeType = $state('all');
	const typeLabel = (t: string) =>
		({ all: 'All', post: 'Articles', video: 'Videos', talk: 'Talks' })[t] ?? t;

	const filters = $derived(['all', ...Array.from(new Set(media.map((m) => m.type)))]);

	const items = $derived(
		media
			.filter((m) => activeType === 'all' || m.type === activeType)
			.slice()
			.sort((a, b) => b.year - a.year)
	);

	// Track images that fail to load (dead/hotlink-blocked URLs) so we can swap in
	// a branded placeholder instead of a broken-image icon.
	let failedImages = $state<Set<string>>(new Set());
	function onImgError(url: string) {
		failedImages = new Set(failedImages).add(url);
	}
	const showImage = (url: string) => url !== '' && !failedImages.has(url);

	function getParts(id: string) {
		let tag = id.match(/title=(.+)&url=(.+)&author=(.+)&year=(.+)&type=(.+)/);
		return {
			title: tag[1],
			url: tag[2],
			author: tag[3],
			year: tag[4],
			type: tag[5]
		};
	}

	onMount(() => {
		const { autocomplete } = window['@algolia/autocomplete-js'];

		autocomplete({
			container: '#autocomplete',
			placeholder: 'Search topics or keywords',
			debug: false,
			defaultActiveItemId: 0,
			getSources({ query }) {
				return searchLambda(query)
					.then((response) => response.json())
					.then((data) => {
						return [
							{
								sourceId: 'predictions',
								getItemUrl({ item }) {
									return getParts(item.ID).url;
								},
								getItems() {
									return data || [];
								},
								templates: {
									noResults({ html }) {
										return html`<div class="prose dark:prose-invert">
											<h3 class="mt-0">No results found.</h3>
											<p>Try adjusting your search with a query string:</p>
											<ul>
												<li class="pb-1 pt-1">
													Faceted search: <code>date:>2021</code> or <code>author:jdkato</code>
												</li>
												<li class="pb-1 pt-1">
													Fuzzy search: <code>term~1</code> or <code>term~2</code>
												</li>
												<li class="pb-1 pt-1">
													Boosted search: <code>text:neovim title:neovim^5</code>
												</li>
												<li class="pb-1 pt-1">
													Regex search: <code>author:/(jdkato|another)/</code>
												</li>
											</ul>
										</div>`;
									},
									item({ item, html, createElement }) {
										const parsed = getParts(item.ID);
										const sample = createElement('p', {
											dangerouslySetInnerHTML: { __html: item.Fragment }
										});
										const chip =
											'mr-2 inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border';
										return html`<div class="prose w-full rounded-lg p-6 dark:prose-invert">
											<a class="no-underline" href="${parsed.url}" target="_blank">
												<h5 class="font-bold tracking-tight underline">${parsed.title}</h5>
												<p class="un text-sm text-muted-foreground">${sample}</p>
												<span class="${chip}">${parsed.type}</span>
												<span class="${chip}">${parsed.year}</span>
												<span class="${chip}">${parsed.author}</span>
											</a>
										</div>`;
									}
								}
							}
						];
					});
			}
		});
	});
</script>

<MetaTags
	title="Media Library"
	description="The Media Library is a collection of videos, articles, and other resources related to Vale and its ecosystem."
	canonical="https://vale.sh"
	openGraph={{
		url: 'https://vale.sh',
		title: 'Vale: Your style, our editor',
		description:
			'Vale is a command-line tool that brings code-like linting to prose. Vale is cross-platform (Windows, macOS, and Linux), written in Go, and available on GitHub.',
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

<!-- Header + search -->
<section class="relative overflow-hidden border-b border-border/60">
	<div
		class="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(hsl(var(--foreground)/0.05)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_60%,transparent_100%)]"
	></div>
	<div class="mx-auto max-w-3xl px-6 py-16 text-center lg:px-8">
		<p class="text-base font-semibold text-lime-500">Media Library</p>
		<h1 class="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
			Vale in the wild
		</h1>
		<p class="mx-auto mt-4 text-pretty text-lg leading-8 text-muted-foreground">
			Articles, talks, and videos about Vale from across the community.
		</p>

		<div class="mx-auto mt-8 max-w-xl">
			<div id="autocomplete" class="w-full"></div>
			<p class="mt-3 text-sm text-muted-foreground">
				Search the full library, including
				<Popover.Root>
					<Popover.Trigger class="font-medium text-lime-500 hover:underline"
						>advanced operators</Popover.Trigger
					>
					<Popover.Content class="prose prose-sm dark:prose-invert">
						<p>The Media Library is indexed daily and supports a variety of search operators:</p>
						<ul class="list-disc">
							<li>Faceted search: <code>date:>2021</code> or <code>author:jdkato</code></li>
							<li>Fuzzy search: <code>term~1</code> or <code>term~2</code></li>
							<li>Boosted search: <code>text:neovim title:neovim^5</code></li>
							<li>Regex search: <code>author:/(jdkato|another)/</code></li>
						</ul>
					</Popover.Content>
				</Popover.Root>.
			</p>
		</div>
	</div>
</section>

<!-- Grid -->
<div class="mx-auto max-w-6xl px-6 py-14 lg:px-8">
	<!-- Filters -->
	<div class="flex flex-wrap items-center gap-2">
		{#each filters as f}
			<button
				type="button"
				onclick={() => (activeType = f)}
				class="rounded-full border px-3 py-1 text-sm font-medium transition-colors {activeType === f
					? 'border-lime-500/50 bg-lime-500/10 text-lime-600'
					: 'border-border text-muted-foreground hover:border-lime-500/40 hover:text-foreground'}"
			>
				{typeLabel(f)}
			</button>
		{/each}
		<span class="ml-auto text-sm text-muted-foreground">
			{items.length}
			{items.length === 1 ? 'resource' : 'resources'}
		</span>
	</div>

	<div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each items as m}
			<article
				class="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-lime-500/40"
			>
				<div class="relative aspect-[16/9] w-full overflow-hidden bg-muted">
					{#if showImage(m.image)}
						<img
							src={m.image}
							alt=""
							onerror={() => onImgError(m.image)}
							class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
							loading="lazy"
						/>
					{:else}
						<div
							class="flex h-full w-full items-center justify-center bg-gradient-to-br from-lime-500/10 via-muted to-muted"
						>
							{#if m.type === 'video'}
								<Play class="h-9 w-9 text-muted-foreground/40" />
							{:else if m.type === 'talk'}
								<Presentation class="h-9 w-9 text-muted-foreground/40" />
							{:else}
								<FileText class="h-9 w-9 text-muted-foreground/40" />
							{/if}
						</div>
					{/if}
				</div>
				<div class="flex flex-1 flex-col p-5">
					<div class="flex items-center gap-2 text-xs">
						<span
							class="rounded-full bg-lime-500/10 px-2 py-0.5 font-medium text-lime-600 ring-1 ring-inset ring-lime-500/20"
							>{typeLabel(m.type).replace(/s$/, '')}</span
						>
						<span class="text-muted-foreground">{m.year}</span>
					</div>
					<h3 class="mt-3 font-semibold leading-snug text-foreground">
						<a
							href={m.url}
							target="_blank"
							rel="noreferrer"
							class="transition-colors after:absolute after:inset-0 focus:outline-none focus-visible:underline group-hover:text-lime-500"
						>
							{m.title}
						</a>
					</h3>
					<p class="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
						{m.description}
					</p>
					<p class="mt-4 text-sm font-medium text-muted-foreground">{m.author}</p>
				</div>
			</article>
		{/each}
	</div>
</div>
