/**
 * Shapes for the live project stats shown on /powered-by.
 *
 * Kept out of $lib/server so components can import the types without pulling in
 * server-only code.
 */

/** A distribution channel that publishes download numbers. */
export type Channel = {
	name: string;
	value: number;
	/**
	 * The window the number covers. Registries disagree here — GitHub and
	 * Docker report lifetime totals, Homebrew only a trailing 12 months, PyPI
	 * only 180 days — so each card states its own window rather than being
	 * rolled into one misleading total.
	 */
	window: string;
	source: string;
	/** Simple Icons slug, see $lib/data/brand-icons. */
	icon?: string;
	/** Extra caveat, e.g. a package the project doesn't maintain. */
	note?: string;
	/** False when the lookup failed and `value` is the checked-in fallback. */
	live: boolean;
};

/**
 * A channel Vale ships through that publishes no download numbers, so it's
 * listed by a short detail — a version, or a count of downstream repos.
 */
export type Availability = {
	name: string;
	detail: string;
	source: string;
	icon?: string;
	live: boolean;
};

/**
 * Open Collective funding. GitHub Sponsors has no public count — that needs the
 * authenticated GraphQL API — so it's linked without numbers.
 */
export type Funding = {
	backers: number;
	/** Yearly income in whole dollars. */
	yearlyIncome: number;
	live: boolean;
};

export type Stats = {
	channels: Channel[];
	/**
	 * Downloads summed across the channels reporting a lifetime figure.
	 *
	 * Only those: the windowed channels count a trailing month or year, so
	 * adding them in would total numbers that measure different spans. The
	 * real figure is therefore higher than this one, not lower.
	 */
	lifetime: { value: number; sources: string[]; live: boolean };
	availability: Availability[];
	funding: Funding;
	contributors: number;
	/** Stargazers on the main repo. */
	stars: number;
	/** ISO date the numbers were gathered, shown as "updated <date>". */
	updated: string;
};
