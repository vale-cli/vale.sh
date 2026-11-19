<script lang="ts">
	import Check from 'lucide-svelte/icons/check';
	import Copy from 'lucide-svelte/icons/copy';

	/** Copies `text`, and says so for a moment. */
	let { text, label = 'Copy' }: { text: string; label?: string } = $props();

	let copied = $state(false);
	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			// Clipboard blocked: the text is selectable, so nothing is lost.
		}
	}
</script>

<button
	type="button"
	onclick={copy}
	disabled={!text}
	class="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-lime-500/40 hover:bg-muted/40 disabled:opacity-40 max-sm:min-h-9 max-sm:px-3"
>
	{#if copied}
		<Check class="h-3.5 w-3.5 text-lime-600" aria-hidden="true" /> Copied
	{:else}
		<Copy class="h-3.5 w-3.5" aria-hidden="true" /> {label}
	{/if}
</button>
