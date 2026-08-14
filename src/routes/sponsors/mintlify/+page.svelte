<script lang="ts">
	import InlineCode from '$lib/components/features/InlineCode.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import Section from '$lib/components/features/Section.svelte';
	import ExternalLink from '$lib/components/features/ExternalLink.svelte';
	import BrandIcon from '$lib/components/landing/BrandIcon.svelte';
	import Screenshot from '$lib/components/features/Screenshot.svelte';
	import { sponsors } from '$lib/data/sponsors';
	import type { PageData } from './$types';
	import { Icons } from '$lib/components/icons';
	import { Badge } from '$lib/components/ui/badge';
	import { sponsorPageLabels } from '$lib/data/sponsor-page';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import CircleDollarSign from 'lucide-svelte/icons/circle-dollar-sign';
	import GitBranch from 'lucide-svelte/icons/git-branch';
	import HandHeart from 'lucide-svelte/icons/hand-heart';
	import HeartHandshake from 'lucide-svelte/icons/heart-handshake';

	const sponsor = sponsors.find((s) => s.name === 'Mintlify')!;

	// The amount is read from Open Collective at build time; see
	// src/lib/server/collective.ts. Only the channel is stated here, because
	// that varies by sponsor -- Open Collective, GitHub Sponsors, direct.
	let { data }: { data: PageData } = $props();
	const sponsorship = {
		via: 'Open Collective',
		href: 'https://opencollective.com/vale'
	};

	const description =
		'Mintlify is an AI-native documentation platform built for developers. They sponsor Vale.';

	const reading = [
		{
			source: 'Mintlify blog',
			title: "Behind Replit's documentation transformation",
			body: 'How Replit rebuilt their docs around Diátaxis, with Vale enforcing the writing standards.',
			href: 'https://www.mintlify.com/blog/behind-replits-documentation-transformation'
		},
		{
			source: 'Mintlify guides',
			title: 'Style and tone',
			body: 'Their principles for clear technical writing, and the linters and style guides that hold the line.',
			href: 'https://www.mintlify.com/guides/writing-style-tips'
		},
		{
			source: 'Mintlify guides',
			title: 'Maintenance',
			body: 'Keeping docs current by automating the checks—style, formatting, metadata—on every pull request.',
			href: 'https://www.mintlify.com/guides/maintenance'
		},
		{
			source: 'Mintlify docs',
			title: 'CI checks',
			body: 'The built-in Vale check, and what loads when you do not bring your own configuration.',
			href: 'https://www.mintlify.com/docs/deploy/ci'
		}
	];

	// Verbatim from mintlify.com. Do not paraphrase a company's own copy.
</script>

<MetaTags
	title="Mintlify — Vale sponsors"
	{description}
	canonical="https://vale.sh/sponsors/mintlify"
	openGraph={{
		url: 'https://vale.sh/sponsors/mintlify',
		title: 'Mintlify sponsors Vale',
		description
	}}
/>

<article>
	<header class="border-b border-border/60 py-14 sm:py-20">
		<div class="mx-auto max-w-4xl px-6 lg:px-8">
			<Badge variant="secondary">Sponsor spotlight</Badge>

			<div class="mt-7 flex items-center gap-4">
				<span class="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
					<BrandIcon name="Mintlify" slug="mintlify" class="h-10 w-10" />
				</span>
				<h1 class="text-3xl font-semibold tracking-tight sm:text-5xl">Mintlify</h1>
			</div>

			<p class="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
				<ExternalLink href="https://www.mintlify.com/">Mintlify</ExternalLink> is “an AI-native documentation
				platform built for developers, with beautiful defaults, interactive API playgrounds, and smart
				search.”
			</p>

			<div class="mt-7 flex flex-wrap items-center gap-2">
				<Badge class="text-sm">{data.funding.amount}</Badge>
				<Badge variant="outline" href={sponsorship.href} target="_blank" rel="noreferrer">
					via {sponsorship.via}
				</Badge>
			</div>

			<div class="mt-10">
				<Screenshot
					light={sponsor.shot?.light}
					dark={sponsor.shot?.dark}
					alt="The Mintlify home page"
					caption="mintlify.com"
					href="https://www.mintlify.com/"
					brand={sponsor.brand}
				/>
			</div>
		</div>
	</header>

	<Section
		title={sponsorPageLabels.integration('Mintlify')}
		lede="Mintlify ships two CI checks: one for broken links, one for prose. The prose one is Vale."
	>
		<p class="leading-7 text-muted-foreground">
			Flip on the Grammar linter add-on and it runs on your pull requests — as a Warning that notes
			what it found, or as Blocking when the prose has to be right before the merge.
		</p>

		<p class="mt-6 leading-7 text-muted-foreground">
			Bring a <InlineCode>.vale.ini</InlineCode> and they use it, or take their default and start with
			a style already tuned for MDX.
		</p>

		<figure class="mt-8">
			<!-- Class-based dark mode, so the theme toggle switches these too. -->
			<img
				src="/sponsors/mintlify/config-light.webp"
				alt="Mintlify's Add-ons settings, showing the Grammar linter check set to Disabled, Warning, or Blocking"
				class="w-full rounded-xl border border-border/60 dark:hidden"
				loading="lazy"
			/>
			<img
				src="/sponsors/mintlify/config-dark.webp"
				alt="Mintlify's Add-ons settings, showing the Grammar linter check set to Disabled, Warning, or Blocking"
				class="hidden w-full rounded-xl border border-border/60 dark:block"
				loading="lazy"
			/>
			<figcaption class="mt-3 text-sm text-muted-foreground/70">
				Add-ons → CI/CD checks, in a Mintlify project.
			</figcaption>
		</figure>

		<div class="mt-8">
			<a
				href="https://www.mintlify.com/docs/deploy/ci"
				target="_blank"
				rel="noreferrer"
				class="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90"
			>
				Set it up
				<ArrowRight class="h-4 w-4" />
			</a>
		</div>
	</Section>

	<Section title={sponsorPageLabels.readMore}>
		<div class="grid gap-4 sm:grid-cols-[1.15fr_0.85fr]">
			<a
				href={reading[0].href}
				target="_blank"
				rel="noreferrer"
				class="group relative overflow-hidden rounded-xl border border-border/60 bg-card p-6 transition-colors hover:border-lime-500/50"
			>
				<span
					aria-hidden="true"
					class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-lime-500 via-emerald-400 to-transparent"
				></span>
				<p
					class="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-lime-600 dark:text-lime-400"
				>
					{reading[0].source}
				</p>
				<h3 class="mt-4 text-xl font-semibold tracking-tight text-foreground">
					{reading[0].title}
				</h3>
				<p class="mt-3 text-sm leading-6 text-muted-foreground">{reading[0].body}</p>
				<span class="mt-6 inline-flex items-center gap-2 text-sm font-medium text-foreground">
					Read the story
					<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
				</span>
			</a>

			<div class="divide-y divide-border/60 rounded-xl border border-border/60">
				{#each reading.slice(1) as item}
					<a
						href={item.href}
						target="_blank"
						rel="noreferrer"
						class="group flex items-start gap-4 p-4 transition-colors hover:bg-muted/40"
					>
						<span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-lime-500"></span>
						<span class="min-w-0 flex-1">
							<span class="block text-sm font-medium text-foreground">{item.title}</span>
							<span class="mt-1 block text-xs text-muted-foreground">{item.source}</span>
						</span>
						<ArrowRight
							class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5"
						/>
					</a>
				{/each}
			</div>
		</div>
	</Section>

	<section class="bg-muted/35 py-14 sm:py-20">
		<div class="mx-auto max-w-4xl px-6 lg:px-8">
			<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
				<div>
					<p
						class="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-lime-600 dark:text-lime-400"
					>
						{sponsorPageLabels.supportEyebrow}
					</p>
					<h2 class="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Sponsor Vale</h2>
					<p class="mt-4 max-w-2xl text-pretty leading-7 text-muted-foreground">
						Vale is free, open source, and primarily maintained by one person. Sponsorship buys the
						focused maintenance time that keeps it fast, reliable, and independent.
					</p>
				</div>

				<div class="flex flex-wrap gap-3 lg:justify-end">
					<a
						href="https://github.com/sponsors/jdkato"
						target="_blank"
						rel="noreferrer"
						class="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90"
					>
						<Icons.GitHub class="h-4 w-4" />
						GitHub Sponsors
						<ArrowRight class="h-4 w-4" />
					</a>
					<a
						href="https://opencollective.com/vale"
						target="_blank"
						rel="noreferrer"
						class="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
					>
						<HandHeart class="h-4 w-4" />
						Open Collective
						<ArrowRight class="h-4 w-4" />
					</a>
				</div>
			</div>

			<div class="mt-8 grid gap-3 border-t border-border/60 pt-6 sm:grid-cols-3">
				<div class="rounded-xl border border-border/60 bg-background p-4 shadow-sm">
					<CircleDollarSign class="h-5 w-5 text-lime-600 dark:text-lime-400" />
					<p class="text-sm font-medium text-foreground">$1,000+</p>
					<p class="mt-1 text-sm text-muted-foreground">Sponsor Spotlight eligibility</p>
				</div>
				<div class="rounded-xl border border-border/60 bg-background p-4 shadow-sm">
					<HeartHandshake class="h-5 w-5 text-lime-600 dark:text-lime-400" />
					<p class="text-sm font-medium text-foreground">Open source</p>
					<p class="mt-1 text-sm text-muted-foreground">Funding goes back into Vale</p>
				</div>
				<div class="rounded-xl border border-border/60 bg-background p-4 shadow-sm">
					<GitBranch class="h-5 w-5 text-lime-600 dark:text-lime-400" />
					<p class="text-sm font-medium text-foreground">Two paths</p>
					<p class="mt-1 text-sm text-muted-foreground">
						Sponsor through Open Collective or GitHub
					</p>
				</div>
			</div>
		</div>
	</section>
</article>
