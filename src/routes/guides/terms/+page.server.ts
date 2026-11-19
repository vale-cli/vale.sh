import { guides, termPages } from '$lib/server/guides';

export const load = () => ({
	total: guides.length,
	terms: termPages().map((t) => ({
		slug: t.slug,
		term: t.variants[0],
		guides: new Set(t.rulings.map((r) => r.guide)).size,
		verdict: t.verdict,
		use: t.verdict === 'agree' ? t.answers[0].use : ''
	}))
});
