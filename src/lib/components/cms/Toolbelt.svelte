<script lang="ts">
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import { groups } from '$lib/data/toolbelt';

	// Every example is a real call with its real output; they live in
	// $lib/data/toolbelt. The page's load function highlights them, so the
	// panels get the blog's palette without the browser loading a highlighter.
	let { exampleHtml }: { exampleHtml: Record<string, { call: string; result: string }> } = $props();

	const all = groups.flatMap((g) => g.tools);
	const total = all.length;

	// Opens on a failing example on purpose. A demo where everything passes proves
	// nothing; the argument for the product is that the engine says no.
	let selected = $state('test_rule');
	const current = $derived(all.find((t) => t.name === selected) ?? all[0]);
	const currentGroup = $derived(
		groups.find((g) => g.tools.some((t) => t.name === selected))?.name ?? ''
	);
</script>

<section id="toolbelt" class="scroll-mt-20 border-b border-border/60 bg-muted/30 py-16 sm:py-20">
	<div class="mx-auto max-w-6xl px-6 lg:px-8">
		<div class="max-w-3xl">
			<h2 class="text-base font-semibold text-lime-600 dark:text-lime-400">The MCP surface</h2>
			<p class="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
				{total} tools, and every one of them can say &ldquo;no&rdquo;
			</p>
			<p class="mt-5 text-pretty text-lg leading-8 text-muted-foreground">
				An assistant with a documentation search can tell you what Vale <em>should</em> do. These
				tools run the engine, so they answer what it <em>does</em>. Open any of them — every panel
				is a real call and what actually came back.
			</p>
		</div>

		<div class="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
			<div class="flex min-w-0 flex-col gap-5">
				{#each groups as group (group.name)}
					<div>
						<div class="flex items-baseline justify-between gap-4">
							<h3 class="text-sm font-semibold">{group.name}</h3>
							<span class="font-mono text-[11px] text-muted-foreground">
								{group.tools.length} tools
							</span>
						</div>
						<p class="mt-1 text-xs leading-5 text-muted-foreground">{group.body}</p>
						<div class="mt-2.5 flex flex-wrap gap-1.5">
							{#each group.tools as tool (tool.name)}
								<button
									type="button"
									onclick={() => (selected = tool.name)}
									aria-pressed={selected === tool.name}
									class="rounded-md border px-2 py-1 font-mono text-[11.5px] transition-colors {selected ===
									tool.name
										? 'border-lime-500 bg-lime-500/15 font-semibold text-lime-700 dark:text-lime-400'
										: 'border-border/60 bg-background text-foreground hover:border-lime-500/50 hover:bg-lime-500/5'}"
								>
									{tool.name}
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			<div class="min-w-0 lg:sticky lg:top-24 lg:self-start">
				<div class="rounded-2xl border border-border/60 bg-card p-6">
					<div class="flex flex-wrap items-center gap-2">
						<code class="font-mono text-base font-semibold text-lime-600 dark:text-lime-400">
							{current.name}
						</code>
						<span class="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
							{currentGroup}
						</span>
					</div>
					<p class="mt-3 text-sm leading-6 text-muted-foreground">{current.desc}</p>

					<div class="mt-5 overflow-hidden rounded-xl border border-border/60">
						<div
							class="border-b border-border/60 bg-muted/60 px-3 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground"
						>
							the call
						</div>
						<CodeBlock html={exampleHtml[current.name].call} bare />
						<div
							class="border-y border-border/60 bg-muted/60 px-3 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground"
						>
							what came back
						</div>
						<CodeBlock html={exampleHtml[current.name].result} bare />
					</div>

					{#if current.example.note}
						<p class="mt-3.5 text-sm leading-6 text-muted-foreground">{current.example.note}</p>
					{/if}
				</div>

				<p class="mt-3 text-center text-xs text-muted-foreground">
					Every one of the {total} carries a real call and its real output &middot;
					<a href="https://docs.vale.sh/topics/mcp" class="font-semibold hover:underline">
						full reference &rarr;
					</a>
				</p>
			</div>
		</div>
	</div>
</section>
