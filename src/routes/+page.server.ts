import { highlightAll } from '$lib/server/highlight';
import { getStats } from '$lib/server/stats';
import { adopterBand } from '$lib/server/adopter-band';
import type { PageServerLoad } from './$types';

// The page is prerendered, so this runs once per build.
export const load: PageServerLoad = async ({ fetch }) => {
	const [stats, snippets] = await Promise.all([
		getStats(fetch),
		highlightAll({
			config: {
				code: `StylesPath = styles
MinAlertLevel = suggestion
Packages = Microsoft

[*.md]
BasedOnStyles = Vale, Microsoft`,
				lang: 'ini'
			},
			rule: {
				code: `extends: substitution
message: "Use '%s' instead of '%s'."
level: warning
swap:
  utilize: use`,
				lang: 'yaml'
			},
			commands: { code: '$ vale sync\n$ vale docs/', lang: 'console' }
		})
	]);
	return { stats, snippets, band: adopterBand() };
};
