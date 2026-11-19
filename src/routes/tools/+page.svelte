<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import { tools } from '$lib/tools';

	const title = 'Free Writing Tools: AI Detector, Word Counter, Readability Checker';
	const description =
		'Free writing tools that run in your browser: an AI writing detector, word counter, readability checker, title case converter, and style guide comparison. No sign-up.';
	const url = 'https://vale.sh/tools';

	const jsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: 'Writing tools',
		itemListElement: tools.map((t, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: t.title,
			url: `${url}/${t.slug}`
		}))
	}).replace(/</g, '\\u003c');
</script>

<MetaTags
	{title}
	{description}
	canonical={url}
	openGraph={{ url, title, description, type: 'website' }}
	twitter={{ cardType: 'summary_large_image' }}
/>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<script type="application/ld+json">${jsonLd}</` + `script>`}
</svelte:head>

<div class="mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8">
	<header class="max-w-2xl">
		<p
			class="font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-lime-600 dark:text-lime-400"
		>
			Free writing tools
		</p>
		<h1 class="mt-4 text-balance text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
			Tools for people who write
		</h1>
		<p class="mt-5 text-pretty text-lg leading-8 text-foreground/85">
			Five tools, free to use with no account. Each one runs in your browser, so the text you paste
			never leaves your device.
		</p>
	</header>

	<ul class="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each tools as t (t.slug)}
			{@const Icon = t.icon}
			<li class="flex">
				<a
					href="/tools/{t.slug}"
					class="group flex w-full flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-lime-500/40"
				>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl border border-lime-500/20 bg-lime-500/10 text-lime-600 dark:text-lime-400"
					>
						<Icon class="h-5 w-5" aria-hidden="true" />
					</div>
					<h2 class="text-lg font-medium text-foreground">{t.title}</h2>
					<p class="text-sm leading-relaxed text-foreground/85">{t.blurb}</p>
					<span
						class="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-lime-600 dark:text-lime-400"
					>
						Open
						<ArrowRight
							class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
							aria-hidden="true"
						/>
					</span>
				</a>
			</li>
		{/each}
	</ul>

	<section class="mt-16 max-w-2xl">
		<h2 class="text-2xl font-medium tracking-tight">Why these are free</h2>
		<p class="mt-4 leading-7 text-foreground/85">
			They come from <a
				href="/"
				class="font-medium text-foreground underline decoration-lime-500 decoration-2 underline-offset-4"
				>Vale</a
			>, an open-source linter for prose. Vale checks writing against a style guide the way a code
			linter checks code: in your editor, and on every commit. These pages do one check at a time on
			whatever you paste. Vale does all of them, on every file, every time something changes.
		</p>
		<a
			href="https://docs.vale.sh/topics/quickstart"
			class="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-lime-500 decoration-2 underline-offset-4 transition-colors hover:text-lime-600 dark:hover:text-lime-400"
		>
			Get started with Vale
			<ArrowRight class="h-4 w-4" aria-hidden="true" />
		</a>
	</section>
</div>
