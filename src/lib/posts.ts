// Posts are markdown files in src/posts, compiled by mdsvex like any other
// page. The filename is the slug: src/posts/voices.md is /blog/voices.
//
// A post with `draft: true` is unlisted: skipped by the index and the RSS
// feed, but still built at its real URL as a noindex page so it can be
// reviewed in place before it ships.
import type { Component } from 'svelte';

import report from '$lib/data/lint.json';

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
	// An AUTHORS key. Posts without one belong to the site's author.
	author?: string;
	// TAGS keys. A tag the vocabulary doesn't know fails the build.
	tags?: string[];
};

export type Author = { name: string; avatar: string; url: string };

export const AUTHORS: Record<string, Author> = {
	jdkato: {
		name: 'Joseph Kato',
		avatar: '/blog/authors/jdkato.png',
		url: 'https://github.com/jdkato'
	}
};

export function authorOf(post: PostMeta): Author {
	return AUTHORS[post.author ?? 'jdkato'];
}

export type Tag = { slug: string; label: string; description: string };

// The vocabulary is fixed so the tag pages stay few and each one means
// something. Add a tag here before using it in a post.
export const TAGS: Record<string, Tag> = {
	packages: {
		slug: 'packages',
		label: 'Packages',
		description: 'A new Vale package and what it checks.'
	},
	agents: {
		slug: 'agents',
		label: 'Agents',
		description: 'Vale beside AI writing tools.'
	},
	tutorials: {
		slug: 'tutorials',
		label: 'Tutorials',
		description: 'A setup, walked through end to end.'
	},
	formats: {
		slug: 'formats',
		label: 'Formats',
		description: 'Linting a file that is not Markdown.'
	}
};

export function tagsOf(post: PostMeta): Tag[] {
	return (post.tags ?? []).map((slug) => TAGS[slug]);
}

export type Post = PostMeta & { slug: string };

type PostModule = { default: Component; metadata: PostMeta };

const modules = import.meta.glob<PostModule>('/src/posts/*.md', { eager: true });

// Every published post ships with Vale's report on it, from
// src/lib/data/lint.json. A post the report doesn't know is a post that was
// never run through script/lint-posts.mjs, and the build says so rather than
// render it without its footer.
function requireReport(slug: string) {
	if (!(slug in report.posts)) {
		throw new Error(
			`src/posts/${slug}.md has no entry in src/lib/data/lint.json; run node script/lint-posts.mjs`
		);
	}
}

function requireTags(slug: string, meta: PostMeta) {
	for (const tag of meta.tags ?? []) {
		if (!(tag in TAGS)) {
			throw new Error(
				`src/posts/${slug}.md uses the tag "${tag}", which TAGS in src/lib/posts.ts does not define`
			);
		}
	}
}

export function listPosts(opts: { drafts?: boolean; tag?: string } = {}): Post[] {
	const posts: Post[] = [];
	for (const [path, mod] of Object.entries(modules)) {
		const slug = path.split('/').pop()!.replace(/\.md$/, '');
		const meta = mod.metadata;
		if (meta.draft && !opts.drafts) {
			continue;
		}
		if (!meta.draft) {
			requireReport(slug);
		}
		requireTags(slug, meta);
		if (opts.tag && !(meta.tags ?? []).includes(opts.tag)) {
			continue;
		}
		posts.push({ slug, ...meta });
	}
	return posts.sort((a, b) => b.date.localeCompare(a.date));
}

// Every tag at least one listed post carries, with its count, in the
// vocabulary's order.
export function listTags(opts: { drafts?: boolean } = {}): (Tag & { count: number })[] {
	const counts = new Map<string, number>();
	for (const post of listPosts(opts)) {
		for (const tag of post.tags ?? []) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
	}
	return Object.values(TAGS)
		.filter((tag) => counts.has(tag.slug))
		.map((tag) => ({ ...tag, count: counts.get(tag.slug)! }));
}

export function getPost(slug: string): { meta: Post; component: Component } | undefined {
	const mod = modules[`/src/posts/${slug}.md`];
	if (!mod) {
		return undefined;
	}
	if (!mod.metadata.draft) {
		requireReport(slug);
	}
	requireTags(slug, mod.metadata);
	return { meta: { slug, ...mod.metadata }, component: mod.default };
}
