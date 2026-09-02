import { authorOf, listPosts } from '$lib/posts';
import type { RequestHandler } from './$types';

export const prerender = true;

const escape = (s: string) =>
	s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

// Titles and links only; the post is the canonical copy and readers land on
// it. Feeds that inline full content go stale the first time a post is
// edited in place.
export const GET: RequestHandler = () => {
	const items = listPosts()
		.map((post) => {
			const url = `https://vale.sh/blog/${post.slug}`;
			return `		<item>
			<title>${escape(post.title)}</title>
			<link>${url}</link>
			<guid isPermaLink="true">${url}</guid>
			<description>${escape(post.description)}</description>
			<dc:creator>${escape(authorOf(post).name)}</dc:creator>
			<pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
		</item>`;
		})
		.join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
	<channel>
		<title>The Vale blog</title>
		<link>https://vale.sh/blog</link>
		<description>Notes from building Vale.</description>
		<language>en-us</language>
		<atom:link href="https://vale.sh/blog/rss.xml" rel="self" type="application/rss+xml"/>
${items}
	</channel>
</rss>
`;

	return new Response(body, {
		headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' }
	});
};
