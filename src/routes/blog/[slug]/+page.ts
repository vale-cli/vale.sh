import { error } from '@sveltejs/kit';

import { getPost, listPosts } from '$lib/posts';
import type { EntryGenerator, PageLoad } from './$types';

// The index only links published posts, but the crawler is not the contract:
// enumerate every post explicitly so each one prerenders even if nothing on
// the site happens to link it. Drafts are included -- they render as
// unlisted, noindex pages, so a post can be reviewed at its real URL --
// and the route always has at least one entry to prerender.
export const entries: EntryGenerator = () => {
	return listPosts({ drafts: true }).map((post) => ({ slug: post.slug }));
};

export const load: PageLoad = ({ params }) => {
	const post = getPost(params.slug);
	if (!post) {
		error(404, 'No such post');
	}
	return { meta: post.meta, component: post.component };
};
