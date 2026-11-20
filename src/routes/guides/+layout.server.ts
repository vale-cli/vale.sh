import { guides } from '$lib/server/guides';

// Every page under /guides carries the explorer's own navigation.
export const load = () => ({
	explorer: guides.map((g) => ({ id: g.id, name: g.name }))
});
