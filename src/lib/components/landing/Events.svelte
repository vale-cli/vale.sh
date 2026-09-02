<script lang="ts">
	import { upcomingEvents } from '$lib/events';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import Calendar from 'lucide-svelte/icons/calendar';

	// Evaluated at prerender and again on hydration, so an event that has passed
	// since the last deploy drops out for the visitor.
	const events = upcomingEvents();

	const day = (iso: string) =>
		new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			year: 'numeric',
			timeZone: 'UTC'
		});
</script>

{#if events.length}
	<section id="events" class="border-b border-border/60 py-14 sm:py-16">
		<div class="mx-auto max-w-6xl px-6 lg:px-8">
			<div class="mx-auto max-w-2xl text-center">
				<h2 class="text-base/7 font-semibold text-lime-600 dark:text-lime-400">Events</h2>
				<p class="mt-2 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">Coming up</p>
			</div>

			<ul class="mx-auto mt-8 grid max-w-3xl gap-4 {events.length > 1 ? 'sm:grid-cols-2' : ''}">
				{#each events as event}
					<li>
						<a
							href={event.url}
							target="_blank"
							rel="noreferrer"
							class="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-colors duration-200 hover:border-lime-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
						>
							<div class="flex items-start justify-between gap-3">
								<span
									class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lime-500/10 text-lime-600 dark:text-lime-400"
								>
									<Calendar class="h-5 w-5" />
								</span>
								<ArrowUpRight
									class="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-lime-600 dark:group-hover:text-lime-400"
								/>
							</div>
							<p class="mt-5 text-sm font-medium text-muted-foreground">{event.host}</p>
							<h3 class="mt-1 text-lg font-semibold tracking-tight">{event.title}</h3>
							<p class="mt-3 text-sm text-muted-foreground">
								<time datetime={event.date}>{day(event.date)}</time>
								{#if event.time}<br />{event.time}{/if}
								<span aria-hidden="true"> · </span>{event.location}
							</p>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}
