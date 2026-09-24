<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';

	import PostCard from '$lib/components/PostCard.svelte';

	let { data } = $props();

	const url = $derived(`https://vale.sh/blog/tags/${data.tag.slug}`);
	const title = $derived(`${data.tag.label} — The Vale blog`);
</script>

<MetaTags
	{title}
	description={data.tag.description}
	canonical={url}
	openGraph={{
		url,
		title,
		description: data.tag.description,
		siteName: 'Vale',
		images: [
			{ url: 'https://vale.sh/brand/vale-social.png', width: 1200, height: 630, alt: 'Vale' }
		]
	}}
	twitter={{
		cardType: 'summary_large_image',
		site: '@jdkato',
		title,
		description: data.tag.description
	}}
/>

<section class="mx-auto max-w-6xl px-6 py-16 lg:px-8">
	<header class="mb-12">
		<p class="text-sm text-muted-foreground">
			<a class="hover:text-foreground" href="/blog">← Blog</a>
		</p>
		<h1 class="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
			{data.tag.label}<span class="text-lime-500">.</span>
		</h1>
		<p class="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
			{data.tag.description}
			{data.posts.length}
			{data.posts.length === 1 ? 'post' : 'posts'}.
		</p>

		<nav aria-label="Tags" class="mt-6 flex flex-wrap gap-2">
			{#each data.tags as tag (tag.slug)}
				<a
					href={`/blog/tags/${tag.slug}`}
					aria-current={tag.slug === data.tag.slug ? 'page' : undefined}
					class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 {tag.slug ===
					data.tag.slug
						? 'bg-lime-500/10 font-medium text-foreground ring-lime-500/40'
						: 'text-muted-foreground ring-border hover:text-foreground'}"
				>
					{tag.label}
					<span class="font-mono text-xs tabular-nums text-muted-foreground">{tag.count}</span>
				</a>
			{/each}
		</nav>
	</header>

	<div class="grid gap-6 md:grid-cols-2">
		{#each data.posts as post (post.slug)}
			<PostCard {post} />
		{/each}
	</div>
</section>
