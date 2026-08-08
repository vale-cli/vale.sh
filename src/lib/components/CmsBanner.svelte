<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import { page } from '$app/stores';

	// Redundant on the page it points at.
	const hidden = $derived($page.url.pathname.startsWith('/cms'));
</script>

{#if !hidden}
	<!--
		The whole bar is the link, so the target is the strip rather than a button
		inside it. It deliberately carries no filled button: this sits directly
		above the hero, and a solid pill here competes with "Get started".
	-->
	<a
		href="/cms"
		class="group block border-b border-lime-500/25 bg-gradient-to-r from-lime-500/10 via-lime-400/[0.14] to-emerald-500/10 transition-colors hover:from-lime-500/15 hover:via-lime-400/20 hover:to-emerald-500/15"
	>
		<div
			class="container flex max-w-screen-2xl items-center justify-center gap-x-2.5 gap-y-1 py-2 text-sm"
		>
			<span
				class="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-lime-500/30 bg-lime-500/10 px-2 py-0.5 text-[11px] font-medium text-lime-700 dark:text-lime-400"
			>
				<span class="h-1.5 w-1.5 rounded-full bg-lime-500"></span>
				Vale CMS
			</span>

			<span class="min-w-0 truncate text-muted-foreground">
				<span class="font-medium text-foreground">Need more than a rule playground?</span>
				<span class="hidden md:inline">
					Author full projects — config, rules, vocabularies, and tests.
				</span>
			</span>

			<span
				class="inline-flex shrink-0 items-center gap-1 font-medium text-foreground underline decoration-border underline-offset-4 transition-colors group-hover:decoration-foreground"
			>
				Explore
				<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
			</span>
		</div>
	</a>
{/if}
