<script lang="ts">
	import type { Backer, Backers } from '$lib/types/backers';
	import { Icons } from '$lib/components/icons';
	import BrandIcon from './BrandIcon.svelte';
	import { siteConfig } from '$lib/config/site.js';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import Section from './Section.svelte';

	/**
	 * The people and companies funding Vale, from both platforms, at build time.
	 *
	 * This replaced Open Collective's own `organizations.svg` / `individuals.svg`
	 * embeds. Those are a single flat image: no names, no links, one shared
	 * destination, a fixed light palette that punched two pale holes in the dark
	 * theme, a third-party request on every page view -- and no way to show the
	 * GitHub sponsors at all, since Open Collective doesn't know about them.
	 */
	let {
		backers,
		funding
	}: {
		backers: Backers;
		/**
		 * Totals from `stats.ts`. These used to be a card in the Grants & Awards
		 * grid; they belong over the roster they describe, not beside an award.
		 */
		funding?: { backers: number; yearlyIncome: number };
	} = $props();

	const usd = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	});

	// Their own site if they gave one, their Open Collective profile otherwise.
	// Organizations mostly have both; individuals rarely have a website.
	const to = (b: Backer) => b.website ?? b.profile;

	/**
	 * Everything the people on this wall have given, summed.
	 *
	 * Open Collective totals only -- GitHub reports a rate, which can't be added
	 * to a lifetime figure. Backers only too, so it excludes the grants in the
	 * Grants & Awards section; that's why it sits under "Who backs Vale" and
	 * isn't labelled as everything Vale has ever raised.
	 */
	const allTime = $derived(
		[...backers.organizations, ...backers.individuals].reduce((sum, b) => sum + (b.total ?? 0), 0)
	);

	/**
	 * The lifetime total, with `~` where it was reconstructed rather than
	 * reported -- a cancelled GitHub sponsorship is within one payment of exact.
	 */
	function amount(b: Backer): string | undefined {
		if (b.total === undefined) return undefined;
		return (b.estimated ? '~' : '') + usd.format(b.total);
	}

	/** Spelled out on hover, so the `~` isn't the only thing explaining itself. */
	function basis(b: Backer): string | undefined {
		if (b.source === 'opencollective') return 'Lifetime total on Open Collective';
		if (!b.estimated) return 'One-time payment on GitHub Sponsors';
		const rate = b.monthly !== undefined ? `${usd.format(b.monthly)}/mo` : 'a monthly tier';
		return `${rate} on GitHub Sponsors${b.active ? ', ongoing' : ', since cancelled'}`;
	}

	/**
	 * Up to two letters, for the 15 backers whose only image is Open Collective's
	 * generated tile. Word-initials where the name has them, so "Spectro Cloud"
	 * reads SC and a mononym still gets two characters.
	 */
	function initials(name: string): string {
		const words = name.trim().split(/\s+/).filter(Boolean);
		if (words.length === 0) return '?';
		if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
		return (words[0][0] + words[words.length - 1][0]).toUpperCase();
	}
</script>

<!--
	Which platform an entry came from. On every card and chip, not just the
	GitHub ones: a mark that appears on some rows reads as a badge singling those
	rows out, where one on all of them reads as a column.

	It also does real work next to the figure -- the Open Collective mark says
	"lifetime total", the GitHub mark says "monthly rate".
-->
{#snippet source(b: Backer)}
	<span
		class="inline-flex shrink-0 opacity-60"
		title={basis(b) ?? (b.source === 'github' ? 'GitHub Sponsors' : 'Open Collective')}
	>
		{#if b.source === 'github'}
			<Icons.GitHub class="h-3 w-3" />
		{:else}
			<BrandIcon name="Open Collective" slug="opencollective" size="h-3 w-3" />
		{/if}
	</span>
{/snippet}

{#if backers.organizations.length || backers.individuals.length}
	<Section
		id="backers"
		eyebrow="Open Collective & GitHub Sponsors"
		title="Who backs Vale"
		lede="Every contribution is public, and so is every expense."
	>
		{#if funding}
			<dl class="mb-10 flex flex-wrap justify-center gap-x-12 gap-y-6 text-center">
				<div>
					<dt class="text-sm text-muted-foreground">Backers</dt>
					<dd class="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
						{funding.backers}
					</dd>
				</div>
				<div>
					<dt class="text-sm text-muted-foreground">All time</dt>
					<dd class="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
						{usd.format(allTime)}
					</dd>
				</div>
				<div>
					<dt class="text-sm text-muted-foreground">A year</dt>
					<dd class="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
						{usd.format(funding.yearlyIncome)}
					</dd>
				</div>
			</dl>
		{/if}

		{#if backers.organizations.length}
			<h3 class="text-sm font-medium text-muted-foreground">Organizations</h3>
			<div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{#each backers.organizations as org}
					<a
						href={to(org)}
						target="_blank"
						rel="noreferrer"
						class="group flex items-center gap-3.5 rounded-xl border border-border bg-card p-4 transition-colors hover:border-lime-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
					>
						<!-- White behind the logo: most are drawn for a light ground and
						     several are dark-on-transparent, so they vanish otherwise. -->
						<span
							class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-white"
						>
							{#if org.image}
								<img
									src={org.image}
									alt=""
									class="h-full w-full object-contain p-1"
									loading="lazy"
								/>
							{:else}
								<span class="text-sm font-semibold text-slate-600">{initials(org.name)}</span>
							{/if}
						</span>
						<span class="min-w-0 flex-1">
							<span class="block truncate text-sm font-medium text-foreground">{org.name}</span>
							<span class="flex items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
								{amount(org) ?? '—'}
								{@render source(org)}
							</span>
						</span>
						<ArrowUpRight
							class="h-4 w-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-lime-500"
						/>
					</a>
				{/each}
			</div>
		{/if}

		{#if backers.individuals.length}
			<h3 class="mt-10 text-sm font-medium text-muted-foreground">
				Individuals
				<span class="text-muted-foreground/60">({backers.individuals.length})</span>
			</h3>
			<!--
				Amounts run from $5 to $1,000, so they're the widest-varying thing in
				the chip: muted and tabular, after a hairline, so the eye can skim the
				column of figures without them competing with the names.
			-->
			<ul class="mt-4 flex flex-wrap gap-2">
				{#each backers.individuals as person}
					<li>
						<a
							href={to(person)}
							target="_blank"
							rel="noreferrer"
							title={person.name}
							class="group flex items-center gap-2.5 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-3.5 transition-colors hover:border-lime-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
						>
							{#if person.image}
								<img
									src={person.image}
									alt=""
									class="h-8 w-8 shrink-0 rounded-full object-cover"
									loading="lazy"
								/>
							{:else}
								<span
									aria-hidden="true"
									class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime-500/15 text-xs font-semibold text-lime-700 dark:text-lime-300"
								>
									{initials(person.name)}
								</span>
							{/if}
							<span class="max-w-[12rem] truncate text-sm text-foreground">{person.name}</span>
							<span aria-hidden="true" class="h-4 w-px shrink-0 bg-border"></span>
							<span
								class="flex shrink-0 items-center gap-1.5 text-sm tabular-nums text-muted-foreground"
							>
								{amount(person) ?? '—'}
								{@render source(person)}
							</span>
						</a>
					</li>
				{/each}
			</ul>
		{/if}

		{#if backers.sources.github}
			<!--
				The column holds two measures, so it has to say so once. Without this
				a $10/mo sponsor reads as having given a tenth of a $100 backer.
			-->
			<p class="mt-6 text-sm text-muted-foreground">
				Amounts are lifetime totals. Open Collective reports them; a
				<Icons.GitHub class="inline h-3 w-3 align-[-0.1em] opacity-60" /> GitHub recurring sponsorship
				has none published, so those are its rate across the cycles it ran and are marked
				<span class="tabular-nums">~</span>.
			</p>
		{/if}

		<!--
			Both platforms, since the wall above now holds both. Same order,
			treatment, and width as the page header: neither is the preferred
			channel, so neither is the filled one.
		-->
		<p class="mt-10 text-sm font-medium text-muted-foreground">Join them</p>
		<div class="mt-3 flex flex-col gap-3 sm:flex-row">
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
	</Section>
{/if}
