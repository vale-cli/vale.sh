/**
 * Title case in the styles people are actually asked to follow.
 *
 * The guides agree on most of a title — first word, nouns, verbs — and differ
 * on the small words. Each style below is those differences and nothing else,
 * so the page can show two styles side by side and have the diff mean
 * something.
 */

const ARTICLES = ['a', 'an', 'the'];

/** and, but, for, nor, or, so, yet. */
const COORDINATING = ['and', 'but', 'for', 'nor', 'or', 'so', 'yet'];

const PREPOSITIONS = (
	'aboard about above across after against along amid among around as at before behind below ' +
	'beneath beside besides between beyond by despite down during except for from in inside into ' +
	'like near of off on onto out outside over past per since than through throughout till to ' +
	'toward towards under underneath until unto up upon versus via vs with within without'
).split(' ');

const upTo = (list: string[], max: number) => list.filter((w) => w.length <= max);

export type StyleId = 'ap' | 'apa' | 'chicago' | 'mla' | 'sentence';

export type Style = {
	id: StyleId;
	name: string;
	/** Who uses it. */
	used: string;
	/** The rule for small words, stated the way the guide states it. */
	rule: string;
	/** Words kept lowercase unless first or last. */
	minor: Set<string>;
	/** Whether the last word is always capitalized. */
	capitalizeLast: boolean;
	source: string;
};

export const styles: Style[] = [
	{
		id: 'ap',
		name: 'AP',
		used: 'News, press releases, most marketing copy',
		rule: 'Capitalize words of four or more letters. Lowercase articles, conjunctions, and prepositions of three letters or fewer.',
		minor: new Set([...ARTICLES, ...upTo(COORDINATING, 3), ...upTo(PREPOSITIONS, 3), 'if']),
		capitalizeLast: true,
		source: 'https://www.apstylebook.com'
	},
	{
		id: 'apa',
		name: 'APA',
		used: 'Psychology, education, and social-science papers',
		rule: 'Capitalize words of four or more letters. Lowercase articles, conjunctions, and prepositions of three letters or fewer.',
		minor: new Set([...ARTICLES, ...upTo(COORDINATING, 3), ...upTo(PREPOSITIONS, 3), 'if']),
		// APA capitalizes the first word and the first after a colon, and has no
		// rule for the last word.
		capitalizeLast: false,
		source: 'https://apastyle.apa.org/style-grammar-guidelines/capitalization/title-case'
	},
	{
		id: 'chicago',
		name: 'Chicago',
		used: 'Books, magazines, and most blog headlines',
		rule: 'Lowercase articles, the conjunctions and, but, for, or, and nor, and prepositions of four letters or fewer. The 18th edition capitalizes longer prepositions.',
		minor: new Set([...ARTICLES, 'and', 'but', 'for', 'or', 'nor', ...upTo(PREPOSITIONS, 4)]),
		capitalizeLast: true,
		source: 'https://www.chicagomanualofstyle.org'
	},
	{
		id: 'mla',
		name: 'MLA',
		used: 'Humanities papers and works-cited lists',
		rule: 'Lowercase articles, coordinating conjunctions, and every preposition, whatever its length.',
		minor: new Set([...ARTICLES, ...COORDINATING, ...PREPOSITIONS]),
		capitalizeLast: true,
		source: 'https://style.mla.org'
	},
	{
		id: 'sentence',
		name: 'Sentence case',
		used: 'Google, Microsoft, and Red Hat documentation; AP news headlines',
		rule: 'Capitalize the first word and proper nouns, and nothing else.',
		minor: new Set(),
		capitalizeLast: false,
		source: 'https://developers.google.com/style/capitalization'
	}
];

export const styleById = (id: StyleId) => styles.find((s) => s.id === id)!;

/** iPhone, GitHub, eBay, macOS: a capital after the first letter is deliberate. */
const hasInnerCapital = (w: string) => /^.+\p{Lu}/u.test(w) && /\p{Ll}/u.test(w);

/** NASA, API, HTTP — but not a whole shouted title, which is handled earlier. */
const isAcronym = (w: string) => /^[\p{Lu}\d]{2,}s?$/u.test(w);

const capitalize = (w: string) => {
	// Skip an opening quote or bracket to reach the first letter.
	const i = w.search(/[\p{L}\p{N}]/u);
	return i < 0 ? w : w.slice(0, i) + w[i].toUpperCase() + w.slice(i + 1);
};

/** The word without the punctuation around it, lowercased, for list lookups. */
const bare = (w: string) => w.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}.]+$/gu, '');

/**
 * Converts one line to a style.
 *
 * Capitalization the writer chose is kept where it carries meaning: an inner
 * capital (iPhone) or an acronym (API) is never touched. A line typed entirely
 * in capitals carries none, so it is lowercased first.
 */
export function convert(line: string, id: StyleId): string {
	const style = styleById(id);
	const letters = line.replace(/[^\p{L}]/gu, '');
	const shouted = letters.length > 3 && letters === letters.toUpperCase();
	const source = shouted ? line.toLowerCase() : line;

	const tokens = source.split(/(\s+)/);
	const wordAt = tokens.map((t, i) => (/\S/.test(t) && /[\p{L}\p{N}]/u.test(t) ? i : -1));
	const indexes = wordAt.filter((i) => i >= 0);
	const first = indexes[0];
	const last = indexes[indexes.length - 1];

	let restart = true; // the next word starts the title or follows a colon
	return tokens
		.map((token, i) => {
			if (wordAt[i] < 0) return token;

			const starts = restart || i === first;
			// A colon, dash, or sentence end makes the next word a first word.
			restart = /[:?!—–]["'”’)\]]*$/.test(token) || /^[—–-]+$/.test(token);

			if (hasInnerCapital(token) || (!shouted && isAcronym(token.replace(/[^\p{L}\d]/gu, '')))) {
				return token;
			}

			if (id === 'sentence') {
				// Proper nouns can't be told from common ones, so a capital the
				// writer typed mid-title is trusted only if the line wasn't
				// already in title case.
				return starts ? capitalize(token.toLowerCase()) : token.toLowerCase();
			}

			const lower = token.toLowerCase();
			// The word before a colon or question mark closes a title of its own.
			const ends = style.capitalizeLast && (i === last || restart);
			if (starts || ends) return capitalizeParts(lower, style, true);
			if (style.minor.has(bare(lower))) return lower;
			return capitalizeParts(lower, style, false);
		})
		.join('');
}

/**
 * Capitalizes a word, treating each part of a hyphenated compound in turn:
 * "self-report" becomes "Self-Report", while "step-by-step" keeps its "by".
 */
function capitalizeParts(word: string, style: Style, edge: boolean): string {
	if (!word.includes('-')) return capitalize(word);
	return word
		.split('-')
		.map((part, i) => {
			if (i === 0) return capitalize(part);
			if (style.minor.has(bare(part)) && !edge) return part;
			return style.minor.has(bare(part)) ? part : capitalize(part);
		})
		.join('-');
}

/** Converts each line on its own, so a pasted list of headlines stays a list. */
export function convertAll(text: string, id: StyleId): string {
	return text
		.split('\n')
		.map((line) => (line.trim() ? convert(line, id) : line))
		.join('\n');
}

export const otherCases = [
	{ id: 'upper', name: 'UPPERCASE', apply: (s: string) => s.toUpperCase() },
	{ id: 'lower', name: 'lowercase', apply: (s: string) => s.toLowerCase() },
	{
		id: 'kebab',
		name: 'kebab-case',
		apply: (s: string) =>
			s
				.split('\n')
				.map((l) => (l.match(/[\p{L}\p{N}]+/gu) ?? []).join('-').toLowerCase())
				.join('\n')
	}
] as const;
