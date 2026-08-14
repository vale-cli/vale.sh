<script lang="ts">
	import InlineCode from '$lib/components/features/InlineCode.svelte';
	import Literals from '$lib/components/features/Literals.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import Section from '$lib/components/features/Section.svelte';
	import ExternalLink from '$lib/components/features/ExternalLink.svelte';
	import BrandIcon from '$lib/components/landing/BrandIcon.svelte';
	import Screenshot from '$lib/components/features/Screenshot.svelte';
	import { Icons } from '$lib/components/icons';
	import { Badge } from '$lib/components/ui/badge';
	import { sponsorPageLabels } from '$lib/data/sponsor-page';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import CheckCircle from 'lucide-svelte/icons/circle-check';
	import CircleDollarSign from 'lucide-svelte/icons/circle-dollar-sign';
	import Download from 'lucide-svelte/icons/download';
	import GitBranch from 'lucide-svelte/icons/git-branch';
	import HandHeart from 'lucide-svelte/icons/hand-heart';
	import HeartHandshake from 'lucide-svelte/icons/heart-handshake';
	import Wrench from 'lucide-svelte/icons/wrench';
	import { sponsors } from '$lib/data/sponsors';

	// The card on the landing page and this panel are the same brand; read it
	// from the one place that defines it.
	const sponsor = sponsors.find((s) => s.name === 'Promptless')!;

	// The means varies by sponsor -- Open Collective, GitHub Sponsors, direct.
	// TODO: confirm the amount and channel before publishing.
	const sponsorship = {
		amount: '$1,000',
		via: 'Open Collective',
		href: 'https://opencollective.com/vale'
	};

	const description =
		'Promptless suggests doc updates when your product changes. You review, edit, and ship. They sponsor Vale.';

	const reading = [
		{
			source: 'Promptless docs',
			title: 'Standards enforcement',
			body: 'How Vale fits into the drafting loop, and what happens to a violation at each severity.',
			href: 'https://promptless.ai/docs/audit/standards-enforcement/'
		},
		{
			source: 'Promptless',
			title: 'How Promptless works',
			body: 'Listen, draft, review, publish — the four steps an update passes through.',
			href: 'https://promptless.ai/'
		}
	];

	// Verbatim from promptless.ai. Do not paraphrase a company's own copy.

	// What Promptless does with a Vale configuration, from their docs.
	const workflow = [
		{
			title: 'Sync',
			body: "Downloads the external style packages your config references, when they aren't already vendored in your repository.",
			icon: Download
		},
		{
			title: 'Lint',
			body: 'Lints every prose file it creates or substantially edits.',
			icon: CheckCircle
		},
		{
			title: 'Fix',
			body: 'Fixes findings against your `MinAlertLevel` — every finding Vale reports when you set one, or `error`-severity as blocking when you leave it unset.',
			icon: Wrench
		}
	];
</script>

<MetaTags
	title="Promptless — Vale sponsors"
	{description}
	canonical="https://vale.sh/sponsors/promptless"
	openGraph={{
		url: 'https://vale.sh/sponsors/promptless',
		title: 'Promptless sponsors Vale',
		description
	}}
/>

<article>
	<header
		class="border-b border-border/60 py-14 sm:py-20"
		style="--brand: {sponsor.brand}; --brand-fg: {sponsor.fg};"
	>
		<div class="mx-auto max-w-4xl px-6 lg:px-8">
			<Badge variant="secondary">Sponsor spotlight</Badge>

			<div class="mt-7 flex items-center gap-4">
				<span class="rounded-xl bg-[--brand] p-2.5 text-[--brand-fg]">
					<BrandIcon name="Promptless" avatar="/users/avatars/Promptless.png" size="h-10 w-10" />
				</span>
				<h1 class="text-3xl font-semibold tracking-tight sm:text-5xl">Promptless</h1>
			</div>

			<p class="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
				<ExternalLink href="https://promptless.ai/">Promptless</ExternalLink> suggests doc updates when
				your product changes. You review, edit, and ship.
			</p>

			<div class="mt-7 flex flex-wrap items-center gap-2">
				<Badge class="text-sm">{sponsorship.amount}</Badge>
				<Badge variant="outline" href={sponsorship.href} target="_blank" rel="noreferrer">
					via {sponsorship.via}
				</Badge>
			</div>

			<div class="mt-10">
				<Screenshot
					light={sponsor.shot?.light}
					dark={sponsor.shot?.dark}
					alt="The Promptless home page"
					caption="promptless.ai"
					href="https://promptless.ai/"
					brand={sponsor.brand}
				/>
			</div>
		</div>
	</header>

	<Section
		title={sponsorPageLabels.integration('Promptless')}
		lede="Vale runs on the draft, before a human is asked to read it."
	>
		<div
			class="grid gap-3 sm:grid-cols-3"
			style="--brand: {sponsor.brand}; --brand-fg: {sponsor.fg};"
		>
			{#each workflow as step, index}
				<div
					class="hover:border-[--brand]/70 group relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-colors"
				>
					<span aria-hidden="true" class="absolute inset-x-0 top-0 h-1 bg-[--brand]"></span>
					<div class="flex items-start justify-between gap-4">
						<span class="rounded-lg bg-[--brand] p-2.5 text-[--brand-fg] shadow-sm">
							<svelte:component this={step.icon} class="h-5 w-5" />
						</span>
						<span
							class="font-mono text-xs font-semibold tabular-nums text-muted-foreground/70 transition-colors group-hover:text-foreground"
						>
							0{index + 1}
						</span>
					</div>
					<h3 class="mt-5 text-lg font-semibold tracking-tight">{step.title}</h3>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">
						<Literals text={step.body} />
					</p>
				</div>
			{/each}
		</div>

		<p class="mt-8 leading-7 text-muted-foreground">
			Vale is “enabled automatically when Promptless detects a Vale configuration file in your docs
			repository”, and from then on it lints “every prose file it creates or substantially edits.”
		</p>

		<p class="mt-6 leading-7 text-muted-foreground">
			Set <InlineCode>MinAlertLevel</InlineCode> and Promptless “fixes every finding Vale reports at
			or above that level, including warnings and suggestions.” Leave it unset and it treats
			<InlineCode>error</InlineCode> rules as hard constraints, weighing warnings and suggestions against
			the voice already in your docs.
		</p>

		<p class="mt-6 leading-7 text-muted-foreground">
			It reads the Vale job in your GitHub Actions workflows and reproduces that invocation locally
			on the changed files, confirming they pass before the suggestion is raised. When a run fails
			on a Promptless pull request anyway, it analyzes the failure and pushes the fix to the branch.
		</p>

		<p class="mt-6 leading-7 text-muted-foreground">
			Your <InlineCode>.vale.ini</InlineCode> is what tells an agent how your team writes. The style
			guide stops being a document people are asked to remember and becomes the constraint the drafts
			are generated against.
		</p>

		<div class="mt-8">
			<a
				href="https://promptless.ai/docs/audit/standards-enforcement/"
				target="_blank"
				rel="noreferrer"
				class="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90"
			>
				See the integration
				<ArrowRight class="h-4 w-4" />
			</a>
		</div>
	</Section>

	<Section title={sponsorPageLabels.readMore}>
		<div class="grid gap-4 sm:grid-cols-2">
			{#each reading as item}
				<a
					href={item.href}
					target="_blank"
					rel="noreferrer"
					class="hover:border-[--brand]/70 group relative overflow-hidden rounded-xl border border-border/60 bg-card p-6 transition-colors"
					style="--brand: {sponsor.brand};"
				>
					<span aria-hidden="true" class="absolute inset-x-0 top-0 h-1 bg-[--brand]"></span>
					<p
						class="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
					>
						{item.source}
					</p>
					<h3 class="mt-4 text-xl font-semibold tracking-tight text-foreground">{item.title}</h3>
					<p class="mt-3 text-sm leading-6 text-muted-foreground">{item.body}</p>
					<span class="mt-6 inline-flex items-center gap-2 text-sm font-medium text-foreground">
						Open resource
						<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
					</span>
				</a>
			{/each}
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
