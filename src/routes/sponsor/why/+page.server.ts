import { getStats } from '$lib/server/stats';
import type { PageServerLoad } from './$types';

// Downloads, the Homebrew rank, and Open Collective's yearly income come live
// from the same stats the landing page loads. Prerendered, so this runs once
// per build; the hand-counted figures are in $lib/data/sponsor-why.
export const load: PageServerLoad = async ({ fetch }) => {
	return { stats: await getStats(fetch) };
};
