<script lang="ts">
	import BrandIcon from './BrandIcon.svelte';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';

	// Kept separate from LogoWall on purpose: that band claims a company ships
	// Vale in its pipeline, which a sponsor has not necessarily done.
	let {
		name,
		slug,
		href,
		blurb
	}: { name: string; slug: string; href: string; blurb: string } = $props();
</script>

<section class="border-b border-border/60 bg-muted/70 py-8 dark:bg-muted/40">
	<div class="mx-auto max-w-4xl px-6 lg:px-8">
		<a
			href={href}
			class="group flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-6 sm:text-left"
		>
			<div
				class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background"
			>
				<BrandIcon {name} {slug} class="h-7 w-7 text-foreground" />
			</div>

			<div class="min-w-0">
				<p class="text-xs font-medium tracking-wider text-muted-foreground/80 uppercase">
					<!-- Decorative: the label already says it. -->
					<span aria-hidden="true">✨</span> Sponsor spotlight
				</p>
				<p class="mt-1 text-lg font-semibold tracking-tight text-foreground">{name}</p>
				<p class="mt-1 text-sm leading-6 text-muted-foreground">{blurb}</p>
			</div>

			<span
				class="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-foreground sm:ml-auto"
			>
				Read more
				<ArrowRight
					class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
				/>
			</span>
		</a>
	</div>
</section>
