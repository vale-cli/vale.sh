<script lang="ts">
	import Eye from 'lucide-svelte/icons/eye';
	import EyeOff from 'lucide-svelte/icons/eye-off';
	import type { Category } from './Editor.svelte';

	/**
	 * The key to the editor's highlights, and the controls for them.
	 *
	 * Each row is a category: its color, how many were found, and what to do
	 * about it. Clicking the row moves the cursor to the next one in the text;
	 * the eye switches that category's marks off, for working through one kind
	 * of problem at a time.
	 */
	let {
		categories,
		counts,
		hidden = $bindable([]),
		onjump,
		title = 'Highlights'
	}: {
		categories: Category[];
		counts: Record<string, number>;
		hidden?: string[];
		onjump: (id: string) => void;
		title?: string;
	} = $props();

	function toggle(id: string) {
		hidden = hidden.includes(id) ? hidden.filter((h) => h !== id) : [...hidden, id];
	}
</script>

<section aria-label={title}>
	<h2 class="px-1 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
		{title}
	</h2>
	<ul class="mt-2 space-y-1.5">
		{#each categories as c (c.id)}
			{@const n = counts[c.id] ?? 0}
			{@const off = hidden.includes(c.id)}
			<li
				class="vt-{c.tone} group flex items-stretch overflow-hidden rounded-xl border border-border bg-card transition-opacity {off
					? 'opacity-55'
					: ''}"
			>
				<button
					type="button"
					onclick={() => onjump(c.id)}
					disabled={n === 0 || off}
					title={n ? 'Go to the next one' : undefined}
					class="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring enabled:hover:bg-muted/50"
				>
					<span
						class="flex h-8 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold tabular-nums"
						style="background: hsl(var(--vt) / {n
							? 0.18
							: 0.07}); color: hsl(var(--vt)); {c.mark === 'line'
							? 'box-shadow: inset 0 -2px 0 hsl(var(--vt) / ' + (n ? 1 : 0.3) + ')'
							: ''}"
					>
						{n}
					</span>
					<span class="min-w-0">
						<span class="block truncate text-sm font-medium text-foreground">{c.label}</span>
						{#if c.hint}
							<span class="block truncate text-xs text-muted-foreground">{c.hint}</span>
						{/if}
					</span>
				</button>
				<button
					type="button"
					onclick={() => toggle(c.id)}
					aria-pressed={!off}
					aria-label="{off ? 'Show' : 'Hide'} {c.label.toLowerCase()} highlights"
					class="flex w-11 shrink-0 items-center justify-center border-l border-border/60 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:w-9"
				>
					{#if off}
						<EyeOff class="h-3.5 w-3.5" aria-hidden="true" />
					{:else}
						<Eye class="h-3.5 w-3.5" aria-hidden="true" />
					{/if}
				</button>
			</li>
		{/each}
	</ul>
</section>
