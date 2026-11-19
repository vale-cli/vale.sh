<script lang="ts">
	// The skill's shape: four steps in a temp directory, one question, three
	// steps in the repository. The line between them is the point.
	import { after, before } from '$lib/data/onboard';

	import Figure from './Figure.svelte';

	let { caption }: { caption?: string } = $props();
</script>

<Figure {caption}>
	<div class="space-y-2">
		<section class="rounded-xl border border-dashed border-border p-3">
			<p class="mb-2 px-1 text-xs text-muted-foreground">
				In a temp directory <span class="mx-1">·</span> nothing in the repository changes
			</p>
			<ol class="grid gap-2 sm:grid-cols-4">
				{#each before as step, i (step.name)}
					<li class="rounded-lg border border-border bg-card px-3 py-2.5">
						<p class="text-sm font-medium">
							<span class="mr-1 font-mono text-xs text-muted-foreground">{i + 1}</span>
							{step.name}
						</p>
						<p class="mt-1 text-xs leading-snug text-muted-foreground">{step.does}</p>
					</li>
				{/each}
			</ol>
		</section>

		<div class="flex items-center gap-3 px-1" aria-label="Then one yes">
			<span class="h-px flex-1 bg-border"></span>
			<span
				class="rounded-full border border-lime-500 bg-lime-500/10 px-3 py-0.5 text-xs font-medium"
				>one yes</span
			>
			<span class="h-px flex-1 bg-border"></span>
		</div>

		<section class="rounded-xl border border-lime-500/50 bg-lime-500/5 p-3">
			<p class="mb-2 px-1 text-xs text-muted-foreground">In the repository, on a branch</p>
			<ol class="grid gap-2 sm:grid-cols-3" start={before.length + 1}>
				{#each after as step, i (step.name)}
					<li class="rounded-lg border border-border bg-card px-3 py-2.5">
						<p class="text-sm font-medium">
							<span class="mr-1 font-mono text-xs text-muted-foreground"
								>{before.length + i + 1}</span
							>
							{step.name}
						</p>
						<p class="mt-1 text-xs leading-snug text-muted-foreground">{step.does}</p>
					</li>
				{/each}
			</ol>
		</section>
	</div>
</Figure>
