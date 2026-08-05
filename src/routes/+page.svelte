<script lang="ts">
	import Hero from '$lib/components/landing/Hero.svelte';
	import LogoWall from '$lib/components/landing/LogoWall.svelte';
	import SponsorSpotlight from '$lib/components/landing/SponsorSpotlight.svelte';
	import SectionNav from '$lib/components/landing/SectionNav.svelte';
	import Ecosystem from '$lib/components/landing/Ecosystem.svelte';
	import Features from '$lib/components/landing/Features.svelte';
	import Ai from '$lib/components/landing/Ai.svelte';
	import Integrations from '$lib/components/landing/Integrations.svelte';
	import AdopterExplorer from '$lib/components/landing/AdopterExplorer.svelte';
	import Events from '$lib/components/landing/Events.svelte';
	import Press from '$lib/components/landing/Press.svelte';
	import Recognition from '$lib/components/landing/Recognition.svelte';
	import Thanks from '$lib/components/landing/Thanks.svelte';
	import CTA from '$lib/components/landing/CTA.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import { upcomingEvents } from '$lib/events';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const hasEvents = upcomingEvents().length > 0;

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

<Hero stats={data.stats} />
<SponsorSpotlight
	name="Mintlify"
	slug="mintlify"
	href="/sponsors/mintlify"
	blurb="Funds Vale's development, and ships it as a built-in CI check."
/>
<LogoWall />
<SectionNav {hasEvents} />
<Features />
<Ai />
<Ecosystem stats={data.stats} />
<Integrations />
<AdopterExplorer />
<Events />
<Press />
<Recognition stats={data.stats} />
<Thanks />
<CTA />
