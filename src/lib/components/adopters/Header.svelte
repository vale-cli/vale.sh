<script lang="ts">
	import FileText from 'lucide-svelte/icons/file-text';
	import Layers from 'lucide-svelte/icons/layers';
	import Users from 'lucide-svelte/icons/users';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import adopters from '$lib/data/adopters.json';
	import stats from '$lib/data/adopter-stats.json';
	import BrandIcon from '$lib/components/landing/BrandIcon.svelte';

	type HeroPost = {
		slug: string;
		title: string;
		description: string;
		date: string;
		tags: string[];
		image: string | null;
		imageAlt: string;
		draft: boolean;
		figure: string | null;
		figureLabel: string;
		brand: string | null;
	};

	/*
		The page's opening: eyebrow, title, the lede, and three facts: two read
		off the list itself, and the count of public configs GitHub finds at
		all, which is how far past this list the tool reaches.
	*/
	let {
		total,
		sectors,
		posts = []
	}: {
		total: number;
		sectors: number;
		/** Published case studies and adopter posts, from the route's load. */
		posts?: HeroPost[];
	} = $props();

	const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

	const dateOf = (iso: string) =>
		new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});

	// The newest study leads; the rest run as a strip of marks under it, each
	// the team the post is about, and are shelved again in their sector's band.
	const featured = $derived(posts[0]);
	const marks = new Map(
		adopters.map((a) => [a.name, a as { name: string; icon?: string; avatar?: string }])
	);
	const others = $derived(
		posts
			.slice(1)
			.filter((p) => p.brand && marks.has(p.brand))
			.map((p) => ({ ...p, team: marks.get(p.brand as string)! }))
	);

	const facts = [
		{ icon: Users, term: String(total), gloss: 'teams listed' },
		{ icon: Layers, term: String(sectors), gloss: 'sectors' },
		{
			icon: FileText,
			term: compact.format(stats.publicConfigs ?? 0),
			gloss: 'public configs on GitHub'
		}
	];
</script>

<!-- Matches the Support page's frame. -->
<section class="relative overflow-hidden border-b border-border/60">
	<div
		class="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(hsl(var(--foreground)/0.05)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_60%,transparent_100%)]"
	></div>
	<div class="mx-auto max-w-4xl px-6 py-16 text-center lg:px-8">
		<p class="text-base font-semibold text-lime-600 dark:text-lime-400">Adopters</p>
		<h1 class="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
			One linter, every sector
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
			Hyperscalers and observatories, chip makers and government services, AI labs and Linux
			distributions. Every entry links to something you can open: the <code
				class="rounded bg-muted px-1.5 py-0.5 text-base">.vale.ini</code
			> a team runs, the style package it publishes, or the page it wrote about running it.
		</p>

		<dl class="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-3">
			{#each facts as fact (fact.gloss)}
				{@const Icon = fact.icon}
				<div class="rounded-xl border border-border bg-card px-3 py-4">
					<dt class="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
						<Icon class="h-3.5 w-3.5" />
						{fact.gloss}
					</dt>
					<dd class="mt-1 text-2xl font-semibold tracking-tight">{fact.term}</dd>
				</div>
			{/each}
		</dl>
	</div>

	{#if featured}
		<!--
			One study, the newest, as a single wide banner. The hero is where a
			visitor decides whether the list is worth reading, and a post that
			explains one team's setup end to end is the strongest answer. It stays
			this size however long the series gets: the rest are shelved in their
			sector's band, and the count here says how many there are.
		-->
		<div class="mx-auto max-w-5xl px-6 pb-16 lg:px-8">
			<div class="mb-4 flex items-baseline justify-between">
				<p class="font-mono text-[11px] uppercase tracking-[0.13em] text-muted-foreground">
					Latest case study
				</p>
				<a
					href="/blog/tags/case-studies"
					class="inline-flex items-center gap-1 text-sm font-medium text-lime-600 hover:underline dark:text-lime-400"
				>
					All {posts.length}
					{posts.length === 1 ? 'study' : 'studies'}
					<ArrowRight class="h-4 w-4" />
				</a>
			</div>
			<a
				href="/blog/{featured.slug}"
				class="group grid overflow-hidden rounded-xl border border-border bg-card text-left transition-all duration-200 hover:border-lime-500/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 md:grid-cols-[2fr_3fr]"
			>
				{#if featured.image}
					<!--
						The post's branded card, cropped to the banner's height. Its
						subject sits at the center of the image, so the crop keeps it.
					-->
					<img
						src={featured.image}
						alt={featured.imageAlt}
						loading="lazy"
						class="aspect-[2/1] h-full w-full border-b border-border object-cover md:aspect-auto md:border-b-0 md:border-r"
					/>
				{/if}
				<span class="flex flex-col p-6">
					<span class="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
						{dateOf(featured.date)}
						{#if featured.draft}
							<span
								class="rounded-full border border-amber-500/50 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400"
								>Draft</span
							>
						{/if}
					</span>
					{#if featured.figure}
						<!-- The study's one number, the way a customer page leads with a metric. -->
						<span class="mt-2 block text-4xl font-semibold tracking-tight text-foreground"
							>{featured.figure}</span
						>
						<span class="block text-xs leading-5 text-muted-foreground">{featured.figureLabel}</span
						>
					{/if}
					<span
						class="mt-3 text-balance text-xl font-semibold leading-snug tracking-tight text-foreground"
						>{featured.title}</span
					>
					<span class="mt-2 line-clamp-3 grow text-sm leading-6 text-muted-foreground"
						>{featured.description}</span
					>
					<span
						class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-lime-600 dark:text-lime-400"
					>
						Read
						<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
					</span>
				</span>
			</a>
			{#if others.length}
				<!-- The rest of the series as marks: a strip that stays one line deep as it grows. -->
				<ul class="mt-4 flex flex-wrap items-center gap-2" aria-label="More case studies">
					<li class="mr-1 font-mono text-[11px] uppercase tracking-[0.13em] text-muted-foreground">
						Also
					</li>
					{#each others as post (post.slug)}
						<li>
							<a
								href="/blog/{post.slug}"
								title={post.title}
								class="group/mark inline-flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 text-sm transition-colors hover:border-lime-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
							>
								<BrandIcon
									name={post.team.name}
									slug={post.team.icon}
									avatar={post.team.avatar}
									size="h-6 w-6"
								/>
								<span class="font-medium text-foreground">{post.team.name}</span>
								{#if post.figure}
									<span class="font-mono text-xs text-muted-foreground">{post.figure}</span>
								{/if}
								{#if post.draft}
									<span
										class="rounded-full border border-amber-500/50 px-1.5 py-px text-[10px] font-medium text-amber-600 dark:text-amber-400"
										>Draft</span
									>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
</section>
