<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import { page } from '$app/stores';
	import { buttonVariants } from '$lib/components/ui/button';
	import { cn } from '$lib/utils.js';

	// Redundant on the page it points at.
	const hidden = $derived($page.url.pathname.startsWith('/cms'));
</script>

{#if !hidden}
	<div class="border-b border-border/40 bg-muted/50">
		<div
			class="container flex max-w-screen-2xl flex-wrap items-center justify-between gap-x-4 gap-y-2 py-1.5 text-sm"
		>
			<p class="min-w-0 flex-1 basis-60 leading-snug text-muted-foreground">
				<strong class="font-semibold text-foreground">Need more than a rule playground?</strong>
				<span class="hidden sm:inline">
					Vale CMS authors full Vale projects: config, rules, vocabularies, tests, and Git-backed
					changes.
				</span>
			</p>
			<a
				href="/cms"
				class={cn(buttonVariants({ size: 'sm' }), 'h-7 shrink-0 rounded-full [&_svg]:size-3.5')}
			>
				Explore Vale CMS
				<ArrowRight />
			</a>
		</div>
	</div>
{/if}
