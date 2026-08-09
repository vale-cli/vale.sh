<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import { siteConfig } from '$lib/config/site.js';
	import SponsorSpotlight from '$lib/components/landing/SponsorSpotlight.svelte';
	import Recognition from '$lib/components/landing/Recognition.svelte';
	import Thanks from '$lib/components/landing/Thanks.svelte';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const description =
		'Who funds Vale, who has recognized it, and who donates the infrastructure it runs on.';
</script>

<MetaTags
	title="Support Vale"
	{description}
	canonical="https://vale.sh/sponsor"
	openGraph={{
		url: 'https://vale.sh/sponsor',
		title: 'Support Vale',
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
		<p class="text-base font-semibold text-lime-500">Support</p>
		<h1 class="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
			Who keeps Vale running
		</h1>
		<p class="mx-auto mt-4 text-pretty text-lg leading-8 text-muted-foreground">
			Vale is free and MIT-licensed, and stays that way because companies sponsor the work,
			foundations fund it, and providers donate the infrastructure it runs on.
		</p>

		<div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
			<a
				href={siteConfig.links.openCollective}
				target="_blank"
				rel="noreferrer"
				class="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
			>
				Back Vale on Open Collective
				<ArrowUpRight class="h-4 w-4" />
			</a>
			<a
				href={siteConfig.links.sponsors}
				target="_blank"
				rel="noreferrer"
				class="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
			>
				GitHub Sponsors
				<ArrowUpRight class="h-4 w-4" />
			</a>
		</div>
	</div>
</section>

<SponsorSpotlight />
<Recognition stats={data.stats} />
<Thanks />
