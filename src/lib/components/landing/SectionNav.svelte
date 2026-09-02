<script lang="ts">
	import { onMount } from 'svelte';
	import Download from 'lucide-svelte/icons/download';
	import Sparkles from 'lucide-svelte/icons/sparkles';
	import Blocks from 'lucide-svelte/icons/blocks';

	// Only the sections still on this page. Adopters, press, supporters and
	// infrastructure moved to /adopters, /library and /sponsor, and a chip
	// scrolling to an anchor that is not here would land on nothing.
	const sections = [
		{ id: 'features', label: 'Features', icon: Sparkles },
		{ id: 'stats', label: 'Downloads', icon: Download },
		{ id: 'integrations', label: 'Integrations', icon: Blocks }
	];

	let active = $state('');
	let nav: HTMLElement | undefined = $state();
	/** Height of the site header, which varies with the banner. */
	let headerHeight = $state(56);

	// The bar deliberately does not re-scroll itself to follow the active chip.
	// The rail only overflows on narrow screens, so that would have animated the
	// bar sideways under the reader's thumb while they scrolled vertically — it
	// made the whole page feel unanchored. The chips stay put; the highlight
	// moves.

	onMount(() => {
		const header = document.querySelector('header');

		const measure = () => {
			headerHeight = header?.offsetHeight ?? 56;
			// So anchor jumps clear both sticky bars.
			document.documentElement.style.scrollPaddingTop = `${headerHeight + (nav?.offsetHeight ?? 48) + 8}px`;
		};
		measure();

		const ro = new ResizeObserver(measure);
		if (header) ro.observe(header);
		if (nav) ro.observe(nav);

		// Mark a section active once it crosses just below the sticky bars.
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible.length) active = visible[0].target.id;
			},
			{ rootMargin: `-${headerHeight + 60}px 0px -55% 0px`, threshold: 0 }
		);
		for (const { id } of sections) {
			const el = document.getElementById(id);
			if (el) observer.observe(el);
		}

		return () => {
			observer.disconnect();
			ro.disconnect();
			document.documentElement.style.scrollPaddingTop = '';
		};
	});
</script>

<nav
	bind:this={nav}
	aria-label="Page sections"
	style="top: {headerHeight}px;"
	class="sticky z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70"
>
	<!--
		Scrolls horizontally on narrow screens rather than wrapping. `overscroll-x-contain`
		keeps a swipe that runs off the end of the rail from chaining into the page or the
		browser's back gesture.
	-->
	<ul
		class="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto overscroll-x-contain px-6 py-2 [scrollbar-width:none] lg:px-8 [&::-webkit-scrollbar]:hidden"
	>
		{#each sections as section}
			{@const Icon = section.icon}
			<li>
				<a
					href="#{section.id}"
					aria-current={active === section.id ? 'true' : undefined}
					class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 {active ===
					section.id
						? 'bg-lime-500/10 font-medium text-foreground'
						: 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}"
				>
					<Icon
						class="h-4 w-4 shrink-0 {active === section.id
							? 'text-lime-600 dark:text-lime-400'
							: ''}"
					/>
					{section.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
