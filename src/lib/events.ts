import events from '$lib/data/events.json';

export type ValeEvent = {
	title: string;
	host: string;
	/** ISO date, YYYY-MM-DD. */
	date: string;
	/** ISO date for multi-day events; defaults to `date`. */
	endDate?: string;
	/** Free text, e.g. "01:00–03:00 UTC". */
	time?: string;
	location: string;
	url: string;
};

/**
 * Events that haven't finished yet, soonest first.
 *
 * The page is prerendered, so on the server this filters against build time —
 * but the component runs again on hydration, so a visitor never sees an event
 * that has passed since the last deploy.
 */
export function upcomingEvents(now = new Date()): ValeEvent[] {
	const today = now.toISOString().slice(0, 10);
	return (events as ValeEvent[])
		.filter((e) => (e.endDate ?? e.date) >= today)
		.sort((a, b) => a.date.localeCompare(b.date));
}
