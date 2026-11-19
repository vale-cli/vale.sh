<script lang="ts">
	/** One number and what it is. The big figure in a tool's results. */
	let {
		value,
		label,
		note,
		tone = 'plain'
	}: {
		value: string | number;
		label: string;
		note?: string;
		/** `good` and `warn` tint the figure; the label still says which. */
		tone?: 'plain' | 'good' | 'warn';
	} = $props();

	const color = $derived(
		tone === 'good'
			? 'text-lime-600 dark:text-lime-400'
			: tone === 'warn'
				? 'text-amber-600 dark:text-amber-400'
				: 'text-foreground'
	);
</script>

<div class="rounded-xl border border-border bg-card p-4">
	<div class="text-2xl font-medium tabular-nums tracking-tight sm:text-3xl {color}">{value}</div>
	<div class="mt-1 text-sm text-foreground/85">{label}</div>
	{#if note}
		<div class="mt-0.5 text-xs text-muted-foreground">{note}</div>
	{/if}
</div>
