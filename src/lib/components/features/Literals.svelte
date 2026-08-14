<script lang="ts">
	import InlineCode from './InlineCode.svelte';

	/**
	 * Renders a plain string, with anything in `backticks` set as code.
	 *
	 * Copy that names a config key or a file lives in data files as often as it
	 * does in markup -- card bodies, ledes, summaries -- and a plain `{text}`
	 * cannot carry a `<code>`. The alternatives were worse: `{@html}` invites a
	 * markup bug into data, and a snippet per field is a rewrite per call site.
	 *
	 * The string stays a string, so it is still what a filter searches.
	 */
	let { text }: { text: string } = $props();

	// Odd indices are the capture, so they are the spans that were ticked.
	const parts = $derived(text.split(/`([^`]+)`/));
</script>

{#each parts as part, i}{#if i % 2}<InlineCode>{part}</InlineCode>{:else}{part}{/if}{/each}
