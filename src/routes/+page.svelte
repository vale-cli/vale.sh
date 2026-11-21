<script lang="ts">
	import type { PageData } from './$types';
	import Overview from '$lib/components/landing/Overview.svelte';
	import SponsorSpotlight from '$lib/components/landing/SponsorSpotlight.svelte';
	import AdopterConfigs from '$lib/components/landing/AdopterConfigs.svelte';
	import Promo from '$lib/components/landing/Promo.svelte';
	import FeatureIndex from '$lib/components/landing/FeatureIndex.svelte';
	import HowItWorks from '$lib/components/landing/HowItWorks.svelte';
	import Integrations from '$lib/components/landing/Integrations.svelte';
	import Browser from '$lib/components/landing/Browser.svelte';
	import Agents from '$lib/components/landing/Agents.svelte';
	import { MetaTags } from 'svelte-meta-tags';

	let { data }: { data: PageData } = $props();

	const description =
		'Vale is a command-line tool that brings code-like linting to prose. Cross-platform, written in Go, and run by teams at AWS, NVIDIA, Microsoft, GitLab, and Red Hat.';
	const cardAlt =
		"Vale: Your style. Our editor. A linter for prose, beside an alert reading: Use 'Vale CLI' instead of 'Vale cli'.";
</script>

<MetaTags
	title="Vale: Your style, our editor"
	{description}
	canonical="https://vale.sh"
	openGraph={{
		url: 'https://vale.sh',
		title: 'Vale: Your style, our editor',
		description,
		images: [
			{
				url: 'https://vale.sh/media/home-og.png',
				width: 1200,
				height: 630,
				alt: cardAlt
			}
		]
	}}
	twitter={{
		cardType: 'summary_large_image',
		site: '@jdkato',
		title: 'Vale: Your style, our editor',
		description,
		image: 'https://vale.sh/media/home-og.png',
		imageAlt: cardAlt
	}}
/>

<!--
	The page makes its case and then stops. Everything a visitor might want
	*after* being convinced lives on its own page: the adopter explorer on
	/adopters, recognition and infrastructure on /sponsor, events and press in
	the library, and the agent toolchain's detail on /agents. AdopterConfigs
	stays because the proof is the argument, the sponsor band stays because
	that visibility is what a sponsorship buys, the agent section stays as a
	summary of its page, and Getting started stays because the hero's button
	lands there. The blog is in the header.
-->
<main>
	<Overview
		stats={data.stats}
		adopters={data.band.total}
		rules={{
			technical: data.snippets.heroTechnical,
			creative: data.snippets.heroCreative,
			scientific: data.snippets.heroScientific
		}}
	/>
	<Promo />
	<SponsorSpotlight editorial />
	<AdopterConfigs band={data.band} editorial />
	<FeatureIndex />
	<Integrations />
	<Browser />
	<Agents />
	<HowItWorks snippets={data.snippets} />
</main>
