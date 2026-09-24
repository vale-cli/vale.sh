<script lang="ts">
	import Check from 'lucide-svelte/icons/check';

	import PostBanner from '$lib/components/PostBanner.svelte';
	import PostTags from '$lib/components/PostTags.svelte';
	import report from '$lib/data/lint.json';
	import { authorOf, type Post } from '$lib/posts';

	// One post in a grid: the blog index's cards below the lead, and every
	// card on a tag page.
	let { post }: { post: Post } = $props();

	type Stats = (typeof report.posts)['voices'];
	const stats = $derived((report.posts as Record<string, Stats>)[post.slug]);

	const fmt = (iso: string) =>
		new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			timeZone: 'UTC'
		});
</script>

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
		<p class="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-muted-foreground">
			<img
				src={authorOf(post).avatar}
				alt=""
				width="20"
				height="20"
				class="h-5 w-5 rounded-full border border-border"
			/>
			<span class="text-foreground">{authorOf(post).name}</span>
			<span class="text-muted-foreground/50">·</span>
			<time datetime={post.date}>{fmt(post.date)}</time>
			{#if post.draft}
				<span
					class="rounded-full border border-amber-500/40 px-2 py-0.5 text-xs font-medium text-amber-500"
					>Draft</span
				>
			{/if}
		</p>
		<h2 class="mt-2 text-xl font-semibold tracking-tight">
			<a href={`/blog/${post.slug}`} class="after:absolute after:inset-0 hover:underline">
				{post.title}
			</a>
		</h2>
		<p class="mt-3 grow text-sm leading-6 text-muted-foreground">{post.description}</p>
		<PostTags {post} class="mt-4" />
		{#if stats}
			<p
				class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs tabular-nums text-muted-foreground"
			>
				{#if stats.errors + stats.warnings + stats.suggestions === 0}
					<span class="flex items-center gap-1 text-lime-600 dark:text-lime-400">
						<Check class="h-3 w-3" /> 0 alerts
					</span>
				{:else}
					<span class="text-rose-400"
						>{stats.errors + stats.warnings + stats.suggestions} alerts</span
					>
				{/if}
				<span>grade {stats.grade}</span>
				<span>{stats.words.toLocaleString('en-US')} words</span>
				<span>{stats.minutes} min</span>
			</p>
		{/if}
	</div>
</article>
