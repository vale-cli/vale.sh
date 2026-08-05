<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import Hero from '$lib/components/cms/Hero.svelte';
	import Surfaces from '$lib/components/cms/Surfaces.svelte';
	import Assets from '$lib/components/cms/Assets.svelte';
	import Loop from '$lib/components/cms/Loop.svelte';
	import Mcp from '$lib/components/cms/Mcp.svelte';
	import Toolbelt from '$lib/components/cms/Toolbelt.svelte';
	import Trust from '$lib/components/cms/Trust.svelte';
	import Pricing from '$lib/components/cms/Pricing.svelte';
	import Faq from '$lib/components/cms/Faq.svelte';
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
	Section order is an argument, not a layout.

	Surfaces names both products at once, so neither reader spends the fold
	reading the other's pitch. MCP and Toolbelt follow immediately because the CMS
	repo's docs/pricing.md calls MCP the most differentiated part of the product:
	Mcp makes the argument, Toolbelt shows the surface behind it. Assets and Loop
	are the editor's equivalent — scope, then workflow. Trust, price, and FAQ are
	the questions a reader only reaches once they want the thing.
-->
<Hero />
<Surfaces />
<Mcp />
<Toolbelt />
<Assets />
<Loop />
<Trust />
<Pricing />
<Faq />
<CTA />
