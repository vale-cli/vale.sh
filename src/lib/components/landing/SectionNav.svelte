<script lang="ts">
	import { onMount } from 'svelte';
	import Download from 'lucide-svelte/icons/download';
	import Sparkles from 'lucide-svelte/icons/sparkles';
	import Blocks from 'lucide-svelte/icons/blocks';
	import Building2 from 'lucide-svelte/icons/building-2';
	import Newspaper from 'lucide-svelte/icons/newspaper';
	import Heart from 'lucide-svelte/icons/heart';
	import Server from 'lucide-svelte/icons/server';
	import Calendar from 'lucide-svelte/icons/calendar';

	// `events` is dropped when there's nothing upcoming — the section renders
	// nothing in that case, so a chip would point at a missing anchor.
	let { hasEvents = false }: { hasEvents?: boolean } = $props();

	const sections = $derived(
		[
			{ id: 'stats', label: 'Downloads', icon: Download },
			{ id: 'features', label: 'Features', icon: Sparkles },
			{ id: 'integrations', label: 'Integrations', icon: Blocks },
			{ id: 'adopters', label: 'Adopters', icon: Building2 },
			{ id: 'events', label: 'Events', icon: Calendar },
			{ id: 'press', label: 'Press', icon: Newspaper },
			{ id: 'support', label: 'Supporters', icon: Heart },
			{ id: 'thanks', label: 'Infrastructure', icon: Server }
		].filter((s) => s.id !== 'events' || hasEvents)
	);

	let active = $state('');
	let links: Record<string, HTMLAnchorElement> = $state({});
	let nav: HTMLElement | undefined = $state();
	let list: HTMLUListElement | undefined = $state();
	/** Height of the site header, which varies with the banner. */
	let headerHeight = $state(56);

	// On narrow screens the bar scrolls, so keep the active chip in view.
	//
	// This sets scrollLeft on the list directly rather than calling
	// scrollIntoView, which walks every scrollable ancestor — including the
	// document — and visibly jerks the page each time a new section activates.
	$effect(() => {
		const el = active && links[active];
		if (!el || !list || list.scrollWidth <= list.clientWidth) return;
		const centered = el.offsetLeft - list.clientWidth / 2 + el.offsetWidth / 2;
		const left = Math.max(0, Math.min(centered, list.scrollWidth - list.clientWidth));
		list.scrollTo({ left, behavior: 'smooth' });
	});

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
	<!-- Scrolls horizontally on narrow screens rather than wrapping. -->
	<ul
		bind:this={list}
		class="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2 [scrollbar-width:none] lg:px-8 [&::-webkit-scrollbar]:hidden"
	>
		{#each sections as section}
			{@const Icon = section.icon}
			<li>
				<a
					bind:this={links[section.id]}
					href="#{section.id}"
					aria-current={active === section.id ? 'true' : undefined}
					class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 {active ===
					section.id
						? 'bg-lime-500/10 font-medium text-foreground'
						: 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}"
				>
					<Icon class="h-4 w-4 shrink-0 {active === section.id ? 'text-lime-500' : ''}" />
					{section.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
