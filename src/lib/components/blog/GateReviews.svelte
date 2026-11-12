<script lang="ts">
	// One draft, five model reviews: a grid of findings by run. A filled
	// cell is a finding that run reported. The first eighteen rows are
	// identical across runs; the last two are judgment calls that appeared
	// once each.
	import { findings, reviews } from '$lib/data/quality-gate';

	import Figure from './Figure.svelte';

	let { caption }: { caption?: string } = $props();

	const has = (quote: string, run: number) => reviews[run - 1].found.includes(quote);
</script>

<Figure {caption}>
	<div
		class="overflow-x-auto"
		role="img"
		aria-label="Twenty findings across five model reviews: eighteen reported by every run, two reported by one run each."
	>
		<table class="w-full border-collapse text-sm">
			<thead>
				<tr class="text-xs text-muted-foreground">
					<th class="pb-2 text-left font-normal">Finding</th>
					{#each reviews as r (r.run)}
						<th class="pb-2 text-center font-mono font-normal">run {r.run}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each findings as f (f.quote)}
					<tr class="border-t border-border/60">
						<td class="max-w-[16rem] truncate py-1.5 pr-3 font-mono text-xs" title={f.quote}
							>{f.quote}</td
						>
						{#each reviews as r (r.run)}
							<td class="py-1.5 text-center">
								<span
									class="inline-block h-3 w-3 rounded-sm {has(f.quote, r.run)
										? f.runs === 5
											? 'bg-lime-500'
											: 'bg-rose-400'
										: 'bg-muted'}"
									aria-label={has(f.quote, r.run) ? 'reported' : 'not reported'}
								></span>
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<ul class="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
		<li class="flex items-center gap-2">
			<span class="h-2.5 w-2.5 rounded-sm bg-lime-500" aria-hidden="true"></span>
			<span>a rule from the list, reported by every run</span>
		</li>
		<li class="flex items-center gap-2">
			<span class="h-2.5 w-2.5 rounded-sm bg-rose-400" aria-hidden="true"></span>
			<span>a judgment call, reported by one run</span>
		</li>
	</ul>
</Figure>
