import stats from '$lib/data/adopter-stats.json';

/**
 * The "how it's used" facets on the directory, each a test over the record
 * script/adopters-stats.mjs writes per adopter. A team matches a facet when
 * the data says so, never by hand; an entry with no readable config or repo
 * simply matches fewer.
 *
 * The first group is the one a newcomer wants: the surfaces they can copy
 * from, each backed by a file the card links to.
 */
export type Integrations = {
	actions: string[];
	valeAction: boolean;
	reviewdog: boolean;
	gitlab: string | null;
	circle: string | null;
	buildkite: string | null;
	precommit: string | null;
	agents: string[];
	tasks: string[];
	vscode: string | null;
	contributing: string[];
};

export type Usage = {
	proof: string;
	styles: string[] | null;
	formats: string[] | null;
	vocab: boolean | null;
	level: string | null;
	repo: string | null;
	integrations: Integrations | null;
	ci: boolean | null;
	preCommit: boolean | null;
	house: boolean | null;
};

export type Facet = { id: string; label: string; test: (u: Usage) => boolean };
export type FacetGroup = { name: string; facets: Facet[] };

// Through `unknown`: the JSON's inferred shape is a union of literal records
// that TypeScript will not relate to the field-optional type directly.
const records = stats.perAdopter as unknown as Record<string, Usage>;

const style = (name: string) => (u: Usage) => (u.styles ?? []).includes(name);
const format = (ext: string) => (u: Usage) => (u.formats ?? []).includes(ext);

// A section scoped to source files: Vale reads the comments. Any of these
// extensions in a config counts.
const CODE = new Set([
	'py',
	'go',
	'rb',
	'js',
	'ts',
	'tsx',
	'jsx',
	'rs',
	'c',
	'cpp',
	'h',
	'java',
	'kt',
	'swift',
	'cs',
	'php',
	'lua',
	'sh',
	'ps1',
	'r',
	'jl',
	'ex',
	'hs',
	'scala',
	'dart',
	'proto',
	'sql'
]);
const code = (u: Usage) => (u.formats ?? []).some((f) => CODE.has(f));
const some = (pick: (i: Integrations) => string[] | string | boolean | null) => (u: Usage) => {
	const v = u.integrations ? pick(u.integrations) : null;
	return Array.isArray(v) ? v.length > 0 : Boolean(v);
};

export const usageGroups: FacetGroup[] = [
	{
		name: 'Integrations',
		facets: [
			{ id: 'action', label: 'GitHub Actions', test: some((i) => i.actions) },
			{ id: 'valeaction', label: 'Official Vale Action', test: some((i) => i.valeAction) },
			{ id: 'gitlabci', label: 'GitLab CI', test: some((i) => i.gitlab) },
			{ id: 'circleci', label: 'CircleCI', test: some((i) => i.circle) },
			{ id: 'buildkite', label: 'Buildkite', test: some((i) => i.buildkite) },
			{ id: 'precommit', label: 'pre-commit', test: some((i) => i.precommit) },
			{ id: 'agents', label: 'AI agents', test: some((i) => i.agents) },
			{ id: 'task', label: 'Make or npm task', test: some((i) => i.tasks) },
			{ id: 'vscode', label: 'VS Code settings', test: some((i) => i.vscode) },
			{ id: 'contributing', label: 'Contributing guide', test: some((i) => i.contributing) }
		]
	},
	{
		name: 'Rules',
		facets: [
			{ id: 'house', label: 'House rules', test: (u) => u.house === true },
			{ id: 'vocab', label: 'Project vocabulary', test: (u) => u.vocab === true },
			{ id: 'google', label: 'Google style', test: style('Google') },
			{ id: 'microsoft', label: 'Microsoft style', test: style('Microsoft') },
			{ id: 'redhat', label: 'Red Hat style', test: style('RedHat') },
			{ id: 'strict', label: 'Errors only', test: (u) => u.level === 'error' }
		]
	},
	{
		name: 'Formats',
		facets: [
			{ id: 'md', label: 'Markdown', test: format('md') },
			{ id: 'mdx', label: 'MDX', test: format('mdx') },
			{ id: 'rst', label: 'reStructuredText', test: format('rst') },
			{ id: 'adoc', label: 'AsciiDoc', test: format('adoc') },
			{ id: 'html', label: 'HTML', test: format('html') },
			{ id: 'txt', label: 'Plain text', test: format('txt') },
			{ id: 'org', label: 'Org', test: format('org') },
			{ id: 'code', label: 'Source code', test: code }
		]
	}
];

export const facetLabel = new Map(usageGroups.flatMap((g) => g.facets.map((f) => [f.id, f.label])));

const cache = new Map<string, Set<string>>();

/** The facet ids a team matches, computed once per name. */
export function usageOf(name: string): Set<string> {
	let ids = cache.get(name);
	if (!ids) {
		const u = records[name];
		ids = new Set(
			u ? usageGroups.flatMap((g) => g.facets.filter((f) => f.test(u)).map((f) => f.id)) : []
		);
		cache.set(name, ids);
	}
	return ids;
}

export type FileLink = { label: string; url: string };

/**
 * The files worth opening in a team's repo, one link each: the workflow, the
 * pipeline, the hook config, the agent instructions, the task runner, the
 * editor settings, the contributing guide. Labels are the file's own name,
 * since that is what a reader will go looking for in their own repo.
 */
export function linksOf(name: string): FileLink[] {
	const u = records[name];
	const i = u?.integrations;
	if (!u?.repo || !i) return [];
	// A GitHub repo is `owner/name`; a GitLab one carries its host.
	const onGitLab = /^gitlab\./.test(u.repo);
	const blob = (path: string) =>
		onGitLab
			? `https://${u.repo}/-/blob/HEAD/${path}`
			: `https://github.com/${u.repo}/blob/HEAD/${path}`;
	const base = (path: string) => path.split('/').pop() ?? path;
	const out: FileLink[] = [];
	for (const p of i.actions.slice(0, 2)) out.push({ label: base(p), url: blob(p) });
	if (i.gitlab) out.push({ label: '.gitlab-ci.yml', url: blob(i.gitlab) });
	if (i.circle) out.push({ label: 'circleci', url: blob(i.circle) });
	if (i.buildkite) out.push({ label: 'buildkite', url: blob(i.buildkite) });
	if (i.precommit) out.push({ label: 'pre-commit', url: blob(i.precommit) });
	for (const p of i.agents) out.push({ label: base(p), url: blob(p) });
	for (const p of i.tasks.slice(0, 1)) out.push({ label: base(p), url: blob(p) });
	if (i.vscode) out.push({ label: 'settings.json', url: blob(i.vscode) });
	for (const p of i.contributing.slice(0, 1)) out.push({ label: base(p), url: blob(p) });
	return out;
}
