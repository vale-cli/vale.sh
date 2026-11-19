<script lang="ts">
	// The two candidate packages on the same docs: one bar each, split by
	// severity, on a shared scale. Errors are the part that would block.
	import { packages } from '$lib/data/onboard';

	import Figure from './Figure.svelte';

	let { caption }: { caption?: string } = $props();

	const total = (p: (typeof packages)[number]) => p.errors + p.warnings + p.suggestions;
	const most = Math.max(...packages.map(total));
	const pct = (n: number) => (n / most) * 100;

	const parts = [
		{ key: 'errors', label: 'errors', tone: 'bg-rose-400' },
		{ key: 'warnings', label: 'warnings', tone: 'bg-amber-400' },
		{ key: 'suggestions', label: 'suggestions', tone: 'bg-foreground/20' }
	] as const;
</script>

<Figure {caption}>
	<div class="space-y-5">
		{#each packages as p (p.name)}
			<div
				role="img"
				aria-label="{p.name}: {total(
					p
				)} alerts, {p.errors} errors, {p.warnings} warnings, {p.suggestions} suggestions"
			>
				<div class="flex items-baseline justify-between gap-4 text-sm">
					<span class="font-medium">{p.name}</span>
					<span class="font-mono tabular-nums text-muted-foreground">{total(p)} alerts</span>
				</div>
				<div class="mt-1.5 flex h-3 w-full gap-0.5">
					{#each parts as part (part.key)}
						<div class="h-full rounded-sm {part.tone}" style="width: {pct(p[part.key])}%"></div>
					{/each}
				</div>
				<p
					class="mt-1.5 flex flex-wrap gap-x-4 font-mono text-xs tabular-nums text-muted-foreground"
				>
					{#each parts as part (part.key)}
						<span>{p[part.key]} {part.label}</span>
					{/each}
				</p>
			</div>
		{/each}
	</div>
	<ul class="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
		{#each parts as part (part.key)}
			<li class="flex items-center gap-2">
				<span class="h-2.5 w-2.5 rounded-sm {part.tone}" aria-hidden="true"></span>
				<span>{part.label}</span>
			</li>
		{/each}
	</ul>
</Figure>
