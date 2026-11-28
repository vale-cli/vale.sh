<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import type { PageData } from './$types';
	import adopters from '$lib/data/adopters.json';
	import stats from '$lib/data/adopter-stats.json';
	import { sectors, sectorBySlug, sectorSlug } from '$lib/data/sectors';
	import Section from '$lib/components/landing/Section.svelte';
	import AdopterExplorer from '$lib/components/landing/AdopterExplorer.svelte';
	import BrandIcon from '$lib/components/landing/BrandIcon.svelte';
	import AdoptionCurve from '$lib/components/adopters/AdoptionCurve.svelte';
	import UsageChart from '$lib/components/adopters/UsageChart.svelte';
	import SectorMotif from '$lib/components/adopters/SectorMotif.svelte';
	import AddYourTeam from '$lib/components/adopters/AddYourTeam.svelte';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';

	let { data }: { data: PageData } = $props();

	// The load has already 404ed an unknown slug, so the sector is there.
	const sector = $derived(sectorBySlug(data.slug)!);
	const Icon = $derived(sector.icon);
	const members = $derived(adopters.filter((a) => a.category === data.name));
	const ci = $derived(stats.bySector[data.name as keyof typeof stats.bySector]);

	// The directory's "how it's used" chips, so a bar in the usage chart can
	// turn one on and send the reader to the teams behind it.
	let facets = $state<string[]>([]);
	let category = $derived(data.name);
	function showFacet(id: string) {
		facets = [id];
		document.getElementById('adopters')?.scrollIntoView({ behavior: 'smooth' });
	}

	// The other eight, for moving sideways without going back to the hub.
	const others = $derived(
		sectors
			.filter((s) => s.name !== data.name)
			.map((s) => ({
				name: s.name,
				href: `/adopters/sector/${sectorSlug(s.name)}`,
				count: adopters.filter((a) => a.category === s.name).length
			}))
	);

	const url = $derived(`https://vale.sh/adopters/sector/${data.slug}`);
	const description = $derived(
		`${members.length} teams in ${data.name} run Vale: ${sector.blurb.replace(/\.$/, '').toLowerCase()}. Each entry links to a public .vale.ini, style package, or write-up.`
	);
</script>

<MetaTags
	title="{data.name} — Vale adopters"
	{description}
	canonical={url}
	openGraph={{
		url,
		title: `Vale in ${data.name}`,
		description,
		images: [
			{
				url: 'https://vale.sh/media/adopters-og.png',
				width: 1200,
				height: 630,
				alt: `${members.length} teams in ${data.name} run Vale`
			}
		]
	}}
/>

<!--
	A sector's deep dive. The hub's band for this sector, opened up: who is
	in it and why, when they arrived, what they run, and every team's card.
	Keyed on the sector, so moving between sector pages rebuilds the charts
	instead of carrying the last sector's numbers.
-->
{#key data.slug}
	<header class="relative isolate overflow-hidden border-b border-border/60">
		<svg
			aria-hidden="true"
			class="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.07] [mask-image:linear-gradient(to_top_left,#000,transparent_70%)] dark:opacity-[0.11] {sector
				.theme.motif}"
		>
			<defs>
				<pattern id="motif-hero" width="176" height="176" patternUnits="userSpaceOnUse">
					<SectorMotif kind="sector-{data.slug}" size={160} />
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill="url(#motif-hero)" />
		</svg>
		<div class="mx-auto max-w-6xl px-6 py-12 sm:py-16 lg:border-x lg:border-border/60 lg:px-8">
			<a
				href="/adopters#sectors"
				class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft class="h-4 w-4" />
				All sectors
			</a>
			<div class="mt-8 flex items-center gap-3">
				<span
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-md ring-1 ring-border {sector
						.theme.box}"
				>
					<Icon class="h-5 w-5" />
				</span>
				<p
					class="font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-lime-600 dark:text-lime-400"
				>
					Sector
				</p>
			</div>
			<h1 class="mt-4 text-balance text-4xl font-medium tracking-tight sm:text-5xl">
				Vale in {data.name}
			</h1>
			<p class="mt-4 max-w-2xl text-pretty text-lg leading-8 text-foreground/85">
				{sector.blurb}
			</p>
			<dl class="mt-8 flex flex-wrap gap-x-10 gap-y-4">
				<div>
					<dt class="text-xs text-muted-foreground">Teams</dt>
					<dd class="mt-1 font-mono text-2xl tabular-nums text-foreground">{members.length}</dd>
				</div>
				{#if ci?.checked}
					<div>
						<dt class="text-xs text-muted-foreground">Run it in CI</dt>
						<dd class="mt-1 font-mono text-2xl tabular-nums text-foreground">
							{ci.ci}<span class="text-base text-muted-foreground">&nbsp;of {ci.checked}</span>
						</dd>
					</div>
					{#if ci.house}
						<div>
							<dt class="text-xs text-muted-foreground">Wrote house rules</dt>
							<dd class="mt-1 font-mono text-2xl tabular-nums text-foreground">{ci.house}</dd>
						</div>
					{/if}
				{/if}
				{#if data.studies.length}
					<div>
						<dt class="text-xs text-muted-foreground">Case studies</dt>
						<dd class="mt-1 font-mono text-2xl tabular-nums text-foreground">
							{data.studies.length}
						</dd>
					</div>
				{/if}
			</dl>
		</div>
	</header>

	{#if data.studies.length}
		<Section
			id="studies"
			eyebrow="Case studies"
			title="How they set it up"
			lede="Each post reads one team's setup end to end: the config, the rules they wrote, and where it runs."
		>
			<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.studies as study (study.slug)}
					<li>
						<a
							href="/blog/{study.slug}"
							class="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 {sector
								.theme.hover}"
						>
							<div class="flex items-center gap-2.5">
								<BrandIcon
									name={study.team.name}
									slug={study.team.icon}
									avatar={study.team.avatar}
									size="h-6 w-6"
								/>
								<span class="text-sm text-muted-foreground">{study.team.name}</span>
								{#if study.draft}
									<span
										class="rounded-full border border-amber-500/50 px-1.5 py-px text-[10px] font-medium text-amber-600 dark:text-amber-400"
										>Draft</span
									>
								{/if}
							</div>
							<p
								class="mt-3 font-medium leading-6 text-foreground group-hover:text-lime-600 dark:group-hover:text-lime-400"
							>
								{study.title}
							</p>
							{#if study.figure}
								<p class="mt-auto pt-4 font-mono text-xs text-muted-foreground">
									{study.figure}
									{study.figureLabel}
								</p>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</Section>
	{/if}

	<Section
		id="growth"
		eyebrow="Over time"
		title="When the sector arrived"
		lede="The date each team's config first landed in its repo, counted from commits."
	>
		<AdoptionCurve sector={data.name} />
	</Section>

	{#snippet usageLede()}
		Counted from each team's public repository and config, with the same tests the directory filters
		by. Pick a bar to see the teams behind it.
	{/snippet}

	<Section id="usage" eyebrow="In practice" title="What these teams run" lede={usageLede}>
		<UsageChart sector={data.name} onpick={showFacet} />
	</Section>

	<AdopterExplorer bind:activeCategory={category} bind:facets studied={data.studied} lock />

	<Section id="other-sectors" eyebrow="Sectors" title="The other eight">
		<ul class="flex flex-wrap justify-center gap-2">
			{#each others as other (other.name)}
				<li>
					<a
						href={other.href}
						class="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
					>
						{other.name}
						<span class="text-xs">{other.count}</span>
					</a>
				</li>
			{/each}
		</ul>
	</Section>

	<AddYourTeam />
{/key}
