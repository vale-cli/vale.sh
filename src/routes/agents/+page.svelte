<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import Bot from 'lucide-svelte/icons/bot';
	import Sparkles from 'lucide-svelte/icons/sparkles';
	import Zap from 'lucide-svelte/icons/zap';
	import Blocks from 'lucide-svelte/icons/blocks';
	import Server from 'lucide-svelte/icons/server';
	import Section from '$lib/components/features/Section.svelte';
	import InlineCode from '$lib/components/features/InlineCode.svelte';
	import ExternalLink from '$lib/components/features/ExternalLink.svelte';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import { skillGroups, skills } from '$lib/data/skills';

	let { data } = $props();

	const repo = 'https://github.com/vale-cli/agent-tools';

	// What each piece costs is on its card, not in a footnote: everything but
	// the MCP server needs nothing but the binary, and that has to be obvious.
	const pieces = [
		{
			icon: Sparkles,
			title: 'Skills',
			cost: 'Free',
			href: '#skills',
			body: `${skills.length} of them: one-prompt onboarding, style choices, rules from your style guide, a written guide, vocabularies, fixes, CI, and commit messages.`
		},
		{
			icon: Zap,
			title: 'Hooks',
			cost: 'Free',
			href: '#hook',
			body: 'Lint each file the assistant writes and each commit it makes, and hand the alerts back in the same turn.'
		},
		{
			icon: Blocks,
			title: 'More plugins',
			cost: 'Experimental',
			href: '#plugins',
			body: 'A setup pane beside the chat, Vale as tools the assistant calls directly, and the language server.'
		},
		{
			icon: Server,
			title: 'MCP server',
			cost: 'Vale CMS',
			href: '#mcp',
			body: 'The engine as tools, so a rule the assistant writes is diagnosed and stress-tested before it reaches your repository.'
		}
	];

	const levels = [
		{ value: 'error', relays: 'Errors', note: 'The default.' },
		{ value: 'warning', relays: 'Errors and warnings', note: '' },
		{ value: 'suggestion', relays: 'Everything', note: '' }
	];

	// What the proposal leaves switched off, each a skill of its own.
	const options = [
		{ name: 'Blocking checks', detail: 'once the remaining errors are fixed' },
		{ name: 'One-click fixes', detail: 'suggested changes on pull requests' },
		{ name: 'Translated docs', detail: 'a section and a dictionary per language' },
		{ name: 'Code comments', detail: 'Go, Python, TypeScript, and about twenty more' },
		{ name: 'One spelling', detail: 'American, British, Australian, Canadian' },
		{ name: 'Commit messages', detail: 'the convention your history already follows' },
		{ name: 'Your style guide', detail: 'turned into tested rules' },
		{ name: 'A written guide', detail: 'generated from the configuration' }
	];

	const plugins = [
		{
			id: 'vale-onboard',
			title: 'The setup pane',
			body: 'The onboarding proposal, drawn beside the chat: a button per style package with its alert count, a button on each rule that makes it quieter, the unknown words to tick, and where Vale should run. Every press re-runs the preview, so the count is a real one. Apply hands the result to the assistant; nothing is written before that.',
			note: '/vale-checks opens the “where it runs” part alone in a repository that already has Vale.',
			snippet: 'pane' as const
		},
		{
			id: 'vale-tools',
			title: 'Vale as tools',
			body: 'Two tools the assistant calls with no shell command: lint, which checks a draft or a file against the project’s rules and returns each alert with the fix its rule carries, and test, which runs the cases beside the project’s own rules. Because lint takes text, a paragraph or a commit message can be checked before it is written.',
			note: 'Works on Windows without Git Bash. In the desktop app it adds “Check with Vale” and “Add to Vale vocabulary” to the right-click menu.',
			snippet: 'tools' as const
		},
		{
			id: 'vale-lsp',
			title: 'The language server',
			body: 'Connects Claude Code to vale-ls, so alerts arrive as diagnostics after an edit, the way a type error does for code. Errors only, matching the hook’s default.',
			note: 'An alternative to the edit hook: install one or the other, or every alert arrives twice. Needs vale-ls on your PATH.',
			snippet: 'lsp' as const
		}
	];

	const requirements = [
		{
			part: 'Skills',
			needs:
				'The vale binary on PATH; onboard and setup install it if it is missing. fix, triage, and vocab read Vale’s JSON with jq. tune and from-guide test their rules with vale test, which needs Vale v3.24.0 or later.'
		},
		{
			part: 'Hooks',
			needs:
				'The vale binary and any POSIX shell. On Windows that means Git Bash, which Git for Windows includes; without it the hooks do nothing and the skills do their scripted steps by hand.'
		},
		{
			part: 'More plugins',
			needs:
				'The vale binary. The pane needs a POSIX shell, the tools do not, and the language server needs vale-ls.'
		},
		{
			part: 'MCP server',
			needs: 'A Vale CMS Pro or Site subscription. Nothing else here depends on it.'
		}
	];

	const description =
		'Vale for coding agents: one-prompt onboarding, thirteen skills, hooks that lint what the assistant writes, and an MCP server, installed as a Claude Code plugin.';
</script>

<MetaTags
	title="Agent tools — Vale"
	{description}
	canonical="https://vale.sh/agents"
	openGraph={{
		url: 'https://vale.sh/agents',
		title: 'Agent tools',
		description,
		images: [
			{
				url: 'https://vale.sh/media/og/agents.png',
				width: 1200,
				height: 630,
				alt: 'Your assistant writes the docs. Vale checks them.'
			}
		]
	}}
/>

{#snippet shot(src: string, width: number, height: number, alt: string, caption: string)}
	<figure>
		<img
			{src}
			{width}
			{height}
			loading="lazy"
			{alt}
			class="h-auto w-full rounded-xl border border-border"
		/>
		<figcaption class="mt-3 text-xs leading-5 text-muted-foreground">{caption}</figcaption>
	</figure>
{/snippet}

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
				put Vale in the loop: an assistant that sets Vale up in one prompt, shapes it to how your
				team writes, and is checked by it on every file and commit.
			</p>

			<CodeBlock html={data.html.install} code={data.code.install} class="mt-8" />
			<p class="mt-3 text-sm leading-relaxed text-muted-foreground">
				Type both in Claude Code. The second restarts the session, which registers the hooks and the
				MCP server. The plugin drives the
				<a
					href="https://docs.vale.sh/topics/installation"
					class="font-medium text-foreground underline decoration-lime-500/40 underline-offset-4"
					>Vale binary</a
				>
				and installs it if it is missing.
				<a
					href="https://docs.vale.sh/guides/agent-setup"
					class="font-medium text-foreground underline decoration-lime-500/40 underline-offset-4"
					>The setup guide</a
				> walks through the whole process.
			</p>

			<div class="mt-10 grid gap-4 sm:grid-cols-2">
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

	<div id="onboard" class="scroll-mt-24">
		<Section
			title="Set up in one prompt"
			lede="In a repository that has prose and no Vale yet, one skill does the whole job: not a configuration and two thousand alerts, but a baseline the team can keep."
		>
			<CodeBlock html={data.html.onboard} code={data.code.onboard} class="max-w-2xl" />

			<div class="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
				{@render shot(
					'/media/agents/onboard-proposal.png',
					1372,
					1978,
					'The onboarding proposal as text: a table showing 427 alerts on the first run and 353 with the baseline, three findings in named files, the package, path, vocabulary and unlinted front matter, five style choices with their evidence, the CI change, the five errors that remain, and a list of seven options that are not included.',
					'The proposal an assistant produced for Vale’s own documentation site, before anything was written.'
				)}
				<div class="text-sm leading-6 text-foreground/85">
					<h3 class="font-medium text-foreground">Look, draft, one yes, apply</h3>
					<ol class="mt-3 list-decimal space-y-3 pl-5">
						<li>
							It surveys the repository: where the prose is, translated docs, source code, a written
							style guide, existing CI.
						</li>
						<li>
							It tries the style packages against your docs in a temp directory and takes the
							quieter one.
						</li>
						<li>
							It drafts a vocabulary, a decision for each rule that would block, and your style
							choices, read from how the docs are written today.
						</li>
						<li>
							It shows one proposal: what it found in named files, the before and after counts, and
							where Vale will run.
						</li>
						<li>
							On a yes, it applies all of it and opens a pull request whose description is the
							proposal, so the team reviews what you did.
						</li>
					</ol>
					<p class="mt-5">
						A word list kept for cspell or another spell checker is carried over into the
						vocabulary. CI starts advisory and looks only at the lines a pull request adds, so the
						backlog lands on nobody.
					</p>
				</div>
			</div>

			<h3 class="mt-12 font-medium">Everything else is offered, not switched on</h3>
			<p class="mt-2 max-w-2xl text-sm leading-6 text-foreground/85">
				The baseline is the smallest useful one: English prose, one package, advisory CI. The rest
				is listed in the proposal with one fact from your repository, and each is a separate yes.
			</p>
			<ul class="mt-5 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
				{#each options as option (option.name)}
					<li class="flex gap-2 border-b border-border/60 py-2">
						<span class="font-medium">{option.name}</span>
						<span class="text-muted-foreground">{option.detail}</span>
					</li>
				{/each}
			</ul>

			<div class="mt-12">
				{@render shot(
					'/media/agents/preview.png',
					1438,
					1434,
					'Terminal output of the preview script. Microsoft reports 427 alerts and Google 598 on 57 files. For Microsoft it then lists the busiest rules and, for each error-level rule, one real alert with its file and line.',
					'Behind the proposal is a script that tries each package against your docs and shows a real alert from your own files for every rule that would block. It needs only Vale and writes nothing to the repository.'
				)}
			</div>
		</Section>
	</div>

	<div id="skills" class="scroll-mt-24">
		<Section
			title="{skills.length} skills"
			lede="Ask in your own words and the assistant reaches for the one that fits, or call it by name. Each checks its prerequisites before touching anything, and one that cannot run Vale says so instead of improvising."
		>
			<div class="space-y-10">
				{#each skillGroups as group (group.title)}
					<div>
						<div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
							<h3 class="font-medium">{group.title}</h3>
							<p class="text-sm text-muted-foreground">{group.note}</p>
						</div>
						<ul class="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
							{#each group.skills as skill (skill.name)}
								<li
									id="skill-{skill.name}"
									class="grid scroll-mt-24 gap-x-6 gap-y-1 px-5 py-4 sm:grid-cols-[10.5rem_1fr]"
								>
									<div>
										<a
											href={skill.path}
											target="_blank"
											rel="noreferrer"
											class="font-mono text-sm font-semibold hover:text-lime-600 dark:hover:text-lime-400"
											><span class="text-muted-foreground">/vale:</span>{skill.name}</a
										>
										<p class="mt-1 text-xs leading-5 text-muted-foreground">“{skill.ask}”</p>
									</div>
									<div>
										<p class="text-sm leading-relaxed">{skill.summary}</p>
										<p class="mt-1 text-sm leading-relaxed text-muted-foreground">{skill.guard}</p>
									</div>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>

			<h3 class="mt-14 font-medium">A style guide, in both directions</h3>
			<div class="mt-4 grid gap-8 text-sm leading-6 text-foreground/85 sm:grid-cols-2">
				<p>
					<span class="font-medium text-foreground">From a guide to rules.</span>
					<InlineCode>/vale:from-guide</InlineCode> reads your written guide and sorts every statement:
					already covered by a package, a rule to write, a vocabulary entry, or not checkable. Each new
					rule links to its section and takes its tests from the guide’s own do and don’t examples. “Be
					warm” is reported as needing a person, not approximated.
				</p>
				<p>
					<span class="font-medium text-foreground">From rules to a guide.</span>
					<InlineCode>/vale:write-guide</InlineCode> writes the page a new contributor can read: what
					blocks a merge, the style choices and why, the words you use. The rule table is read from the
					configuration by a script and sits between markers, so it can be regenerated without touching
					the prose.
				</p>
			</div>

			<div class="mt-12 grid items-start gap-8 lg:grid-cols-2">
				{@render shot(
					'/media/agents/doctor.png',
					1892,
					598,
					'Terminal output of the doctor script: nine checks, two marked FAIL because the Microsoft style named in the configuration is not on disk, with "vale sync" given as the fix.',
					'/vale:doctor on a fresh clone where the styles were never synced, the most common reason Vale “stops working”.'
				)}
				{@render shot(
					'/media/agents/commits.png',
					1778,
					682,
					'Terminal output of the history script: of the last 20 commits, 19 fail Conventional Commits and 3 fail the "seven rules", so it names SevenRules as the closest convention.',
					'/vale:commits scoring a repository’s own history before suggesting a convention.'
				)}
			</div>

			<p class="mt-8 text-sm leading-relaxed text-muted-foreground">
				Type <InlineCode>/vale:</InlineCode> and all {skills.length} should complete. The
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
			title="The hooks"
			lede="Two checks that run on the assistant’s work, not yours: one when it writes a file, one when it makes a commit. Both are silent unless there is something to fix."
		>
			{@render shot(
				'/media/agents/hook.svg',
				812,
				763,
				'A Claude Code session. Asked to add a line about disk space to docs/install.md, the assistant makes the edit, says the Vale hook flagged the existing word whitelist on line 4, and makes a second edit replacing it with allowlist.',
				'A real session. The request was one line about disk space; the edit hook reported a house-style error already in the file, and the assistant fixed it in the same turn.'
			)}
			<p class="mt-8 text-sm leading-6 text-foreground/85">
				What the edit hook hands back, word for word:
			</p>
			<CodeBlock html={data.html.alert} class="mt-3" />

			<div class="mt-8 grid gap-8 sm:grid-cols-2">
				<div>
					<h3 class="font-medium">Silent unless there is something to fix</h3>
					<p class="mt-2 text-sm leading-6 text-foreground/85">
						No Vale binary, no configuration, a file Vale does not lint, or a clean run: the hook
						says nothing. It covers Markdown, MDX, AsciiDoc, reStructuredText, Org, and plain text,
						and source files too when your configuration has a section for them, so a typo in a doc
						comment is caught the same way.
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

			<h3 id="commit-hook" class="mt-12 scroll-mt-24 font-medium">Commit messages</h3>
			<div class="mt-2 grid items-start gap-8 sm:grid-cols-2">
				<p class="text-sm leading-6 text-foreground/85">
					The second hook runs after the assistant makes a commit. If your configuration has a
					<InlineCode>[COMMIT_EDITMSG]</InlineCode> section, it lints the message git just recorded and
					hands back any error-level alerts, with the instruction to amend if the commit has not been
					pushed. A project’s own commit-msg hook is installed per clone, and an assistant’s checkout
					usually has not run that setup; this gives its commits the same check. Without the section
					it does nothing. <InlineCode>/vale:commits</InlineCode> writes it.
				</p>
				<CodeBlock html={data.html.commits} />
			</div>

			<h3 class="mt-12 font-medium">Nothing happened</h3>
			<p class="mt-2 max-w-2xl text-sm leading-6 text-foreground/85">
				That is often correct. Ask for <InlineCode>/vale:doctor</InlineCode>, or check by hand; no
				error lines means the hook has nothing to say.
			</p>
			<CodeBlock html={data.html.check} code={data.code.check} class="mt-3 max-w-2xl" />
		</Section>
	</div>

	<div id="plugins" class="scroll-mt-24">
		<Section
			title="More plugins"
			lede="Three more plugins come from the same marketplace. Each is experimental and installs on its own, beside the main one."
		>
			<div class="space-y-10">
				{#each plugins as plugin (plugin.id)}
					<div
						id={plugin.id}
						class="grid scroll-mt-24 items-start gap-x-8 gap-y-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]"
					>
						<div>
							<h3 class="font-medium">
								{plugin.title}
								<span class="ml-2 font-mono text-xs font-normal text-muted-foreground"
									>{plugin.id}</span
								>
							</h3>
							<p class="mt-2 text-sm leading-6 text-foreground/85">{plugin.body}</p>
							<p class="mt-2 text-sm leading-6 text-muted-foreground">{plugin.note}</p>
						</div>
						<CodeBlock html={data.html[plugin.snippet]} code={data.code[plugin.snippet]} />
					</div>
				{/each}
			</div>

			<div class="mt-12">
				{@render shot(
					'/media/agents/lint-tool.png',
					1804,
					640,
					'What the lint tool returns for one sentence: six alerts, each with its position, severity, rule and message, and for four of them the exact replacement to make.',
					'What the lint tool returns for one sentence: each alert with its position, level, rule, and message, and the replacement where the rule carries one.'
				)}
			</div>
		</Section>
	</div>

	<div id="mcp" class="scroll-mt-24">
		<Section
			title="The MCP server"
			lede="The skills test a rule the way anyone can, with vale test and cases kept beside it. The MCP server goes further than a pass or a fail, by handing the assistant the engine itself."
		>
			<div class="grid items-start gap-8 sm:grid-cols-2">
				<div class="text-sm leading-6 text-foreground/85">
					<p>
						<InlineCode>diagnose_rule</InlineCode> says why a pattern does not match,
						<InlineCode>stress_rule</InlineCode> finds the false positives the cases miss,
						<InlineCode>diff_rule</InlineCode> shows what an edit changes in a rule already in use, and
						<InlineCode>audit_style</InlineCode> reports what a style costs to run.
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
			the hooks run the CLI on your machine, against your files.
		</p>
	</Section>

	<section class="py-14 sm:py-16">
		<div class="mx-auto max-w-4xl px-6 lg:px-8">
			<h2 class="text-2xl font-medium tracking-tight sm:text-3xl">Other assistants</h2>
			<p class="mt-4 max-w-2xl text-pretty leading-7 text-foreground/85">
				<InlineCode>skills/</InlineCode> in
				<ExternalLink href={repo}>vale-cli/agent-tools</ExternalLink> is a plain skills directory. Copy
				the folders you want to wherever your assistant reads them, such as
				<InlineCode>.claude/skills/</InlineCode> or <InlineCode>.cursor/skills/</InlineCode>. Any
				coding agent that can run a shell can do the onboarding from one prompt:
			</p>
			<CodeBlock html={data.html.clone} code={data.code.clone} class="mt-5 max-w-2xl" />
			<p class="mt-5 max-w-2xl text-pretty leading-7 text-foreground/85">
				For one with no skill support, hand it
				<a
					href="/AGENTS.md"
					class="font-medium text-foreground underline decoration-lime-500 decoration-2 underline-offset-4"
					>AGENTS.md</a
				>, which covers the same ground as prose.
			</p>
		</div>
	</section>
</article>
