<script lang="ts">
	import Copy from 'lucide-svelte/icons/copy';
	import Check from 'lucide-svelte/icons/check';
	import { copyStringToClipboard } from '$lib/utils.js';
	import { cn } from '$lib/utils.js';

	/**
	 * A block of code outside the blog: the blog's highlighting, without its
	 * window chrome. `html` comes from $lib/server/highlight in a page's load
	 * function; `code` is the text a copy button puts on the clipboard, and
	 * there is no button without it. `bare` drops the frame, for a block
	 * that sits inside a framed container of its own.
	 */
	let {
		html,
		code = '',
		bare = false,
		class: className = ''
	}: { html: string; code?: string; bare?: boolean; class?: string } = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout>;
	function copy() {
		copyStringToClipboard(code);
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 1500);
	}
</script>

<div class={cn('code relative', bare && 'bare', className)}>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- produced by shiki at build time -->
	{@html html}
	{#if code}
		<button
			type="button"
			onclick={copy}
			aria-label="Copy"
			class="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
		>
			{#if copied}<Check class="h-4 w-4 text-lime-600 dark:text-lime-400" />{:else}<Copy
					class="h-4 w-4"
				/>{/if}
		</button>
	{/if}
</div>

<style>
	/* The highlighter sets the colors; the frame is the site's. */
	.code :global(pre) {
		overflow-x: auto;
		border-radius: 0.5rem;
		border: 1px solid hsl(var(--border));
		padding: 1rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 13px;
		line-height: 1.625;
	}

	.code.bare :global(pre) {
		border: 0;
		border-radius: 0;
		padding: 0;
		background-color: transparent !important;
	}
</style>
