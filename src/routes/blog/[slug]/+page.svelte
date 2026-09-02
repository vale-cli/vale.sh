<script lang="ts">
	import { JsonLd, MetaTags } from 'svelte-meta-tags';

	import PostBanner from '$lib/components/PostBanner.svelte';
	import PostLintFooter from '$lib/components/PostLintFooter.svelte';
	import report from '$lib/data/lint.json';
	import { authorOf } from '$lib/posts';

	let { data } = $props();

	const url = `https://vale.sh/blog/${data.meta.slug}`;
	const Body = $derived(data.component);
	const author = $derived(authorOf(data.meta));
	const minutes = $derived(
		(report.posts as Record<string, { minutes: number }>)[data.meta.slug]?.minutes
	);

	// Crawlers resolve relative og:image URLs inconsistently, so the card is
	// always absolute. A post without its own image gets its banner, rendered
	// to a PNG by script/build-og.mjs and committed under static/blog/og.
	const image = `https://vale.sh${data.meta.image ?? `/blog/og/${data.meta.slug}.png`}`;
	const imageAlt = data.meta.imageAlt ?? 'Vale';

	const fmt = (iso: string) =>
		new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			timeZone: 'UTC'
		});
</script>

<MetaTags
	title={`${data.meta.title} — Vale`}
	description={data.meta.description}
	robots={data.meta.draft ? 'noindex,nofollow' : 'index,follow'}
	canonical={url}
	openGraph={{
		url,
		title: data.meta.title,
		description: data.meta.description,
		type: 'article',
		siteName: 'Vale',
		article: {
			publishedTime: `${data.meta.date}T00:00:00Z`,
			authors: [author.url]
		},
		images: [{ url: image, width: 1200, height: 630, alt: imageAlt }]
	}}
	twitter={{
		cardType: 'summary_large_image',
		site: '@jdkato',
		creator: '@jdkato',
		title: data.meta.title,
		description: data.meta.description,
		image,
		imageAlt
	}}
/>

<JsonLd
	schema={{
		'@type': 'BlogPosting',
		headline: data.meta.title,
		description: data.meta.description,
		datePublished: `${data.meta.date}T00:00:00Z`,
		image,
		url,
		mainEntityOfPage: url,
		author: {
			'@type': 'Person',
			name: author.name,
			url: author.url
		},
		publisher: {
			'@type': 'Organization',
			name: 'Vale',
			url: 'https://vale.sh'
		}
	}}
/>

<article class="mx-auto max-w-3xl px-6 py-16 lg:px-8">
	<div class="mb-10 overflow-hidden rounded-xl border border-border">
		<PostBanner
			seed={data.meta.slug}
			image={data.meta.image}
			values={data.meta.poster}
			motif={data.meta.motif}
			alt={data.meta.imageAlt}
			class="h-44 w-full sm:h-56"
		/>
	</div>

	<header>
		<p class="text-sm text-muted-foreground">
			<a class="hover:text-foreground" href="/blog">← Blog</a>
			{#if data.meta.draft}
				<span
					class="ml-2 rounded-full border border-amber-500/40 px-2 py-0.5 text-xs font-medium text-amber-500"
					>Draft</span
				>
			{/if}
		</p>
		<h1 class="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
			{data.meta.title}
		</h1>
		<p class="mt-4 text-pretty text-lg leading-8 text-muted-foreground">{data.meta.description}</p>

		<div class="mt-6 flex items-center gap-3">
			<img
				src={author.avatar}
				alt=""
				width="40"
				height="40"
				class="h-10 w-10 rounded-full border border-border"
			/>
			<div class="text-sm leading-tight">
				<a class="font-medium hover:underline" href={author.url}>{author.name}</a>
				<p class="mt-0.5 text-muted-foreground">
					<time datetime={data.meta.date}>{fmt(data.meta.date)}</time>{#if minutes}
						<span class="mx-1.5">·</span>{minutes} min read{/if}
				</p>
			</div>
		</div>
	</header>

	<Body />

	<PostLintFooter slug={data.meta.slug} />
</article>
