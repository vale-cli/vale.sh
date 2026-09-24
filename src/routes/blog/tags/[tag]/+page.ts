import { error } from '@sveltejs/kit';

import { listPosts, listTags, TAGS } from '$lib/posts';
import type { EntryGenerator, PageLoad } from './$types';

// One page per tag that a published post carries. A tag no post uses has
// no page: prerendering enumerates the tags in use, not the vocabulary.
export const entries: EntryGenerator = () => {
	return listTags().map((tag) => ({ tag: tag.slug }));
};

export const load: PageLoad = ({ params }) => {
	const tag = TAGS[params.tag];
	if (!tag) {
		error(404, 'No such tag');
	}
	return {
		tag,
		posts: listPosts({ drafts: import.meta.env.DEV, tag: tag.slug }),
		tags: listTags({ drafts: import.meta.env.DEV })
	};
};
