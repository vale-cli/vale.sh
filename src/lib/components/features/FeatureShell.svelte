<script lang="ts">
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import { otherFeatures, type Feature } from '$lib/features';
	import type { Snippet } from 'svelte';

	let {
		feature,
		lede,
		docs,
		children
	}: {
		feature: Feature;
		/** The one-paragraph argument under the title. Prose, not a summary. */
		lede: string;
		/** Where in the manual a reader goes for the full reference. */
		docs: { href: string; label: string };
		children: Snippet;
	} = $props();

	const Icon = feature.icon;
	const rest = otherFeatures(feature.slug);
</script>

<article>
	<header class="border-b border-border/60">
		<div class="mx-auto max-w-4xl px-6 pb-14 pt-10 sm:pb-16 lg:px-8">
			<a
				href="/#features"
				class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft class="h-4 w-4" />
				Why Vale
			</a>

			<div class="mt-8 flex items-center gap-3">
				<div
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-lime-500/20 bg-lime-500/10 text-lime-500"
				>
					<Icon class="h-5 w-5" />
				</div>
				<p class="text-sm font-medium text-lime-500">{feature.tagline}</p>
			</div>

			<h1 class="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
				{feature.title}
			</h1>
			<p class="mt-6 text-pretty text-lg leading-8 text-muted-foreground">{lede}</p>

			<a
				href={docs.href}
				class="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-lime-500 decoration-2 underline-offset-4 transition-colors hover:text-lime-600 dark:hover:text-lime-400"
			>
				{docs.label}
				<ArrowRight class="h-4 w-4" />
			</a>
		</div>
	</header>

	{@render children()}

	<!-- Keep reading: the other three deep dives, in their landing-page order. -->
	<section class="border-t border-border/60 bg-muted/20">
		<div class="mx-auto max-w-6xl px-6 py-14 sm:py-16 lg:px-8">
			<h2 class="text-base font-semibold text-lime-500">Keep reading</h2>
			<div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
				{#each rest as other}
					{@const OtherIcon = other.icon}
					<a
						href="/features/{other.slug}"
						class="group flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-lime-500/40"
					>
						<div
							class="flex h-9 w-9 items-center justify-center rounded-lg border border-lime-500/20 bg-lime-500/10 text-lime-500"
						>
							<OtherIcon class="h-4 w-4" />
						</div>
						<h3 class="font-semibold text-foreground">{other.title}</h3>
						<p class="text-sm leading-relaxed text-muted-foreground">{other.tagline}.</p>
						<span
							class="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-lime-600 dark:text-lime-400"
						>
							Read more
							<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
						</span>
					</a>
				{/each}
			</div>
		</div>
	</section>
</article>
