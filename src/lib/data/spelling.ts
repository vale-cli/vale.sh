// The measurements behind the spell-checker comparison.
//
// Every number comes from textbench (https://github.com/jdkato/textbench):
// fifteen generated documents of 300 KB, each planting nonsense words in
// prose, which a tool should report, and in code, URLs, and comments-as-code,
// which it should not. Accuracy is scored on the marked document; time and
// memory are measured with hyperfine, five runs after a warm-up, on the
// document's clean twin, on an Apple Silicon Mac. Vale is at the release
// named in the post; cspell 10.0.1, typos 1.50.2, codespell 2.4.3, and
// textlint 15.7.1 with textlint-rule-spelling.

import results from './spelling-results.json';
import repo from './spelling-repo.json';

export type Tool = 'vale' | 'typos' | 'codespell' | 'cspell' | 'textlint';

export const tools: { id: Tool; label: string }[] = [
	{ id: 'vale', label: 'Vale' },
	{ id: 'typos', label: 'typos' },
	{ id: 'codespell', label: 'codespell' },
	{ id: 'cspell', label: 'cspell' },
	{ id: 'textlint', label: 'textlint' }
];

export type Cell = {
	// Planted misspellings reported, of `expected`.
	found: number;
	// Markers in code, URLs, or comments-as-code that were reported anyway.
	leaked: number;
	// Mean wall-clock seconds on the clean twin, and peak resident memory.
	seconds: number;
	mb: number;
	// The same tool held to the markup by its own documented ignore
	// patterns, where it has such a run.
	tuned?: Cell;
};

export type Row = {
	format: string;
	label: string;
	family: 'prose' | 'source' | 'data';
	expected: number;
	tools: Partial<Record<Tool, Cell>>;
};

// The rows come from script/spelling-rows.mjs, which copies them out of a
// textbench results.json; nothing here is typed by hand.
export const rows = results.rows as Row[];
export const versions = results.versions as Partial<Record<string, string>>;

export const families: { id: Row['family']; label: string }[] = [
	{ id: 'prose', label: 'Prose' },
	{ id: 'source', label: 'Source code' },
	{ id: 'data', label: 'Data' }
];

// Scale: each tool on one 3 MB document, ten times the corpus size, and on
// a repository of 140 files (40 MB): ten copies of every markup format's
// clean twin. hyperfine, three runs after a warm-up; peak resident memory
// from /usr/bin/time on one run.
export type ScaleBar = {
	label: string;
	ours: boolean;
	seconds: number;
	mb: number;
	detail?: string;
};

export type Scale = { id: string; label: string; tools: ScaleBar[] };

export const scale: Scale[] = [
	{
		id: 'md-3mb',
		label: 'A 3 MB Markdown document',
		tools: [
			{
				label: 'codespell',
				ours: false,
				seconds: 0.317,
				mb: 45,
				detail: 'Python. Reads the file as text.'
			},
			{ label: 'cspell', ours: false, seconds: 1.042, mb: 229, detail: 'Node. Reads every token.' },
			{
				label: 'Vale',
				ours: true,
				seconds: 1.047,
				mb: 157,
				detail: 'Parsed as Markdown; code blocks, spans, and URLs skipped.'
			},
			{ label: 'typos', ours: false, seconds: 1.085, mb: 454, detail: 'Rust. Reads every token.' }
		]
	},
	{
		id: 'rst-3mb',
		label: 'A 3 MB reStructuredText document',
		tools: [
			{
				label: 'codespell',
				ours: false,
				seconds: 0.392,
				mb: 45,
				detail: 'Reads the file as text.'
			},
			{ label: 'typos', ours: false, seconds: 1.135, mb: 467, detail: 'Reads every token.' },
			{ label: 'cspell', ours: false, seconds: 1.238, mb: 211, detail: 'Reads every token.' },
			{
				label: 'Vale',
				ours: true,
				seconds: 25.233,
				mb: 288,
				detail: 'Docutils converts the document; the wait is Docutils.'
			}
		]
	}
];

// Samples: one excerpt per format, as each tool read it, from
// spelling-samples.json. The text is the benchmark document with its nonsense
// markers replaced by plausible words; every marker is a word no dictionary
// knows, so a tool that read the position reported it. `by` lists the tools
// that did, from the scored run, so a highlight is a measurement and not an
// illustration.
export type Span = {
	text: string;
	// A marker: 'prose' should be reported, 'code' should not.
	kind?: 'prose' | 'code';
	by?: Tool[];
	// What the position is, for the caption under a highlight.
	what?: string;
};

export type Sample = {
	id: string;
	family: Row['family'];
	label: string;
	// The shiki grammar the excerpt is highlighted with.
	lang: string;
	file: string;
	lines: Span[][];
};

// Repositories: twenty copies of each format's clean twin in a directory of
// their own, one invocation per tool. hyperfine, three runs after a warm-up;
// peak resident memory from /usr/bin/time on one run. From
// script/spelling-repo.mjs.
export type RepoCell = { seconds: number; user: number; mb: number };

export const repos = repo as {
	files: number;
	rows: Record<string, Partial<Record<Tool, RepoCell>>>;
};
