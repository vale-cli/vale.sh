<script lang="ts">
	// What the agent or a script printed, in the blog's terminal window. The
	// text is the real output; color marks only what the reader should find
	// first: the headings, what passed, and what did not.
	import { doctor, proposal, type Tone } from '$lib/data/onboard';

	import Figure from './Figure.svelte';

	let { name, title, caption }: { name: 'proposal' | 'doctor'; title: string; caption?: string } =
		$props();

	const lines = $derived(name === 'proposal' ? proposal : doctor);

	const tones: Record<Tone, string> = {
		head: 'font-semibold text-foreground',
		good: 'font-semibold text-lime-600 dark:text-lime-400',
		bad: 'font-semibold text-rose-600 dark:text-rose-400',
		muted: 'text-muted-foreground'
	};
</script>

<Figure {caption}>
	<div class="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
		<div class="flex items-center gap-1.5 border-b border-border/60 bg-muted/40 px-3.5 py-1.5">
			<span class="h-2.5 w-2.5 rounded-full bg-red-500/80"></span>
			<span class="h-2.5 w-2.5 rounded-full bg-amber-500/80"></span>
			<span class="h-2.5 w-2.5 rounded-full bg-lime-500/80"></span>
			<span class="ml-2 select-none font-mono text-xs text-muted-foreground">{title}</span>
		</div>
		<div class="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-relaxed">
			{#each lines as line, i (i)}
				<div class="whitespace-pre text-foreground/80">
					{#if typeof line === 'string'}{line || ' '}{:else}{#each line as [text, tone], j (j)}<span
								class={tone ? tones[tone] : ''}>{text}</span
							>{/each}{/if}
				</div>
			{/each}
		</div>
	</div>
</Figure>
