import { highlight } from '$lib/server/highlight';
import { languages } from '$lib/data/code-queries';
import type { PageServerLoad } from './$types';

// Prerendered, so each language's tree-sitter query is highlighted once per
// build. A query is an S-expression, which the Scheme grammar reads well.
export const load: PageServerLoad = async () => {
	const queryHtml: Record<string, string> = {};
	for (const lang of languages) {
		queryHtml[lang.id] = await highlight(lang.query, 'scheme');
	}
	return { queryHtml };
};
