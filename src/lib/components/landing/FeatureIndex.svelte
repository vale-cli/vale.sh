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
	*/
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
</Section>
