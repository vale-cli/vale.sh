<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import Check from 'lucide-svelte/icons/check';

	import PostBanner from '$lib/components/PostBanner.svelte';
	import report from '$lib/data/lint.json';
	import { authorOf } from '$lib/posts';

	let { data } = $props();

	const description =
		'Notes from building Vale: releases, the standard library, and prose linting in the age of agents.';

	const lead = $derived(data.posts[0]);
	const rest = $derived(data.posts.slice(1));

	// The blog lints itself, so the index can prove it: per-card stats and a
	// masthead total, all from the committed report the footers use.
	type Stats = (typeof report.posts)['voices'];
	const statsFor = (slug: string): Stats | undefined =>
		(report.posts as Record<string, Stats>)[slug];

	const totals = $derived.by(() => {
		const rows = data.posts
			.map((post: { slug: string }) => statsFor(post.slug))
			.filter(Boolean) as Stats[];
		return {
			words: rows.reduce((n, r) => n + r.words, 0),
			alerts: rows.reduce((n, r) => n + r.errors + r.warnings + r.suggestions, 0)
		};
	});

	const fmt = (iso: string) =>
		new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			timeZone: 'UTC'
		});
</script>

<MetaTags
	title="Blog — Vale"
	{description}
	canonical="https://vale.sh/blog"
	openGraph={{
		url: 'https://vale.sh/blog',
		title: 'The Vale blog',
		description,
		siteName: 'Vale',
		images: [
			{ url: 'https://vale.sh/brand/vale-social.png', width: 1200, height: 630, alt: 'Vale' }
		]
	}}
	twitter={{
		cardType: 'summary_large_image',
		site: '@jdkato',
		title: 'The Vale blog',
		description
	}}
/>

<svelte:head>
	<link rel="alternate" type="application/rss+xml" title="The Vale blog" href="/blog/rss.xml" />
</svelte:head>

<section class="relative mx-auto max-w-6xl px-6 py-16 lg:px-8">
	<!-- Faint plotting grid behind the masthead, fading out before the cards. -->
	<div
		class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 [background-image:radial-gradient(hsl(var(--foreground)/0.06)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
		aria-hidden="true"
	></div>

	<header class="mb-12">
		<div
			class="flex flex-wrap items-center gap-3 border-b border-border pb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
		>
			<span class="inline-block h-2 w-2 bg-lime-500"></span>
			<span class="text-foreground">The Vale blog</span>
			<span class="ml-auto normal-case tracking-normal">
				{data.posts.length}
				{data.posts.length === 1 ? 'post' : 'posts'} · {totals.words.toLocaleString('en-US')} words ·
				{#if totals.alerts === 0}
					<span class="text-lime-600 dark:text-lime-400">0 alerts</span>
				{:else}
					<span class="text-rose-400">{totals.alerts} alerts</span>
				{/if}
			</span>
		</div>

		<h1 class="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">
			Notes from building Vale<span class="text-lime-500">.</span>
		</h1>
		<p class="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
			Written here, linted here — every post ships with Vale's own report on it. Subscribe with
			<a
				class="underline decoration-dotted underline-offset-4 hover:text-foreground"
				href="/blog/rss.xml">RSS</a
			>.
		</p>
	</header>

	{#snippet lintline(slug: string)}
		{@const s = statsFor(slug)}
		{#if s}
			<p
				class="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs tabular-nums text-muted-foreground"
			>
				{#if s.errors + s.warnings + s.suggestions === 0}
					<span class="flex items-center gap-1 text-lime-600 dark:text-lime-400">
						<Check class="h-3 w-3" /> 0 alerts
					</span>
				{:else}
					<span class="text-rose-400">{s.errors + s.warnings + s.suggestions} alerts</span>
				{/if}
				<span>grade {s.grade}</span>
				<span>{s.words.toLocaleString('en-US')} words</span>
				<span>{s.minutes} min</span>
			</p>
		{/if}
	{/snippet}

	{#if data.posts.length === 0}
		<p class="border-t border-border pt-6 text-muted-foreground">Nothing published yet.</p>
	{:else}
		<div class="space-y-10">
			<!-- Lead: the newest post, text beside its banner. -->
			<article
				class="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
			>
				<!-- The side banner column is hidden on mobile, so the lead keeps a
				     top band there -- a featured post always shows its picture. -->
				<div class="border-b border-border md:hidden">
					<PostBanner
						seed={lead.slug}
						image={lead.image}
						values={lead.poster}
						motif={lead.motif}
						alt={lead.imageAlt}
						class="h-36 w-full"
					/>
				</div>

				<div class="grid md:grid-cols-5">
					<div class="p-6 md:col-span-3 md:p-10">
						<p class="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
							<img
								src={authorOf(lead).avatar}
								alt=""
								width="20"
								height="20"
								class="h-5 w-5 rounded-full border border-border"
							/>
							<span class="text-foreground">{authorOf(lead).name}</span>
							<span class="text-muted-foreground/50">·</span>
							<time datetime={lead.date}>{fmt(lead.date)}</time>
							{#if lead.draft}
								<span
									class="rounded-full border border-amber-500/40 px-2 py-0.5 text-xs font-medium text-amber-500"
									>Draft</span
								>
							{:else}
								<span
									class="rounded-full border border-lime-500/40 px-2 py-0.5 text-xs font-medium text-lime-500"
									>Latest</span
								>
							{/if}
						</p>
						<h2 class="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
							<a href={`/blog/${lead.slug}`} class="after:absolute after:inset-0 hover:underline">
								{lead.title}
							</a>
						</h2>
						<p class="mt-4 max-w-xl text-pretty leading-7 text-muted-foreground">
							{lead.description}
						</p>
						<div class="mt-5">
							{@render lintline(lead.slug)}
						</div>
					</div>

					<div class="hidden flex-col border-l border-border md:col-span-2 md:flex">
						<div class="relative grow overflow-hidden">
							<PostBanner
								seed={lead.slug}
								image={lead.image}
								values={lead.poster}
								motif={lead.motif}
								alt={lead.imageAlt}
								class="absolute inset-0 h-full w-full"
							/>
						</div>
						<div class="flex items-center justify-between gap-3 border-t border-border p-5">
							<span class="text-xs font-semibold uppercase tracking-widest text-lime-500"
								>Featured</span
							>
							<span
								class="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-foreground"
							>
								Read the post
								<ArrowUpRight
									class="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
								/>
							</span>
						</div>
					</div>
				</div>
			</article>

			{#if rest.length > 0}
				<div class="grid gap-6 md:grid-cols-2">
					{#each rest as post (post.slug)}
						<article
							class="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
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
							<div class="p-6">
								<p class="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
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
									<a
										href={`/blog/${post.slug}`}
										class="after:absolute after:inset-0 hover:underline"
									>
										{post.title}
									</a>
								</h2>
								<p class="mt-3 text-sm leading-6 text-muted-foreground">{post.description}</p>
								<div class="mt-4">
									{@render lintline(post.slug)}
								</div>
							</div>
						</article>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</section>
