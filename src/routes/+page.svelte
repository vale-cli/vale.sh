<script lang="ts">
	import Banner from '$lib/components/landing/Banner.svelte';
	import Testimonials from '$lib/components/landing/Testimonials.svelte';
	import Integrations from '$lib/components/landing/Integrations.svelte';
	import FAQ from '$lib/components/landing/FAQ.svelte';
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

<Banner />
<Integrations />
<FAQ />
<Testimonials />
<Sponsors />
