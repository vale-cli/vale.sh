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
	import AddYourTeam from '$lib/components/adopters/AddYourTeam.svelte';

	let { data }: { data: PageData } = $props();

	const total = adopters.length;

	// Owned here so the sector bands and the directory's chips move together.
	let category = $state('All');

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
{/snippet}

<!--
	The page is composition: each section is its own component under
	src/lib/components/adopters, and only the sector filter is shared, so the
	bands' "Browse" links and the directory's chips move together.
-->
<Header {total} sectors={sectors.length} posts={data.posts} />

<Section id="sectors" eyebrow="Sectors" title="Where the writing gets checked" lede={sectorsLede}>
	<AdoptionCurve />
	<div class="mt-3">
		<Figures />
	</div>
	<div class="mt-12">
		<SectorBands bind:category posts={data.posts} />
	</div>
</Section>

<AdopterExplorer bind:activeCategory={category} studied={data.studied} />

<AddYourTeam />
