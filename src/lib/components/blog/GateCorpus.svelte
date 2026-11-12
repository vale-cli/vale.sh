<script lang="ts">
	// What one full pass over a corpus costs, two ways. The top panel is
	// Vale's wall-clock time; the bottom is the list price of handing the
	// same text to a model as input, before it writes a word. Two panels
	// rather than two axes: seconds and dollars don't share a scale.
	import { corpora, pricePerMillion } from '$lib/data/quality-gate';

	import Figure from './Figure.svelte';

	let { caption }: { caption?: string } = $props();

	const models = Object.entries(pricePerMillion) as [string, number][];
	const dollars = (tokens: number, perMillion: number) => (tokens / 1e6) * perMillion;

	const maxSeconds = Math.max(...corpora.map((c) => c.valeSeconds));
	const maxDollars = Math.max(...corpora.map((c) => dollars(c.tokens, models[0][1])));

	const width = (v: number, max: number) => Math.max((v / max) * 100, 1.5);
	const money = (d: number) => (d < 1 ? `$${d.toFixed(2)}` : `$${d.toFixed(2)}`);
	const words = (n: number) => `${Math.round(n / 1000)}k words`;
</script>

<Figure {caption}>
	<div
		role="img"
		aria-label="Per full pass: Vale's seconds against a model's input price, for three corpora"
	>
		<p class="mb-2 text-xs text-muted-foreground">Vale, one pass, wall clock</p>
		<div class="space-y-3">
			{#each corpora as c (c.name)}
				<div>
					<div class="flex items-baseline justify-between gap-4 text-sm">
						<span>{c.name} <span class="text-muted-foreground">· {words(c.words)}</span></span>
						<span class="font-mono tabular-nums text-muted-foreground"
							>{c.valeSeconds.toFixed(2)} s</span
						>
					</div>
					<div class="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
						<div
							class="h-full rounded-full bg-lime-500"
							style="width: {width(c.valeSeconds, maxSeconds)}%"
						></div>
					</div>
				</div>
			{/each}
		</div>

		<p class="mb-2 mt-6 text-xs text-muted-foreground">
			A model, one pass, input tokens at list price
		</p>
		<div class="space-y-3">
			{#each corpora as c (c.name)}
				<div>
					<div class="flex items-baseline justify-between gap-4 text-sm">
						<span
							>{c.name}
							<span class="text-muted-foreground">· {c.tokens.toLocaleString('en-US')} tokens</span
							></span
						>
						<span class="font-mono tabular-nums text-muted-foreground">
							{#each models as [name, price], i (name)}
								{i > 0 ? ' · ' : ''}{money(dollars(c.tokens, price))} {name}
							{/each}
						</span>
					</div>
					<div class="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
						<div
							class="h-full rounded-full bg-rose-400"
							style="width: {width(dollars(c.tokens, models[0][1]), maxDollars)}%"
						></div>
					</div>
				</div>
			{/each}
		</div>
	</div>
	<ul class="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
		<li class="flex items-center gap-2">
			<span class="h-2.5 w-2.5 rounded-full bg-lime-500" aria-hidden="true"></span>
			<span>Vale</span>
		</li>
		<li class="flex items-center gap-2">
			<span class="h-2.5 w-2.5 rounded-full bg-rose-400" aria-hidden="true"></span>
			<span>model input, Fable 5.1 bar, Sonnet 5.5 beside it</span>
		</li>
	</ul>
</Figure>
