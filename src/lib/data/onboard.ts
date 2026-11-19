// The figures behind /blog/onboard. The onboarding run is `/vale:onboard` on
// a clone of vale-cli/docs with Vale 3.27.0; the commit history and the
// doctor report are the agent-tools scripts' own output; the guide is the
// worked example under skills/from-guide/example in vale-cli/agent-tools.

export type Counts = { errors: number; warnings: number; suggestions: number };

// `preview.sh -p Microsoft -p Google website`: 41 .md and 16 .mdx files.
export const packages: ({ name: string } & Counts)[] = [
	{ name: 'Microsoft', errors: 54, warnings: 106, suggestions: 267 },
	{ name: 'Google', errors: 68, warnings: 223, suggestions: 307 }
];

// The proposal's table: Microsoft as shipped, then with the drafted baseline.
export const firstRun: Counts = { errors: 54, warnings: 106, suggestions: 267 };
export const baseline: Counts = { errors: 5, warnings: 73, suggestions: 275 };

export type Step = { name: string; does: string };

// The skill's steps, on either side of the one question it asks.
export const before: Step[] = [
	{ name: 'Look', does: 'Where the prose is, what CI already lints, word lists to carry over' },
	{ name: 'Preview', does: 'Each package against the docs, with a real alert per blocking rule' },
	{ name: 'Draft', does: 'A vocabulary, a decision per blocking rule, the style choices' },
	{ name: 'Propose', does: 'One message, with the counts before and after' }
];
export const after: Step[] = [
	{ name: 'Apply', does: 'Config, vocabulary, overrides with reasons, the CI change' },
	{ name: 'Verify', does: 'The preview again, against the real config, line for line' },
	{ name: 'Pull request', does: 'One commit on a branch; the proposal is the description' }
];

export type Pile = 'rule' | 'covered' | 'vocabulary' | 'person';

export const piles: Record<Pile, { label: string; tone: string }> = {
	rule: {
		label: 'A rule',
		tone: 'bg-lime-500/15 text-lime-700 ring-lime-500/40 dark:text-lime-300'
	},
	covered: {
		label: 'Already covered',
		tone: 'bg-sky-500/15 text-sky-700 ring-sky-500/40 dark:text-sky-300'
	},
	vocabulary: {
		label: 'Vocabulary',
		tone: 'bg-violet-500/15 text-violet-700 ring-violet-500/40 dark:text-violet-300'
	},
	person: {
		label: 'Needs a person',
		tone: 'bg-amber-500/15 text-amber-700 ring-amber-500/40 dark:text-amber-300'
	}
};

// Every statement in the example guide, in its order, with the pile it
// lands in and what becomes of it.
export const statements: { says: string; pile: Pile; becomes: string; tests?: number }[] = [
	{
		says: 'Use "sign in" for the action. Don\'t use "log in."',
		pile: 'rule',
		becomes: 'Acme.SignIn',
		tests: 3
	},
	{
		says: "Don't tell the reader a task is trivial.",
		pile: 'rule',
		becomes: 'Acme.Filler',
		tests: 3
	},
	{ says: 'Write "email," never "e-mail."', pile: 'rule', becomes: 'Acme.Email', tests: 2 },
	{
		says: 'Keep sentences to 30 words or fewer.',
		pile: 'rule',
		becomes: 'Acme.SentenceLength',
		tests: 2
	},
	{ says: 'Use sentence case.', pile: 'covered', becomes: "a package rule's level" },
	{
		says: "Don't end a heading with a period or a colon.",
		pile: 'rule',
		becomes: 'Acme.HeadingPunctuation',
		tests: 3
	},
	{
		says: 'Write for a busy reader. Be warm, and never condescending.',
		pile: 'person',
		becomes: 'listed as not enforced'
	}
];

// `history.sh -n 20` on vale-cli/agent-tools: commits of the last twenty
// that fail each convention at error level.
export const historyOf = 20;
export const history: { name: string; failing: number; reason?: string; closest?: boolean }[] = [
	{ name: 'SevenRules', failing: 3, reason: 'SevenRules.Capitalize (2)', closest: true },
	{ name: 'Conventional', failing: 19, reason: 'Conventional.Type (19)' },
	{ name: 'Go', failing: 19, reason: 'Go.Package (19)' },
	{ name: 'Gitmoji', failing: 20, reason: 'Gitmoji.Intention (20)' },
	{ name: 'Kernel', failing: 20, reason: 'Kernel.Subsystem (19)' },
	{ name: 'Jira', failing: 20, reason: 'Jira.Key (20)' }
];

// A terminal line: plain text, or runs of [text, tone].
export type Tone = 'head' | 'good' | 'bad' | 'muted';
export type Line = string | [string, Tone?][];

const head = (text: string): Line => [[text, 'head']];

// The proposal, as the agent wrote it.
export const proposal: Line[] = [
	head('Vale baseline for website/ (41 .md, 16 .mdx) — nothing written yet'),
	'',
	[['              total   errors  warnings  suggestions', 'muted']],
	[['First run       427       '], ['54', 'bad'], ['       106          267']],
	[['With baseline   353        '], ['5', 'good'], ['        73          275']],
	'',
	head('What it found, in your files'),
	'  "VSCode" in creating-plugin.md:16 — the product is "VS Code" (4 uses)',
	'  "Intellij" in intellij.md:10 — the product is "IntelliJ"',
	'  "e.g.," in core.md:19 → "for example"',
	'',
	[['Package:     ', 'head'], ['Microsoft   (Google: 598 alerts, 68 errors — say so to switch)']],
	[['Path:        ', 'head'], ['website/    the path your CI job already lints']],
	[
		['Vocabulary:  ', 'head'],
		['12 terms    Asciidoctor, Buildkite, DZone, Jilles, Linode, Tengo, …']
	],
	[['Not linted:  ', 'head'], ['front matter `id` — page URLs, not prose (cli, gui, vscode, …)']],
	'',
	head('Style choices — from how the docs are written today; change any'),
	'  Headings       sentence case   12 hits; advice only, as shipped',
	'  "We"           allowed         52 uses; the docs speak as "we" throughout',
	'  Contractions   advice only     8 hits; was blocking',
	'  "e.g."         spell out       4 hits; shown in review, not blocking',
	'  Terms          VS Code, IntelliJ   6 inconsistent spellings get a fix',
	'',
	head('Other overrides: 1'),
	'  Microsoft.Quotes = warning     9 hits, right rule; not blocking yet',
	[['CI:          ', 'head'], ['update .github/workflows/main.yml — advisory, and only on lines']],
	'             a pull request adds, so the backlog never lands on anyone.',
	'             Changes: errata-ai/vale-action@v1.4.2 → vale-cli/vale-action@v3,',
	'             trigger gains pull_request, `debug: true` and the explicit',
	'             GITHUB_TOKEN go. `files: website` stays.',
	[
		['Still errors: ', 'head'],
		['5', 'bad'],
		[' — "VSCode" (4) and "Intellij" (1), the spellings above. Real']
	],
	"             findings; I'd leave them for a follow-up fix.",
	'',
	head('Not included — say the word for any of these'),
	'  Blocking CI        5 errors would fail it today; fix those first',
	'  One-click fixes    suggested changes on pull requests (not from forks)',
	'  Code comments      5 .jsx, 3 .js, 1 .tsx, 1 .py files',
	'  One spelling       79 American, 1 British ("centre") — enforce American',
	'  Commit messages    closest to the "seven rules": 1 of your last 2 pass',
	'  A written guide    generated from this config, for contributors',
	'  In your editor     alerts as you type',
	'',
	[['The reasons in the config are what I observed, for you to replace with yours.', 'muted']],
	[['Apply this as a pull request? Or tell me what to change.', 'good']]
];

const ok = (text: string): Line => [['ok    ', 'good'], [text]];
const fail = (text: string): Line => [['FAIL  ', 'bad'], [text]];

// `/vale:doctor` on a fresh clone, where the styles were never synced.
export const doctor: Line[] = [
	ok('vale 3.27.0 at /usr/local/bin/vale'),
	ok('configuration loads: .vale.ini'),
	fail('styles named in the configuration are not on disk: Microsoft'),
	[['      → vale sync', 'muted']],
	ok('vocabulary Docs: 12 terms accepted'),
	ok('the vocabulary is tracked by git'),
	fail("vale could not lint README.md: .vale.ini:8:E201:Style 'Microsoft' isn't on the StylesPath"),
	ok('a POSIX shell is available for the edit hook'),
	ok("the edit hook reports 'error' and above; it stays silent on a file with none"),
	'',
	'2 thing(s) to fix, marked FAIL above.'
];
