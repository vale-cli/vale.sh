<script lang="ts">
	import Hero from '$lib/components/landing/Hero.svelte';
	import AdopterConfigs from '$lib/components/landing/AdopterConfigs.svelte';
	import SponsorSpotlight from '$lib/components/landing/SponsorSpotlight.svelte';
	import SectionNav from '$lib/components/landing/SectionNav.svelte';
	import Ecosystem from '$lib/components/landing/Ecosystem.svelte';
	import Features from '$lib/components/landing/Features.svelte';
	import Integrations from '$lib/components/landing/Integrations.svelte';
	import CTA from '$lib/components/landing/CTA.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const description =
		'Vale is a command-line tool that brings code-like linting to prose. Cross-platform, written in Go, and run by teams at AWS, NVIDIA, Microsoft, GitLab, and Red Hat.';
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
				url: '/media/mac.png',
				width: 800,
				height: 600,
				alt: 'Example Vale output'
			}
		]
	}}
/>

<!--
	The page makes its case and then stops. Everything a visitor might want
	*after* being convinced lives on its own page now: the 90-adopter explorer
	on /adopters, recognition and infrastructure on /sponsor, events and press
	in the library, and the agent toolchain on /skills. AdopterConfigs stays
	because the proof is the argument, not an appendix to it, and the sponsor
	band stays because that visibility is what a sponsorship buys.
-->
<Hero stats={data.stats} />
<SponsorSpotlight />
<AdopterConfigs />
<SectionNav />
<Features />
<Ecosystem stats={data.stats} />
<Integrations />
<CTA />
