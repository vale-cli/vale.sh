<script lang="ts">
	import Section from '$lib/components/landing/Section.svelte';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';

	// The README section that spells out the JSON entry and its fields.
	const HOW_TO = 'https://github.com/vale-cli/vale.sh#add-your-team-to-the-home-page';
</script>

<Section
	id="add"
	eyebrow="Contribute"
	title="Add your team"
	lede="If your team runs Vale and can point at a public config, style package, or write-up, it belongs here. Entries are one JSON object; the avatar is fetched for you."
>
	<div class="flex justify-center">
		<a
			href={HOW_TO}
			target="_blank"
			rel="noreferrer"
			class="group inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
		>
			How to add an entry
			<ArrowUpRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
		</a>
	</div>
</Section>
