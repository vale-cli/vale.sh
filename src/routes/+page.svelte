<script lang="ts">
	import Hero from '$lib/components/landing/Hero.svelte';
	import LogoCloud from '$lib/components/landing/LogoCloud.svelte';
	import Stats from '$lib/components/landing/Stats.svelte';
	import Features from '$lib/components/landing/Features.svelte';
	import Integrations from '$lib/components/landing/Integrations.svelte';
	import CTA from '$lib/components/landing/CTA.svelte';
	import Sponsors from '$lib/components/docs/Sponsors.svelte';
	import { MetaTags } from 'svelte-meta-tags';
</script>

<MetaTags
	title="Vale: Your style, our editor"
	description="Vale is a command-line tool that brings code-like linting to prose. Vale is cross-platform (Windows, macOS, and Linux), written in Go, and available on GitHub."
	canonical="https://vale.sh"
	openGraph={{
		url: 'https://vale.sh',
		title: 'Vale: Your style, our editor',
		description:
			'Vale is a command-line tool that brings code-like linting to prose. Vale is cross-platform (Windows, macOS, and Linux), written in Go, and available on GitHub.',
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

<Hero />
<LogoCloud />
<Stats />
<Features />
<Integrations />
<Sponsors />
<CTA />
