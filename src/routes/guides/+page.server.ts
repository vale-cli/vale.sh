import { cards, mostShared, sampleSize, splits, totals } from '$lib/server/guides';
import { guides } from '$lib/server/guides';

export const load = () => {
	const names = Object.fromEntries(guides.map((g) => [g.id, g.name]));
	return {
		cards: cards(),
		totals: totals(),
		shared: mostShared(),
		splits: splits().slice(0, 6),
		names,
		sampleSize
	};
};
