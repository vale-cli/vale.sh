<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import FeatureShell from '$lib/components/features/FeatureShell.svelte';
	import Section from '$lib/components/features/Section.svelte';
	import BarChart from '$lib/components/features/BarChart.svelte';
	import ProjectPicker from '$lib/components/features/ProjectPicker.svelte';
	import ExternalLink from '$lib/components/features/ExternalLink.svelte';
	import { features } from '$lib/features';

	const feature = features.find((f) => f.slug === 'speed')!;

	/*
		The headline corpus is GitLab's documentation, linted with the .vale.ini
		GitLab checks into its own repository. Nothing here is a configuration we
		invented to look good: it is one company's real docs, real styles, and real
		rule set. The methodology note at the bottom pins the commit.
	*/
	/*
		Four real documentation sets, each linted with the configuration its own
		project ships. Rule counts differ more than corpus sizes do, which is why
		the picker shows both — a faster project here is usually a lighter rule
		set, not a better one.
	*/
	const projects = [
		{
			id: 'docker',
			name: 'Docker',
			avatar: '/users/avatars/docker.png',
			format: 'Markdown',
			formatIcon: 'markdown',
			docs: 'https://github.com/docker/docs/tree/main/content',
			config: 'https://github.com/docker/docs/blob/main/.vale.ini',
			commit: '86dd043',
			clone: 'https://github.com/docker/docs.git',
			dir: 'docs',
			target: 'content/',
			pages: 1048,
			mb: 7.66,
			rules: 14,
			seconds: 10.8,
			note: 'Fourteen rules they wrote themselves, with per-directory overrides that relax them for generated reference content and release notes.',
			levels: { suggestion: 86, warning: 322, error: 385 }
		},
		{
			id: 'gitlab',
			name: 'GitLab',
			avatar: '/users/avatars/gitlab.png',
			format: 'Markdown',
			formatIcon: 'markdown',
			docs: 'https://gitlab.com/gitlab-org/gitlab/-/tree/master/doc',
			config: 'https://gitlab.com/gitlab-org/gitlab/-/blob/master/.vale.ini',
			commit: '57f859d1',
			clone: 'https://gitlab.com/gitlab-org/gitlab.git',
			dir: 'gitlab',
			target: 'doc/',
			glob: "!*graphql/reference*",
			pages: 2826,
			mb: 31.3,
			rules: 82,
			seconds: 19.5,
			note: 'The largest corpus here and the most rules. Excludes one 4.5 MB generated GraphQL reference; including it the run takes 45 s.',
			levels: { suggestion: 15109, warning: 9851, error: 1 }
		},
		{
			id: 'ti',
			name: 'Texas Instruments',
			avatar: '/users/avatars/TexasInstruments.png',
			format: 'reStructuredText',
			formatIcon: 'sphinx',
			docs: 'https://github.com/TexasInstruments/processor-sdk-doc',
			config: 'https://github.com/TexasInstruments/processor-sdk-doc/blob/master/.vale.ini',
			commit: 'ccab88e',
			clone: 'https://github.com/TexasInstruments/processor-sdk-doc.git',
			dir: 'processor-sdk-doc',
			target: '.',
			pages: 634,
			mb: 5.61,
			rules: 38,
			seconds: 33.5,
			note: 'Every embedded-systems manual in the SDK, checked against the Red Hat style and their own vocabulary. Docutils converts each page first, and Vale keeps those interpreters up across the run rather than restarting them per file.',
			levels: { suggestion: 25455, warning: 11099, error: 864 }
		},
		{
			id: 'circleci',
			name: 'CircleCI',
			avatar: '/users/avatars/circleci.png',
			format: 'AsciiDoc',
			formatIcon: 'asciidoctor',
			docs: 'https://github.com/circleci/circleci-docs',
			config: 'https://github.com/circleci/circleci-docs/blob/main/.vale.ini',
			commit: '6ae1fec',
			clone: 'https://github.com/circleci/circleci-docs.git',
			dir: 'circleci-docs',
			target: '.',
			pages: 812,
			mb: 6.15,
			rules: 62,
			seconds: 104.3,
			note: 'Eight hundred AsciiDoc pages against 62 rules, inside two minutes. Asciidoctor converts each page before Vale reads it, and Vale keeps those converters running for the whole corpus rather than starting one per file.',
			levels: { suggestion: 8783, warning: 7128, error: 3874 }
		}
	];

	const fmt = new Intl.NumberFormat('en-US');

	let active = $state('gitlab');
	const current = $derived(projects.find((p) => p.id === active)!);

	/*
		The severity split from that same run. It is on a speed page because it is
		the context the raw total needs: 24,961 alerts is not 24,961 defects, and
		the shape of the split is what lets a team run every rule without the
		pipeline becoming noise.
	*/
	const levels = $derived([
		{
			label: 'suggestion',
			value: current.levels.suggestion,
			display: fmt.format(current.levels.suggestion),
			note: 'Advisory. Surfaced while you write; nothing depends on it.'
		},
		{
			label: 'warning',
			value: current.levels.warning,
			display: fmt.format(current.levels.warning),
			note: 'Worth a look in review.'
		},
		{
			label: 'error',
			value: current.levels.error,
			display: fmt.format(current.levels.error),
			note: 'What the project has decided should stop a build.'
		}
	]);

	const totalAlerts = $derived(
		current.levels.suggestion + current.levels.warning + current.levels.error
	);

	/*
		Built as one string rather than as markup: inside `whitespace-pre` a line
		break in the template is a line break on the page, so splitting the
		command across source lines would split it on screen too.
	*/
	const command = $derived(
		`time vale${current.glob ? ` --glob='${current.glob}'` : ''} ${current.target}`
	);

	const page = [
		{ label: 'Vale', value: 156 },
		{ label: '+ Microsoft', value: 180 },
		{ label: '+ Google', value: 189 },
		{ label: '+ write-good, proselint', value: 246 }
	];

	const local = [
		{
			title: 'Nothing to install alongside it',
			body: 'One statically linked executable. No interpreter starts, no module graph resolves, no virtual environment activates—and nothing is uploaded, so nothing waits on a response.'
		},
		{
			title: 'Every core you have',
			body: 'The GitLab run spent close to four cores’ worth of CPU throughout: files are linted several at a time, and results stream back as they land.'
		}
	];

	const where = [
		{
			when: 'While you write',
			body: 'The language server loads your styles once and keeps them, so re-linting the buffer costs a fraction of a cold run. Alerts reach your editor with any fixes a rule defines attached.',
			href: 'https://docs.vale.sh/guides/lsp',
			cta: 'Editor integration'
		},
		{
			when: 'Before you commit',
			body: 'A typical repository in well under a second is fast enough to sit in a pre-commit hook without becoming the reason people reach for --no-verify.',
			href: 'https://docs.vale.sh/integrations/pre-commit',
			cta: 'pre-commit'
		},
		{
			when: 'In CI',
			body: 'A single binary to fetch and a machine-readable report to publish—no toolchain to provision on the runner first.',
			href: 'https://github.com/errata-ai/vale-action',
			cta: 'GitHub Actions'
		}
	];

	const description =
		"Vale checks about 145 documentation pages a second—GitLab's 2,826-page repository, 31.3 MB against 82 rules, in under 20 seconds.";
</script>

<MetaTags
	title="Built for speed — Vale"
	{description}
	canonical="https://vale.sh/features/speed"
	openGraph={{
		url: 'https://vale.sh/features/speed',
		title: 'Built for speed',
		description
	}}
/>

<FeatureShell
	{feature}
	lede="Speed decides where linting fits in your day. A checker that takes an afternoon belongs in a nightly job, where you hear about a problem long after you stopped thinking about it. One that finishes while you are still reading the diff can sit in your editor, your pre-commit hook, and your pipeline at once—and that is a different tool, even when the rules are identical."
	docs={{ href: 'https://docs.vale.sh/topics/installation', label: 'Install Vale' }}
>
	<Section
		title="Four real documentation sets"
		lede="Four projects, four markup formats, each linted with the configuration it ships—their rules, their overrides, unmodified. Pick one to see what a full run costs it."
	>
		<div>
			<ProjectPicker {projects} bind:active />
		</div>
		<p class="mt-3 text-xs leading-relaxed text-muted-foreground/70">
			Pages per second of wall clock over the whole corpus. Files run several at a time, so this is
			throughput, not the time a single page takes.
		</p>

		<p class="mt-6 text-sm leading-relaxed text-muted-foreground">
			Format moves this number more than corpus size does. Markdown Vale parses itself, at about 7 ms
			a page. reStructuredText and AsciiDoc go first through the tools that define them—Docutils and
			Asciidoctor—and Vale holds those open for the whole run instead of starting one per page,
			which is most of the difference between 53 ms and 128 ms a page here and what those
			conversions used to cost. Rule count matters second: Docker runs fourteen rules, GitLab
			eighty-two.
		</p>
		<p class="mt-8 text-sm leading-relaxed text-muted-foreground">
			Every rule ran against every page—no sampling, no incremental cache. Each project links to its
			own docs and config above, so any of these is reproducible with one command.
		</p>
	</Section>

	<Section
		title="Every rule, without the noise"
		lede="Vale has three levels, and each project decides which findings sit at which. That decision is what makes it practical to switch every rule on—the same selection above drives this chart."
	>
		<div class="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
			<BarChart
				rows={levels}
				unit=""
				caption="Alerts by level from the same run, using the project's own configuration."
			/>
		</div>

		<p class="mt-6 text-sm leading-relaxed text-muted-foreground">
			The shapes differ because the policies do. GitLab reserves <code
				class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">error</code
			>
			for a single thing across 2,826 pages and lets the rest inform; Docker puts most of its findings
			there. Neither is wrong—the level is set per rule, so the decision about what stops a build gets
			made once, in the rule, instead of being argued over in review.
		</p>
	</Section>

	<Section
		title="What another style guide costs you"
		lede="Speed in the abstract is not the useful question. The useful question is what it costs to turn on the rules you actually want."
	>
		<div class="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
			<BarChart
				rows={page}
				caption="One 2 KB documentation page, linted from cold. Mean of 15 runs after warm-up."
			/>
		</div>

		<p class="mt-6 text-sm leading-relaxed text-muted-foreground">
			Going from one style guide to five adds 90 ms. Most of even that is the one-time cost of
			loading and compiling the rules, paid on every CLI invocation—which is why the language
			server, which pays it once and then keeps the styles in memory, can re-lint as you type.
		</p>
	</Section>

	<Section title="Nothing runs but Vale">
		<div
			class="overflow-x-auto rounded-2xl border border-border/60 bg-card p-5 font-mono text-[13px] leading-relaxed sm:p-6"
		>
			<div class="whitespace-pre">
				<span class="text-lime-600 dark:text-lime-400">$</span> brew install vale
			</div>
			<div class="mt-3 whitespace-pre">
				<span class="text-lime-600 dark:text-lime-400">$</span> vale doc/
			</div>
			<div class="mt-3 whitespace-pre text-muted-foreground/60">
				# That is the whole dependency list.
			</div>
		</div>

		<div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
			{#each local as item}
				<div class="rounded-xl border border-border/60 bg-card p-5">
					<h3 class="text-sm font-semibold text-foreground">{item.title}</h3>
					<p class="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
				</div>
			{/each}
		</div>
	</Section>

	<Section title="Where that speed goes" wide>
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
			{#each where as item}
				<div class="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-6">
					<h3 class="font-semibold text-foreground">{item.when}</h3>
					<p class="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
					<a
						href={item.href}
						class="mt-auto pt-2 text-sm font-medium text-lime-600 underline decoration-lime-500/40 underline-offset-4 dark:text-lime-400"
						>{item.cta} →</a
					>
				</div>
			{/each}
		</div>
	</Section>

	<Section
		title="Check it yourself"
		lede="Every figure here comes from a public repository and an unmodified configuration. These are the exact commands for the project selected above—and then run it on your own docs, which is the number that actually matters."
	>
		<div
			class="overflow-x-auto rounded-2xl border border-border/60 bg-card p-5 font-mono text-[13px] leading-relaxed sm:p-6"
		>
			<div class="whitespace-pre">
				<span class="text-lime-600 dark:text-lime-400">$</span> git clone --depth 1 {current.clone}
			</div>
			<div class="whitespace-pre">
				<span class="text-lime-600 dark:text-lime-400">$</span> cd {current.dir}
			</div>
			<div class="whitespace-pre">
				<span class="text-lime-600 dark:text-lime-400">$</span>
				{command}
			</div>
			<div class="mt-3 whitespace-pre text-muted-foreground/60">
				# Then try it on your own docs, which is the number that matters.
			</div>
		</div>

		<div class="mt-6 rounded-xl border border-border/60 bg-muted/30 p-5">
			<h3 class="text-sm font-semibold text-foreground">How these were measured</h3>
			<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
				Vale v3.17.0, built from commit
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">5f071ef5</code>, on an
				Apple M1 with 8 cores, macOS 15.7. The GitLab figures use commit
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">57f859d1</code> and the
				<ExternalLink href="https://gitlab.com/gitlab-org/gitlab/-/blob/master/.vale.ini"
					>.vale.ini</ExternalLink
				> in that repository, unmodified. The per-page figures use this site's documentation with
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]"
					>Vale, Microsoft, Google, write-good, proselint</code
				>
				at
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]"
					>MinAlertLevel = suggestion</code
				>. Your hardware and your prose will give you different numbers; the commands above are the
				ones that tell you which.
			</p>
		</div>
	</Section>
</FeatureShell>
