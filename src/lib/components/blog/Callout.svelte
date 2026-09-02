<script lang="ts">
	// An aside the post can set apart without leaving the argument: a note,
	// a tip, a warning, or a plain aside. One accent per kind, over the same
	// card the other blog components sit on.
	import type { Snippet } from 'svelte';
	import Info from 'lucide-svelte/icons/info';
	import Lightbulb from 'lucide-svelte/icons/lightbulb';
	import TriangleAlert from 'lucide-svelte/icons/triangle-alert';
	import MessageSquareQuote from 'lucide-svelte/icons/message-square-quote';

	type Kind = 'note' | 'tip' | 'warning' | 'aside';

	let {
		kind = 'note',
		title,
		children
	}: { kind?: Kind; title?: string; children: Snippet } = $props();

	const kinds = {
		note: {
			icon: Info,
			label: 'Note',
			border: 'border-lime-500/40',
			accent: 'text-lime-600 dark:text-lime-400',
			bar: 'bg-lime-500'
		},
		tip: {
			icon: Lightbulb,
			label: 'Tip',
			border: 'border-lime-500/40',
			accent: 'text-lime-600 dark:text-lime-400',
			bar: 'bg-lime-500'
		},
		warning: {
			icon: TriangleAlert,
			label: 'Warning',
			border: 'border-amber-500/40',
			accent: 'text-amber-600 dark:text-amber-400',
			bar: 'bg-amber-500'
		},
		aside: {
			icon: MessageSquareQuote,
			label: 'Aside',
			border: 'border-border',
			accent: 'text-muted-foreground',
			bar: 'bg-muted-foreground/40'
		}
	} as const;

	const style = $derived(kinds[kind]);
	const Icon = $derived(style.icon);
</script>

<aside
	class="relative my-8 overflow-hidden rounded-xl border bg-card px-5 py-4 {style.border}"
	role="note"
>
	<span class="absolute inset-y-0 left-0 w-1 {style.bar}" aria-hidden="true"></span>
	<p class="not-prose mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide {style.accent}">
		<Icon class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
		<span>{title ?? style.label}</span>
	</p>
	<div class="text-sm leading-relaxed text-foreground/90 [&>p]:my-0 [&>p+p]:mt-3">
		{@render children()}
	</div>
</aside>
