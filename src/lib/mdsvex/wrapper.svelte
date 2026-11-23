<section class="docs-content prose mt-6 dark:prose-invert" id="markdown">
	<slot />
</section>

<style>
	.prose {
		max-width: none;
	}
	/* A table wider than a phone scrolls in place, as a code block does,
	   rather than pushing the whole page sideways. */
	.prose :global(table) {
		display: block;
		max-width: 100%;
		overflow-x: auto;
	}
</style>
