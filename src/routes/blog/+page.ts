import { listPosts } from '$lib/posts';
import type { PageLoad } from './$types';

// Drafts appear in the local index (badged) so a post can be reviewed in
// place; a production build never sees them.
export const load: PageLoad = () => {
	return { posts: listPosts({ drafts: import.meta.env.DEV }) };
};
