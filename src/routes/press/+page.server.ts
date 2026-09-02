import { getStats } from '$lib/server/stats';
import type { PageServerLoad } from './$types';

// The facts block reads the same numbers as the home page. Prerendered, so
// this runs once per build.
export const load: PageServerLoad = async ({ fetch }) => {
	return { stats: await getStats(fetch) };
};
