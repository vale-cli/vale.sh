<script lang="ts">
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

		<div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each steps as step (step.n)}
				<div class="border-t-2 border-lime-500 pt-4">
					<div class="font-mono text-xs font-bold tracking-widest text-lime-600 dark:text-lime-400">
						{step.n} · {step.label.toUpperCase()}
					</div>
					<h3 class="mt-2 text-lg font-semibold">{step.title}</h3>
					<p class="mt-1.5 text-sm leading-6 text-muted-foreground">{step.body}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
