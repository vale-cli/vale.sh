<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import Check from 'lucide-svelte/icons/check';
	import Rss from 'lucide-svelte/icons/rss';

	import PostBanner from '$lib/components/PostBanner.svelte';
	import report from '$lib/data/lint.json';
	import type { Post } from '$lib/posts';
	import Section from './Section.svelte';

	let { posts, total }: { posts: Post[]; total: number } = $props();

	// The same committed report the blog index and post footers draw from.
	type Stats = (typeof report.posts)['voices'];
	const statsFor = (slug: string): Stats | undefined =>
		(report.posts as Record<string, Stats>)[slug];

	const fmt = (iso: string) =>
		new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			timeZone: 'UTC'
		});
</script>

<Section
	editorial
	id="blog"
	eyebrow="From the blog"
	title="Notes from building Vale."
	lede="Releases, the standard library, and prose linting in the age of agents. Every post ships with Vale's own report on it."
>
	<ul class="grid gap-6 md:grid-cols-3">
		{#each posts as post (post.slug)}
			{@const s = statsFor(post.slug)}
			<li>
				<article
					class="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
				>
					<div class="border-b border-border">
						<PostBanner
							seed={post.slug}
							image={post.image}
							values={post.poster}
							motif={post.motif}
							alt={post.imageAlt}
							class="h-32 w-full"
						/>
					</div>
					<div class="flex grow flex-col p-6">
						<p class="text-sm text-muted-foreground">
							<time datetime={post.date}>{fmt(post.date)}</time>
						</p>
						<h3 class="mt-2 text-balance text-xl font-semibold tracking-tight">
							<a
								href={`/blog/${post.slug}`}
								class="after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-lime-500"
							>
								{post.title}
							</a>
						</h3>
						<p class="mt-3 grow text-sm leading-6 text-muted-foreground">{post.description}</p>
						{#if s}
							<p
								class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs tabular-nums text-muted-foreground"
							>
								{#if s.errors + s.warnings + s.suggestions === 0}
									<span class="flex items-center gap-1 text-lime-600 dark:text-lime-400">
										<Check class="h-3 w-3" /> 0 alerts
									</span>
								{:else}
									<span class="text-rose-400">{s.errors + s.warnings + s.suggestions} alerts</span>
								{/if}
								<span>{s.minutes} min</span>
							</p>
						{/if}
					</div>
				</article>
			</li>
		{/each}
	</ul>

	<div class="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
		<a
			href="/blog"
			class="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-lime-500/40 underline-offset-4 transition-colors hover:text-lime-600 dark:hover:text-lime-400"
		>
			{total > posts.length ? `Read all ${total} posts` : 'Read the blog'}
			<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
		</a>
		<a
			href="/blog/rss.xml"
			class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
		>
			<Rss class="h-3.5 w-3.5" />
			RSS
		</a>
	</div>
</Section>
