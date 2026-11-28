<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import type { PageData } from './$types';
	import adopters from '$lib/data/adopters.json';
	import { sectors } from '$lib/data/sectors';
	import Section from '$lib/components/landing/Section.svelte';
	import AdopterExplorer from '$lib/components/landing/AdopterExplorer.svelte';
	import Header from '$lib/components/adopters/Header.svelte';
	import Figures from '$lib/components/adopters/Figures.svelte';
	import AdoptionCurve from '$lib/components/adopters/AdoptionCurve.svelte';
	import SectorBands from '$lib/components/adopters/SectorBands.svelte';
	import UsageChart from '$lib/components/adopters/UsageChart.svelte';
	import AddYourTeam from '$lib/components/adopters/AddYourTeam.svelte';

	let { data }: { data: PageData } = $props();

	const total = adopters.length;

	// The directory's sector chip. Each band links to its sector's own page.
	let category = $state('All');

	// The directory's "how it's used" chips, owned here so a bar in the usage
	// chart can turn one on and send the reader to the teams behind it.
	let facets = $state<string[]>([]);
	function showFacet(id: string) {
		category = 'All';
		facets = [id];
		document.getElementById('adopters')?.scrollIntoView({ behavior: 'smooth' });
	}

	const description = `${total} teams across ${sectors.length} sectors run Vale, each entry linking to a public .vale.ini, style package, or write-up.`;
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
				url: 'https://vale.sh/media/adopters-og.png',
				width: 1200,
				height: 630,
				alt: `${total} teams run Vale`
			}
		]
	}}
/>

{#snippet sectorsLede()}
	Every team, grouped by the sector it works in, with what its repos do counted rather than claimed.
	Each sector has its own page: the whole roster, its adoption curve, and what its teams run.
{/snippet}

<!--
	The page is composition: each section is its own component under
	src/lib/components/adopters. Each band summarizes a sector and links to
	its page under /adopters/sector, which reuses the same components.
-->
<Header {total} sectors={sectors.length} posts={data.posts} />

<Section id="sectors" eyebrow="Sectors" title="Where the writing gets checked" lede={sectorsLede}>
	<AdoptionCurve />
	<div class="mt-3">
		<Figures />
	</div>
	<div class="mt-12">
		<SectorBands posts={data.posts} />
	</div>
</Section>

{#snippet usageLede()}
	Counted from each team's public repository and config, with the same tests the directory filters
	by. Pick a bar to see the teams behind it.
{/snippet}

<Section id="usage" eyebrow="In practice" title="What teams actually run" lede={usageLede}>
	<UsageChart onpick={showFacet} />
</Section>

<AdopterExplorer bind:activeCategory={category} bind:facets studied={data.studied} />

<AddYourTeam />
