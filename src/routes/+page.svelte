<script lang="ts">
	import type { PageData } from './$types';
	import Overview from '$lib/components/landing/Overview.svelte';
	import SponsorSpotlight from '$lib/components/landing/SponsorSpotlight.svelte';
	import AdopterConfigs from '$lib/components/landing/AdopterConfigs.svelte';
	import Features from '$lib/components/landing/Features.svelte';
	import HowItWorks from '$lib/components/landing/HowItWorks.svelte';
	import Ecosystem from '$lib/components/landing/Ecosystem.svelte';
	import Integrations from '$lib/components/landing/Integrations.svelte';
	import Blog from '$lib/components/landing/Blog.svelte';
	import { MetaTags } from 'svelte-meta-tags';

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
	*after* being convinced lives on its own page: the adopter explorer on
	/adopters, recognition and infrastructure on /sponsor, events and press in
	the library, and the agent toolchain on /skills. AdopterConfigs stays
	because the proof is the argument, the sponsor band stays because that
	visibility is what a sponsorship buys, and the blog gets its three newest
	posts because they show the work.
-->
<main>
	<Overview
		stats={data.stats}
		rules={{
			technical: data.snippets.heroTechnical,
			creative: data.snippets.heroCreative,
			scientific: data.snippets.heroScientific
		}}
	/>
	<SponsorSpotlight editorial />
	<AdopterConfigs editorial />
	<Features />
	<Ecosystem stats={data.stats} />
	<Integrations />
	<Blog posts={data.posts} total={data.postCount} />
	<HowItWorks snippets={data.snippets} />
</main>
