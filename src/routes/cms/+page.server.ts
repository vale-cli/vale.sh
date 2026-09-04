import { highlight } from '$lib/server/highlight';
import { groups } from '$lib/data/toolbelt';
import type { PageServerLoad } from './$types';

// Prerendered, so the toolbelt's calls and results are highlighted once per
// build: a call is written as YAML, a result comes back as JSON.
export const load: PageServerLoad = async () => {
	const exampleHtml: Record<string, { call: string; result: string }> = {};
	for (const group of groups) {
		for (const tool of group.tools) {
			exampleHtml[tool.name] = {
				call: await highlight(tool.example.call, 'yaml'),
				result: await highlight(tool.example.result, 'json')
			};
		}
	}
	return { exampleHtml };
};
