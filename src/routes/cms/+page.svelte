<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import Check from 'lucide-svelte/icons/check';
	import GitBranch from 'lucide-svelte/icons/git-branch';
	import KeyRound from 'lucide-svelte/icons/key-round';
	import LockKeyhole from 'lucide-svelte/icons/lock-keyhole';
	import ShieldCheck from 'lucide-svelte/icons/shield-check';
	import Sparkles from 'lucide-svelte/icons/sparkles';
	import SquareTerminal from 'lucide-svelte/icons/square-terminal';
	import WandSparkles from 'lucide-svelte/icons/wand-sparkles';
	import { buttonVariants } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';

	const pillars = [
		{
			title: 'Author the full project',
			description:
				'Config, rules, actions, vocabularies, dictionaries, filters, views, and output templates all get first-class editing.',
			icon: SquareTerminal
		},
		{
			title: 'Test against the real engine',
			description:
				'Lint samples, inspect compiled regex, validate references, and catch broken rules before they reach CI.',
			icon: Check
		},
		{
			title: 'Ship reviewable changes',
			description:
				'Open a repository, commit to a branch, or propose a pull request while Git remains the source of truth.',
			icon: GitBranch
		}
	];

	const workflows = [
		'Use guided forms for every Vale check type, then drop into raw YAML when you need exact control.',
		'Autocomplete real .vale.ini keys, rule fields, styles, scopes, vocabularies, and package paths.',
		'Preview exactly what a rule catches with the same output shape your CLI, editor, or docs pipeline sees.',
		'Keep tests, dictionaries, templates, filters, and config changes together instead of editing scattered files by hand.'
	];

	const security = [
		{
			title: 'Repository content stays in your source of truth',
			description:
				'Vale CMS reads from GitHub, GitLab, local folders, samples, or zip files. The hosted app does not persist your style-guide content.',
			icon: ShieldCheck
		},
		{
			title: 'Git tokens are not stored on Vale CMS servers',
			description:
				'Provider tokens live in your browser and are forwarded per request to the SCM broker. The broker calls the host API and stores nothing.',
			icon: KeyRound
		},
		{
			title: 'Scoped provider flows',
			description:
				'GitHub uses a GitHub App with installation-scoped repository access. GitLab uses OAuth Authorization Code with PKCE.',
			icon: LockKeyhole
		},
		{
			title: 'AI is optional and bring-your-own-key',
			description:
				'Assistant requests go from your browser to the provider you choose. Your AI key and chat transcript do not touch Vale CMS servers.',
			icon: WandSparkles
		}
	];
</script>

<MetaTags
	title="Vale CMS"
	description="Vale CMS is the hosted authoring layer for Vale: build, test, edit, and ship your entire Vale project from the browser."
	canonical="https://vale.sh/cms"
	openGraph={{
		url: 'https://vale.sh/cms',
		title: 'Vale CMS',
		description: 'Build, test, edit, and ship your entire Vale project from the browser.',
		images: [
			{
				url: '/favicon.png',
				width: 512,
				height: 512,
				alt: 'Vale'
			}
		]
	}}
/>

<section class="relative overflow-hidden border-b border-border/60">
	<div
		class="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(hsl(var(--foreground)/0.05)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_55%,transparent_100%)]"
	></div>
	<div
		class="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24"
	>
		<div class="flex flex-col justify-center">
			<p class="text-sm font-semibold uppercase tracking-[0.18em] text-lime-500">Vale CMS</p>
			<h1 class="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
				Build, test, edit, and ship your entire Vale project.
			</h1>
			<p class="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
				Vale CMS is not a YAML textarea with a save button. It is a hosted control plane for the
				whole Vale project: config, rules, vocabularies, dictionaries, filters, views, templates,
				tests, previews, and Git publishing, all grounded in the engine your team already runs in
				editors and CI.
			</p>
			<div class="mt-8 flex flex-wrap gap-3">
				<a href="https://cms.vale.sh" class={buttonVariants({ size: 'lg' })}>
					Open Vale CMS
					<ArrowRight class="ml-2 size-4" />
				</a>
				<a
					href="https://docs.vale.sh"
					class={cn(buttonVariants({ size: 'lg', variant: 'outline' }))}
				>
					Read the Vale docs
				</a>
			</div>
		</div>

		<div class="relative">
			<div
				class="overflow-hidden rounded-2xl border bg-white text-zinc-800 shadow-2xl shadow-lime-950/10 dark:bg-[#16180f] dark:text-[#d7d6c8]"
				aria-label="Vale CMS editor preview"
			>
				<div
					class="flex items-center gap-2 border-b bg-zinc-50 px-4 py-2.5 dark:border-[#2a2e1f] dark:bg-[#14160e]"
				>
					<span class="size-2.5 rounded-full bg-[#e06c5b]"></span>
					<span class="size-2.5 rounded-full bg-[#d9a441]"></span>
					<span class="size-2.5 rounded-full bg-[#7fb84a]"></span>
					<span class="ml-2.5 font-mono text-xs text-zinc-500 dark:text-[#8a8d78]">
						<b class="font-semibold text-zinc-800 dark:text-[#d7d6c8]">product-docs</b> · main
					</span>
					<span
						class="ml-auto rounded-md bg-lime-500 px-3 py-1 text-[11.5px] font-semibold text-lime-950 dark:bg-lime-400"
						>Save</span
					>
				</div>

				<div class="grid min-h-[25rem] grid-cols-1 sm:grid-cols-[180px_minmax(0,1fr)]">
					<div
						class="hidden border-r py-3 font-mono text-[12px] text-zinc-500 dark:border-[#2a2e1f] dark:text-[#8a8d78] sm:block"
					>
						<div
							class="px-3.5 py-1 text-[10px] uppercase tracking-wider text-zinc-400 dark:text-[#62654f]"
						>
							Project
						</div>
						<div class="px-4 py-1">.vale.ini</div>
						<div
							class="px-3.5 py-1 text-[10px] uppercase tracking-wider text-zinc-400 dark:text-[#62654f]"
						>
							Styles / House
						</div>
						<div
							class="border-l-2 border-lime-500 bg-lime-500/10 py-1 pl-5 pr-3 text-zinc-900 dark:border-lime-400 dark:bg-lime-400/10 dark:text-[#d7d6c8]"
						>
							RepeatedWord.yml
						</div>
						<div class="py-1 pl-6 pr-3">ApprovedTerms.yml</div>
						<div class="py-1 pl-6 pr-3">Contractions.yml</div>
						<div class="py-1 pl-6 pr-3">Headings.yml</div>
						<div
							class="px-3.5 py-1 text-[10px] uppercase tracking-wider text-zinc-400 dark:text-[#62654f]"
						>
							Assets
						</div>
						<div class="px-4 py-1">Vocab / Base</div>
						<div class="px-4 py-1">Dictionaries</div>
						<div class="px-4 py-1">Filters · Views</div>
					</div>

					<div class="flex min-w-0 flex-col">
						<div class="flex h-9 items-center border-b px-3 dark:border-[#2a2e1f]">
							<div
								class="flex h-full items-center border-b-2 border-lime-500 px-3 font-mono text-xs dark:border-lime-400"
							>
								RepeatedWord.yml
							</div>
							<div
								class="ml-auto overflow-hidden rounded-md border text-[11px] dark:border-[#2a2e1f]"
							>
								<span
									class="bg-lime-500/10 px-2.5 py-1 text-zinc-900 dark:bg-lime-400/15 dark:text-[#d7d6c8]"
									>Form</span
								>
								<span class="px-2.5 py-1 text-zinc-500 dark:text-[#8a8d78]">Raw</span>
							</div>
						</div>
						<div
							class="flex-1 overflow-x-auto whitespace-pre px-4 py-4 font-mono text-[12px] leading-7"
						>
							<span class="text-zinc-400 dark:text-[#62654f]">1</span>
							<span class="italic text-zinc-500 dark:text-[#6c7059]"
								># Flags an immediately repeated word.</span
							>
							<span class="text-zinc-400 dark:text-[#62654f]">2</span>
							<span class="text-lime-700 dark:text-[#a3d94f]">extends</span>:
							<span class="text-amber-700 dark:text-[#e3b168]">repetition</span>
							<span class="text-zinc-400 dark:text-[#62654f]">3</span>
							<span class="text-lime-700 dark:text-[#a3d94f]">message</span>:
							<span class="text-amber-700 dark:text-[#e3b168]">"'%s' is repeated."</span>
							<span class="text-zinc-400 dark:text-[#62654f]">4</span>
							<span class="text-lime-700 dark:text-[#a3d94f]">level</span>:
							<span class="text-amber-700 dark:text-[#e3b168]">error</span>
							<span class="text-zinc-400 dark:text-[#62654f]">5</span>
							<span class="text-lime-700 dark:text-[#a3d94f]">alpha</span>:
							<span class="text-sky-700 dark:text-[#7cc7f2]">true</span>
							<span class="text-zinc-400 dark:text-[#62654f]">6</span>
							<span class="text-lime-700 dark:text-[#a3d94f]">tokens</span>:
							<span class="text-zinc-400 dark:text-[#62654f]">7</span> -
							<span class="text-purple-700 dark:text-[#c9a6f2]">'[^\s]+'</span>
						</div>
						<div
							class="border-t bg-zinc-50 px-4 py-2.5 font-mono text-[11px] text-zinc-500 dark:border-[#2a2e1f] dark:bg-[#14160e] dark:text-[#8a8d78]"
						>
							<span class="text-lime-600 dark:text-lime-400">compiled</span>
							<span class="text-purple-700 dark:text-[#c9a6f2]">\b([^\s]+)\s+\1\b</span>
						</div>
						<div class="border-t p-4 dark:border-[#2a2e1f]">
							<div
								class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-[#62654f]"
							>
								Test · onboarding.md
							</div>
							<div class="text-[13px] leading-6 text-zinc-800 dark:text-[#d7d6c8]">
								Welcome new writers to
								<span
									class="underline decoration-[#f0745a] decoration-wavy decoration-2 underline-offset-4"
									>the the</span
								>
								team. Please
								<span
									class="underline decoration-[#6ea0ff] decoration-wavy decoration-2 underline-offset-4"
									>utilise</span
								>
								a clear voice.
							</div>
							<div class="mt-3 grid gap-2 md:grid-cols-2">
								<div class="flex items-start gap-2">
									<span
										class="rounded bg-[#f0745a]/15 px-1.5 py-0.5 text-[9.5px] font-bold uppercase text-[#f0745a]"
										>error</span
									>
									<span class="text-[12px] leading-tight">'the' is repeated.</span>
								</div>
								<div class="flex items-start gap-2">
									<span
										class="rounded bg-[#6ea0ff]/15 px-1.5 py-0.5 text-[9.5px] font-bold uppercase text-[#6ea0ff]"
										>suggestion</span
									>
									<span class="text-[12px] leading-tight">Prefer 'use'.</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div
					class="flex items-center gap-4 border-t bg-zinc-50 px-4 py-2 font-mono text-[11px] text-zinc-500 dark:border-[#2a2e1f] dark:bg-[#14160e] dark:text-[#8a8d78]"
				>
					<span class="text-lime-600 dark:text-lime-400">engine ready</span>
					<span>14 assets</span>
					<span>2 alerts</span>
					<span class="ml-auto">saved · main</span>
				</div>
			</div>
			<div
				class="absolute -bottom-6 left-6 right-6 rounded-xl border bg-background/95 p-4 shadow-xl backdrop-blur"
			>
				<div class="flex items-start gap-3">
					<div class="rounded-lg bg-lime-500/10 p-2 text-lime-600">
						<Sparkles class="size-5" />
					</div>
					<div>
						<p class="font-medium">The real Vale engine, while you work.</p>
						<p class="mt-1 text-sm leading-6 text-muted-foreground">
							Build rules with confidence because the CMS validates what Vale will actually load,
							compile, and report.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="mx-auto max-w-7xl px-6 py-20 lg:px-8">
	<div class="mx-auto max-w-3xl text-center">
		<p class="text-sm font-semibold uppercase tracking-[0.18em] text-lime-500">Why it exists</p>
		<h2 class="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
			A CMS for the system behind your writing standards.
		</h2>
		<p class="mt-4 text-pretty text-lg leading-8 text-muted-foreground">
			A mature Vale setup is an editorial system: rule logic, exceptions, package dependencies,
			scopes, ignore patterns, test cases, and publishing conventions. Vale CMS gives that system a
			purpose-built interface without hiding the files that keep Vale portable.
		</p>
	</div>

	<div class="mt-12 grid gap-5 md:grid-cols-3">
		{#each pillars as pillar}
			<div class="rounded-2xl border bg-card p-6">
				<div class="mb-5 inline-flex rounded-lg bg-lime-500/10 p-2 text-lime-600">
					<svelte:component this={pillar.icon} class="size-5" />
				</div>
				<h3 class="text-lg font-semibold">{pillar.title}</h3>
				<p class="mt-2 text-sm leading-6 text-muted-foreground">{pillar.description}</p>
			</div>
		{/each}
	</div>
</section>

<section class="border-y border-border/60 bg-muted/30">
	<div class="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
		<div>
			<p class="text-sm font-semibold uppercase tracking-[0.18em] text-lime-500">Workflow</p>
			<h2 class="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
				From idea to reviewed style-guide change.
			</h2>
			<p class="mt-4 text-pretty text-lg leading-8 text-muted-foreground">
				The product is built around the work that usually slows Vale adoption: translating guidance
				into checks, proving those checks against real examples, and publishing the result through
				the same Git workflow as the docs or content it protects.
			</p>
		</div>

		<div class="rounded-2xl border bg-background p-6">
			<ul class="space-y-4">
				{#each workflows as item}
					<li class="flex items-start gap-3">
						<span
							class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-lime-500/10 text-lime-600"
						>
							<Check class="size-3.5" />
						</span>
						<span class="text-sm leading-6 text-muted-foreground">{item}</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<section class="mx-auto max-w-7xl px-6 py-20 lg:px-8">
	<div class="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
		<div>
			<p class="text-sm font-semibold uppercase tracking-[0.18em] text-lime-500">
				Privacy and security
			</p>
			<h2 class="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
				Designed for private repositories and real team workflows.
			</h2>
			<p class="mt-4 text-pretty text-lg leading-8 text-muted-foreground">
				Vale CMS needs to open projects and write changes, but it is intentionally shaped around
				short-lived broker calls and browser-held credentials. Git remains the system of record;
				Vale CMS supplies the editing and validation layer.
			</p>
		</div>

		<div class="grid gap-5 sm:grid-cols-2">
			{#each security as item}
				<div class="rounded-2xl border bg-card p-6">
					<div class="mb-5 inline-flex rounded-lg bg-lime-500/10 p-2 text-lime-600">
						<svelte:component this={item.icon} class="size-5" />
					</div>
					<h3 class="text-lg font-semibold">{item.title}</h3>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<section class="mx-auto max-w-7xl px-6 py-20 lg:px-8">
	<div class="grid gap-8 lg:grid-cols-[1fr_0.75fr]">
		<div class="rounded-2xl border bg-card p-8">
			<div class="mb-5 inline-flex rounded-lg bg-lime-500/10 p-2 text-lime-600">
				<WandSparkles class="size-5" />
			</div>
			<h2 class="text-balance text-3xl font-semibold tracking-tight">
				Powerful without becoming proprietary lock-in.
			</h2>
			<p class="mt-4 text-pretty text-lg leading-8 text-muted-foreground">
				Vale CMS is commercial software, but it is designed around the same open, file-based model
				that makes Vale useful everywhere. Your project remains a normal Vale project: readable,
				reviewable, portable, and usable by the CLI, GitHub Action, editor integrations, and MCP.
			</p>
		</div>

		<div class="rounded-2xl border bg-card p-8">
			<p class="text-sm font-semibold uppercase tracking-[0.18em] text-lime-500">Access</p>
			<h2 class="mt-3 text-3xl font-semibold tracking-tight">Try it free.</h2>
			<p class="mt-4 text-sm leading-6 text-muted-foreground">
				Explore the sample project for free. Pro starts at $12/month with a 30-day trial, and team
				plans are available for shared style-guide work.
			</p>
			<a href="https://cms.vale.sh" class={cn(buttonVariants({ class: 'mt-6 w-full' }))}>
				Launch Vale CMS
			</a>
		</div>
	</div>
</section>
