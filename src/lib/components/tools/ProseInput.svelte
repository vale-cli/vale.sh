<script lang="ts" module>
	/**
	 * The text carries from one tool to the next within a tab: count the words,
	 * then open the readability checker and the same draft is there. Session
	 * storage only — it is gone when the tab closes, and never leaves the page.
	 */
	const KEY = 'vale-tools-text';
	const MAX = 500_000;

	function recall(): string {
		try {
			return sessionStorage.getItem(KEY) ?? '';
		} catch {
			return ''; // private mode, or storage disabled
		}
	}

	function remember(text: string) {
		try {
			if (text.length <= MAX) sessionStorage.setItem(KEY, text);
		} catch {
			// Nothing to do: the tool works without it.
		}
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import ClipboardPaste from 'lucide-svelte/icons/clipboard-paste';
	import Eraser from 'lucide-svelte/icons/eraser';
	import TextQuote from 'lucide-svelte/icons/text-quote';

	let {
		value = $bindable(''),
		sample,
		label = 'Your text',
		placeholder = 'Type or paste your text here…',
		rows = 10,
		carry = true
	}: {
		value?: string;
		/** Text for the "Try a sample" button. */
		sample: string;
		label?: string;
		placeholder?: string;
		rows?: number;
		/** Share the text with the other tools in this tab. */
		carry?: boolean;
	} = $props();

	const id = $props.id();
	let canPaste = $state(false);

	onMount(() => {
		if (carry && !value) value = recall();
		canPaste = !!navigator.clipboard?.readText;
	});

	$effect(() => {
		if (carry) remember(value);
	});

	async function paste() {
		try {
			value = await navigator.clipboard.readText();
		} catch {
			canPaste = false; // permission denied; Ctrl+V still works
		}
	}

	const button =
		'inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-lime-500/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
</script>

<div>
	<div class="flex flex-wrap items-center justify-between gap-2">
		<label for={id} class="text-sm font-medium text-foreground">{label}</label>
		<div class="flex flex-wrap items-center gap-2">
			{#if canPaste}
				<button type="button" class={button} onclick={paste}>
					<ClipboardPaste class="h-3.5 w-3.5" aria-hidden="true" />
					Paste
				</button>
			{/if}
			<button type="button" class={button} onclick={() => (value = sample)}>
				<TextQuote class="h-3.5 w-3.5" aria-hidden="true" />
				Try a sample
			</button>
			<button type="button" class={button} onclick={() => (value = '')} disabled={!value}>
				<Eraser class="h-3.5 w-3.5" aria-hidden="true" />
				Clear
			</button>
		</div>
	</div>
	<textarea
		{id}
		bind:value
		{rows}
		{placeholder}
		spellcheck="false"
		class="mt-2 block w-full resize-y rounded-xl border border-border bg-card p-4 text-base leading-7 text-foreground shadow-sm placeholder:text-muted-foreground/70 focus:border-lime-500/60 focus:outline-none focus:ring-2 focus:ring-lime-500/30"
	></textarea>
</div>
