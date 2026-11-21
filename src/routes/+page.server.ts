import { highlightAll } from '$lib/server/highlight';
import { getStats } from '$lib/server/stats';
import { adopterBand } from '$lib/server/adopter-band';
import { fields } from '$lib/data/fields';
import type { PageServerLoad } from './$types';

// The page is prerendered, so this runs once per build.
export const load: PageServerLoad = async ({ fetch }) => {
	const [stats, snippets, heroRules] = await Promise.all([
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
		}),
		// The hero's flow figure, one rule per kind of writing, each in the
		// form that ships (only word lists are trimmed). The rules live in
		// $lib/data/fields beside the guides that explain them.
		highlightAll(
			Object.fromEntries(fields.map((f) => [f.id, { code: f.demo.rule, lang: 'yaml' as const }]))
		)
	]);
	return { stats, snippets, heroRules, band: adopterBand() };
};
