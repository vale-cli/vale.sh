import { error } from '@sveltejs/kit';
import { guides, overlap, rows, sampleSize, usedBy } from '$lib/server/guides';
import type { EntryGenerator, PageServerLoad } from './$types';

// The site prerenders, so every guide page is named up front.
export const entries: EntryGenerator = () => guides.map((g) => ({ id: g.id }));

export const load: PageServerLoad = ({ params }) => {
	const guide = guides.find((g) => g.id === params.id);
	if (!guide) error(404, `No style guide called "${params.id}".`);

	return {
		guide,
		// This guide's word list, sorted for reading.
		terms: rows
			.filter((r) => r.guide === guide.id)
			.map(({ find, use, rule, level }) => ({ find, use, rule, level }))
			.sort((a, b) => a.find.localeCompare(b.find, 'en', { sensitivity: 'base' })),
		overlap: overlap(guide).slice(0, 8),
		usedBy: usedBy(guide),
		sampleSize,
		others: guides.filter((g) => g.id !== guide.id).map((g) => ({ id: g.id, name: g.name }))
	};
};
