<script lang="ts">
	import { upcomingEvents } from '$lib/events';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import Calendar from 'lucide-svelte/icons/calendar';

	/*
		The next event, site-wide, under the nav. Nothing renders when there is
		nothing coming up -- the same rule the Events section follows, so the two
		never disagree about whether an event has passed.

		upcomingEvents() runs at prerender and again on hydration, so an event that
		ended since the last deploy drops out for the visitor rather than sitting
		there until someone rebuilds.
	*/
	const next = $derived(upcomingEvents()[0]);

	const day = (iso: string) =>
		new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			timeZone: 'UTC'
		});
</script>

{#if next}
	<a
		href={next.url}
		target="_blank"
		rel="noreferrer"
		class="group block border-b border-border/60 bg-lime-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
	>
		<div
			class="mx-auto flex max-w-7xl items-center justify-center gap-x-2 gap-y-1 px-6 py-2 text-sm lg:px-8"
		>
			<Calendar class="h-4 w-4 shrink-0 text-lime-600 dark:text-lime-400" aria-hidden="true" />
			<span class="font-semibold text-lime-600 dark:text-lime-400">Coming up</span>
			<span class="text-muted-foreground" aria-hidden="true">·</span>
			<span class="truncate font-medium">{next.title}</span>
			<span class="hidden truncate text-muted-foreground sm:inline">
				{next.host} · {day(next.date)}
			</span>
			<ArrowRight
				class="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-lime-600 dark:group-hover:text-lime-400"
				aria-hidden="true"
			/>
		</div>
	</a>
{/if}
