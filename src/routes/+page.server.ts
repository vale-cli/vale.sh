import { getStats } from '$lib/server/stats';
import { highlight } from '$lib/server/highlight';
import { extensionPoints } from '$lib/data/extension-points';
import type { PageServerLoad } from './$types';

// The page is prerendered, so this runs once per build.
export const load: PageServerLoad = async ({ fetch }) => {
	const yamlHtml: Record<string, string> = {};
	for (const point of extensionPoints) {
		yamlHtml[point.id] = await highlight(point.yaml, 'yaml');
	}
	return { stats: await getStats(fetch), yamlHtml };
};
