<script lang="ts">
	import BrandIcon from '$lib/components/landing/BrandIcon.svelte';
	import { guideLogos } from '$lib/tools/guide-logos';

	/** A guide's mark, by the guide's id. */
	let { id, name, size = 'h-5 w-5' }: { id: string; name: string; size?: string } = $props();
	const logo = $derived(guideLogos[id] ?? {});
</script>

<BrandIcon
	name={logo.letters ?? name}
	mono={logo.mono}
	slug={logo.slug}
	avatar={logo.avatar}
	{size}
/>
