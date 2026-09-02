<script lang="ts">
	// A terminal app the way it sits on screen: window chrome, what has been
	// typed so far with whatever it printed, and the prompt waiting for the
	// next line. Output is shown only where the post has the real thing.
	// The chrome matches the landing page's terminal.
	import Copy from 'lucide-svelte/icons/copy';
	import Check from 'lucide-svelte/icons/check';

	import Figure from './Figure.svelte';

	type Entry = { cmd: string; out?: string[] };

	let {
		app = 'claude',
		commands,
		session,
		caption
	}: { app?: string; commands?: string[]; session?: Entry[]; caption?: string } = $props();

	// Claude Code's transcript prompt is `>` and its input is a box; a shell
	// shows `$` and a bare cursor.
	const claude = $derived(app === 'claude');
	const prompt = $derived(claude ? '>' : '$');
	const entries = $derived<Entry[]>(session ?? (commands ?? []).map((cmd) => ({ cmd })));

	let copied = $state(false);
	const copy = async () => {
		await navigator.clipboard.writeText(entries.map((e) => e.cmd).join('\n'));
		copied = true;
		setTimeout(() => (copied = false), 1000);
	};
</script>

<Figure {caption}>
	<div class="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
		<div class="flex items-center gap-1.5 border-b border-border/60 bg-muted/40 px-3.5 py-1.5">
			<span class="h-2.5 w-2.5 rounded-full bg-red-500/80"></span>
			<span class="h-2.5 w-2.5 rounded-full bg-amber-500/80"></span>
			<span class="h-2.5 w-2.5 rounded-full bg-lime-500/80"></span>
			<span class="ml-2 select-none font-mono text-xs text-muted-foreground">{app}</span>
			<button
				type="button"
				onclick={copy}
				class="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
				aria-label="Copy commands"
			>
				{#if copied}
					<Check class="h-3.5 w-3.5 text-lime-500" />
					Copied
				{:else}
					<Copy class="h-3.5 w-3.5" />
					Copy
				{/if}
			</button>
		</div>

		<div class="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed">
			{#each entries as entry, i (i)}
				<div class="whitespace-pre {i > 0 ? 'mt-3' : ''} {claude ? 'text-muted-foreground' : ''}">
					<span class="select-none {claude ? '' : 'text-lime-600 dark:text-lime-400'}">{prompt}</span>
					{entry.cmd}
				</div>
				{#each entry.out ?? [] as line, j (j)}
					<div class="whitespace-pre text-foreground/90">{line}</div>
				{/each}
			{/each}

			{#if claude}
				<div
					class="mt-4 flex items-center gap-2 rounded-md border border-border px-3 py-2 text-foreground"
				>
					<span class="select-none text-muted-foreground">&gt;</span>
					<span class="h-4 w-2 animate-pulse bg-foreground/80" aria-hidden="true"></span>
				</div>
			{:else}
				<div class="mt-3 flex items-center gap-2 whitespace-pre">
					<span class="select-none text-lime-600 dark:text-lime-400">$</span>
					<span class="h-4 w-2 animate-pulse bg-foreground/80" aria-hidden="true"></span>
				</div>
			{/if}
		</div>
	</div>
</Figure>
