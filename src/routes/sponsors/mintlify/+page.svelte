<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import Section from '$lib/components/features/Section.svelte';
	import ExternalLink from '$lib/components/features/ExternalLink.svelte';
	import BrandIcon from '$lib/components/landing/BrandIcon.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';

	// The means varies by sponsor -- Open Collective, GitHub Sponsors, direct.
	const sponsorship = {
		amount: '$1,000',
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
	const headline = 'The knowledge infrastructure agents build on';
	const subheadline = 'Self-updating documentation for startups, enterprises, and agents.';
	const capabilities = [
		'Agent-native platform',
		'Self-updating knowledge',
		'Control who has access',
		'Connect with your systems',
		'Collaborate with your team & agents',
		'Build on top of your existing setup'
	];
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
			<!-- Disclosure first, so a reader weighs the page before reading it. -->
			<Badge variant="secondary" class="gap-1.5">
				<span aria-hidden="true">✨</span> Sponsor spotlight
			</Badge>

			<div class="mt-6 flex items-center gap-4">
				<BrandIcon name="Mintlify" slug="mintlify" class="h-10 w-10 text-foreground" />
				<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Mintlify</h1>
			</div>

			<p class="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
				<ExternalLink href="https://www.mintlify.com/">Mintlify</ExternalLink> is “an AI-native
				documentation platform built for developers, with beautiful defaults, interactive API
				playgrounds, and smart search.”
			</p>

			<div class="mt-6 flex flex-wrap items-center gap-2">
				<Badge class="text-sm">{sponsorship.amount}</Badge>
				<Badge variant="outline" href={sponsorship.href} target="_blank" rel="noreferrer">
					via {sponsorship.via}
				</Badge>
			</div>
		</div>
	</header>

	<Section title="💬 In their words">
		<!-- The mark, oversized and clipped, as the page's one piece of colour. -->
		<figure
			class="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-8 sm:p-12"
		>
			<BrandIcon
				name=""
				slug="mintlify"
				class="pointer-events-none absolute -right-10 -bottom-14 h-64 w-64 text-emerald-500/10"
			/>
			<div class="relative max-w-2xl">
				<blockquote class="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
					“{headline}”
				</blockquote>
				<p class="mt-5 text-lg leading-8 text-muted-foreground">“{subheadline}”</p>
			</div>
			<figcaption class="sr-only">Mintlify</figcaption>
		</figure>

		<ul class="mt-6 flex flex-wrap gap-2">
			{#each capabilities as name}
				<li>
					<Badge variant="outline" class="text-sm font-normal">{name}</Badge>
				</li>
			{/each}
		</ul>

		<div class="mt-8">
			<a
				href="https://www.mintlify.com/"
				target="_blank"
				rel="noreferrer"
				class="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90"
			>
				Explore Mintlify
				<ArrowRight class="h-4 w-4" />
			</a>
		</div>
	</Section>

	<Section
		title="✅ Vale is built in"
		lede="Mintlify ships two CI checks: one for broken links, one for prose. The prose one is Vale."
	>
		<p class="leading-7 text-muted-foreground">
			Nothing to install, no workflow to copy. Flip on the
			<span class="font-medium text-foreground">Grammar linter</span> add-on and it runs on your pull
			requests—as a
			<span class="font-medium text-foreground">Warning</span> that notes what it found, or as
			<span class="font-medium text-foreground">Blocking</span> when the prose has to be right before
			the merge.
		</p>

		<p class="mt-6 leading-7 text-muted-foreground">
			Bring a <code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">.vale.ini</code> and
			they use it, or take their default and start with a style already tuned for MDX.
		</p>

		<figure class="mt-8">
			<!-- Class-based dark mode, so the theme toggle switches these too. -->
			<img
				src="/sponsors/config-light.png"
				alt="Mintlify's Add-ons settings, showing the Grammar linter check set to Disabled, Warning, or Blocking"
				class="w-full rounded-xl border border-border/60 dark:hidden"
				loading="lazy"
			/>
			<img
				src="/sponsors/config-dark.png"
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

	<Section title="📚 Read more">
		<ul class="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60">
			{#each reading as item}
				<li>
					<a
						href={item.href}
						target="_blank"
						rel="noreferrer"
						class="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
					>
						<div class="min-w-0 flex-1">
							<p class="truncate font-medium text-foreground">
								{item.title}
								<span class="ml-2 text-xs font-normal text-muted-foreground/60">{item.source}</span>
							</p>
							<p class="mt-0.5 truncate text-sm text-muted-foreground">{item.body}</p>
						</div>
						<ArrowRight
							class="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5"
						/>
					</a>
				</li>
			{/each}
		</ul>
	</Section>

	<section class="py-14 sm:py-20">
		<div class="mx-auto max-w-4xl px-6 lg:px-8">
			<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Sponsor Vale</h2>
			<p class="mt-4 max-w-2xl leading-7 text-muted-foreground">
				Vale is free, open source, and primarily maintained by one person. Sponsorship is what buys the time to
				keep it that way.
			</p>

			<div class="mt-8 flex flex-wrap gap-3">
				<a
					href="https://opencollective.com/vale"
					target="_blank"
					rel="noreferrer"
					class="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90"
				>
					Open Collective
					<ArrowRight class="h-4 w-4" />
				</a>
				<a
					href="https://github.com/sponsors/jdkato"
					target="_blank"
					rel="noreferrer"
					class="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
				>
					GitHub Sponsors
				</a>
			</div>
		</div>
	</section>
</article>
