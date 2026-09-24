import { authorOf, listPosts, tagsOf } from '$lib/posts';
import type { RequestHandler } from './$types';

export const prerender = true;

const escape = (s: string) =>
	s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const IMAGE_TYPES: Record<string, string> = {
	png: 'image/png',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	webp: 'image/webp',
	gif: 'image/gif'
};

// Titles, links and the banner; the post is the canonical copy and readers
// land on it. Feeds that inline full content go stale the first time a post
// is edited in place. The banner is the same card the post page advertises
// to crawlers, so a reader that shows it matches a link unfurl.
export const GET: RequestHandler = () => {
	const items = listPosts()
		.map((post) => {
			const url = `https://vale.sh/blog/${post.slug}`;
			const image = post.image ?? `/blog/og/${post.slug}.png`;
			const imageType = IMAGE_TYPES[image.split('.').pop()?.toLowerCase() ?? ''] ?? 'image/png';
			const media = `<media:content url="https://vale.sh${escape(image)}" type="${imageType}" medium="image">`;
			const categories = tagsOf(post)
				.map(
					(tag) => `
			<category domain="https://vale.sh/blog/tags/${tag.slug}">${escape(tag.label)}</category>`
				)
				.join('');
			const alt = post.imageAlt
				? `
				<media:description type="plain">${escape(post.imageAlt)}</media:description>
			`
				: '';
			return `		<item>
			<title>${escape(post.title)}</title>
			<link>${url}</link>
			<guid isPermaLink="true">${url}</guid>
			<description>${escape(post.description)}</description>
			<dc:creator>${escape(authorOf(post).name)}</dc:creator>
			<pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>${categories}
			${media}${alt}</media:content>
		</item>`;
		})
		.join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
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
