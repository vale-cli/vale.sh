<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import adopters from '$lib/data/adopters.json';
	import AdopterExplorer from '$lib/components/landing/AdopterExplorer.svelte';

	const total = adopters.length;

	const description = `${total} teams running Vale, each entry linking to a public .vale.ini, style package, or write-up.`;
</script>

<MetaTags
	title="Adopters"
	{description}
	canonical="https://vale.sh/adopters"
	openGraph={{
		url: 'https://vale.sh/adopters',
		title: 'Teams running Vale',
		description,
		images: [
			{
				url: '/media/mac.png',
				width: 800,
				height: 600,
				alt: 'Example Vale output'
			}
		]
	}}
/>

<!-- Header, matching the Media Library's frame. -->
<section class="relative overflow-hidden border-b border-border/60">
	<div
		class="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(hsl(var(--foreground)/0.05)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_60%,transparent_100%)]"
	></div>
	<div class="mx-auto max-w-3xl px-6 py-16 text-center lg:px-8">
		<p class="text-base font-semibold text-lime-500">Adopters</p>
		<h1 class="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
			Who runs Vale
		</h1>
		<p class="mx-auto mt-4 text-pretty text-lg leading-8 text-muted-foreground">
			{total} teams, and nothing here is a logo we were given permission to show. Every entry links to
			a public configuration, style package, or write-up you can open and read.
		</p>
	</div>
</section>

<AdopterExplorer />
