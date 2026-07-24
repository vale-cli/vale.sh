import { getStats } from '$lib/server/stats';
import type { PageServerLoad } from './$types';

// The page is prerendered, so this runs once per build.
export const load: PageServerLoad = async ({ fetch }) => {
	return { stats: await getStats(fetch) };
};
