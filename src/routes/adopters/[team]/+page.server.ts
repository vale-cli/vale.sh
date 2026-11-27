import { error } from '@sveltejs/kit';
import adopters from '$lib/data/adopters.json';
import stats from '$lib/data/adopter-stats.json';
import { slugOf } from '$lib/data/adopter-slug';
import { facetLabel, linksOf, usageGroups, usageOf } from '$lib/data/usage';
import { listPosts } from '$lib/posts';
import media from '$lib/data/media.json';
import type { EntryGenerator, PageServerLoad } from './$types';

/*
	One page per team: what the directory's card says, plus everything
	script/adopters-stats.mjs read from the team's repository. Built here, on
	the server, so a profile ships its own record and not the whole list.
*/

type Adopter = {
	name: string;
	category: string;
	context: string;
	url: string;
	icon?: string;
	avatar?: string;
};

type Record_ = {
	proof?: string;
	styles?: string[] | null;
	formats?: string[] | null;
	vocab?: boolean | null;
	level?: string | null;
	repo?: string | null;
	ci?: boolean | null;
	house?: boolean | null;
	stars?: number | null;
	pushed?: string | null;
	touched?: string | null;
	since?: string | null;
	runs30?: number | null;
};

const all = adopters as Adopter[];
const records = stats.perAdopter as unknown as Record<string, Record_>;

// The site prerenders, so every team needs naming up front.
export const entries: EntryGenerator = () => all.map((a) => ({ team: slugOf(a.name) }));

/** What the entry's link is, in the words the page uses for it. */
const PROOF: Record<string, string> = {
	config: 'Open the config',
	package: 'Open the style package',
	repo: 'Open the repository',
	writeup: 'Read the write-up'
};

export const load: PageServerLoad = ({ params }) => {
	const team = all.find((a) => slugOf(a.name) === params.team);
	if (!team) error(404, `No adopter at "${params.team}".`);

	const record = records[team.name] ?? null;
	const mine = usageOf(team.name);

	// The facets the team matches, grouped as the directory groups them.
	const groups = usageGroups
		.map((g) => ({
			name: g.name,
			facets: g.facets.filter((f) => mine.has(f.id)).map((f) => ({ id: f.id, label: f.label }))
		}))
		.filter((g) => g.facets.length > 0);

	// Teams in the same sector that share the most with this one.
	const similar = all
		.filter((a) => a.name !== team.name && a.category === team.category)
		.map((a) => {
			const shared = [...usageOf(a.name)].filter((id) => mine.has(id));
			return { a, shared };
		})
		.filter((s) => s.shared.length > 0)
		.sort((x, y) => y.shared.length - x.shared.length || x.a.name.localeCompare(y.a.name))
		.slice(0, 6)
		.map(({ a, shared }) => ({
			name: a.name,
			slug: slugOf(a.name),
			icon: a.icon ?? null,
			avatar: a.avatar ?? null,
			shared: shared.slice(0, 3).map((id) => facetLabel.get(id) ?? id)
		}));

	const study = listPosts({ tag: 'case-studies' }).find((p) => p.brand === team.name);

	// What the team has written or recorded about Vale, from the library.
	const writing = (
		media as { adopter?: string; title: string; url: string; type: string; year: number }[]
	)
		.filter((m) => m.adopter === team.name)
		.sort((x, y) => y.year - x.year)
		.map(({ title, url, type, year }) => ({ title, url, type, year }));

	return {
		team: {
			name: team.name,
			category: team.category,
			context: team.context,
			url: team.url,
			icon: team.icon ?? null,
			avatar: team.avatar ?? null
		},
		proofLabel: PROOF[record?.proof ?? ''] ?? 'Open the proof',
		record: record && {
			repo: record.repo ?? null,
			styles: record.styles ?? null,
			formats: record.formats ?? null,
			vocab: record.vocab ?? null,
			level: record.level ?? null,
			house: record.house ?? null,
			stars: record.stars ?? null,
			pushed: record.pushed ?? null,
			touched: record.touched ?? null,
			since: record.since ?? null,
			runs30: record.runs30 ?? null
		},
		groups,
		files: linksOf(team.name),
		similar,
		study: study ? { slug: study.slug, title: study.title } : null,
		writing,
		generated: stats.generated,
		slug: params.team
	};
};
