// Posts are markdown files in src/posts, compiled by mdsvex like any other
// page. The filename is the slug: src/posts/voices.md is /blog/voices.
//
// A post with `draft: true` is unlisted: skipped by the index and the RSS
// feed, but still built at its real URL as a noindex page so it can be
// reviewed in place before it ships.
import type { Component } from 'svelte';

export type PostMeta = {
	title: string;
	description: string;
	// ISO date, quoted in the frontmatter so YAML leaves it a string.
	date: string;
	draft?: boolean;
	// Social-card image as a path under static/ (e.g. /blog/voices/card.png),
	// ideally 1200x630. Posts without one fall back to the site card.
	image?: string;
	imageAlt?: string;
	// The post's headline numbers; the banner draws them as a token meter.
	poster?: number[];
	// A named banner illustration (see PostBanner) for posts whose subject
	// has a better picture than a meter.
	motif?: string;
};

export type Post = PostMeta & { slug: string };

type PostModule = { default: Component; metadata: PostMeta };

const modules = import.meta.glob<PostModule>('/src/posts/*.md', { eager: true });

export function listPosts(opts: { drafts?: boolean } = {}): Post[] {
	const posts: Post[] = [];
	for (const [path, mod] of Object.entries(modules)) {
		const slug = path.split('/').pop()!.replace(/\.md$/, '');
		const meta = mod.metadata;
		if (meta.draft && !opts.drafts) {
			continue;
		}
		posts.push({ slug, ...meta });
	}
	return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): { meta: Post; component: Component } | undefined {
	const mod = modules[`/src/posts/${slug}.md`];
	if (!mod) {
		return undefined;
	}
	return { meta: { slug, ...mod.metadata }, component: mod.default };
}
