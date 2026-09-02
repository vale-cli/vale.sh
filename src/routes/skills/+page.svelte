<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import { skills } from '$lib/data/skills';
	import { assistants } from '$lib/assistants';
	import BrandIcon from '$lib/components/landing/BrandIcon.svelte';
	import AgentTools from '$lib/components/AgentTools.svelte';

	const description =
		'Agent skills for Vale: setup, fixing alerts, triaging a first run, vocabularies, and CI. Free, local, and driven by the CLI.';
</script>

<MetaTags
	title="Agent skills — Vale"
	{description}
	canonical="https://vale.sh/skills"
	openGraph={{ url: 'https://vale.sh/skills', title: 'Agent skills', description }}
/>

<div class="mx-auto max-w-5xl px-6 py-16 sm:py-20 lg:px-8">
	<div class="mx-auto max-w-2xl sm:text-center">
		<h1 class="text-base/7 font-semibold text-lime-600 dark:text-lime-400">Agent skills</h1>
		<p class="mt-2 text-pretty text-4xl font-semibold tracking-tight sm:text-balance sm:text-5xl">
			Hand the setup to your assistant.
		</p>
		<p class="mt-6 text-lg/8 text-neutral-500">
			Each of these is a <code class="font-mono text-base">SKILL.md</code> that a coding agent reads
			while working in your repository. They run the Vale CLI, edit your files, and open your pull request&mdash;nothing
			to sign up for.
		</p>
	</div>

	<div class="mx-auto mt-10 max-w-3xl rounded-2xl border border-border bg-card p-6">
		<h2 class="text-sm font-semibold">Get started</h2>
		<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
			In Claude Code, install the plugin&mdash;the second command restarts the session, which is
			what registers the linting hook and the MCP server alongside the skills:
		</p>
		<pre
			class="mt-3 overflow-x-auto rounded-lg border border-border bg-background p-3 font-mono text-xs leading-relaxed"><code
				>/plugin marketplace add vale-cli/agent-tools
/plugin install vale@agent-tools</code
			></pre>
		<p class="mt-3 text-sm leading-relaxed text-muted-foreground">
			Then type <code class="font-mono">/vale:</code> and the five below should complete. For an
			assistant that reads skills from a folder, copy one into
			<code class="font-mono">.claude/skills/</code> instead; for one with no skill support, hand it
			<a href="/AGENTS.md" class="font-medium text-lime-600 hover:underline dark:text-lime-400"
				>AGENTS.md</a
			>, which covers the same ground as prose.
		</p>

		<div class="mt-4 flex flex-wrap gap-3">
			{#each assistants as assistant}
				<a
					href={assistant.href}
					target="_blank"
					rel="noreferrer"
					class="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:border-lime-500/40 hover:text-lime-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 dark:hover:text-lime-400"
				>
					<BrandIcon
						name={assistant.label}
						slug={assistant.slug}
						size="h-3.5 w-3.5"
						class="opacity-80"
					/>
					{assistant.label}
					<ArrowUpRight class="h-3.5 w-3.5" />
				</a>
			{/each}
		</div>

		<p class="mt-4 text-sm leading-relaxed text-muted-foreground">
			Want the engine itself rather than the CLI&mdash;scaffolding rules, auditing a style, diffing
			a rule change across a corpus? That is what
			<a href="/cms" class="font-medium text-lime-600 hover:underline dark:text-lime-400"
				>Vale CMS</a
			> and its MCP server are for. These skills stay on the command line.
		</p>
	</div>

	<ul id="skill-list" class="mx-auto mt-8 grid max-w-3xl scroll-mt-24 gap-4">
		{#each skills as skill}
			<li>
				<a
					href={skill.path}
					target="_blank"
					rel="noreferrer"
					class="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-lime-500/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
				>
					<div class="flex items-start justify-between gap-3">
						<h2 class="font-mono text-sm font-semibold">
							<span class="text-muted-foreground">/vale:</span>{skill.name}
						</h2>
						<ArrowUpRight
							class="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-lime-600 dark:group-hover:text-lime-400"
						/>
					</div>
					<p class="mt-2 text-sm leading-relaxed">{skill.summary}</p>
					<p class="mt-2 text-sm leading-relaxed text-muted-foreground">{skill.guard}</p>
				</a>
			</li>
		{/each}
	</ul>
</div>

<!--
	The rest of the toolchain. Skills are one of three pieces, and the other two
	-- the edit hook and the MCP server -- have no other home on the site.
-->
<div class="mt-16 border-t border-border/60 pb-20 pt-10">
	<AgentTools />
</div>
