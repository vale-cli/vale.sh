/** Shared by the two funding sources so the wall can hold both. */
export type Backer = {
	/** Open Collective slug or GitHub login. Unique within a source, not across. */
	slug: string;
	name: string;
	/** Their own logo or photo, where the source has a real one. */
	image?: string;
	/** Their own site, where they gave one. */
	website?: string;
	/** Their profile on whichever platform they gave through. */
	profile: string;
	/**
	 * Lifetime total in whole US dollars.
	 *
	 * Reported directly by Open Collective. Reconstructed for GitHub, which
	 * publishes no such figure -- see `estimated`.
	 */
	total?: number;
	/** Recurring rate in whole US dollars. GitHub only; absent for a one-off. */
	monthly?: number;
	/**
	 * True when `total` is rate x billing cycles rather than a reported sum.
	 *
	 * Only GitHub recurring sponsorships. A cancellation lands mid-cycle, so the
	 * figure is within one payment of the truth; the wall prefixes it with `~`
	 * rather than passing it off as exact.
	 */
	estimated?: boolean;
	/** Still sponsoring. Past sponsors keep their total and lose the present tense. */
	active?: boolean;
	organization: boolean;
	source: 'opencollective' | 'github';
};

export type Backers = {
	organizations: Backer[];
	individuals: Backer[];
	/** Which sources actually answered, for the note under the wall. */
	sources: { opencollective: boolean; github: boolean };
};
