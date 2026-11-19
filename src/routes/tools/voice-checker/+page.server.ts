import { error } from '@sveltejs/kit';
import { engineStaged } from '$lib/server/engine';

// Every check on this page is Vale's, so without the engine there is no page.
export const prerender = engineStaged;

export const load = () => {
	if (!engineStaged) error(404, 'Not found');
};
