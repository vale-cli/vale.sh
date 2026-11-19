<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import Section from './Section.svelte';
	import Terminal from './Terminal.svelte';

	/*
		The case for a rule over a reviewer that reads the page afresh each
		time, made without naming one. Every figure is from the measurements
		in /blog/quality-gate; change them there first.
	*/
	const points = [
		{
			title: 'The same answer on every run.',
			body: 'A rule’s verdict is decided before the draft exists. Test each one against the sentences it should catch and the ones it should leave alone.',
			link: { href: 'https://docs.vale.sh/topics/testing', label: 'Testing rules' }
		},
		{
			title: 'Milliseconds, not tokens.',
			body: 'On one draft, Vale and a model review found the same fourteen long sentences. Vale took 70 milliseconds; the review took 46 seconds and 45,000 tokens.',
			link: { href: '/blog/quality-gate', label: 'Read the measurements' }
		},
		{
			title: 'Yours to read.',
			body: 'Rules are YAML files in your repository, reviewed in a pull request like any other change. Vale runs offline, so no draft leaves your machine.'
		},
		{
			title: 'A model writes the rule. The rule checks the docs.',
			body: 'Describe a guideline in a sentence and your agent writes the YAML and its tests. Its attention then goes to what no pattern can judge.',
			link: { href: '/skills', label: 'Agent skills' }
		}
	];
</script>

<Section
	editorial
	id="why-rules"
	eyebrow="Rules, not guesses"
	title="A style guide is a list. Check it like one."
	lede="Most of a style guide is mechanical: this word, not that one; this heading case; this many words. A rule checks that the same way every time, and says which rule fired."
>
	<div class="grid items-start gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
		<dl class="flex flex-col gap-7">
			{#each points as point (point.title)}
				<div>
					<dt class="text-base font-medium tracking-tight text-foreground">{point.title}</dt>
					<dd class="mt-1.5 text-sm leading-6 text-muted-foreground">
						{point.body}
						{#if point.link}
							<a
								href={point.link.href}
								class="group ml-1 inline-flex items-center gap-1 whitespace-nowrap font-medium text-foreground underline decoration-lime-500/40 underline-offset-4 transition-colors hover:text-lime-600 dark:hover:text-lime-400"
							>
								{point.link.label}
								<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
							</a>
						{/if}
					</dd>
				</div>
			{/each}
		</dl>
		<figure class="min-w-0">
			<Terminal />
			<figcaption class="mt-3 text-xs leading-5 text-muted-foreground">
				What a run prints: the place, the level, the message, and the rule that raised it.
			</figcaption>
		</figure>
	</div>
</Section>
