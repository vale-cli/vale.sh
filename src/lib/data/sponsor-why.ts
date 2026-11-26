/*
	The figures behind /sponsor/why that this site can't compute at build time,
	each dated and sourced. Everything else on that page is live: team and
	sector counts from adopters.json, downloads and the Homebrew rank from
	$lib/server/stats, and Open Collective's yearly income from the same.

	Refresh by hand. The counts come from Vale's own repositories and sponsor
	ledgers; the commands are noted beside each block.
*/

/** The date every hand-set figure below was counted. */
export const asOf = '2026-11-21';

/**
 * Issues and pull requests opened in vale-cli/vale by anyone but me, bots
 * excluded (`gh issue list` and `gh pr list --state all`). A first reply is
 * my first comment or review, or the close if that came first; fixes that
 * only reference an issue from a commit aren't seen, so reply times read slow.
 */
export const issues = {
	fromOthers: 945,
	closedPct: 99,
	medianCloseDays: 4.2,
	openNow: 12,
	medianReplyHours: 29,
	thisYear: { year: 2026, count: 155, medianReplyHours: 77 },
	lastYear: { year: 2025, count: 76 }
};

/** Vale's git history, v3, merges excluded. */
export const commits = { total: 2207, mine: 2097 };

/**
 * Every dollar Vale has received: Open Collective's lifetime backer totals,
 * GitHub Sponsors' lifetime received values (public and private), and
 * FLOSS/fund's direct grant. In-kind support (hosting, credits, model
 * access) isn't money and isn't counted.
 *
 * `days` are the distinct days with at least one commit of mine across Vale,
 * libvale, the packages and style library, the markup parsers, and this
 * site: a floor, since triage, reviews, and support leave no commit.
 * `hoursPerDay` is an assumption, and the page says so.
 */
export const funding = {
	opencollective: 11502,
	github: 3301,
	direct: 10000,
	/** GitHub Sponsors' current monthly total; Open Collective's comes live. */
	githubMonthly: 75,
	days: 781,
	hoursPerDay: 3
};
export const received = funding.opencollective + funding.github + funding.direct;

/**
 * The work and the money, year by year.
 *
 * releases: GitHub releases of vale-cli/vale.
 * commits: mine, deduplicated by hash, across the repositories above.
 * incoming: issues and pull requests from users, as in `issues`.
 * money: Open Collective contributions by date; GitHub Sponsors rebuilt from
 *   each sponsorship's start, tier, and cancellation (within $46 of GitHub's
 *   exact lifetime total, and scaled to it); FLOSS/fund's grant in 2025.
 *   Sums to `received`.
 */
export const perYear: Record<
	string,
	{ releases: number; commits: number; incoming: number; money: number }
> = {
	'2017': { releases: 23, commits: 414, incoming: 19, money: 0 },
	'2018': { releases: 17, commits: 171, incoming: 36, money: 0 },
	'2019': { releases: 13, commits: 141, incoming: 61, money: 0 },
	'2020': { releases: 28, commits: 267, incoming: 121, money: 1500 },
	'2021': { releases: 21, commits: 165, incoming: 76, money: 1468 },
	'2022': { releases: 20, commits: 395, incoming: 116, money: 3445 },
	'2023': { releases: 28, commits: 242, incoming: 142, money: 1977 },
	'2024': { releases: 26, commits: 369, incoming: 143, money: 2617 },
	'2025': { releases: 10, commits: 104, incoming: 76, money: 11001 },
	'2026': { releases: 21, commits: 823, incoming: 155, money: 2795 }
};

/**
 * GitHub release downloads over the past year, divided by 365: most are CI
 * jobs. A fallback: the page computes it live from the release walk.
 */
export const downloadsPerDay = 13180;

/** Docs pages Vale checks across the adopters' public repositories. */
export const docsPages = 289184;

/**
 * Well-known developer tools' all-time downloads, for scale, 2026-11-26.
 * Only channels that ship their own build are counted: a package that just
 * fetches the GitHub release when installed (Vale's on PyPI and npm,
 * actionlint's on PyPI) would count those installs twice. GitHub figures for
 * the peers are shields.io's, rounded to two or three digits. Vale's own row
 * is filled in live by the page.
 */
export type Channel = 'github' | 'pypi' | 'npm' | 'docker' | 'conda';
export const peers: {
	id: string;
	name: string;
	kind: string;
	channels: Partial<Record<Channel, number>>;
}[] = [
	{
		id: 'actionlint',
		name: 'actionlint',
		kind: 'GitHub Actions linter',
		channels: { github: 46000000, npm: 615790, docker: 25934475, conda: 266788 }
	},
	{
		id: 'shfmt',
		name: 'shfmt',
		kind: 'Shell formatter',
		channels: { github: 38000000, docker: 6854050, conda: 473234 }
	},
	{
		id: 'typos',
		name: 'typos',
		kind: 'Spell checker',
		channels: { github: 13000000, pypi: 18000000, conda: 1124394 }
	},
	{
		id: 'lychee',
		name: 'lychee',
		kind: 'Link checker',
		channels: { github: 16000000, docker: 2149547, conda: 278528 }
	},
	{
		id: 'languagetool',
		name: 'LanguageTool',
		kind: 'Grammar checker',
		channels: { pypi: 8700000, docker: 8973285 }
	},
	{
		id: 'goreleaser',
		name: 'GoReleaser',
		kind: 'Release tool',
		channels: { github: 14000000, conda: 16180 }
	},
	{ id: 'write-good', name: 'write-good', kind: 'Prose linter', channels: { npm: 9283499 } },
	{
		id: 'harper',
		name: 'Harper',
		kind: 'Grammar checker',
		channels: { github: 462000, npm: 1610713 }
	}
];
/** The writing tools among the peers. typos checks code, so it isn't one. */
export const writingTools = ['languagetool', 'write-good', 'harper'];

/**
 * One draft, five model reviews, input tokens at list price, measured
 * 2026-11-12 in /blog/quality-gate: 40,966 tokens a review on average, 15 to
 * 19 seconds; Vale took 0.09 seconds.
 */
export const modelReview = {
	tokens: 40966,
	price: { low: 2, high: 10, lowModel: 'Sonnet 5.5', highModel: 'Fable 5.1' }
};

/**
 * Words typical of AI-written text in GitHub issues, per 1,000 words: the
 * latest year against the years before ChatGPT. From "AI Tells: the burden
 * of LLMs" on jdkato.io.
 */
export const aiPhrasing = { ratio: 2.4, href: 'https://jdkato.io/stories/github-ai-tells' };
