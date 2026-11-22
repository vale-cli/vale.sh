import { error } from '@sveltejs/kit';
import packages from '$lib/data/packages.json';
import adopterList from '$lib/data/adopters.json';
import { slugOf } from '$lib/data/adopter-slug';
import { integrationGroups } from '$lib/data/integrations';
import { skills as allSkills } from '$lib/data/skills';
import { fields } from '$lib/data/fields';
import { listPosts } from '$lib/posts';
import { highlightAll } from '$lib/server/highlight';
import type { EntryGenerator, PageServerLoad } from './$types';

// Prerendered, so each field is named up front, and a package or post the
// field lists but the site doesn't have fails the build instead of leaving
// a hole in the page.
// The two lines that install the agent tools in Claude Code, as /agents gives them.
const PLUGIN = '/plugin marketplace add vale-cli/agent-tools\n/plugin install vale@agent-tools';

export const entries: EntryGenerator = () => fields.map((f) => ({ field: f.id }));

export const load: PageServerLoad = async ({ params }) => {
	const field = fields.find((f) => f.id === params.field);
	if (!field) error(404, `No guide for "${params.field}".`);

	// A name is looked up in the Explorer; a package published elsewhere
	// carries its own description and links its own page.
	const pkgs = field.packages.map((entry) => {
		if (typeof entry !== 'string') {
			return { ...entry, rules: 0, downloads: 0 };
		}
		const pkg = packages.find((p) => p.name === entry);
		if (!pkg) throw new Error(`fields.ts: ${field.id} lists "${entry}", which packages.json lacks`);
		return {
			name: pkg.name,
			description: pkg.description,
			href: `/explorer/${pkg.name}`,
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

	// The site's own list of integrations, so a guide and the home page
	// can't disagree about where Vale runs. A name it lacks fails the build.
	const allIntegrations = integrationGroups.flatMap((g) => g.items);
	const integrations = field.integrations.map((name) => {
		const it = allIntegrations.find((x) => x.name === name);
		if (!it)
			throw new Error(
				`fields.ts: ${field.id} lists the integration "${name}", which integrations.ts lacks`
			);
		return it;
	});

	// Agent skills, from the list /agents is built from; each links its card there.
	const skills = field.skills.map((name) => {
		const sk = allSkills.find((x) => x.name === name);
		if (!sk)
			throw new Error(`fields.ts: ${field.id} lists the skill "${name}", which skills.ts lacks`);
		return { name: sk.name, ask: sk.ask, summary: sk.summary };
	});

	const html = await highlightAll({
		config: { code: field.config.code, lang: 'ini' },
		run: { code: '$ vale sync\n$ vale .', lang: 'console' },
		plugin: { code: PLUGIN, lang: 'plaintext' }
	});

	// Everything but the icon, which is a component and can't be serialized;
	// the page looks it up again by id.
	const { icon: _icon, ...rest } = field;
	return {
		field: rest,
		packages: pkgs,
		posts,
		adopters,
		integrations,
		skills,
		plugin: PLUGIN,
		html
	};
};
