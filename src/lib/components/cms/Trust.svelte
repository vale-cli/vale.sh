<script lang="ts">
	import TrustDiagram from './TrustDiagram.svelte';
	import GitBranch from 'lucide-svelte/icons/git-branch';
	import KeyRound from 'lucide-svelte/icons/key-round';
	import ServerOff from 'lucide-svelte/icons/server-off';
	import ShieldCheck from 'lucide-svelte/icons/shield-check';

	// Each claim is taken from the CMS repo's SECURITY.md, which checks its own
	// claims against the source. Say what it means for the reader, not what the
	// mechanism is called — nobody choosing a writing tool is shopping for a CSP
	// directive. If you add a card, it states a consequence, not an acronym.
	const points = [
		{
			icon: GitBranch,
			title: 'Your files stay in your repo',
			body: 'Vale CMS edits your repository directly. There is no second copy of your style guide living somewhere else, and nothing to migrate out of if you stop paying.'
		},
		{
			icon: KeyRound,
			title: 'Your GitHub login never reaches us',
			body: 'The access token stays in your browser. We hand it to GitHub or GitLab when you ask for something, then drop it. We never store it.'
		},
		{
			icon: ServerOff,
			title: 'We do not keep your writing',
			body: 'Your content is checked and forgotten. The engine holds it just long enough to lint it and writes none of it down.'
		},
		{
			icon: ShieldCheck,
			title: 'Only our own code runs',
			body: 'Every script is fingerprinted before it ships, so anything injected later simply will not run — and if it somehow did, it could not send your data anywhere we have not listed by name.'
		}
	];
</script>

<section class="border-b border-border/60 py-16 sm:py-20">
	<div class="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 lg:px-8">
		<div>
			<h2 class="text-base font-semibold text-lime-500">Built for private repositories</h2>
			<!--
				State the design, not the disaster. An earlier headline opened with a
				server breach, which makes the reader picture one — on a page whose job
				is to make handing us a private repository feel ordinary. The guarantee
				is the same; it just leads with what we don't hold.
			-->
			<p class="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
				We don't keep the things worth keeping safe.
			</p>
			<p class="mt-5 text-pretty text-lg leading-8 text-muted-foreground">
				Vale CMS has to open your project and write changes back to it. Your credentials stay in
				your browser and your writing is forgotten as soon as it is linted, so the parts that matter
				never pile up on our servers in the first place.
			</p>
			<a
				href="https://cms.vale.sh/security"
				class="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-lime-600 hover:underline dark:text-lime-400"
			>
				Read the full security page
				<span aria-hidden="true">→</span>
			</a>
		</div>

		<div class="flex flex-col gap-5">
			<TrustDiagram />
			<div class="grid gap-5 sm:grid-cols-2">
				{#each points as point (point.title)}
					<div class="rounded-2xl border border-border/60 bg-card p-6">
						<div class="inline-flex rounded-lg bg-lime-500/10 p-2 text-lime-600 dark:text-lime-400">
							<point.icon class="size-5" />
						</div>
						<h3 class="mt-4 font-semibold">{point.title}</h3>
						<p class="mt-2 text-sm leading-6 text-muted-foreground">{point.body}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
