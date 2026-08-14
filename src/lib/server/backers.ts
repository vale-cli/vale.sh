/**
 * The two funding sources, merged into one wall.
 *
 * Open Collective is the richer side -- lifetime totals, past backers included
 * -- so it leads within each group and GitHub sponsors follow alphabetically.
 * Sorting them together would need a shared measure, and there isn't one; see
 * the note in github-sponsors.ts.
 */

import { getCollectiveBackers } from './collective';
import { getGitHubSponsors } from './github-sponsors';
import type { Backer, Backers } from '$lib/types/backers';

/** Names differ in case and spacing across platforms; slugs don't match at all. */
const key = (b: Backer) => b.name.trim().toLowerCase().replace(/\s+/g, ' ');

/**
 * One list, sorted by lifetime total.
 *
 * The two sides used to be appended rather than interleaved, because GitHub
 * gave only a monthly rate and a rate can't be ranked against a total. Now that
 * github-sponsors.ts reconstructs a total from the activity log, both sides
 * measure the same thing and the wall is a single ordering.
 *
 * A backer on both platforms appears once, as their Open Collective entry:
 * that side reports its total rather than inferring it.
 */
function merge(collective: Backer[], github: Backer[]): Backer[] {
	const seen = new Set(collective.map(key));
	const fresh = github.filter((b) => !seen.has(key(b)));
	return [...collective, ...fresh].sort(
		(a, b) => (b.total ?? 0) - (a.total ?? 0) || a.name.localeCompare(b.name)
	);
}

export async function getBackers(fetch: typeof globalThis.fetch): Promise<Backers> {
	const [oc, gh] = await Promise.all([getCollectiveBackers(fetch), getGitHubSponsors(fetch)]);
	const all = merge(oc.backers, gh);
	return {
		organizations: all.filter((b) => b.organization),
		individuals: all.filter((b) => !b.organization),
		sources: { opencollective: oc.live, github: gh.length > 0 }
	};
}

export type { Backer, Backers };
