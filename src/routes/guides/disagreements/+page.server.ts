import { guides, splits, termPages } from '$lib/server/guides';
import { termSlug } from '$lib/tools/topics';

export const load = () => {
	const pages = termPages();
	const has = new Set(pages.map((t) => t.slug));
	const link = (term: string) => (has.has(termSlug(term)) ? termSlug(term) : '');

	return {
		total: guides.length,
		names: Object.fromEntries(guides.map((g) => [g.id, g.name])),
		// One guide's fix is another's error.
		opposed: splits().map((s) => ({
			...s,
			pairs: s.pairs.map((p) => ({ ...p, slug: link(p.a) || link(p.b) }))
		})),
		// The guides flag the same term and replace it with different words.
		differ: pages
			.filter((t) => t.verdict === 'split')
			.map((t) => ({ slug: t.slug, term: t.variants[0], answers: t.answers }))
			.sort((a, b) => b.answers.length - a.answers.length || a.term.localeCompare(b.term))
	};
};
