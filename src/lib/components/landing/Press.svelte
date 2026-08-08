<script lang="ts">
	import press from '$lib/data/press.json';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import BookOpen from 'lucide-svelte/icons/book-open';
	import Section from './Section.svelte';

	type Item = {
		type: string;
		title: string;
		subtitle?: string;
		outlet: string;
		author?: string;
		year?: number;
		url: string;
	};

	const all = press as Item[];

	// A preview, not an index — /library is the searchable archive.
	const PREVIEW = 6;

	// The book gets its own card; the rest are a uniform list, newest first.
	// Undated entries sort to the end so they don't crowd out recent coverage.
	const book = all.find((i) => i.type === 'book');
	const rest = all.filter((i) => i.type !== 'book').sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
	const preview = rest.slice(0, PREVIEW);
	const remaining = rest.length - preview.length;

	const typeLabel: Record<string, string> = {
		paper: 'Paper',
		talk: 'Talk',
		article: 'Article',
		video: 'Video',
		newsletter: 'Newsletter'
	};
</script>

<Section id="press" eyebrow="Press & media" title="Books, talks, and write-ups">
	{#if book}
		<a
			href={book.url}
			target="_blank"
			rel="noreferrer"
			class="group flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 transition-colors duration-200 hover:border-lime-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 sm:flex-row sm:items-center sm:p-7"
		>
			<span
				class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime-500/10 text-lime-500"
			>
				<BookOpen class="h-6 w-6" />
			</span>
			<div class="min-w-0 grow">
				<p class="text-sm font-medium text-muted-foreground">
					{book.outlet} · {book.year}
				</p>
				<h3 class="mt-0.5 text-xl font-semibold tracking-tight">{book.title}</h3>
				{#if book.subtitle}
					<p class="mt-1 text-sm leading-6 text-muted-foreground">{book.subtitle}</p>
				{/if}
				{#if book.author}
					<p class="mt-1 text-sm text-muted-foreground">by {book.author}</p>
				{/if}
			</div>
			<ArrowUpRight
				class="hidden h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-lime-500 sm:block"
			/>
		</a>
	{/if}

	<ul class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
		{#each preview as item}
			<li>
				<a
					href={item.url}
					target="_blank"
					rel="noreferrer"
					class="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors duration-200 hover:border-lime-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
				>
					<div class="flex items-start justify-between gap-3">
						<p class="text-sm font-medium text-muted-foreground">
							{item.outlet}{item.year ? ` · ${item.year}` : ''}
						</p>
						<ArrowUpRight
							class="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-lime-500"
						/>
					</div>
					<h3 class="mt-1 grow text-sm font-semibold leading-6 tracking-tight text-foreground">
						{item.title}
					</h3>
					<span
						class="mt-3 inline-flex w-fit rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border"
					>
						{typeLabel[item.type] ?? item.type}
					</span>
				</a>
			</li>
		{/each}
	</ul>

	<div class="mt-8 text-center">
		<a
			href="/library"
			class="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-lime-500 hover:text-lime-600"
		>
			{remaining > 0 ? `Browse all ${rest.length} in the library` : 'Browse the library'}
			<ArrowRight class="h-4 w-4" />
		</a>
	</div>
</Section>
