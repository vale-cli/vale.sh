<script lang="ts">
	import { siteConfig } from '$lib/config/site.js';
	import type { Stats } from '$lib/types/stats';
	import Terminal from './Terminal.svelte';
	import HeroFeatures from './HeroFeatures.svelte';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import Star from 'lucide-svelte/icons/star';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import { assistants } from '$lib/assistants';
	import BrandIcon from './BrandIcon.svelte';
	import Sparkles from 'lucide-svelte/icons/sparkles';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import HeroBackdrop from './HeroBackdrop.svelte';

	let { stats }: { stats: Stats } = $props();

	const starLabel = $derived(
		new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(
			stats.stars
		)
	);
</script>

<section class="relative overflow-hidden border-b border-border/60">
	<HeroBackdrop />

	<div
		class="relative z-10 mx-auto max-w-6xl border-border/60 px-6 py-16 sm:py-20 lg:border-x lg:px-8"
	>
		<div class="mx-auto max-w-3xl text-center">
			<!-- Split pill: label, rule, then the count set in figures. -->
			<a
				href={siteConfig.links.github}
				target="_blank"
				rel="noreferrer"
				class="group inline-flex items-center gap-2.5 rounded-full border border-border bg-background/70 py-1 pl-3 pr-2 text-sm text-muted-foreground backdrop-blur transition-colors hover:bg-muted"
			>
				<span>Open source · MIT</span>
				<span class="h-4 w-px bg-border"></span>
				<span
					class="inline-flex items-center gap-1 font-mono text-xs font-medium tabular-nums text-lime-600 dark:text-lime-400"
				>
					<Star class="h-3 w-3 fill-current" />
					{starLabel}
				</span>
				<ChevronRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
			</a>

			<!-- Large and medium-weight, not bold: the display size carries it. -->
			<h1 class="mt-6 text-5xl font-medium leading-[1.05] sm:text-6xl lg:text-[4.25rem]">
				Vale is a linter for
				<span class="text-lime-500">prose</span>
			</h1>

			<p class="mx-auto mt-6 max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
				A command-line tool that brings code-like linting to your writing. Enforce a consistent
				editorial style across
				<strong class="font-medium text-foreground">every doc</strong>, in
				<strong class="font-medium text-foreground">any format</strong>—entirely
				<strong class="font-medium text-foreground">offline</strong>.
			</p>

			<!-- CTAs -->
			<div class="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
				<a
					href="https://docs.vale.sh/topics/installation"
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

			<!-- What the panel above cannot show: what you can teach it. -->
			<div class="mt-10">
				<HeroFeatures />
			</div>
		</div>

		<!--
			Setting up with an assistant, for people who would rather not read the
			quickstart. The links carry the prompt, so the chat opens already
			pointed at vale.sh/AGENTS.md. Kept below the demo and deliberately
			quiet: it is a shortcut, not a headline.
		-->
		<div class="mt-14 border-t border-border/60 pt-6">
			<div
				class="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-muted-foreground"
			>
				<span>Setting up with an agent?</span>
				{#each assistants as assistant}
					<a
						href={assistant.href}
						target="_blank"
						rel="noreferrer"
						class="inline-flex items-center gap-1.5 font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
					>
						<BrandIcon
							name={assistant.label}
							slug={assistant.slug}
							size="h-3.5 w-3.5"
							class="opacity-80"
						/>
						{assistant.label}
						<ArrowUpRight class="h-3.5 w-3.5" />
					</a>
				{/each}
				<a
					href="/skills"
					class="inline-flex items-center gap-1.5 font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
				>
					<Sparkles class="h-3.5 w-3.5 opacity-80" />
					Agent skills
					<ArrowRight class="h-3.5 w-3.5" />
				</a>
			</div>

			<p class="mt-3 text-center text-xs text-muted-foreground">
				Thanks to <a
					href="https://claude.com/contact-sales/claude-for-oss"
					target="_blank"
					rel="noreferrer"
					class="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
					>Claude for Open Source</a
				>.
			</p>
		</div>
	</div>
</section>
