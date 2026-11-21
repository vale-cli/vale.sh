<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import { features } from '$lib/features';
	import Section from './Section.svelte';

	/*
		The four deep dives as cards. The landing page used to walk through
		each with a worked figure; the video above the fold now shows them
		moving, and each has its own page under /features, so the page keeps
		the claim and the way in and drops the walk-through. Features.svelte
		still holds the long form.

		Below them, the case for a rule over a reviewer that reads the page
		afresh each time, made without naming one. Every figure is from the
		measurements in /blog/quality-gate; change them there first.
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
			link: { href: '/agents#skills', label: 'Agent skills' }
		}
	];
</script>

<Section
	editorial
	id="features"
	eyebrow="Why Vale"
	accent
	title="Most tools see text. Vale sees a document."
	lede="Check the writing in context. Target a heading, a comment, or a description, while leaving the code around it alone."
>
	<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each features as feature, i (feature.slug)}
			{@const Icon = feature.icon}
			<li>
				<a
					href="/features/{feature.slug}"
					class="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-lime-500/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
				>
					<span
						class="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground"
					>
						<span>{String(i + 1).padStart(2, '0')}</span>
						<Icon class="size-4" aria-hidden="true" />
						{feature.title}
					</span>
					<span
						class="mt-4 text-pretty text-lg font-medium leading-snug tracking-tight text-foreground"
					>
						{feature.tagline}.
					</span>
					<span class="mt-2 hidden grow text-sm leading-6 text-muted-foreground sm:block"
						>{feature.description}</span
					>
					<!-- On a phone the card is its claim and the way in; the paragraph
					     is on the page it leads to. -->
					<span
						class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-lime-600 dark:text-lime-400"
					>
						Read more
						<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
					</span>
				</a>
			</li>
		{/each}
	</ul>

	<dl class="mt-12 grid gap-x-10 gap-y-8 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-4">
		{#each points as point (point.title)}
			<div>
				<dt class="text-base font-medium tracking-tight text-foreground">{point.title}</dt>
				<dd class="mt-2 text-sm leading-6 text-muted-foreground">
					{point.body}
					{#if point.link}
						<a
							href={point.link.href}
							class="group mt-2 flex w-fit items-center gap-1 font-medium text-foreground underline decoration-lime-500/40 underline-offset-4 transition-colors hover:text-lime-600 dark:hover:text-lime-400"
						>
							{point.link.label}
							<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
						</a>
					{/if}
				</dd>
			</div>
		{/each}
	</dl>
</Section>
