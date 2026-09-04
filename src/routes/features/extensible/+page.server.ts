import { highlight } from '$lib/server/highlight';
import { ruleExamples } from '$lib/data/rule-examples';
import type { PageServerLoad } from './$types';

// Prerendered, so the gallery's rules are highlighted once per build.
export const load: PageServerLoad = async () => {
	const yamlHtml: Record<string, string> = {};
	for (const point of ruleExamples) {
		yamlHtml[point.id] = await highlight(point.yaml, 'yaml');
	}
	return { yamlHtml };
};
