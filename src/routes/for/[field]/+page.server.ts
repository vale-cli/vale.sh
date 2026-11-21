import { error } from '@sveltejs/kit';
import packages from '$lib/data/packages.json';
import adopterList from '$lib/data/adopters.json';
import { slugOf } from '$lib/data/adopter-slug';
import { fields } from '$lib/data/fields';
import { listPosts } from '$lib/posts';
import { highlightAll } from '$lib/server/highlight';
import type { EntryGenerator, PageServerLoad } from './$types';

// Prerendered, so each field is named up front, and a package or post the
// field lists but the site doesn't have fails the build instead of leaving
// a hole in the page.
export const entries: EntryGenerator = () => fields.map((f) => ({ field: f.id }));

export const load: PageServerLoad = async ({ params }) => {
	const field = fields.find((f) => f.id === params.field);
	if (!field) error(404, `No guide for "${params.field}".`);

	const pkgs = field.packages.map((name) => {
		const pkg = packages.find((p) => p.name === name);
		if (!pkg) throw new Error(`fields.ts: ${field.id} lists "${name}", which packages.json lacks`);
		return {
			name: pkg.name,
			description: pkg.description,
			rules: pkg.rules?.length ?? 0,
			downloads: pkg.downloads ?? 0
		};
	});

	// A draft the field names is left off until it's published, so a guide
	// can list a post ahead of its date. A slug that matches no post at all
	// is a typo, and fails the build.
	const all = listPosts({ drafts: true });
	const posts = field.posts.flatMap((slug) => {
		const post = all.find((p) => p.slug === slug);
		if (!post)
			throw new Error(`fields.ts: ${field.id} lists the post "${slug}", which doesn't exist`);
		if (post.draft) return [];
		return [
			{
				slug,
				title: post.title,
				description: post.description,
				date: post.date,
				study: (post.tags ?? []).includes('case-studies')
			}
		];
	});

	// Teams who write this kind of text, from the adopter directory, each
	// linking its profile. A name the directory doesn't have fails the build.
	const adopters = field.adopters.map((name) => {
		const a = adopterList.find((x) => x.name === name);
		if (!a)
			throw new Error(
				`fields.ts: ${field.id} lists the adopter "${name}", which adopters.json lacks`
			);
		return {
			name: a.name,
			context: a.context,
			slug: slugOf(a.name),
			avatar: 'avatar' in a ? a.avatar : undefined,
			icon: 'icon' in a ? a.icon : undefined
		};
	});

	const html = await highlightAll({
		rule: { code: field.demo.rule, lang: 'yaml' },
		config: { code: field.config.code, lang: 'ini' },
		run: { code: '$ vale sync\n$ vale .', lang: 'console' }
	});

	// Everything but the icon, which is a component and can't be serialized;
	// the page looks it up again by id.
	const { icon: _icon, ...rest } = field;
	return { field: rest, packages: pkgs, posts, adopters, html };
};
