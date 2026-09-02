<script lang="ts">
	// A chart or demo with its caption, and for anything interactive a line
	// saying what to do with it. Both come from the post, not the data.
	import type { Snippet } from 'svelte';

	let { caption, hint, children }: { caption?: string; hint?: string; children: Snippet } =
		$props();
</script>

<figure class="not-prose my-8">
	{#if hint}
		<p class="mb-2 text-xs text-muted-foreground/80">{hint}</p>
	{/if}
	{@render children()}
	{#if caption}
		<figcaption class="mt-3 text-sm leading-relaxed text-muted-foreground">{caption}</figcaption>
	{/if}
</figure>
