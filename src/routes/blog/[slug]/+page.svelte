<script lang="ts">
	import { JsonLd, MetaTags } from 'svelte-meta-tags';

	import PostBanner from '$lib/components/PostBanner.svelte';
	import PostLintFooter from '$lib/components/PostLintFooter.svelte';
	import { siteConfig } from '$lib/config/site';

	let { data } = $props();

	const url = `https://vale.sh/blog/${data.meta.slug}`;
	const Body = $derived(data.component);

	// Crawlers resolve relative og:image URLs inconsistently, so the card is
	// always absolute; a post without its own image gets the site card.
	const image = `https://vale.sh${data.meta.image ?? '/brand/vale-social.png'}`;
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
			authors: [siteConfig.links.jdkato]
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
			name: 'Joseph Kato',
			url: siteConfig.links.jdkato
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
			<span class="mx-2">·</span>
			<time datetime={data.meta.date}>{fmt(data.meta.date)}</time>
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
	</header>

	<Body />

	<PostLintFooter slug={data.meta.slug} />
</article>
