import { getBackers } from '$lib/server/backers';
import { getStats } from '$lib/server/stats';
import type { PageServerLoad } from './$types';

// Recognition reads the Open Collective backer count and yearly income, so
// this page needs the same stats the landing page loads. Backers is the roster
// behind that count. Prerendered, so both run once per build.
export const load: PageServerLoad = async ({ fetch }) => {
	const [stats, backers] = await Promise.all([getStats(fetch), getBackers(fetch)]);
	return { stats, backers };
};
