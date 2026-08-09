<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import adopters from '$lib/data/adopters.json';
	import AdopterExplorer from '$lib/components/landing/AdopterExplorer.svelte';

	const total = adopters.length;

	const description = `${total} teams running Vale, each entry linking to a public .vale.ini, style package, or write-up.`;
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
				url: '/media/mac.png',
				width: 800,
				height: 600,
				alt: 'Example Vale output'
			}
		]
	}}
/>

<!--
	No page header: AdopterExplorer opens with its own "Adopters / Teams running
	Vale" band, and a second title above it said the same thing twice.
-->
<AdopterExplorer />
