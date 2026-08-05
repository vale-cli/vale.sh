<script lang="ts">
	import DiffShot from './DiffShot.svelte';
	const steps = [
		{
			n: '01',
			label: 'Author',
			title: 'Open your repo',
			body: 'Connect GitHub or GitLab, or open a local folder. Your content stays the source of truth — none of it is stored on our servers.'
		},
		{
			n: '02',
			label: 'Preview',
			title: 'Lint as you type',
			body: 'The real Vale engine runs on every keystroke: each alert, its severity, and the rule that fired. The same output your CI will produce.'
		},
		{
			n: '03',
			label: 'Validate',
			title: 'Prove it loads',
			body: 'Before anything ships, the engine confirms the config parses, references resolve, and every rule compiles. No broken style guides.'
		},
		{
			n: '04',
			label: 'Ship',
			title: 'Commit or open a PR',
			body: 'Write changes straight back to your branch, or propose them as a pull request. Enforcement stays with the Vale CLI and your CI.'
		}
	];
</script>

<section id="loop" class="scroll-mt-20 border-b border-border/60 bg-muted/30 py-16 sm:py-20">
	<div class="mx-auto max-w-6xl px-6 lg:px-8">
		<div class="max-w-2xl">
			<h2 class="text-base font-semibold text-lime-500">The loop</h2>
			<p class="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
				Author, preview, and ship — without leaving the browser
			</p>
		</div>

		<!--
			A connected track rather than a fourth grid of cards. Assets, Trust and
			Pricing are all card grids; four in a row read as one undifferentiated
			block and the reader stops seeing the boundaries. This section is the
			only one describing a *sequence*, so it is the one that should look like
			one — the rail carries the eye left-to-right instead of parking it in
			four equal boxes.
		-->
		<div class="relative mt-14">
			<!-- The rail: horizontal on wide screens, vertical once the steps stack. -->
			<div
				class="pointer-events-none absolute left-[7px] top-2 hidden h-[calc(100%-1rem)] w-px bg-gradient-to-b from-lime-500 via-lime-500/40 to-transparent sm:block lg:left-0 lg:top-[7px] lg:h-px lg:w-full lg:bg-gradient-to-r lg:from-lime-500 lg:via-lime-500/40 lg:to-transparent"
				aria-hidden="true"
			></div>

			<ol class="grid gap-8 sm:grid-cols-1 sm:gap-10 lg:grid-cols-4 lg:gap-8">
				{#each steps as step (step.n)}
					<li class="relative sm:pl-8 lg:pl-0 lg:pt-8">
						<span
							class="absolute left-0 top-1.5 grid size-3.5 place-items-center rounded-full border-2 border-lime-500 bg-background sm:top-1.5 lg:top-0"
							aria-hidden="true"
						></span>
						<div
							class="font-mono text-xs font-bold tracking-widest text-lime-600 dark:text-lime-400"
						>
							{step.n} · {step.label.toUpperCase()}
						</div>
						<h3 class="mt-2 text-lg font-semibold">{step.title}</h3>
						<p class="mt-1.5 text-sm leading-6 text-muted-foreground">{step.body}</p>
					</li>
				{/each}
			</ol>
		</div>

		<!--
			The evidence for step 03. "Prove it loads" is the claim that sells the
			loop, and it was the only step with nothing behind it.
		-->
		<div class="mt-12 grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
			<div>
				<h3 class="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
					The dangerous edit is the one to a rule that already works
				</h3>
				<p class="mt-3 text-pretty leading-7 text-muted-foreground">
					A new rule gets read carefully. A one-word change to a rule that has been fine for a year
					gets waved through — and it is the one that quietly starts flagging a word inside another
					word, in files nobody re-reads.
				</p>
				<p class="mt-3 text-pretty leading-7 text-muted-foreground">
					Every edit is run against a corpus both ways, and you see the alerts it adds and removes
					before it lands.
				</p>
			</div>
			<DiffShot />
		</div>
	</div>
</section>
