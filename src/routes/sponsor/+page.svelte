<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import { siteConfig } from '$lib/config/site.js';
	import SponsorSpotlight from '$lib/components/landing/SponsorSpotlight.svelte';
	import Recognition from '$lib/components/landing/Recognition.svelte';
	import Backers from '$lib/components/landing/Backers.svelte';
	import Thanks from '$lib/components/landing/Thanks.svelte';
	import BrandIcon from '$lib/components/landing/BrandIcon.svelte';
	import { Icons } from '$lib/components/icons';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import CircleDollarSign from 'lucide-svelte/icons/circle-dollar-sign';
	import GitBranch from 'lucide-svelte/icons/git-branch';
	import HeartHandshake from 'lucide-svelte/icons/heart-handshake';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const description =
		'Who funds Vale, who has recognized it, and who donates the infrastructure it runs on.';

	// Verbatim from the close of each spotlight page, so a reader arriving from
	// one meets the same three facts rather than a differently-worded set.
	const facts = [
		{
			icon: CircleDollarSign,
			term: '$1,000+',
			gloss: 'Sponsor Spotlight eligibility'
		},
		{
			icon: HeartHandshake,
			term: 'Open source',
			gloss: 'Funding goes back into Vale'
		},
		{
			icon: GitBranch,
			term: 'Two paths',
			gloss: 'Sponsor through Open Collective or GitHub'
		}
	];
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
	<div class="mx-auto max-w-4xl px-6 py-16 text-center lg:px-8">
		<p class="text-base font-semibold text-lime-500">Support</p>
		<h1 class="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
			Who keeps Vale running
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
			Vale is free and MIT-licensed, and stays that way because companies sponsor the work,
			foundations fund it, and providers donate the infrastructure it runs on.
		</p>

		<!--
			Two ways to give the same thing, so neither is the primary action: same
			outline treatment, same width from `sm` up. Filling one of them told the
			reader there was a preferred channel, and there isn't.
		-->
		<div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
			<a
				href={siteConfig.links.sponsors}
				target="_blank"
				rel="noreferrer"
				class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 sm:w-64"
			>
				<Icons.GitHub class="h-4 w-4" />
				GitHub Sponsors
				<ArrowUpRight class="h-4 w-4" />
			</a>
			<a
				href={siteConfig.links.openCollective}
				target="_blank"
				rel="noreferrer"
				class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 sm:w-64"
			>
				<BrandIcon name="Open Collective" slug="opencollective" size="h-4 w-4" />
				Open Collective
				<ArrowUpRight class="h-4 w-4" />
			</a>
		</div>

		<!--
			The same three facts the spotlight pages close on. Left-aligned under a
			centered header: three short stacks of icon-term-gloss read as a column
			each, and centering them leaves the eye no edge to come back to.
		-->
		<div class="mt-10 grid gap-3 border-t border-border/60 pt-8 text-left sm:grid-cols-3">
			{#each facts as fact}
				<div class="rounded-xl border border-border/60 bg-background p-4 shadow-sm">
					<fact.icon class="h-5 w-5 text-lime-600 dark:text-lime-400" />
					<p class="mt-2 text-sm font-medium text-foreground">{fact.term}</p>
					<p class="mt-1 text-sm text-muted-foreground">{fact.gloss}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!--
	Who pays for Vale, in descending order of how much the reader is being asked
	to care: the spotlight sponsors, then everyone else funding it, then the
	donated infrastructure. Grants & Awards is last -- it's the page's credential,
	not its ask.
-->
<SponsorSpotlight more={false} />
<Backers backers={data.backers} funding={data.stats.funding} />
<Thanks />
<Recognition />
