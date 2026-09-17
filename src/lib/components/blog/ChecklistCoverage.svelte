<script lang="ts">
	// One cell per checklist item, in item order, lit when a rule names it.
	// The picture is the gap as much as the coverage: the unlit cells are the
	// items that need a reader. Each cell says which item it is on hover, and
	// the count beside the row says it without hovering.
	import { checklists } from '$lib/data/journals';

	import Figure from './Figure.svelte';

	let { caption }: { caption?: string } = $props();

	const items = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
</script>

<Figure {caption}>
	<div class="space-y-4">
		{#each checklists as c (c.name)}
			{@const done = new Set(c.covered)}
			<div class="grid grid-cols-[6.5rem_1fr_4rem] items-center gap-3 text-sm">
				<span class="font-mono text-xs">{c.name}</span>
				<div
					class="flex gap-[3px]"
					role="img"
					aria-label="{c.name}: {c.covered.length} of {c.total} items have a rule"
				>
					{#each items(c.total) as n (n)}
						<span
							class="h-3 min-w-0 flex-1 rounded-[2px] {done.has(n)
								? 'bg-lime-500'
								: 'bg-foreground/10'}"
							title="Item {n}{done.has(n) ? '' : ': no rule'}"
						></span>
					{/each}
				</div>
				<span class="text-right font-mono tabular-nums text-muted-foreground"
					>{c.covered.length} of {c.total}</span
				>
			</div>
		{/each}
	</div>
</Figure>
