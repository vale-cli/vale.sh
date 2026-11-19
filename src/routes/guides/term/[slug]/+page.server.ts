import { error } from '@sveltejs/kit';
import { guides, termPages } from '$lib/server/guides';
import type { EntryGenerator, PageServerLoad } from './$types';

// The site prerenders, so every term page is named up front.
export const entries: EntryGenerator = () => termPages().map((t) => ({ slug: t.slug }));

export const load: PageServerLoad = ({ params }) => {
	const all = termPages();
	const at = all.findIndex((t) => t.slug === params.slug);
	if (at < 0) error(404, `No term page for "${params.slug}".`);
	const term = all[at];

	const ruled = new Set(term.rulings.map((r) => r.guide));
	const top = term.answers[0]?.use.toLowerCase();
	const brief = (t: (typeof all)[number]) => ({ slug: t.slug, term: t.variants[0] });

	return {
		term,
		total: guides.length,
		silent: guides.filter((g) => !ruled.has(g.id)).map((g) => ({ id: g.id, name: g.name })),
		// Other terms the guides replace with the same word.
		related: top
			? all
					.filter((t) => t.slug !== term.slug && t.answers[0]?.use.toLowerCase() === top)
					.slice(0, 12)
					.map(brief)
			: [],
		previous: at > 0 ? brief(all[at - 1]) : null,
		next: at < all.length - 1 ? brief(all[at + 1]) : null
	};
};
