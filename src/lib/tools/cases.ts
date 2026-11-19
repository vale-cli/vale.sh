/**
 * Letter case for the case converter: the cases a writer uses (sentence,
 * capitalized) and the ones a programmer does (camel, snake, kebab).
 *
 * Every function works line by line, so a pasted list stays a list.
 */
import { convert } from './titlecase';

const lines = (text: string, each: (line: string) => string) =>
	text.split('\n').map(each).join('\n');

/** A name with a capital inside it, such as iPhone or GitHub: kept as typed. */
const named = (word: string) => /^\p{L}.*\p{Lu}/u.test(word) && /\p{Ll}/u.test(word);

/**
 * Lowercases caps lock and leaves acronyms: two or more words in capitals
 * side by side are shouting, and one among lowercase words is a name.
 */
export function calm(text: string): string {
	return text.replace(
		/\p{Lu}[\p{Lu}\p{N}'’]*(?:[^\p{L}\p{N}\n]+\p{Lu}[\p{Lu}\p{N}'’]*)+(?![\p{Ll}])/gu,
		(run) => (/\p{Lu}{2}/u.test(run) ? run.toLowerCase() : run)
	);
}

/**
 * Capitalizes the first word of each sentence and line and lowercases the
 * rest. Names with inner capitals and lone acronyms are left alone. "I" is
 * always capitalized.
 */
export function sentenceCase(text: string): string {
	const lowered = calm(text).replace(/[\p{L}\p{N}][\p{L}\p{N}'’]*/gu, (word) => {
		if (named(word) || /^\p{Lu}[\p{Lu}\p{N}]+$/u.test(word)) return word;
		return word.toLowerCase();
	});
	return lowered
		.replace(/(^|[.!?]["'”’)\]]*\s+|\n\s*)(["'“‘(\[]*)(\p{Ll})/gu, (_, before, open, letter) => {
			return before + open + letter.toUpperCase();
		})
		.replace(/(?<![\p{L}\p{N}'’])i(?=['’](?:m|d|ll|ve)\b|(?![\p{L}\p{N}'’]))/gu, 'I');
}

/** Every Word Capitalized, whatever its part of speech. */
export function capitalized(text: string): string {
	return calm(text).replace(/[\p{L}\p{N}][\p{L}\p{N}'’]*/gu, (word) =>
		named(word) ? word : word[0].toUpperCase() + word.slice(1)
	);
}

/** aLtErNaTiNg, counted over letters only. */
export function alternating(text: string): string {
	let n = 0;
	return text.replace(/\p{L}/gu, (c) => (n++ % 2 ? c.toUpperCase() : c.toLowerCase()));
}

/**
 * The words of an identifier or a phrase: split at anything that isn't a
 * letter or digit, and at the seams of camelCase ("parseHTTPResponse" is
 * parse, HTTP, Response).
 */
export function parts(line: string): string[] {
	return line
		.replace(/['’]/g, '')
		.replace(/(\p{Ll}|\p{N})(\p{Lu})/gu, '$1 $2')
		.replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2')
		.split(/[^\p{L}\p{N}]+/u)
		.filter(Boolean);
}

const cap = (w: string) => w[0].toUpperCase() + w.slice(1).toLowerCase();

export type Case = {
	id: string;
	name: string;
	/** What it is for, in a few words. */
	used: string;
	apply: (text: string) => string;
};

export const writing: Case[] = [
	{
		id: 'sentence',
		name: 'Sentence case',
		used: 'Body text, and headings in most documentation',
		apply: sentenceCase
	},
	{
		id: 'title',
		name: 'Title Case',
		used: 'Headlines and titles, in AP style',
		apply: (text) => lines(calm(text), (l) => convert(l, 'ap'))
	},
	{
		id: 'capitalized',
		name: 'Capitalized Case',
		used: 'Every word, including the short ones',
		apply: capitalized
	},
	{ id: 'upper', name: 'UPPERCASE', used: 'Labels and acronyms', apply: (t) => t.toUpperCase() },
	{
		id: 'lower',
		name: 'lowercase',
		used: 'Undoing caps lock; tags and handles',
		apply: (t) => t.toLowerCase()
	},
	{ id: 'alternating', name: 'aLtErNaTiNg', used: 'Mockery', apply: alternating }
];

export const code: Case[] = [
	{
		id: 'camel',
		name: 'camelCase',
		used: 'Variables in JavaScript, Java, and Go',
		apply: (text) =>
			lines(text, (l) =>
				parts(l)
					.map((w, i) => (i ? cap(w) : w.toLowerCase()))
					.join('')
			)
	},
	{
		id: 'pascal',
		name: 'PascalCase',
		used: 'Classes and types',
		apply: (text) => lines(text, (l) => parts(l).map(cap).join(''))
	},
	{
		id: 'snake',
		name: 'snake_case',
		used: 'Python and Ruby names, database columns',
		apply: (text) => lines(text, (l) => parts(l).join('_').toLowerCase())
	},
	{
		id: 'constant',
		name: 'CONSTANT_CASE',
		used: 'Constants and environment variables',
		apply: (text) => lines(text, (l) => parts(l).join('_').toUpperCase())
	},
	{
		id: 'kebab',
		name: 'kebab-case',
		used: 'URLs, file names, and CSS classes',
		apply: (text) => lines(text, (l) => parts(l).join('-').toLowerCase())
	},
	{
		id: 'dot',
		name: 'dot.case',
		used: 'Configuration keys',
		apply: (text) => lines(text, (l) => parts(l).join('.').toLowerCase())
	}
];
