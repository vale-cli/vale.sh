<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import Bot from 'lucide-svelte/icons/bot';
	import Sparkles from 'lucide-svelte/icons/sparkles';
	import Zap from 'lucide-svelte/icons/zap';
	import Server from 'lucide-svelte/icons/server';
	import Section from '$lib/components/features/Section.svelte';
	import InlineCode from '$lib/components/features/InlineCode.svelte';
	import ExternalLink from '$lib/components/features/ExternalLink.svelte';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import { skills } from '$lib/data/skills';

	let { data } = $props();

	const repo = 'https://github.com/vale-cli/agent-tools';

	// The free/account split is on each card, not in a footnote: two of the
	// three need nothing but the binary, and that has to be obvious here.
	const pieces = [
		{
			icon: Sparkles,
			title: 'Skills',
			cost: 'Free',
			href: '#skills',
			body: 'Seven task-shaped instructions: setup, fixing alerts, triage, vocabularies, ignores, rules, and CI. Each runs the CLI in your repository and ends with a report.'
		},
		{
			icon: Zap,
			title: 'Edit hook',
			cost: 'Free',
			href: '#hook',
			body: 'Lints each prose file the moment the assistant writes it and hands the alerts back, so a mistake is fixed in the turn it was made.'
		},
		{
			icon: Server,
			title: 'MCP server',
			cost: 'Vale CMS',
			href: '#mcp',
			body: 'The engine as tools an assistant can call, so a rule it writes is compiled and tested before it reaches your repository.'
		}
	];

	const levels = [
		{ value: 'error', relays: 'Errors', note: 'The default.' },
		{ value: 'warning', relays: 'Errors and warnings', note: '' },
		{ value: 'suggestion', relays: 'Everything', note: '' }
	];

	const requirements = [
		{
			part: 'Skills',
			needs:
				'The vale binary on PATH. fix, triage, and vocab also use jq; rule needs Vale v3.24.0 or later for vale test.'
		},
		{
			part: 'Edit hook',
			needs:
				'The vale binary and any POSIX shell. On Windows that means Git Bash; without it the hook does nothing and the rest is unaffected.'
		},
		{
			part: 'MCP server',
			needs: 'A Vale CMS Pro or Site subscription. Nothing else in the plugin depends on it.'
		}
	];

	const description =
		'Vale for coding agents: seven skills, an edit-time linting hook, and an MCP server, installed as one Claude Code plugin.';
</script>

<MetaTags
	title="Agent tools — Vale"
	{description}
	canonical="https://vale.sh/agents"
	openGraph={{ url: 'https://vale.sh/agents', title: 'Agent tools', description }}
/>

<article>
	<header class="border-b border-border">
		<div class="mx-auto max-w-4xl px-6 pb-14 pt-12 sm:pb-16 lg:px-8">
			<div class="flex items-center gap-3">
				<div
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-lime-500/20 bg-lime-500/10 text-lime-600 dark:text-lime-400"
				>
					<Bot class="h-5 w-5" />
				</div>
				<p
					class="font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-lime-600 dark:text-lime-400"
				>
					Vale for agents
				</p>
			</div>

			<h1 class="mt-5 text-balance text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
				Your assistant writes the docs. Something should check them.
			</h1>
			<p class="mt-6 text-pretty text-lg leading-8 text-foreground/85">
				A model writes plausible prose and plausible linter rules with equal confidence. Agent tools
				put Vale in the loop: skills for the jobs around a linter, a hook that checks each file as
				it is written, and an MCP server for checking the rules themselves.
			</p>

			<CodeBlock html={data.html.install} code={data.code.install} class="mt-8" />
			<p class="mt-3 text-sm leading-relaxed text-muted-foreground">
				Type both in Claude Code. The second restarts the session, which registers the hook and the
				MCP server. The plugin drives the
				<a
					href="https://docs.vale.sh/topics/installation"
					class="font-medium text-foreground underline decoration-lime-500/40 underline-offset-4"
					>Vale binary</a
				>; it does not bundle it.
			</p>

			<div class="mt-10 grid gap-4 sm:grid-cols-3">
				{#each pieces as piece (piece.title)}
					<a
						href={piece.href}
						class="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-lime-500/40"
					>
						<div class="flex items-center justify-between gap-3">
							<span
								class="inline-flex rounded-lg bg-lime-500/10 p-2 text-lime-600 dark:text-lime-400"
							>
								<piece.icon class="size-5" />
							</span>
							<span
								class="rounded-md bg-muted px-2 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground"
							>
								{piece.cost}
							</span>
						</div>
						<h2 class="mt-4 font-semibold">{piece.title}</h2>
						<p class="mt-2 text-sm leading-6 text-muted-foreground">{piece.body}</p>
					</a>
				{/each}
			</div>
		</div>
	</header>

	<div id="skills" class="scroll-mt-24">
		<Section
			title="Seven skills"
			lede="Ask in your own words and the assistant reaches for the one that fits, or call it by name. Each checks its prerequisites before touching anything, and one that cannot run Vale says so instead of improvising."
		>
			<ul class="divide-y divide-border rounded-2xl border border-border bg-card">
				{#each skills as skill (skill.name)}
					<li class="grid gap-x-6 gap-y-1 px-5 py-4 sm:grid-cols-[8.5rem_1fr]">
						<a
							href={skill.path}
							target="_blank"
							rel="noreferrer"
							class="font-mono text-sm font-semibold hover:text-lime-600 dark:hover:text-lime-400"
							><span class="text-muted-foreground">/vale:</span>{skill.name}</a
						>
						<div>
							<p class="text-sm leading-relaxed">{skill.summary}</p>
							<p class="mt-1 text-sm leading-relaxed text-muted-foreground">{skill.guard}</p>
						</div>
					</li>
				{/each}
			</ul>
			<p class="mt-5 text-sm leading-relaxed text-muted-foreground">
				Type <InlineCode>/vale:</InlineCode> and all seven should complete. The
				<a
					href="/skills"
					class="font-medium text-foreground underline decoration-lime-500/40 underline-offset-4"
					>skills page</a
				> has the options for assistants other than Claude Code.
			</p>
		</Section>
	</div>

	<div id="hook" class="scroll-mt-24">
		<Section
			title="The edit hook"
			lede="It runs when the assistant writes or edits a file, not when you do. If the file is prose and has a Vale configuration above it, the hook lints that one file and returns the alerts in the same turn."
		>
			<CodeBlock html={data.html.alert} />
			<div class="mt-8 grid gap-8 sm:grid-cols-2">
				<div>
					<h3 class="font-medium">Silent unless there is something to fix</h3>
					<p class="mt-2 text-sm leading-6 text-foreground/85">
						No Vale binary, no configuration, a file that is not prose, or a clean run: the hook
						says nothing. Prose means Markdown, MDX, AsciiDoc, reStructuredText, Org, Quarto, MyST,
						Typst, and plain text. Source files are left alone.
					</p>
				</div>
				<div>
					<h3 class="font-medium">Anchored at the file's own configuration</h3>
					<p class="mt-2 text-sm leading-6 text-foreground/85">
						The hook walks up from the edited file to the nearest
						<InlineCode>.vale.ini</InlineCode> and runs Vale from there, so a section like
						<InlineCode>[docs/**/*.md]</InlineCode> matches wherever the session started. A configuration
						that fails to load is reported, not passed over.
					</p>
				</div>
			</div>

			<h3 class="mt-12 font-medium">Which alerts reach the assistant</h3>
			<p class="mt-2 max-w-2xl text-sm leading-6 text-foreground/85">
				Errors only, by default: a project's warnings and suggestions are advisory by its own
				choice. For a style whose rules are deliberately advisory, run
				<InlineCode>/plugin</InlineCode> and set
				<span class="font-medium">Alert level the edit hook reports</span>.
			</p>
			<div class="mt-5 overflow-x-auto rounded-xl border border-border">
				<table class="w-full text-left text-sm">
					<thead class="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
						<tr>
							<th class="px-4 py-2.5 font-medium">Value</th>
							<th class="px-4 py-2.5 font-medium">Relays</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						{#each levels as level (level.value)}
							<tr>
								<td class="px-4 py-2.5 font-mono">{level.value}</td>
								<td class="px-4 py-2.5">
									{level.relays}
									{#if level.note}<span class="text-muted-foreground"> · {level.note}</span>{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<p class="mt-5 max-w-2xl text-sm leading-6 text-foreground/85">
				Vale's own <InlineCode>MinAlertLevel</InlineCode> decides what is reported at all, and this setting
				decides what is passed on, so raising it past <InlineCode>MinAlertLevel</InlineCode> gains nothing.
				To override it for one session:
			</p>
			<CodeBlock html={data.html.level} code={data.code.level} class="mt-3 max-w-2xl" />

			<h3 class="mt-12 font-medium">Nothing happened</h3>
			<p class="mt-2 max-w-2xl text-sm leading-6 text-foreground/85">
				That is often correct. Check the setup by hand; no error lines means the hook has nothing to
				say.
			</p>
			<CodeBlock html={data.html.check} code={data.code.check} class="mt-3 max-w-2xl" />
		</Section>
	</div>

	<div id="mcp" class="scroll-mt-24">
		<Section
			title="The MCP server"
			lede="Ask an assistant for a Vale rule and it writes plausible YAML. Whether it compiles, whether the pattern matches anything, whether the configuration still loads: it has no way to find out. The MCP server gives it the engine to ask."
		>
			<div class="grid items-start gap-8 sm:grid-cols-2">
				<div class="text-sm leading-6 text-foreground/85">
					<p>
						<InlineCode>scaffold_rule</InlineCode> starts from something valid,
						<InlineCode>diagnose_rule</InlineCode> and <InlineCode>test_rule</InlineCode> say whether
						it works, <InlineCode>stress_rule</InlineCode> finds the false positives the examples miss,
						and <InlineCode>diff_rule</InlineCode> shows what an edit changes before it lands.
					</p>
					<p class="mt-4">
						It is hosted by <a
							href="/cms"
							class="font-medium text-foreground underline decoration-lime-500/40 underline-offset-4"
							>Vale CMS</a
						> and needs a Pro or Site subscription. Claude Code prompts you to sign in the first time
						a tool is called. Until then every call returns a 401 that names Vale CMS, which is the server
						working, not a broken install.
					</p>
					<p class="mt-4 flex flex-wrap gap-x-5 gap-y-2">
						<a
							href="/cms#mcp"
							class="inline-flex items-center gap-1 font-medium text-lime-600 hover:underline dark:text-lime-400"
							>What it can check <ArrowRight class="size-3.5" /></a
						>
						<a
							href="https://docs.vale.sh/guides/mcp"
							class="inline-flex items-center gap-1 font-medium text-lime-600 hover:underline dark:text-lime-400"
							>Tool reference <ArrowRight class="size-3.5" /></a
						>
					</p>
				</div>
				<CodeBlock html={data.html.mcp} code={data.code.mcp} />
			</div>
		</Section>
	</div>

	<Section title="What each piece needs">
		<dl class="divide-y divide-border rounded-2xl border border-border bg-card">
			{#each requirements as row (row.part)}
				<div class="grid gap-x-6 gap-y-1 px-5 py-4 sm:grid-cols-[8.5rem_1fr]">
					<dt class="text-sm font-semibold">{row.part}</dt>
					<dd class="text-sm leading-relaxed text-foreground/85">{row.needs}</dd>
				</div>
			{/each}
		</dl>
		<p class="mt-5 max-w-2xl text-sm leading-6 text-foreground/85">
			The pieces are independent: a missing one is quiet and the others keep working. The skills and
			the hook run the CLI on your machine, against your files.
		</p>
	</Section>

	<section class="py-14 sm:py-16">
		<div class="mx-auto max-w-4xl px-6 lg:px-8">
			<h2 class="text-2xl font-medium tracking-tight sm:text-3xl">Other assistants</h2>
			<p class="mt-4 max-w-2xl text-pretty leading-7 text-foreground/85">
				<InlineCode>skills/</InlineCode> in
				<ExternalLink href={repo}>vale-cli/agent-tools</ExternalLink> is a plain skills directory. Copy
				the folders you want to wherever your assistant reads them, such as
				<InlineCode>.claude/skills/</InlineCode> or <InlineCode>.cursor/skills/</InlineCode>. For
				one with no skill support, hand it
				<a
					href="/AGENTS.md"
					class="font-medium text-foreground underline decoration-lime-500 decoration-2 underline-offset-4"
					>AGENTS.md</a
				>, which covers the same ground as prose.
			</p>
		</div>
	</section>
</article>
