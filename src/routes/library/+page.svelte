<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import Events from '$lib/components/landing/Events.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import mediaData from '$lib/data/media.json';
	import pressData from '$lib/data/press.json';
	import { slugOf } from '$lib/data/adopter-slug';
	import { liteClient } from 'algoliasearch/lite';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import BookOpen from 'lucide-svelte/icons/book-open';
	import FileText from 'lucide-svelte/icons/file-text';
	import FlaskConical from 'lucide-svelte/icons/flask-conical';
	import Mail from 'lucide-svelte/icons/mail';
	import Newspaper from 'lucide-svelte/icons/newspaper';
	import Play from 'lucide-svelte/icons/play';
	import Presentation from 'lucide-svelte/icons/presentation';
	import Search from 'lucide-svelte/icons/search';
	import X from 'lucide-svelte/icons/x';

	const ALGOLIA_APP = '2Y8OU39U1X';
	const ALGOLIA_INDEX = 'library';
	const ALGOLIA_SEARCH_KEY = '0e82d6007f06d9f280629a37bb8a0892';

	type Media = {
		title: string;
		url: string;
		author: string;
		year: number;
		type: string;
		description: string;
		image: string;
		site: string;
		/** The team in the adopters directory that wrote it, when one did. */
		adopter?: string;
	};

	type Press = {
		type: string;
		title: string;
		subtitle?: string;
		outlet: string;
		author?: string;
		year?: number;
		url: string;
	};

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

	type Kind = 'post' | 'video' | 'talk' | 'book' | 'paper' | 'coverage' | 'newsletter';

	/** One row of the archive, whichever list it came from. */
	type Entry = {
		title: string;
		url: string;
		year: number;
		kind: Kind;
		byline: string;
		source: string;
		description: string;
		image: string;
		adopter?: string;
	};

	// The press list's `article` is coverage of Vale in a publication, which
	// is a different thing from the community's posts the library calls articles.
	const pressKind: Record<string, Kind> = {
		book: 'book',
		paper: 'paper',
		article: 'coverage',
		newsletter: 'newsletter'
	};

	const entries: Entry[] = [
		...(mediaData as Media[]).map((m) => ({
			title: m.title,
			url: m.url,
			year: m.year,
			kind: (m.type as Kind) ?? 'post',
			byline: m.author,
			source: m.site,
			description: m.description,
			image: m.image,
			adopter: m.adopter
		})),
		...(pressData as Press[]).map((p) => ({
			title: p.subtitle ? `${p.title}: ${p.subtitle}` : p.title,
			url: p.url,
			year: p.year ?? 0,
			kind: pressKind[p.type] ?? 'coverage',
			byline: p.author ?? '',
			source: p.outlet,
			description: '',
			image: ''
		}))
	];

	const kindLabel: Record<Kind, string> = {
		post: 'Article',
		video: 'Video',
		talk: 'Talk',
		book: 'Book',
		paper: 'Paper',
		coverage: 'Coverage',
		newsletter: 'Newsletter'
	};

	const kindIcon = {
		post: FileText,
		video: Play,
		talk: Presentation,
		book: BookOpen,
		paper: FlaskConical,
		coverage: Newspaper,
		newsletter: Mail
	};

	// The filters group the kinds: the book, papers, and coverage are all
	// published work, and too few apiece to be worth a chip of their own.
	const filters = [
		{ id: 'all', label: 'All', kinds: null },
		{ id: 'post', label: 'Articles', kinds: ['post'] },
		{ id: 'video', label: 'Videos', kinds: ['video'] },
		{ id: 'talk', label: 'Talks', kinds: ['talk'] },
		{ id: 'published', label: 'Published', kinds: ['book', 'paper', 'coverage', 'newsletter'] }
	] as const;

	const countOf = (kinds: readonly string[] | null) =>
		kinds ? entries.filter((e) => kinds.includes(e.kind)).length : entries.length;

	const mediaCount = (mediaData as Media[]).length;
	const pressCount = (pressData as Press[]).length;
	const adopterCount = entries.filter((e) => e.adopter).length;

	let filter = $state<(typeof filters)[number]['id']>('all');
	let byAdopters = $state(false);
	let query = $state('');

	// ----------------------------------------------------------------- search

	/*
		Every keystroke filters by title, author, and source at once. Algolia
		searches the whole text of each article in the background and adds what
		it finds, with a snippet of where; the publications aren't in its index,
		so the local match is what finds them.
	*/
	const words = $derived(
		query
			.toLowerCase()
			.split(/\s+/)
			.filter((w) => w && !w.startsWith('-') && !w.startsWith('"'))
	);
	const localMatch = (e: Entry) => {
		const hay = `${e.title} ${e.byline} ${e.source} ${e.description}`.toLowerCase();
		return words.every((w) => hay.includes(w));
	};

	let snippets = $state<Map<string, string>>(new Map());
	let issues = $state<SearchHit[]>([]);
	let searchFailed = $state(false);
	let searched = $state('');

	let client: ReturnType<typeof liteClient> | null = null;
	let timer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const q = query.trim();
		clearTimeout(timer);
		if (!q) {
			snippets = new Map();
			issues = [];
			searchFailed = false;
			searched = '';
			return;
		}
		timer = setTimeout(() => void fullText(q), 200);
		return () => clearTimeout(timer);
	});

	async function fullText(q: string) {
		// Built on first use: the client validates its key on construction, and
		// this page is prerendered, where that would fail the build.
		client ??= liteClient(ALGOLIA_APP, ALGOLIA_SEARCH_KEY);
		const shared = {
			indexName: ALGOLIA_INDEX,
			query: q,
			attributesToSnippet: ['text:30', 'description:30'],
			// Turns on the "exact phrase" and -excluded operators the tips
			// document. Off by default.
			advancedSyntax: true,
			highlightPreTag: '<mark>',
			highlightPostTag: '</mark>'
		};
		try {
			// Asked for separately so the tracker can't bury the library: there
			// are twenty issues for every resource.
			const { results } = await client.search<SearchHit>({
				requests: [
					{ ...shared, filters: 'NOT type:issue', hitsPerPage: 100 },
					{ ...shared, filters: 'type:issue', hitsPerPage: 4 }
				]
			});
			if (q !== query.trim()) return;
			const hits = 'hits' in results[0] ? results[0].hits : [];
			snippets = new Map(
				hits.map((h) => [
					h.url,
					h._snippetResult?.text?.value || h._snippetResult?.description?.value || ''
				])
			);
			issues = 'hits' in results[1] ? results[1].hits : [];
			searchFailed = false;
			searched = q;
		} catch {
			if (q !== query.trim()) return;
			snippets = new Map();
			issues = [];
			searchFailed = true;
			searched = q;
		}
	}

	// --------------------------------------------------------------- the list

	const visible = $derived.by(() => {
		const kinds = filters.find((f) => f.id === filter)?.kinds ?? null;
		return entries
			.filter((e) => !kinds || (kinds as readonly string[]).includes(e.kind))
			.filter((e) => !byAdopters || e.adopter)
			.filter((e) => !query.trim() || localMatch(e) || snippets.has(e.url))
			.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
	});

	const years = $derived.by(() => {
		const groups: { year: number; items: Entry[] }[] = [];
		for (const e of visible) {
			const last = groups.at(-1);
			if (last && last.year === e.year) last.items.push(e);
			else groups.push({ year: e.year, items: [e] });
		}
		return groups;
	});

	const browsing = $derived(!query.trim() && filter === 'all' && !byAdopters);

	// The book, then the two newest talks or videos with a picture: the
	// published work and the few entries that have an image worth showing.
	const book = entries.find((e) => e.kind === 'book');
	const watch = entries
		.filter((e) => (e.kind === 'video' || e.kind === 'talk') && e.image)
		.sort((a, b) => b.year - a.year)
		.slice(0, 2);

	// A thumbnail host that has stopped serving it leaves the row without one
	// rather than with a broken image.
	let failedImages = $state<Set<string>>(new Set());
	const onImgError = (url: string) => (failedImages = new Set(failedImages).add(url));
	const showImage = (e: Entry) =>
		(e.kind === 'video' || e.kind === 'talk') && e.image !== '' && !failedImages.has(e.image);

	const description = `${mediaCount} articles, talks, and videos about Vale, and ${pressCount} published works, searchable in full.`;
</script>

<MetaTags
	title="Library — Vale"
	{description}
	canonical="https://vale.sh/library"
	openGraph={{ url: 'https://vale.sh/library', title: 'The Vale library', description }}
/>

<!-- Header, search, and filters -->
<section class="border-b border-border/60">
	<div class="mx-auto max-w-5xl px-6 pb-10 pt-14 sm:pt-16 lg:px-8">
		<p class="text-base font-semibold text-lime-600 dark:text-lime-400">Library</p>
		<h1 class="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
			Articles, talks, and videos
		</h1>
		<p class="mt-4 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
			What the community has written and recorded about Vale, and the book, papers, and coverage
			published on it. For the teams running it, see
			<a href="/adopters" class="font-medium text-lime-600 hover:underline dark:text-lime-400"
				>adopters</a
			>.
		</p>

		<div class="mt-8 max-w-2xl">
			<label class="relative block">
				<span class="sr-only">Search the library</span>
				<Search
					class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
				/>
				<input
					type="search"
					bind:value={query}
					placeholder="Search every article in full…"
					class="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-10 text-base shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-lime-500/60 focus:ring-2 focus:ring-lime-500/20 [&::-webkit-search-cancel-button]:hidden"
				/>
				{#if query}
					<button
						type="button"
						onclick={() => (query = '')}
						class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
						aria-label="Clear the search"
					>
						<X class="h-4 w-4" />
					</button>
				{/if}
			</label>
			<p class="mt-2 text-sm text-muted-foreground">
				Matches the whole text of each article, refreshed weekly. See the
				<Popover.Root>
					<Popover.Trigger class="font-medium text-lime-600 hover:underline dark:text-lime-400"
						>search tips</Popover.Trigger
					>
					<Popover.Content class="prose prose-sm dark:prose-invert">
						<ul class="list-disc">
							<li>Misspellings still match: <code>lintr</code> finds <code>linter</code></li>
							<li>Exact phrase: <code>"documentation as code"</code></li>
							<li>Exclude a word: <code>vale -server</code></li>
						</ul>
					</Popover.Content>
				</Popover.Root>.
				<a
					href="https://www.algolia.com/ref/docsearch/"
					target="_blank"
					rel="noreferrer"
					class="whitespace-nowrap hover:text-foreground">Search by Algolia</a
				>
			</p>
		</div>

		<div class="mt-8 flex flex-wrap items-center gap-2">
			{#each filters as f (f.id)}
				<button
					type="button"
					onclick={() => (filter = f.id)}
					aria-pressed={filter === f.id}
					class="rounded-full border px-3 py-1 text-sm font-medium transition-colors {filter ===
					f.id
						? 'border-lime-500/50 bg-lime-500/10 text-lime-600 dark:text-lime-400'
						: 'border-border text-muted-foreground hover:border-lime-500/40 hover:text-foreground'}"
				>
					{f.label}
					<span class="ml-1 tabular-nums opacity-60">{countOf(f.kinds)}</span>
				</button>
			{/each}
			<span class="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden="true"></span>
			<button
				type="button"
				onclick={() => (byAdopters = !byAdopters)}
				aria-pressed={byAdopters}
				class="rounded-full border px-3 py-1 text-sm font-medium transition-colors {byAdopters
					? 'border-lime-500/50 bg-lime-500/10 text-lime-600 dark:text-lime-400'
					: 'border-border text-muted-foreground hover:border-lime-500/40 hover:text-foreground'}"
			>
				By teams running Vale
				<span class="ml-1 tabular-nums opacity-60">{adopterCount}</span>
			</button>
		</div>
	</div>
</section>

<!--
	Upcoming first: an event has a date on it, and renders nothing at all once
	that date passes.
-->
<Events />

<div class="mx-auto max-w-5xl px-6 pb-20 lg:px-8">
	{#if browsing && (book || watch.length)}
		<!-- Featured: the book and the newest recordings, before the archive. -->
		<section class="mt-12 grid gap-4 lg:grid-cols-3" aria-label="Featured">
			{#if book}
				<a
					href={book.url}
					target="_blank"
					rel="noreferrer"
					class="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-colors hover:border-lime-500/40"
				>
					<div>
						<span
							class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-lime-500/10 text-lime-600 dark:text-lime-400"
						>
							<BookOpen class="h-5 w-5" />
						</span>
						<p class="mt-5 text-sm font-medium text-muted-foreground">
							The book · {book.source}
						</p>
						<h2
							class="mt-1 text-lg font-semibold leading-snug tracking-tight group-hover:text-lime-600 dark:group-hover:text-lime-400"
						>
							{book.title}
						</h2>
					</div>
					<p class="mt-4 text-sm text-muted-foreground">{book.byline}, {book.year}</p>
				</a>
			{/if}
			{#each watch as w (w.url)}
				<a
					href={w.url}
					target="_blank"
					rel="noreferrer"
					class="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-lime-500/40"
				>
					{#if showImage(w)}
						<div class="aspect-video w-full overflow-hidden bg-muted">
							<img
								src={w.image}
								alt=""
								loading="lazy"
								onerror={() => onImgError(w.image)}
								class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
							/>
						</div>
					{/if}
					<div class="flex flex-1 flex-col p-5">
						<p class="text-sm font-medium text-muted-foreground">
							{kindLabel[w.kind]} · {w.year}
						</p>
						<h2
							class="mt-1 font-semibold leading-snug tracking-tight group-hover:text-lime-600 dark:group-hover:text-lime-400"
						>
							{w.title}
						</h2>
						<p class="mt-auto pt-3 text-sm text-muted-foreground">{w.byline}</p>
					</div>
				</a>
			{/each}
		</section>
	{/if}

	<!-- The archive: every entry, newest year first. -->
	<p class="mt-12 text-sm text-muted-foreground" aria-live="polite">
		{#if query.trim()}
			{visible.length}
			{visible.length === 1 ? 'match' : 'matches'} for “{query.trim()}”{#if searchFailed && searched}.
				Full-text search couldn't be reached, so these match titles, authors, and sources only{/if}.
		{:else}
			{visible.length}
			{visible.length === 1 ? 'entry' : 'entries'}, newest first.
		{/if}
	</p>

	{#each years as group (group.year)}
		<section class="mt-8 grid gap-x-10 sm:grid-cols-[5.5rem_1fr]">
			<div class="sm:sticky sm:top-24 sm:self-start">
				<h2 class="font-mono text-2xl font-medium tabular-nums tracking-tight">
					{group.year || 'Undated'}
				</h2>
				<p class="mt-0.5 text-xs text-muted-foreground">
					{group.items.length}
					{group.items.length === 1 ? 'entry' : 'entries'}
				</p>
			</div>
			<ul class="mt-3 divide-y divide-border border-y border-border sm:mt-0">
				{#each group.items as e (e.url)}
					{@const Icon = kindIcon[e.kind]}
					<li class="group relative flex gap-4 py-4">
						{#if showImage(e)}
							<div
								class="hidden aspect-video w-28 shrink-0 overflow-hidden rounded-md bg-muted sm:block"
							>
								<img
									src={e.image}
									alt=""
									loading="lazy"
									onerror={() => onImgError(e.image)}
									class="h-full w-full object-cover"
								/>
							</div>
						{/if}
						<div class="min-w-0 flex-1">
							<p class="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
								<span
									class="inline-flex items-center gap-1 font-medium text-lime-600 dark:text-lime-400"
								>
									<Icon class="h-3 w-3" />
									{kindLabel[e.kind]}
								</span>
								{#if e.source}<span>{e.source}</span>{/if}
							</p>
							<h3 class="mt-1 font-medium leading-snug text-foreground">
								<a
									href={e.url}
									target="_blank"
									rel="noreferrer"
									class="after:absolute after:inset-0 focus:outline-none focus-visible:underline group-hover:text-lime-600 dark:group-hover:text-lime-400"
								>
									{e.title}
								</a>
							</h3>
							{#if snippets.get(e.url)}
								<!-- Algolia's snippet, which carries its own <mark> tags. -->
								<p
									class="mt-1 line-clamp-2 text-sm text-muted-foreground [&_mark]:bg-lime-500/20 [&_mark]:text-foreground"
								>
									{@html snippets.get(e.url)}
								</p>
							{/if}
							{#if e.byline}
								<p class="mt-1 text-sm text-muted-foreground">{e.byline}</p>
							{/if}
						</div>
						<div class="flex shrink-0 flex-col items-end justify-between gap-2">
							<ArrowUpRight
								class="h-4 w-4 text-muted-foreground transition-colors group-hover:text-lime-600 dark:group-hover:text-lime-400"
							/>
							{#if e.adopter}
								<!-- Above the row's stretched link, so it opens the team, not the post. -->
								<a
									href="/adopters/{slugOf(e.adopter)}"
									class="relative z-10 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border transition-colors hover:text-foreground hover:ring-lime-500/40"
									>{e.adopter} runs Vale</a
								>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		</section>
	{:else}
		<p
			class="mt-8 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground"
		>
			Nothing matches. Try a shorter search, or clear the filters.
		</p>
	{/each}

	{#if issues.length}
		<section class="mt-14">
			<h2 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				From the issue tracker
			</h2>
			<ul class="mt-3 divide-y divide-border border-y border-border">
				{#each issues as issue (issue.url)}
					<li class="py-3">
						<a
							href={issue.url}
							target="_blank"
							rel="noreferrer"
							class="text-sm font-medium hover:text-lime-600 dark:hover:text-lime-400"
							>{issue.title}</a
						>
						{#if issue._snippetResult?.text?.value}
							<p
								class="mt-1 line-clamp-2 text-sm text-muted-foreground [&_mark]:bg-lime-500/20 [&_mark]:text-foreground"
							>
								{@html issue._snippetResult.text.value}
							</p>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</div>
