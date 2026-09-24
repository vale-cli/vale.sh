<script lang="ts">
	// The framework's two-by-two, with the package's style in each cell and,
	// when asked, the rules that cell has. Drawn from the data rather than
	// copied: the grid is the idea, and the idea is what's being borrowed.
	import { kinds, type Kind } from '$lib/data/diataxis';

	import Figure from './Figure.svelte';

	let { caption, rules = false }: { caption?: string; rules?: boolean } = $props();

	const cell = (when: 'study' | 'work', how: 'action' | 'cognition') =>
		kinds.find((k) => k.when === when && k.how === how)!;

	const grid = [
		[cell('study', 'action'), cell('work', 'action')],
		[cell('study', 'cognition'), cell('work', 'cognition')]
	];
</script>

<!--
	Two layouts. From the sm breakpoint up, the two-by-two with its axes
	labeled along the top and side. Below it, the four cells in one column,
	each carrying its axes as a line of its own: a 2x2 at phone width leaves
	each cell too narrow for a rule name and what it checks.
-->
<Figure {caption}>
	<div class="hidden grid-cols-[auto_1fr_1fr] grid-rows-[auto_1fr_1fr] gap-2 text-sm sm:grid">
		<div></div>
		<div class="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
			Study
		</div>
		<div class="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
			Work
		</div>
		{#each grid as row, r (r)}
			<div
				class="flex rotate-180 items-center justify-center pr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground [writing-mode:vertical-rl]"
			>
				{r === 0 ? 'Action' : 'Cognition'}
			</div>
			{#each row as k (k.style)}
				{@render card(k, false)}
			{/each}
		{/each}
	</div>
	<div class="grid gap-2 text-sm sm:hidden">
		{#each kinds as k (k.style)}
			{@render card(k, true)}
		{/each}
	</div>
</Figure>

{#snippet card(k: Kind, axes: boolean)}
	<div class="rounded-lg p-4 ring-1 {k.tone}">
		<div class="flex items-baseline justify-between gap-2">
			<span class="font-semibold">{k.label}</span>
			<code class="font-mono text-xs opacity-80">{k.style}</code>
		</div>
		<p class="mt-0.5 text-xs opacity-80">
			{k.purpose}{#if axes}
				<span class="opacity-70"> · {k.when} by {k.how}</span>{/if}
		</p>
		{#if rules}
			<ul class="mt-3 space-y-1 text-xs">
				{#each k.rules as rule (rule.name)}
					<li class="flex gap-2">
						<code class="shrink-0 font-mono">{rule.name}</code>
						<span class="opacity-80">{rule.checks}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/snippet}
