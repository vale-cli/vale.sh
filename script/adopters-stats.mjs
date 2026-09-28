/**
 * Counts what the adopters' repos actually do with Vale, into
 * src/lib/data/adopter-stats.json:
 *
 *   - ci:        the repo's CI config (GitHub workflows, GitLab CI, CircleCI,
 *                Buildkite) mentions Vale, so it runs on pull requests
 *   - preCommit: .pre-commit-config.yaml mentions Vale
 *   - stars:     the repo's stargazer count
 *   - actionDependents: repositories depending on vale-cli/vale-action,
 *                from GitHub's dependents page (a total, not per adopter)
 *   - runs30:    runs in the last thirty days of the workflows that name
 *                Vale, from the Actions API; `runs` holds the total
 *   - dockerPulls: pulls of the Vale image on Docker Hub, all time
 *   - publicConfigs: how many .vale.ini files GitHub's code search finds in
 *                public repos, a floor that reaches past this list
 *   - activity:  how often Vale itself is fetched, past this list: downloads
 *                of the releases published in the last thirty days, monthly
 *                pip, npm, and Homebrew installs, and VS Code installs
 *   - pushed:    when the repo last received a push
 *   - touched:   when the linked config file itself last changed, for an
 *                entry whose URL points at one
 *   - since:     when the team started, as the date its config first landed
 *                in the repo checked (the linked file, else the root
 *                .vale.ini, else the first CI file that names Vale; a style
 *                package counts from the day its repo was created)
 *   - house:     the sampled .vale.ini bases itself on a style that is not a
 *                registry package -- rules the team wrote itself
 *   - vocab:     the sampled .vale.ini sets Vocab
 *   - styles, formats, level: what the sampled .vale.ini declares
 *   - proof:     what the entry's URL is -- a config file, a style package,
 *                a plain repository, or a write-up
 *   - integrations: the files in the repo that mention Vale, by surface --
 *                workflows (and whether they use the official Action),
 *                GitLab CI, CircleCI, Buildkite, pre-commit, agent
 *                instructions, task runners, VS Code settings, and the
 *                contributing guide -- so the directory can link to each
 *
 * An adopter is checked through its `repo` field, or else the GitHub repo
 * its URL points into; GitLab hosts go through GitLab's REST API. The rest
 * are counted in `unchecked`. Every repo's CI files are read in one GraphQL
 * round of twenty, so the whole list takes a few requests.
 *
 * Run with: GITHUB_TOKEN=... node script/adopters-stats.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';

const ADOPTERS = new URL('../src/lib/data/adopters.json', import.meta.url);
const CONFIGS = new URL('../src/lib/data/config-stats.json', import.meta.url);
const OUT = new URL('../src/lib/data/adopter-stats.json', import.meta.url);

const token = process.env.GITHUB_TOKEN;
if (!token) {
	console.error('GITHUB_TOKEN is required: the GraphQL API does not serve anonymous requests.');
	process.exit(1);
}

/** Styles anyone can `vale sync`; anything else in BasedOnStyles is the team's own. */
const REGISTRY = new Set([
	'Vale',
	'Microsoft',
	'Google',
	'RedHat',
	'write-good',
	'proselint',
	'Joblint',
	'alex',
	'Readability',
	'Hugo',
	'AsciiDoc',
	'MDX',
	'ai-tells',
	'Openly'
]);

const adopters = JSON.parse(await readFile(ADOPTERS, 'utf8'));
const configs = JSON.parse(await readFile(CONFIGS, 'utf8'));

/*
	Where to look. An entry's `repo` field wins, since it exists for the
	write-up entries whose url is a page rather than a file; otherwise the
	url's own GitHub repository. GitHub results carry `owner`/`name`; GitLab
	ones carry the host and the project path, which can be a nested group.
*/
function repoOf(a) {
	if (a.repo) {
		const [host, ...rest] = a.repo.split('/');
		if (host === 'github.com') return { host: 'github', owner: rest[0], name: rest[1] };
		return { host, project: rest.join('/') };
	}
	const m = a.url.match(/^https:\/\/github\.com\/([^/]+)\/([^/#?]+)/);
	return m ? { host: 'github', owner: m[1], name: m[2].replace(/\.git$/, '') } : null;
}

// A mention counts when it is not just a path: Epic's pre-commit config
// names Vale only inside an `exclude:` pattern for another hook.
const mentions = (text) =>
	Boolean(
		text && text.split('\n').some((line) => /\bvale\b/i.test(line) && !/^\s*exclude:/.test(line))
	);

/**
 * The same record for a project on a GitLab host, through its REST API,
 * which serves public projects without a token. GitLab CI is one root file
 * that usually includes others under .gitlab/ci, so those are read too.
 */
async function checkGitLab(host, project) {
	const api = `https://${host}/api/v4/projects/${encodeURIComponent(project)}`;
	const json = async (path) => {
		const res = await fetch(api + path);
		const text = res.ok ? await res.text() : '';
		return text ? JSON.parse(text) : null;
	};
	const raw = async (file) => {
		const res = await fetch(`${api}/repository/files/${encodeURIComponent(file)}/raw?ref=HEAD`);
		return res.ok ? res.text() : null;
	};
	const info = await json('');
	if (!info) return { missing: true };
	const files = {};
	for (const [k, e] of Object.entries(FILES)) files[k] = await raw(e.slice('HEAD:'.length));
	// The root pipeline plus whatever it includes from .gitlab/ci.
	const ciFiles = [];
	if (mentions(files.gitlab)) ciFiles.push('.gitlab-ci.yml');
	const tree = (await json('/repository/tree?path=.gitlab/ci&per_page=100')) ?? [];
	for (const entry of tree) {
		if (entry.type !== 'blob' || !/\.ya?ml$/.test(entry.name)) continue;
		if (mentions(await raw(entry.path))) ciFiles.push(entry.path);
	}
	const commits = (await json('/repository/commits?path=.vale.ini&per_page=1')) ?? [];
	// The history is newest first with no total, so it is paged to the end.
	let oldest = null;
	for (let page = 1; page; ) {
		const res = await fetch(`${api}/repository/commits?path=.vale.ini&per_page=100&page=${page}`);
		const list = res.ok ? JSON.parse((await res.text()) || '[]') : [];
		if (list.length) oldest = list[list.length - 1].committed_date?.slice(0, 10) ?? oldest;
		page = Number(res.headers.get('x-next-page')) || 0;
	}
	const found = (keys) => keys.filter((k) => mentions(files[k])).map((k) => PATHS[k]);
	return {
		repo: `${host}/${project}`,
		integrations: {
			actions: [],
			valeAction: false,
			reviewdog: false,
			gitlab: ciFiles[0] ?? null,
			circle: found(['circle'])[0] ?? null,
			buildkite: found(['buildkite'])[0] ?? null,
			precommit: found(['preCommit'])[0] ?? null,
			agents: found(['agents', 'docsAgents', 'claude', 'cursor', 'copilot']),
			tasks: found(['makefile', 'pkg', 'justfile', 'taskfile']),
			vscode: found(['vscode'])[0] ?? null,
			contributing: found(['contributing', 'docsContributing', 'ghContributing'])
		},
		stars: info.star_count ?? 0,
		pushed: info.last_activity_at?.slice(0, 10) ?? null,
		touched: commits[0]?.committed_date?.slice(0, 10) ?? null,
		since: oldest,
		ci: ciFiles.length > 0,
		ciFiles,
		preCommit: mentions(files.preCommit)
	};
}

async function graphql(query, attempt = 1) {
	const res = await fetch('https://api.github.com/graphql', {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({ query })
	});
	// A batch this wide can draw a 502 from the API on a slow day; back off
	// and ask again before giving up.
	if (res.status >= 500 && attempt < 4) {
		await new Promise((r) => setTimeout(r, 2000 * attempt));
		return graphql(query, attempt + 1);
	}
	if (!res.ok) throw new Error(`graphql -> ${res.status}`);
	const body = await res.json();
	if (body.errors && !body.data) throw new Error(JSON.stringify(body.errors).slice(0, 300));
	return body.data;
}

// The CI files a repo might keep Vale in. Workflows are a directory, read as
// a tree of blobs; the rest are single files.
const FILES = {
	gitlab: 'HEAD:.gitlab-ci.yml',
	circle: 'HEAD:.circleci/config.yml',
	buildkite: 'HEAD:.buildkite/pipeline.yml',
	preCommit: 'HEAD:.pre-commit-config.yaml',
	// The surfaces a newcomer copies from: agent instructions, task runners,
	// editor settings, and the contributing guide.
	agents: 'HEAD:AGENTS.md',
	docsAgents: 'HEAD:docs/AGENTS.md',
	claude: 'HEAD:CLAUDE.md',
	cursor: 'HEAD:.cursorrules',
	copilot: 'HEAD:.github/copilot-instructions.md',
	makefile: 'HEAD:Makefile',
	pkg: 'HEAD:package.json',
	justfile: 'HEAD:justfile',
	taskfile: 'HEAD:Taskfile.yml',
	vscode: 'HEAD:.vscode/settings.json',
	contributing: 'HEAD:CONTRIBUTING.md',
	docsContributing: 'HEAD:docs/CONTRIBUTING.md',
	ghContributing: 'HEAD:.github/CONTRIBUTING.md'
};

// Where each key lives in the repo, for the links the directory shows.
const PATHS = Object.fromEntries(
	Object.entries(FILES).map(([k, e]) => [k, e.slice('HEAD:'.length)])
);

/*
	What a reader lands on. A blob ending in vale.ini is a config. A GitHub
	repository or tree whose path says vale or style is a package of rules.
	Any other GitHub link is a repository, and everything else is a page the
	team wrote.
*/
function proofOf(url) {
	if (/^https:\/\/github\.com\/.+\/blob\/.+vale\.ini$/.test(url)) return 'config';
	if (/^https:\/\/github\.com\//.test(url)) {
		const path = url.replace(/^https:\/\/github\.com\//, '');
		return /vale|style/i.test(path) && !/\/blob\//.test(path) ? 'package' : 'repository';
	}
	return 'writeup';
}

function pathOf(url) {
	const m = url.match(/^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\/[^/]+\/(.+)$/);
	return m ? m[1] : null;
}

// A folder inside a bigger repo, like a styles directory: dated by its own
// history, never by the repo's.
function treeOf(url) {
	const m = url.match(/^https:\/\/github\.com\/[^/]+\/[^/]+\/tree\/[^/]+\/(.+?)\/?$/);
	return m ? m[1] : null;
}

// One query slot per adopter, since two entries can share a repo but point
// at different files. Ten per round: each slot reads a dozen or more blobs.
const all = adopters
	.map((a) => ({
		name: a.name,
		repo: repoOf(a),
		// The config's path for `touched`: the url's own file, or the root
		// config when the entry names a repo beside a write-up.
		path: pathOf(a.url) ?? (a.repo ? '.vale.ini' : null),
		tree: treeOf(a.url),
		proof: proofOf(a.url)
	}))
	.filter((t) => t.repo);
const targets = all.filter((t) => t.repo.host === 'github');

const results = {};
for (const t of all.filter((t) => t.repo.host !== 'github')) {
	results[t.name] = await checkGitLab(t.repo.host, t.repo.project);
	console.log(`  ${t.repo.host}: ${t.name}`);
}
for (let i = 0; i < targets.length; i += 10) {
	const chunk = targets.slice(i, i + 10);
	const parts = chunk.map((t, j) => {
		const { owner, name } = t.repo;
		const files = Object.entries(FILES)
			.map(([k, e]) => `${k}: object(expression: ${JSON.stringify(e)}) { ... on Blob { text } }`)
			.join(' ');
		// The linked file's latest commit for `touched`, and how long the
		// histories are, so the next round can ask for their first commits.
		const cfg = (t.path && t.path !== '.vale.ini' ? t.path : null) ?? t.tree;
		const history = `defaultBranchRef { target { oid ... on Commit {
			ini: history(first: 1, path: ".vale.ini") { totalCount nodes { committedDate } }
			${cfg ? `cfg: history(first: 1, path: ${JSON.stringify(cfg)}) { totalCount nodes { committedDate } }` : ''}
		} } }`;
		return `r${j}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) {
			createdAt
			stargazerCount
			pushedAt
			workflows: object(expression: "HEAD:.github/workflows") {
				... on Tree { entries { name object { ... on Blob { text } } } }
			}
			${files}
			${history}
		}`;
	});
	const data = await graphql(`{ ${parts.join('\n')} }`);
	chunk.forEach((t, j) => {
		const d = data[`r${j}`];
		if (!d) {
			results[t.name] = { missing: true };
			return;
		}
		const workflows = (d.workflows?.entries ?? []).filter((e) => mentions(e.object?.text));
		const workflowText = workflows.map((e) => e.object.text).join('\n');
		const found = (keys) => keys.filter((k) => mentions(d[k]?.text)).map((k) => PATHS[k]);
		const head = d.defaultBranchRef?.target ?? {};
		const linkedPath = (t.path && t.path !== '.vale.ini' ? t.path : null) ?? t.tree ?? t.path;
		const linked = linkedPath && linkedPath !== '.vale.ini' ? head.cfg : head.ini;
		results[t.name] = {
			repo: `${t.repo.owner}/${t.repo.name}`,
			integrations: {
				actions: workflows.map((e) => `.github/workflows/${e.name}`),
				valeAction: /(errata-ai|vale-cli)\/vale-action/.test(workflowText),
				reviewdog: /vale-action@reviewdog/.test(workflowText),
				gitlab: found(['gitlab'])[0] ?? null,
				circle: found(['circle'])[0] ?? null,
				buildkite: found(['buildkite'])[0] ?? null,
				precommit: found(['preCommit'])[0] ?? null,
				agents: found(['agents', 'docsAgents', 'claude', 'cursor', 'copilot']),
				tasks: found(['makefile', 'pkg', 'justfile', 'taskfile']),
				vscode: found(['vscode'])[0] ?? null,
				contributing: found(['contributing', 'docsContributing', 'ghContributing'])
			},
			stars: d.stargazerCount,
			pushed: d.pushedAt?.slice(0, 10) ?? null,
			touched: t.path ? (linked?.nodes?.[0]?.committedDate?.slice(0, 10) ?? null) : null,
			createdAt: d.createdAt?.slice(0, 10) ?? null,
			head: head.oid ?? null,
			// The path whose first commit dates the adoption, and how many
			// commits it has, so the cursor for the oldest can be built.
			dated:
				linkedPath && linked?.totalCount
					? { path: linkedPath, count: linked.totalCount }
					: head.ini?.totalCount
						? { path: '.vale.ini', count: head.ini.totalCount }
						: null,
			ci:
				workflows.length > 0 ||
				mentions(d.gitlab?.text) ||
				mentions(d.circle?.text) ||
				mentions(d.buildkite?.text),
			ciFiles: workflows.map((e) => `.github/workflows/${e.name}`),
			preCommit: mentions(d.preCommit?.text)
		};
	});
	console.log(`  checked ${Math.min(i + 10, targets.length)}/${targets.length}`);
}

/*
	When each team started: the first commit of the file that dates it. The
	API pages history newest first, and a cursor is the head commit plus an
	index, so the oldest commit is one more batched round away. A repo with
	no dated config falls back to its first CI file that names Vale, and a
	style package that is its own repo to the day that repo was created.
*/
async function histories(items, args) {
	for (let i = 0; i < items.length; i += 10) {
		const chunk = items.slice(i, i + 10);
		const parts = chunk.map(
			(t, j) =>
				`r${j}: repository(owner: ${JSON.stringify(t.repo.owner)}, name: ${JSON.stringify(t.repo.name)}) {
				defaultBranchRef { target { ... on Commit {
					h: history(first: 1, ${args(results[t.name])}) { totalCount nodes { committedDate } }
				} } }
			}`
		);
		const data = await graphql(`{ ${parts.join('\n')} }`);
		chunk.forEach((t, j) => {
			results[t.name].h = data[`r${j}`]?.defaultBranchRef?.target?.h ?? null;
		});
	}
}

const dating = targets.filter((t) => results[t.name]?.head);
const undated = dating.filter((t) => !results[t.name].dated && results[t.name].ciFiles?.length);
await histories(undated, (r) => `path: ${JSON.stringify(r.ciFiles[0])}`);
for (const t of undated) {
	const r = results[t.name];
	if (r.h?.totalCount) r.dated = { path: r.ciFiles[0], count: r.h.totalCount };
}
const dated = dating.filter((t) => results[t.name].dated);
await histories(dated, (r) => {
	const { path, count } = r.dated;
	const after = count > 1 ? `, after: ${JSON.stringify(`${r.head} ${count - 2}`)}` : '';
	return `path: ${JSON.stringify(path)}${after}`;
});
for (const t of dating) {
	const r = results[t.name];
	r.since = r.dated ? (r.h?.nodes?.[0]?.committedDate?.slice(0, 10) ?? null) : null;
	if (!r.since && t.proof === 'package' && !t.tree) r.since = r.createdAt;
	delete r.h;
}
console.log(
	`  dated ${dating.filter((t) => results[t.name].since).length}/${targets.length} repos`
);

/*
	How often the Vale workflows actually ran. For each GitHub repo whose
	workflow file names Vale, the Actions API reports that workflow's run
	count over a date range, so the last thirty days are counted, not
	estimated. It counts runs of workflows that include a Vale job -- a
	repo's ci.yml has other jobs too -- and the tile says so.
*/
const DAY = 86400000;
const since = new Date(Date.now() - 30 * DAY).toISOString().slice(0, 10);
const CAP = 2500;

// The API caps one count at 2,500, and a busy repo passes that in a month,
// so the month is read as seven-day windows and summed. A week that hits
// the cap is re-read day by day; a day that still hits it is a floor.
async function countRuns(owner, name, file, from, to) {
	const url = `https://api.github.com/repos/${owner}/${name}/actions/workflows/${encodeURIComponent(file)}/runs?created=${from}..${to}&per_page=1`;
	const res = await fetch(url, {
		headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
	});
	if (!res.ok) return null;
	// An empty 200 has been seen once; treat it as no answer, not a crash.
	const text = await res.text();
	if (!text) return null;
	const n = JSON.parse(text).total_count;
	return typeof n === 'number' ? n : null;
}

const day = (ms) => new Date(ms).toISOString().slice(0, 10);

async function workflowRuns(owner, name, file) {
	let total = 0;
	let capped = false;
	let seen = false;
	const now = Date.now();
	for (let start = now - 30 * DAY; start < now; start += 7 * DAY) {
		const end = Math.min(start + 7 * DAY - DAY, now);
		let n = await countRuns(owner, name, file, day(start), day(end));
		if (n === null) continue;
		seen = true;
		if (n >= CAP) {
			n = 0;
			for (let d = start; d <= end; d += DAY) {
				const m = await countRuns(owner, name, file, day(d), day(d));
				if (m === null) continue;
				n += m;
				if (m >= CAP) capped = true;
			}
		}
		total += n;
	}
	return seen ? { total, capped } : null;
}

let runs30 = 0;
let runsRepos = 0;
let runsCapped = false;
for (const t of targets) {
	const r = results[t.name];
	if (!r || r.missing || !r.ciFiles?.length) continue;
	let total = 0;
	let any = false;
	for (const path of r.ciFiles) {
		const n = await workflowRuns(t.repo.owner, t.repo.name, path.split('/').pop());
		if (n) {
			total += n.total;
			any = true;
			if (n.capped) runsCapped = true;
		}
	}
	r.runs30 = any ? total : null;
	if (any) {
		runs30 += total;
		runsRepos++;
	}
}
console.log(`  workflow runs since ${since}: ${runs30} across ${runsRepos} repos`);

/*
	Pulls of the Vale image on Docker Hub, all time: how a good share of CI
	jobs install Vale. Public, no token. Kept if the request fails.
*/
async function dockerPulls(previous) {
	try {
		const res = await fetch('https://hub.docker.com/v2/repositories/jdkato/vale/');
		const text = res.ok ? await res.text() : '';
		if (text) return JSON.parse(text).pull_count ?? previous ?? null;
	} catch {
		// Fall through to the previous figure.
	}
	return previous ?? null;
}

/*
	How many repositories depend on the official Action, from GitHub's own
	dependents page: the one adoption figure that reaches past this list. There
	is no API for it, so the page is read for its count, and if the markup
	ever changes the previous figure is kept rather than written as zero.
*/
async function actionDependents(previous) {
	try {
		const res = await fetch('https://github.com/vale-cli/vale-action/network/dependents', {
			headers: { 'User-Agent': 'vale.sh adopters-stats' }
		});
		const html = (await res.text()).replace(/\s+/g, ' ');
		const m = html.match(/([0-9][0-9,]*) Repositories/);
		if (m) return Number(m[1].replace(/,/g, ''));
		console.warn('  dependents: count not found on the page, keeping the previous figure');
	} catch (err) {
		console.warn(`  dependents: ${err.message}, keeping the previous figure`);
	}
	return previous ?? null;
}

/*
	How often Vale itself is fetched, from the counters each registry
	publishes. The GitHub figure is the downloads of every release published
	in the window, so it can only undercount. The pip and npm packages fetch
	the binary from those releases on install, so their counts are shown
	beside it, never summed with it. Each is kept if its request fails.
*/
async function activity(previous, since) {
	const prev = previous ?? {};
	const json = async (url, init) => {
		try {
			const res = await fetch(url, init);
			const text = res.ok ? await res.text() : '';
			return text ? JSON.parse(text) : null;
		} catch {
			return null;
		}
	};

	const releases = await json('https://api.github.com/repos/vale-cli/vale/releases?per_page=20', {
		headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
	});
	const recent = (releases ?? []).filter((r) => r.published_at >= since);
	const downloads = recent.length
		? {
				since,
				total: recent.reduce((n, r) => n + r.assets.reduce((m, a) => m + a.download_count, 0), 0),
				releases: recent.length
			}
		: (prev.downloads ?? null);

	const pypi = await json('https://pypistats.org/api/packages/vale/recent', {
		headers: { Accept: 'application/json' }
	});
	const npm = await json('https://api.npmjs.org/downloads/point/last-month/@vvago/vale');
	const brew = await json('https://formulae.brew.sh/api/formula/vale.json');
	const vscode = await json(
		'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery',
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json;api-version=3.0-preview.1'
			},
			body: JSON.stringify({
				filters: [{ criteria: [{ filterType: 7, value: 'ChrisChinchilla.vale-vscode' }] }],
				flags: 914
			})
		}
	);
	const installs = vscode?.results?.[0]?.extensions?.[0]?.statistics?.find(
		(s) => s.statisticName === 'install'
	)?.value;

	return {
		downloads,
		pip30: pypi?.data?.last_month ?? prev.pip30 ?? null,
		npm30: npm?.downloads ?? prev.npm30 ?? null,
		brew30: brew?.analytics?.install?.['30d']?.vale ?? prev.brew30 ?? null,
		vscode: typeof installs === 'number' ? installs : (prev.vscode ?? null)
	};
}

/*
	How many public configs GitHub can find at all, past this list: a code
	search for files named .vale.ini. The index covers repos with recent
	activity, so the count is a floor. Kept if the request fails.
*/
async function publicConfigs(previous) {
	try {
		const res = await fetch('https://api.github.com/search/code?q=filename:.vale.ini&per_page=1', {
			headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
		});
		const text = res.ok ? await res.text() : '';
		const n = text ? JSON.parse(text).total_count : null;
		if (typeof n === 'number' && n > 0) return n;
		console.warn(`  public configs: search -> ${res.status}, keeping the previous figure`);
	} catch (err) {
		console.warn(`  public configs: ${err.message}, keeping the previous figure`);
	}
	return previous ?? null;
}

let previous = {};
try {
	previous = JSON.parse(await readFile(OUT, 'utf8'));
} catch {
	// First run: nothing to fall back to.
}
const dependents = await actionDependents(previous.actionDependents ?? null);
const pulls = await dockerPulls(previous.dockerPulls ?? null);
const fetched = await activity(previous.activity ?? null, since);
const found = await publicConfigs(previous.publicConfigs ?? null);

// Per adopter, then the totals the page shows.
const sampledByName = new Map(configs.sampled.map((s) => [s.name, s]));
const today = new Date();
const daysAgo = (iso) => (iso ? Math.floor((today - new Date(iso)) / 86400000) : null);
const perAdopter = {};
const totals = {
	teams: adopters.length,
	checked: 0,
	unchecked: 0,
	ci: 0,
	preCommit: 0,
	stars: 0,
	active30: 0,
	active90: 0,
	touched90: 0,
	touchable: 0
};
const bySector = {};

for (const a of adopters) {
	const r = results[a.name];
	const hit = r && !r.missing ? r : null;
	const sampled = sampledByName.get(a.name);
	perAdopter[a.name] = {
		proof: proofOf(a.url),
		styles: sampled ? sampled.styles : null,
		formats: sampled ? (sampled.formats ?? []) : null,
		vocab: sampled ? (sampled.keys ?? []).includes('Vocab') : null,
		level: sampled ? (sampled.minAlertLevel ?? null) : null,
		repo: hit ? hit.repo : null,
		integrations: hit ? hit.integrations : null,
		ci: hit ? hit.ci : null,
		preCommit: hit ? hit.preCommit : null,
		stars: hit ? hit.stars : null,
		pushed: hit ? hit.pushed : null,
		touched: hit ? hit.touched : null,
		since: hit ? (hit.since ?? null) : null,
		runs30: hit ? (hit.runs30 ?? null) : null,
		house: sampled ? sampled.styles.some((s) => !REGISTRY.has(s)) : null
	};

	const sector = (bySector[a.category] ??= {
		teams: 0,
		checked: 0,
		ci: 0,
		house: 0,
		stars: 0,
		active30: 0
	});
	sector.teams++;
	if (hit) {
		totals.checked++;
		sector.checked++;
		totals.stars += hit.stars;
		sector.stars += hit.stars;
		if (hit.ci) {
			totals.ci++;
			sector.ci++;
		}
		if (hit.preCommit) totals.preCommit++;
		const pushed = daysAgo(hit.pushed);
		if (pushed !== null && pushed <= 30) {
			totals.active30++;
			sector.active30++;
		}
		if (pushed !== null && pushed <= 90) totals.active90++;
		if (hit.touched !== null) {
			totals.touchable++;
			if (daysAgo(hit.touched) <= 90) totals.touched90++;
		}
	} else {
		totals.unchecked++;
	}
	if (perAdopter[a.name].house) sector.house++;
}

// The config-side counts, against the configs that were actually read.
const sampled = configs.sampled.length;
const house = configs.sampled.filter((s) => s.styles.some((x) => !REGISTRY.has(x))).length;
const vocab = configs.keys?.Vocab ?? 0;
const registryOnly = configs.sampled.filter(
	(s) => s.styles.length > 0 && s.styles.every((x) => REGISTRY.has(x))
).length;

await writeFile(
	OUT,
	JSON.stringify(
		{
			generated: new Date().toISOString().slice(0, 10),
			actionDependents: dependents,
			dockerPulls: pulls,
			activity: fetched,
			publicConfigs: found,
			runs: { since, total: runs30, repos: runsRepos, floor: runsCapped },
			...totals,
			configs: { sampled, house, registryOnly, vocab },
			bySector,
			perAdopter
		},
		null,
		'\t'
	) + '\n'
);
console.log(
	`\n${totals.teams} teams: ${totals.checked} repos checked, ${totals.ci} run Vale in CI, ${totals.preCommit} in pre-commit, ${totals.stars} stars, ${totals.active30} pushed in 30 days, ${totals.touched90}/${totals.touchable} configs touched in 90 days; ${house}/${sampled} configs carry house rules, ${vocab} keep a Vocab.`
);
