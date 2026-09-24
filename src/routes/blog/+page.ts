import { listPosts, listTags } from '$lib/posts';
import type { PageLoad } from './$types';

// Drafts appear in the local index (badged) so a post can be reviewed in
// place; a production build never sees them.
export const load: PageLoad = () => {
	const drafts = import.meta.env.DEV;
	return { posts: listPosts({ drafts }), tags: listTags({ drafts }) };
};
