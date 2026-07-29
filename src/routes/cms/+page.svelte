<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import Hero from '$lib/components/cms/Hero.svelte';
	import Assets from '$lib/components/cms/Assets.svelte';
	import Loop from '$lib/components/cms/Loop.svelte';
	import Mcp from '$lib/components/cms/Mcp.svelte';
	import Trust from '$lib/components/cms/Trust.svelte';
	import Pricing from '$lib/components/cms/Pricing.svelte';
	import CTA from '$lib/components/cms/CTA.svelte';

	const description =
		'Vale CMS is the hosted editor for your whole Vale project — config, rules, vocabularies, and every asset — with the real engine linting as you type, then shipping straight to your repo.';
</script>

<MetaTags
	title="Vale CMS — author your style guide with the linter running"
	{description}
	canonical="https://vale.sh/cms"
	openGraph={{
		url: 'https://vale.sh/cms',
		title: 'Vale CMS',
		description,
		images: [
			{
				url: '/android-chrome-512x512.png',
				width: 512,
				height: 512,
				alt: 'Vale'
			}
		]
	}}
/>

<!--
	Section order is an argument, not a layout. MCP sits directly under the hero
	because the CMS repo's docs/pricing.md calls it the most differentiated part
	of the product; scope, then workflow, then the trust and price questions a
	reader only asks once they want it.
-->
<Hero />
<Mcp />
<Assets />
<Loop />
<Trust />
<Pricing />
<CTA />
