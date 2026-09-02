<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import Events from '$lib/components/landing/Events.svelte';
	import Press from '$lib/components/landing/Press.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import { onMount } from 'svelte';
	import data from '$lib/data/media.json';
	import { liteClient } from 'algoliasearch/lite';
	import FileText from 'lucide-svelte/icons/file-text';
	import Play from 'lucide-svelte/icons/play';
	import Presentation from 'lucide-svelte/icons/presentation';

	// Published by script/index, which scrapes each entry and replaces the
	// index. The key is search-only and scoped to this index, so it ships to
	// the browser the way DocSearch's does.
	const ALGOLIA_APP = '2Y8OU39U1X';
	const ALGOLIA_INDEX = 'library';
	const ALGOLIA_SEARCH_KEY = '0e82d6007f06d9f280629a37bb8a0892';

	/** A record in the `library` Algolia index, plus the matched snippet. */
	type SearchHit = {
		title: string;
		url: string;
		author: string;
		year: number;
		type: string;
		description: string;
		_snippetResult?: { text?: { value: string }; description?: { value: string } };
	};

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

	/*
		Search results carry their fields packed into the document ID. A result
		that does not parse is a malformed record rather than a reason to throw
		inside the autocomplete renderer, so it comes back empty and renders as a
		blank row.
	*/

	onMount(async () => {
		// The npm package rather than the CDN copy app.html used to load: that
		// one was unpinned, so the version served drifted from the one in the
		// lockfile, and a failed request left a search box that never appeared.
		//
		// Imported here rather than at the top because the package is CommonJS
		// and a static named import of it fails during SSR. It is only wanted in
		// the browser anyway, so this keeps it out of the server bundle too.
		//
		// Typed on SearchHit so the source below is checked against the records
		// the lambda returns; the CDN build reached this through an `any` global
		// and nothing here was checked at all.
		const { autocomplete } = await import('@algolia/autocomplete-js');

		// Built here rather than at module scope: the client validates its key on
		// construction, and this page is prerendered, so doing it at import time
		// fails the build instead of the search.
		const client = liteClient(ALGOLIA_APP, ALGOLIA_SEARCH_KEY);

		autocomplete<SearchHit>({
			container: '#autocomplete',
			placeholder: 'Search the library...',
			debug: false,
			defaultActiveItemId: 0,
			// Always detached, which is the modal DocSearch is built on: a
			// trigger button here, and the search itself in an overlay. Left at
			// its default this only kicked in under 680px, so a phone got the
			// bare version of a mode the desktop never showed at all.
			detachedMediaQuery: '(min-width: 0px)',
			openOnFocus: true,
			// Autocomplete draws no footer, so the panel is composed here: the
			// results, then the bar DocSearch ends on. The class names are
			// DocSearch's because its stylesheet defines them globally, which
			// is what keeps the two panels identical rather than merely
			// similar. The attribution is also what Algolia's open-source plan
			// asks for in return for the index.
			render({ children, render, html }: any, root: any) {
				render(
					html`<div class="lib-PanelWrap">
						<div class="lib-PanelBody">${children}</div>
						<div class="DocSearch-Footer">
							<a
								class="DocSearch-Logo"
								href="https://www.algolia.com/ref/docsearch/"
								target="_blank"
								rel="noreferrer"
								>Search by Algolia</a
							>
							<ul class="DocSearch-Commands">
								<li><kbd class="DocSearch-Commands-Key">↵</kbd><span>to select</span></li>
								<li>
									<kbd class="DocSearch-Commands-Key">↑</kbd
									><kbd class="DocSearch-Commands-Key">↓</kbd><span>to navigate</span>
								</li>
								<li><kbd class="DocSearch-Commands-Key">esc</kbd><span>to close</span></li>
							</ul>
						</div>
					</div>`,
					root
				);
			},
			async getSources({ query }: { query: string }) {
				// One row renderer for both sources: a resource and an issue
				// carry the same fields, and a result should read the same
				// whichever list it came from.
				const row = (item: SearchHit, html: any, createElement: any) => {
					// The snippet carries Algolia's <mark> tags, so it is set as
					// HTML; falling back to the description keeps a row that
					// matched on title alone from rendering empty.
					const snippet =
						item._snippetResult?.text?.value ||
						item._snippetResult?.description?.value ||
						item.description;
					const sample = createElement('span', {
						class: 'lib-Hit-snippet',
						dangerouslySetInnerHTML: { __html: snippet }
					});
					const meta = [item.type, item.year, item.author].filter(Boolean).join(' · ');

					// Laid out like a DocSearch hit -- title, then a muted line
					// under it -- rather than as a card, so the two search
					// panels on the site read as one design.
					return html`<a class="lib-Hit" href="${item.url}" target="_blank" rel="noreferrer">
						<span class="lib-Hit-content">
							<span class="lib-Hit-title">${item.title}</span>
							${snippet ? sample : ''}
							<span class="lib-Hit-meta">${meta}</span>
						</span>
					</a>`;
				};

				// A rejected promise here leaves the panel empty -- no rows and no
				// `noResults`, so a search backend that is down reads as a blank
				// sheet. The failure is caught and told apart from a genuine miss.
				let items: SearchHit[] = [];
				let tracker: SearchHit[] = [];
				let failed = false;
				try {
					const shared = {
						indexName: ALGOLIA_INDEX,
						query,
						// The whole article is indexed, so a match is often far
						// from the top of it; a snippet is what shows the reader
						// the part that matched.
						attributesToSnippet: ['text:35', 'description:35'],
						// Turns on the two operators the tips document: "exact
						// phrase" and -excluded. Off by default.
						advancedSyntax: true,
						highlightPreTag: '<mark>',
						highlightPostTag: '</mark>'
					};

					// Asked for separately so the tracker cannot bury the
					// library: there are twenty issues for every resource, and
					// this page is about the resources.
					const { results } = await client.search<SearchHit>({
						requests: [
							{ ...shared, filters: 'NOT type:issue', hitsPerPage: 6 },
							{ ...shared, filters: 'type:issue', hitsPerPage: 4 }
						]
					});
					items = 'hits' in results[0] ? results[0].hits : [];
					tracker = 'hits' in results[1] ? results[1].hits : [];
				} catch {
					failed = true;
				}

				return [
					{
						sourceId: 'predictions',
						getItemUrl({ item }: { item: SearchHit }) {
							return item.url;
						},
						getItems() {
							return items;
						},
						templates: {
							noResults({ html }: { html: any }) {
								if (failed) {
									return html`<div class="prose dark:prose-invert">
										<h3 class="mt-0">Search is unavailable.</h3>
										<p>The index could not be reached. The full library is still listed below.</p>
									</div>`;
								}
								return html`<div class="prose dark:prose-invert">
									<h3 class="mt-0">No results found.</h3>
									<p>Try a shorter query, or browse the full library below.</p>
								</div>`;
							},
							item({
								item,
								html,
								createElement
							}: {
								item: SearchHit;
								html: any;
								createElement: any;
							}) {
								return row(item, html, createElement);
							}
						}
					},
					{
						sourceId: 'issues',
						getItemUrl({ item }: { item: SearchHit }) {
							return item.url;
						},
						getItems() {
							return tracker;
						},
						templates: {
							header({ html }: { html: any }) {
								if (tracker.length === 0) {
									return null;
								}
								return html`<span
									class="mt-2 block border-t border-border px-6 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
									>From the issue tracker</span
								>`;
							},
							item({
								item,
								html,
								createElement
							}: {
								item: SearchHit;
								html: any;
								createElement: any;
							}) {
								return row(item, html, createElement);
							}
						}
					}
				];
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
		<p class="text-base font-semibold text-lime-600 dark:text-lime-400">Media Library</p>
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
					<Popover.Trigger class="font-medium text-lime-600 hover:underline dark:text-lime-400"
						>search tips</Popover.Trigger
					>
					<Popover.Content class="prose prose-sm dark:prose-invert">
						<p>
							The library is searched in full — the whole text of each article, not just its title —
							and refreshed weekly.
						</p>
						<ul class="list-disc">
							<li>Misspellings still match: <code>lintr</code> finds <code>linter</code></li>
							<li>Exact phrase: <code>"documentation as code"</code></li>
							<li>Exclude a word: <code>vale -server</code></li>
						</ul>
					</Popover.Content>
				</Popover.Root>.
			</p>
		</div>
	</div>
</section>

<!--
	Upcoming first: an event has a date on it, and renders nothing at all once
	that date passes. The searchable grid below is the standing archive.
-->
<Events />

<!-- Grid -->
<div class="mx-auto max-w-6xl border-border/60 px-6 py-14 lg:border-x lg:px-8">
	<!-- Filters -->
	<div class="flex flex-wrap items-center gap-2">
		{#each filters as f}
			<button
				type="button"
				onclick={() => (activeType = f)}
				class="rounded-full border px-3 py-1 text-sm font-medium transition-colors {activeType === f
					? 'border-lime-500/50 bg-lime-500/10 text-lime-600 dark:text-lime-400'
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

	<!--
		Nearly half the library has no usable thumbnail -- some entries never had
		one, others link to hosts that have since stopped serving them -- and
		giving those a 16:9 placeholder turned a third of the grid into empty gray
		boxes. They render as text cards instead, with the type on the chip.

		That leaves cards of two very different heights, which a row-aligned grid
		can only absorb as dead space. Columns pack them instead. The cost is
		reading order: items flow down each column rather than across, so the
		year-sorted list reads newest-to-oldest per column, not per row.
	-->
	<div class="mt-8 columns-1 gap-6 sm:columns-2 lg:columns-3">
		{#each items as m}
			<article
				class="group relative mb-6 flex break-inside-avoid flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-lime-500/40"
			>
				{#if showImage(m.image)}
					<div class="relative aspect-[16/9] w-full overflow-hidden bg-muted">
						<img
							src={m.image}
							alt=""
							onerror={() => onImgError(m.image)}
							class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
							loading="lazy"
						/>
					</div>
				{/if}
				<div class="flex flex-1 flex-col p-5">
					<!-- The chip carries the icon now that the thumbnail may not. -->
					<div class="flex items-center gap-2 text-xs">
						<span
							class="inline-flex items-center gap-1.5 rounded-full bg-lime-500/10 px-2 py-0.5 font-medium text-lime-600 ring-1 ring-inset ring-lime-500/20 dark:text-lime-400"
						>
							{#if m.type === 'video'}
								<Play class="h-3 w-3" />
							{:else if m.type === 'talk'}
								<Presentation class="h-3 w-3" />
							{:else}
								<FileText class="h-3 w-3" />
							{/if}
							{typeLabel(m.type).replace(/s$/, '')}
						</span>
						<span class="text-muted-foreground">{m.year}</span>
					</div>
					<h3 class="mt-3 font-semibold leading-snug text-foreground">
						<a
							href={m.url}
							target="_blank"
							rel="noreferrer"
							class="transition-colors after:absolute after:inset-0 focus:outline-none focus-visible:underline group-hover:text-lime-600 dark:group-hover:text-lime-400"
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

<!-- Curated coda: the books, talks, and write-ups worth calling out by hand. -->
<Press />
