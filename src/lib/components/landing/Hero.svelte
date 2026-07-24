<script lang="ts">
	import { siteConfig } from '$lib/config/site.js';
	import type { Stats } from '$lib/types/stats';
	import Terminal from './Terminal.svelte';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import Star from 'lucide-svelte/icons/star';

	let { stats }: { stats: Stats } = $props();

	const starLabel = $derived(
		new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(
			stats.stars
		)
	);
</script>

<section class="relative overflow-hidden border-b border-border/60">
	<!-- Subtle dotted grid background -->
	<div
		class="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(hsl(var(--foreground)/0.06)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)]"
	></div>

	<div class="mx-auto max-w-6xl px-6 pb-16 pt-20 sm:pb-24 sm:pt-28 lg:px-8">
		<div class="mx-auto max-w-3xl text-center">
			<!-- Eyebrow -->
			<a
				href={siteConfig.links.github}
				target="_blank"
				rel="noreferrer"
				class="group inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-lime-500/40 hover:text-foreground"
			>
				<span class="inline-flex h-1.5 w-1.5 rounded-full bg-lime-500"></span>
				Open source · MIT licensed
				<span class="text-border">·</span>
				<span class="inline-flex items-center gap-1 font-medium text-foreground">
					<Star class="h-3.5 w-3.5 fill-lime-500 text-lime-500" />
					{starLabel}
				</span>
			</a>

			<!-- Headline -->
			<h1 class="mt-6 text-balance text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
				Vale is a linter for
				<span class="text-lime-500">prose</span>
			</h1>

			<p class="mx-auto mt-6 max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
				A command-line tool that brings code-like linting to your writing. Enforce a consistent
				editorial style across every doc, in any format—entirely offline.
			</p>

			<!-- CTAs -->
			<div class="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
				<a
					href="/docs/install"
					class="group inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
				>
					Get started
					<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
				</a>
				<a
					href={siteConfig.links.github}
					target="_blank"
					rel="noreferrer"
					class="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
				>
					<Star class="h-4 w-4" />
					Star on GitHub
				</a>
			</div>
		</div>

		<!-- Terminal demo -->
		<div class="mx-auto mt-14 max-w-3xl sm:mt-16">
			<Terminal />
		</div>
	</div>
</section>
