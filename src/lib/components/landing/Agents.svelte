<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import Sparkles from 'lucide-svelte/icons/sparkles';
	import Zap from 'lucide-svelte/icons/zap';
	import Server from 'lucide-svelte/icons/server';
	import Section from './Section.svelte';

	// The landing page's summary of /agents. The cost chip is on every row:
	// two of the three need nothing but the binary, and this is the page whose
	// promise is that Vale is free.
	const pieces = [
		{
			icon: Sparkles,
			title: 'Skills',
			cost: 'Free',
			href: '/agents#skills',
			body: 'One-prompt onboarding, style choices, rules from your style guide, fixes, CI, and commit messages, each run through the CLI in your repository.'
		},
		{
			icon: Zap,
			title: 'Hooks',
			cost: 'Free',
			href: '/agents#hook',
			body: 'Lint each file the assistant writes and each commit it makes, and hand the alerts back in the same turn.'
		},
		{
			icon: Server,
			title: 'MCP server',
			cost: 'Vale CMS',
			href: '/agents#mcp',
			body: 'The engine as tools, so a rule the assistant writes is compiled and tested before you see it.'
		}
	];
</script>

<Section
	editorial
	id="agents"
	eyebrow="Vale for agents"
	accent
	title="Your assistant writes the docs. Something should check them."
	lede="A model writes plausible prose with confidence either way. Vale tells it which sentences break your style, in the turn it wrote them."
>
	<div class="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
		<!--
			The hook's own wording, from the run pictured on /agents. A clean file
			gets no output at all, which is why the last line is a note and not a
			check mark.
		-->
		<div
			class="overflow-hidden rounded-2xl border font-mono text-[13px] leading-[1.75]"
			style="background:#16180f; border-color:#2a2e1f; color:#d7d6c8"
			role="img"
			aria-label="The edit hook at work: the assistant edits docs/install.md, Vale reports a House.Terms error on line 4, use allowlist instead of whitelist, the assistant edits the file again, and the hook has nothing left to report."
		>
			<div
				class="border-b px-4 py-2 text-[11px]"
				style="border-color:#2a2e1f; background:#14160e; color:#8a8d78"
			>
				edit hook · docs/install.md
			</div>
			<div class="overflow-x-auto whitespace-nowrap p-4">
				<div><span class="text-lime-400">assistant</span> › Edit docs/install.md</div>
				<div class="mt-2" style="color:#8a8d78">
					Vale reports 1 alert(s) at error level or above in this file:
				</div>
				<div class="text-[#f0745a]">
					&nbsp;&nbsp;line 4: House.Terms [error] — Use 'allowlist' instead of 'whitelist'.
				</div>
				<div class="mt-2"><span class="text-lime-400">assistant</span> › Edit docs/install.md</div>
				<div style="color:#6c7059">&nbsp;&nbsp;↳ no output: nothing left to fix</div>
			</div>
		</div>

		<ul class="divide-y divide-border border-y border-border">
			{#each pieces as piece (piece.title)}
				<li>
					<a
						href={piece.href}
						class="group flex items-start gap-4 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
					>
						<span
							class="mt-0.5 inline-flex shrink-0 rounded-lg bg-lime-500/10 p-2 text-lime-600 dark:text-lime-400"
						>
							<piece.icon class="size-4" />
						</span>
						<span class="min-w-0 flex-1">
							<span class="flex flex-wrap items-center gap-2">
								<span class="text-sm font-semibold">{piece.title}</span>
								<span
									class="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
									>{piece.cost}</span
								>
							</span>
							<span class="mt-1 block text-sm leading-6 text-muted-foreground">{piece.body}</span>
						</span>
						<ArrowRight
							class="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-lime-600 dark:group-hover:text-lime-400"
						/>
					</a>
				</li>
			{/each}
		</ul>
	</div>

	<div class="mt-10">
		<a
			href="/agents"
			class="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-lime-500/40 underline-offset-4 transition-colors hover:text-lime-600 dark:hover:text-lime-400"
		>
			Install the agent tools
			<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
		</a>
	</div>
</Section>
