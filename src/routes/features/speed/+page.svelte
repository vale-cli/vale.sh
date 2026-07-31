<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import FeatureShell from '$lib/components/features/FeatureShell.svelte';
	import Section from '$lib/components/features/Section.svelte';
	import BarChart from '$lib/components/features/BarChart.svelte';
	import ExternalLink from '$lib/components/features/ExternalLink.svelte';
	import { features } from '$lib/features';

	const feature = features.find((f) => f.slug === 'speed')!;

	/*
		The headline corpus is GitLab's documentation, linted with the .vale.ini
		GitLab checks into its own repository. Nothing here is a configuration we
		invented to look good: it is one company's real docs, real styles, and real
		rule set. The methodology note at the bottom pins the commit.
	*/
	const headline = [
		{ stat: '2,826', label: 'pages checked', sub: 'every hand-written page in the repository' },
		{ stat: '31.3 MB', label: 'of prose', sub: 'against 82 rules GitLab wrote' },
		{ stat: '40.8s', label: 'for all of it', sub: 'mean of three runs, from cold' }
	];

	const scale = [
		{
			label: 'This site’s docs — 56 pages',
			href: 'https://github.com/errata-ai/vale.sh/tree/svelte/docs',
			value: 15.0,
			display: '15.0 ms / page',
			note: '143 KB, linted whole in 0.84 s.'
		},
		{
			label: 'GitLab’s docs — 2,826 pages',
			href: 'https://gitlab.com/gitlab-org/gitlab/-/tree/master/doc',
			value: 14.4,
			display: '14.4 ms / page',
			note: '31.3 MB, linted whole in 40.8 s.'
		}
	];

	/*
		The severity split from that same run. It is on a speed page because it is
		the context the raw total needs: 24,961 alerts is not 24,961 defects, and
		the shape of the split is what lets a team run every rule without the
		pipeline becoming noise.
	*/
	const levels = [
		{
			label: 'suggestion',
			value: 15109,
			display: '15,109',
			note: 'Advisory. Sentence length, reading level, phrasing—surfaced while you write.'
		},
		{
			label: 'warning',
			value: 9851,
			display: '9,851',
			note: 'Worth a look. Shown in review, but nothing is blocked.'
		},
		{
			label: 'error',
			value: 1,
			display: '1',
			note: 'The only thing in 2,826 pages that fails the build.'
		}
	];

	const page = [
		{ label: 'Vale', value: 156 },
		{ label: '+ Microsoft', value: 180 },
		{ label: '+ Google', value: 189 },
		{ label: '+ write-good, proselint', value: 246 }
	];

	const local = [
		{
			title: 'No network round-trip',
			body: 'Nothing is uploaded, so nothing waits on a response. The floor is your disk, not a queue.'
		},
		{
			title: 'No runtime to boot',
			body: 'One statically linked executable. No interpreter starts, no module graph resolves, no virtual environment activates.'
		},
		{
			title: 'No rate limit',
			body: 'Nobody is counting requests, and nobody is billing you per document. Lint the whole repository on every commit if you want to.'
		},
		{
			title: 'Every core you have',
			body: "The GitLab run spent close to four cores' worth of CPU throughout—files are linted several at a time, and results stream back as they land."
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
		"Vale checks all 2,826 pages of GitLab's documentation—31.3 MB of prose against 82 rules—in 38 seconds, from a single binary with no runtime dependencies.";
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
		title="All of GitLab’s documentation, in 41 seconds"
		lede="Not a corpus we assembled. This is the GitLab repository, checked with the .vale.ini GitLab keeps in it, against the 82 rules their writers maintain."
	>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			{#each headline as item}
				<div class="flex flex-col gap-1 rounded-2xl border border-border/60 bg-card p-6">
					<div
						class="font-mono text-4xl font-semibold tracking-tight text-lime-600 dark:text-lime-400"
					>
						{item.stat}
					</div>
					<div class="mt-1 text-sm font-medium text-foreground">{item.label}</div>
					<div class="text-xs text-muted-foreground">{item.sub}</div>
				</div>
			{/each}
		</div>

		<p class="mt-8 text-sm leading-relaxed text-muted-foreground">
			Every rule ran against every page—no sampling, no incremental cache. You can reproduce it from
			<ExternalLink href="https://gitlab.com/gitlab-org/gitlab/-/tree/master/doc"
				>their docs</ExternalLink
			>
			and
			<ExternalLink href="https://gitlab.com/gitlab-org/gitlab/-/blob/master/.vale.ini"
				>their .vale.ini</ExternalLink
			>.
		</p>

		<p class="mt-4 text-xs leading-relaxed text-muted-foreground/70">
			Excludes one 4.5 MB generated GraphQL API reference with
			<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]"
				>--glob='!*graphql/reference*'</code
			>. Including it, the whole repository takes 64.4 s.
		</p>
	</Section>

	<Section
		title="Every rule, without the noise"
		lede="Running 82 rules over 2,826 pages produces 24,961 alerts. Almost none of them block anything: Vale has three levels, and a team that uses all three can turn everything on without the pipeline turning into a wall of red."
	>
		<div class="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
			<BarChart
				rows={levels}
				unit=""
				caption="Alerts by level from the same run. GitLab's own configuration, unmodified."
			/>
		</div>

		<p class="mt-6 text-sm leading-relaxed text-muted-foreground">
			A level is set per rule, not per run. That is what makes it practical to switch everything on:
			the decision about which findings are worth stopping for gets made once, in the rule, instead
			of being argued over in review.
		</p>
	</Section>

	<Section
		title="A page costs the same at any scale"
		lede="Two projects two hundred times apart in size, each linted from cold. What a page costs barely moves between them."
	>
		<div class="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
			<BarChart
				rows={scale}
				unit="ms"
				caption="Wall-clock time for the whole project, divided by its page count."
			/>
		</div>

		<p class="mt-6 text-sm leading-relaxed text-muted-foreground">
			When the whole tree costs this little, it can be the unit of work: a rule you add today gets
			checked against everything you have already published, not just the page you have open.
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
			Going from one style guide to five adds 90 ms to a cold run. Most of what remains is the
			one-time cost of loading and compiling the rules—which is why the language server, which pays
			it once and then keeps the styles in memory, can re-lint as you type.
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
		lede="Every figure on this page comes from a public repository and an unmodified configuration, so you can run it yourself—and then run it on your own docs, which is the number that actually matters."
	>
		<div
			class="overflow-x-auto rounded-2xl border border-border/60 bg-card p-5 font-mono text-[13px] leading-relaxed sm:p-6"
		>
			<div class="whitespace-pre">
				<span class="text-lime-600 dark:text-lime-400">$</span> git clone --depth 1 https://gitlab.com/gitlab-org/gitlab.git
			</div>
			<div class="whitespace-pre">
				<span class="text-lime-600 dark:text-lime-400">$</span> cd gitlab
			</div>
			<div class="whitespace-pre">
				<span class="text-lime-600 dark:text-lime-400">$</span> time vale --glob='!*graphql/reference*'
				doc/
			</div>
			<div class="mt-3 whitespace-pre text-muted-foreground/60">
				# Then try it on your own docs, which is the number that matters.
			</div>
		</div>

		<div class="mt-6 rounded-xl border border-border/60 bg-muted/30 p-5">
			<h3 class="text-sm font-semibold text-foreground">How these were measured</h3>
			<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
				Vale v3.17.0, built from commit
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">769943cc</code>, on an
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
