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
	/** What `value` counts when it isn't downloads, e.g. `repositories`. */
	unit?: string;
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

/**
 * Where Vale stands on the registries that publish comparable numbers.
 * `leads` is whether it has more installs than every prose, grammar, and
 * spelling checker on that registry; a page makes the "most installed" claim
 * only while it holds on both.
 */
export type Ranking = {
	/** Rank among homebrew-core formulae by installs on request, past year. */
	brew: { rank: number; of: number; leads: boolean; live: boolean };
	chocolatey: { leads: boolean; live: boolean };
	mise: { leads: boolean; live: boolean };
};

/** One published release and the downloads across its assets. */
export type Release = { tag: string; date: string; downloads: number };

export type Stats = {
	channels: Channel[];
	/**
	 * Vale's one download total: GitHub Releases, Docker Hub, and conda-forge,
	 * the channels that ship their own build. Every other channel either
	 * installs the GitHub release (so its installs are already counted) or
	 * reports a trailing window that can't be added to an all-time count. The
	 * real figure is therefore higher than this one, not lower.
	 */
	lifetime: { value: number; sources: string[]; live: boolean };
	/** Every release, oldest first; empty when the walk fell back. */
	releases: Release[];
	availability: Availability[];
	funding: Funding;
	contributors: number;
	/** Stargazers on the main repo. */
	stars: number;
	ranking: Ranking;
	/** ISO date the numbers were gathered, shown as "updated <date>". */
	updated: string;
};
