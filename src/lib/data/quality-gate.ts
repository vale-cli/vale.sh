/**
 * Measurements behind /blog/quality-gate, taken on 2026-11-12.
 *
 * Reviews: the LintKit draft from /blog/voices, reviewed five times by
 * Claude Fable 5.1 through the Claude Code agent harness, each run a fresh
 * context given the same rule list and asked for a JSON list of violations.
 * Token counts are what the harness billed per run, most of it the harness's
 * own context rather than the draft. Vale's row is the same draft under the
 * Voices and Direct styles at their current versions.
 *
 * Counting: thirty sentences from this site's docs, 18 to 34 words each,
 * with the model asked three times which run past 25 words. Ground truth is
 * the whitespace count the prompt defined. Vale's Direct.Length counts
 * tokens, so a contraction or a parenthesis adds one; its two extra alerts
 * are 25-word sentences by whitespace and 26 by token.
 *
 * Decay: the same draft and rule list with the draft placed after 32k and
 * then 86k tokens of this site's docs, which the prompt said were not under
 * review, and separately with 47 rules from the Microsoft style added to the
 * ten, each given by its message alone. "kept" is how many of the eighteen
 * baseline findings the run reported. For the 57-rule runs, "matched" is
 * agreement with Vale's own 13 Microsoft alerts on the draft, "missed" the
 * ones it didn't raise, "extra" the ones Vale's definitions don't raise.
 *
 * Corpora: words and o200k tokens of every Markdown file, and one warm run
 * of Vale with the Voices and Direct styles on an Apple M1, wall clock. The
 * dollar figures are list price for input tokens alone, before any output,
 * from Anthropic's pricing table as of 2026-11-03: Fable 5.1 at $10 and
 * Sonnet 5.5 at $2 per million input tokens.
 */

export type Review = { run: number; seconds: number; tokens: number; found: string[] };

/** The eighteen findings every run reported, in the draft's order. */
export const consistent = [
	"We're thrilled to announce",
	'thrilled',
	'transformative',
	'reimagines',
	"isn't just a linter; it's",
	'comprehensive',
	'leveraging',
	'cutting-edge',
	'empowers',
	'streamline',
	'ship with confidence',
	'seamlessly',
	'robust',
	'plays nicely with',
	"It's worth noting that",
	'In conclusion',
	'pivotal',
	'journey'
];

export const reviews: Review[] = [
	{ run: 1, seconds: 15.1, tokens: 40804, found: consistent },
	{ run: 2, seconds: 16.6, tokens: 40915, found: consistent },
	{
		run: 3,
		seconds: 17.9,
		tokens: 41037,
		found: [...consistent, 'upgrading is effortless']
	},
	{
		run: 4,
		seconds: 19.3,
		tokens: 41147,
		found: [...consistent, 'fundamentally reimagines how teams approach code quality']
	},
	{ run: 5, seconds: 16.4, tokens: 40926, found: consistent }
];

/** Every distinct finding across the five runs, consistent ones first. */
export const findings: { quote: string; runs: number }[] = [
	...consistent.map((quote) => ({ quote, runs: 5 })),
	{ quote: 'upgrading is effortless', runs: 1 },
	{ quote: 'fundamentally reimagines how teams approach code quality', runs: 1 }
];

export const valeReview = { seconds: 0.09, alerts: 14 };

export type Counting = {
	label: string;
	seconds: number;
	tokens: number;
	right: number;
	of: number;
	extra: number;
};

export const counting: Counting[] = [
	{ label: 'Model, run 1', seconds: 46.7, tokens: 45070, right: 14, of: 14, extra: 0 },
	{ label: 'Model, run 2', seconds: 46.3, tokens: 45066, right: 14, of: 14, extra: 0 },
	{ label: 'Model, run 3', seconds: 46.6, tokens: 45064, right: 14, of: 14, extra: 0 },
	{ label: 'Vale, Direct.Length', seconds: 0.07, tokens: 0, right: 14, of: 14, extra: 2 }
];

export type Corpus = {
	name: string;
	files: number;
	words: number;
	tokens: number;
	valeSeconds: number;
	alerts: number;
};

export const corpora: Corpus[] = [
	{ name: 'vale.sh docs', files: 76, words: 49060, tokens: 84533, valeSeconds: 0.19, alerts: 448 },
	{ name: 'textbench', files: 9, words: 372618, tokens: 579823, valeSeconds: 1.28, alerts: 4256 },
	{
		name: 'Grafana docs',
		files: 777,
		words: 925338,
		tokens: 1693217,
		valeSeconds: 2.67,
		alerts: 15637
	}
];

/** List price per million input tokens, 2026-11-03. */
export const pricePerMillion = { 'Fable 5.1': 10, 'Sonnet 5.5': 2 };

export type Decay = {
	condition: string;
	run: number;
	seconds: number;
	tokens: number;
	kept: number;
	matched?: number;
	missed?: number;
	extra?: number;
};

export const decay: Decay[] = [
	{ condition: '10 rules, draft alone', run: 1, seconds: 15.1, tokens: 40804, kept: 18 },
	{ condition: '10 rules, draft alone', run: 2, seconds: 16.6, tokens: 40915, kept: 18 },
	{ condition: '10 rules, after 32k tokens', run: 1, seconds: 28.5, tokens: 103875, kept: 18 },
	{ condition: '10 rules, after 32k tokens', run: 2, seconds: 29.6, tokens: 103781, kept: 18 },
	{ condition: '10 rules, after 86k tokens', run: 1, seconds: 48.1, tokens: 203289, kept: 18 },
	{ condition: '10 rules, after 86k tokens', run: 2, seconds: 61.0, tokens: 204299, kept: 18 },
	{
		condition: '57 rules, draft alone',
		run: 1,
		seconds: 38.8,
		tokens: 49031,
		kept: 18,
		matched: 11,
		missed: 2,
		extra: 2
	},
	{
		condition: '57 rules, draft alone',
		run: 2,
		seconds: 38.6,
		tokens: 49279,
		kept: 18,
		matched: 11,
		missed: 2,
		extra: 4
	}
];

/** Vale's Microsoft-style alerts on the draft, the reference for the 57-rule runs. */
export const microsoftAlerts = 13;
