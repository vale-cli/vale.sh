<script lang="ts">
	// How Vale learns a page's kind: a folder per kind on the left, the
	// config section that names its style on the right, matched by color.
	import { kinds } from '$lib/data/diataxis';

	import Figure from './Figure.svelte';

	let { caption }: { caption?: string } = $props();

	const folders: Record<string, string> = {
		Tutorial: 'tutorials/',
		HowTo: 'how-to/',
		Reference: 'reference/',
		Explanation: 'explanation/'
	};
</script>

<Figure {caption}>
	<div class="grid gap-3 sm:grid-cols-2">
		<pre class="rounded-lg border bg-card p-4 font-mono text-[13px] leading-relaxed"><code
				>docs/{'\n'}{#each kinds as k, i (k.style)}<span class="text-muted-foreground/50"
						>{i === kinds.length - 1 ? '└── ' : '├── '}</span
					><span class="rounded-sm px-1 ring-1 {k.tone}">{folders[k.style]}</span>{'\n'}{/each}</code
			></pre>
		<pre class="rounded-lg border bg-card p-4 font-mono text-[13px] leading-relaxed"><code
				>{#each kinds as k (k.style)}[docs/<span class="rounded-sm px-1 ring-1 {k.tone}"
						>{folders[k.style]}</span
					>*.md]{'\n'}BasedOnStyles = {k.style}{'\n'}{'\n'}{/each}</code
			></pre>
	</div>
</Figure>
