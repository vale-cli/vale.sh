<script lang="ts">
	import EngineDiagram from './EngineDiagram.svelte';
	import MonitorSmartphone from 'lucide-svelte/icons/monitor-smartphone';
	import Bot from 'lucide-svelte/icons/bot';

	// Two products, one argument. The hero sells the editor and the MCP section
	// sells the server, but nothing said they were the same claim — so a reader
	// who wanted the assistant had to scroll past a pitch aimed at someone else
	// to find out this page was also for them.
	//
	// The promise here, the proof below: Mcp.svelte then Assets.svelte are the
	// evidence for the right and left halves of this band, in that order.
	const surfaces = [
		{
			icon: MonitorSmartphone,
			eyebrow: 'You write',
			title: 'The hosted editor',
			body: 'Your whole Vale project in the browser — config, rules, vocabularies, dictionaries, filters, templates. The engine lints every keystroke and refuses to ship a rule that does not compile.',
			href: '#assets',
			cta: 'What you can edit'
		},
		{
			icon: Bot,
			eyebrow: 'Your assistant writes',
			title: 'The hosted MCP server',
			body: 'The same engine, exposed as tools your assistant can call. It writes a rule, the engine tells it whether that rule compiles and what it actually matches, and it fixes its own mistake before you ever see one.',
			href: '#mcp',
			cta: 'See it catch an error'
		}
	];
</script>

<section id="surfaces" class="scroll-mt-20 border-b border-border/60 py-14 sm:py-16">
	<div class="mx-auto max-w-6xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl text-center">
			<p class="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
				One engine. Two ways to reach it.
			</p>
			<p class="mt-3 text-pretty leading-7 text-muted-foreground">
				Both run Vale's engine itself — the twelve check types, the same regex compilation, the same
				scopes. Whoever writes the rule, it is a linter that decides whether it works, not a model's
				opinion of whether it looks right.
			</p>
		</div>

		<div class="mt-10 grid gap-5 sm:grid-cols-2">
			{#each surfaces as surface (surface.title)}
				<div
					class="group flex flex-col rounded-2xl border border-border/60 bg-card p-7 transition-colors hover:border-lime-500/50"
				>
					<div class="flex items-center gap-3">
						<div class="inline-flex rounded-lg bg-lime-500/10 p-2 text-lime-600 dark:text-lime-400">
							<surface.icon class="size-5" />
						</div>
						<span
							class="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
						>
							{surface.eyebrow}
						</span>
					</div>

					<h3 class="mt-4 text-xl font-semibold">{surface.title}</h3>
					<p class="mt-2.5 text-pretty text-sm leading-6 text-muted-foreground">{surface.body}</p>

					<a
						href={surface.href}
						class="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-lime-600 hover:underline dark:text-lime-400"
					>
						{surface.cta}
						<span aria-hidden="true" class="transition-transform group-hover:translate-x-0.5"
							>→</span
						>
					</a>
				</div>
			{/each}
		</div>

		<div class="mt-6">
			<EngineDiagram />
		</div>

		<p class="mt-8 text-center text-sm text-muted-foreground">
			Both are included on every paid plan.
		</p>
	</div>
</section>
