<script lang="ts">
	import type { Snippet } from 'svelte';

	// Links off-site to the projects Vale builds on. Marked with an arrow so a
	// reader knows they're leaving before they click, rather than after.
	let { href, children }: { href: string; children: Snippet } = $props();
</script>

<a
	{href}
	target="_blank"
	rel="noreferrer"
	class="font-medium text-foreground underline decoration-lime-500 decoration-2 underline-offset-4 transition-colors hover:text-lime-600 dark:hover:text-lime-400"
	>{@render children()}<span aria-hidden="true" class="text-muted-foreground/60">↗</span></a
>
