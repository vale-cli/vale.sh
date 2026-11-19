/**
 * Sorts a style guide's rules into the topics a reader would look them up
 * under, and describes what each rule looks for.
 *
 * The packages name their rules but don't group them, and three guides give
 * the same concern three names (`EmDash`, `Dashes`). Grouping by topic is what
 * lets the page draw a guide as a map and set the guides side by side.
 */

export const topics = [
	{ id: 'words', label: 'Word choice', blurb: 'Preferred terms, jargon, and words to avoid' },
	{ id: 'concision', label: 'Concision', blurb: 'Long sentences, filler, and wordy phrases' },
	{ id: 'voice', label: 'Voice and tone', blurb: 'Person, tense, contractions, and claims' },
	{ id: 'inclusive', label: 'Inclusive language', blurb: 'Gendered, ableist, and loaded terms' },
	{ id: 'punctuation', label: 'Punctuation', blurb: 'Commas, dashes, quotes, and spacing' },
	{ id: 'headings', label: 'Headings', blurb: 'Capitalization and punctuation in titles' },
	{ id: 'numbers', label: 'Numbers and dates', blurb: 'Dates, times, units, and ordinals' },
	{ id: 'abbreviations', label: 'Abbreviations', blurb: 'Acronyms, Latin, and periods' },
	{ id: 'source', label: 'Source hygiene', blurb: 'Leftovers that should not ship' }
] as const;

export type TopicId = (typeof topics)[number]['id'];

const MATCHERS: [TopicId, RegExp][] = [
	['source', /GitLinks|MergeConflict|SessionId|UserReplaced|PascalCamelCase/],
	['headings', /Heading|Gerunds|Titles/],
	['inclusive', /Gender|Bias|Accessib|Conscious|Militar/],
	['numbers', /Date|AMPM|Ordinal|Units|Percent|Negative|RangeTime|Ranges/],
	['abbreviations', /Acronym|Abbreviat|Definitions|Latin|Foreign|Periods/],
	[
		'punctuation',
		/Comma|Dash|Ellips|Exclamation|Colon|Semicolon|Quotes|Parens|Hyphen|Slash|Spacing|QuestionMark|Suspended|Symbols|Plurals/
	],
	['concision', /Adverb|Wordiness|SimpleWords|SentenceLength|Obvious|Repeated|Readability/],
	[
		'voice',
		/Passive|^We$|FirstPerson|Will|Contraction|Anthropomorph|ProductCentric|Timeless|Excessive|Conjunction|SelfReferential|Uppercase/
	]
];

/** `rule` is the name without its package: "OxfordComma". */
export function topicOf(rule: string): TopicId {
	for (const [id, re] of MATCHERS) if (re.test(rule)) return id;
	return 'words';
}

/** "OxfordComma" → "Oxford comma"; "AMPM" stays as it is. */
export const ruleTitle = (name: string) =>
	name
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
		.split(' ')
		.map((w, i) => (i === 0 || /^[A-Z]{2,}$/.test(w) ? w : w.toLowerCase()))
		.join(' ');

/** How each rule type decides, in words a writer would use. */
export const kinds: Record<string, string> = {
	existence: 'Flags these wherever they appear',
	substitution: 'Flags a term and names its replacement',
	repetition: 'Flags a word typed twice in a row',
	conditional: 'Flags an abbreviation the text never spells out',
	occurrence: 'Flags a sentence over the limit',
	capitalization: 'Flags a heading that isn’t in sentence case'
};

/** A pattern simple enough to show a reader as the thing it matches. */
const plain = (source: string) => /^[\p{L}\p{N}][\p{L}\p{N}'’ ./&-]*$/u.test(source);

/**
 * The plainest thing a pattern matches, or nothing if it isn't simple enough
 * to show. "e\.g\." is "e.g." to a reader, and `\b(?:eg|e\.g\.)[\s,]` is a
 * choice between two spellings with some boundary-matching around it.
 */
function readable(source: string): string | null {
	let core = source
		.replace(/^\(\?<[=!][^()]*\)|\(\?[=!][^()]*\)$/g, '') // a lookaround at either end
		.replace(/^\\b|\\b$/g, '')
		.replace(/\[[^\]]*\][?*+]?$/, '')
		.replace(/\\b$/, '');
	const group = /^\(\?:([^()]+)\)$/.exec(core);
	if (group) {
		// The longest alternative is usually the fullest spelling.
		core = group[1].split('|').sort((a, b) => b.length - a.length)[0];
	}
	core = core.replace(/\\([.\-/&'])/g, '$1');
	return plain(core) ? core : null;
}

export type RuleSummary = {
	/** "Google.OxfordComma" */
	id: string;
	title: string;
	topic: TopicId;
	level: string;
	kind: string;
	/** The rule's message, with its placeholders shown as a gap. */
	message: string;
	link: string;
	/** How many terms or patterns the rule carries. */
	size: number;
	/** A few of the things it flags, and what it suggests when it does. */
	examples: { find: string; use?: string }[];
};

type RawRule = {
	name: string;
	extends: string;
	level: string;
	message: string;
	link?: string;
	tokens?: string[];
	itokens?: string[];
	swap?: string[][];
	max?: number;
};

export function summarize(rule: RawRule): RuleSummary {
	const name = rule.name.slice(rule.name.indexOf('.') + 1);
	const tokens = [...(rule.tokens ?? []), ...(rule.itokens ?? [])];
	const swaps = rule.swap ?? [];

	const examples = swaps.length
		? swaps
				.flatMap(([from, to]) => {
					const find = readable(from);
					return find ? [{ find, use: to.split('|')[0] }] : [];
				})
				.slice(0, 8)
		: tokens
				.flatMap((t) => {
					const find = readable(t);
					return find ? [{ find }] : [];
				})
				.slice(0, 10);

	return {
		id: rule.name,
		title: ruleTitle(name),
		topic: topicOf(name),
		level: rule.level,
		kind:
			rule.extends === 'occurrence' && rule.max
				? `Flags a sentence over ${rule.max} words`
				: (kinds[rule.extends] ?? ''),
		message: rule.message.replace(/'?%[sd]'?/g, '…').replace(/\s+/g, ' '),
		link: rule.link ?? '',
		size: swaps.length || tokens.length || 1,
		examples
	};
}

export type Term = {
	/** The word or phrase the rule flags. */
	find: string;
	/** What it says to write instead, when it says. */
	use?: string;
	/** "google.WordList" */
	rule: string;
	level: string;
};

/**
 * Every term a rule names that can be shown as plain words: the guide's word
 * list, in effect. Patterns that aren't a word or a short choice of words are
 * left out, so this undercounts rules written as regular expressions.
 */
export function terms(rule: RawRule): Term[] {
	// A passive-voice rule lists irregular verbs, which aren't terms the guide
	// has a view on.
	if (/passive/i.test(rule.name)) return [];
	const out: Term[] = [];
	const seen = new Set<string>();
	const add = (source: string, use?: string) => {
		const find = readable(source);
		if (!find || find.length < 2 || seen.has(find.toLowerCase())) return;
		seen.add(find.toLowerCase());
		out.push({ find, use, rule: rule.name, level: rule.level });
	};
	for (const [from, to] of rule.swap ?? []) add(from, to.split('|')[0]);
	if (!rule.swap?.length) {
		for (const t of [...(rule.tokens ?? []), ...(rule.itokens ?? [])]) add(t);
	}
	return out;
}

/** A term's place under /guides/term: "ad hoc" and "ad-hoc" share one page. */
export const termSlug = (term: string) =>
	term
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

/**
 * A rule's `use` is a replacement ("blocklist") or a sentence of advice
 * ("Do not use ..."). Only the first can be counted and compared.
 */
export const replacement = (use: string) =>
	use.length > 48 || /^(?:do not|don['’]t|avoid|use |what )/i.test(use) ? '' : use;
