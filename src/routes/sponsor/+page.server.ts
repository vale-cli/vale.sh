import { getStats } from '$lib/server/stats';
import type { PageServerLoad } from './$types';

// Recognition reads the Open Collective backer count and yearly income, so
// this page needs the same stats the landing page loads. Prerendered, so it
// runs once per build.
export const load: PageServerLoad = async ({ fetch }) => {
	return { stats: await getStats(fetch) };
};
