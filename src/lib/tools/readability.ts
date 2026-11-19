import type { Counts } from './text';

/**
 * The seven readability formulas, written as Vale's Readability package writes
 * them (github.com/vale-cli/readability), with that package's thresholds. A
 * score here is the number `vale` reports for the same text.
 */

export type Formula = {
	id: string;
	name: string;
	/** What the number is: a US school grade, or a score on the formula's own scale. */
	kind: 'grade' | 'score';
	/** The package's target, as a sentence fragment. */
	target: string;
	/** True when the score misses the target. */
	over: (n: number) => boolean;
	compute: (c: Counts) => number;
	formula: string;
	/** What the formula rewards, in a sentence. */
	about: string;
	link: string;
};

const per = (a: number, b: number) => (b ? a / b : 0);

export const formulas: Formula[] = [
	{
		id: 'flesch-kincaid',
		name: 'Flesch–Kincaid grade',
		kind: 'grade',
		target: '8 or below',
		over: (n) => n > 8,
		compute: (c) => 0.39 * per(c.words, c.sentences) + 11.8 * per(c.syllables, c.words) - 15.59,
		formula: '0.39 × (words ÷ sentences) + 11.8 × (syllables ÷ words) − 15.59',
		about:
			'Sentence length and syllables per word, scaled to a US school grade. The US military adopted it in 1978 for its technical manuals, and it is the score most style guides quote.',
		link: 'https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests'
	},
	{
		id: 'flesch-reading-ease',
		name: 'Flesch reading ease',
		kind: 'score',
		target: '70 or above',
		over: (n) => n < 70,
		compute: (c) => 206.835 - 1.015 * per(c.words, c.sentences) - 84.6 * per(c.syllables, c.words),
		formula: '206.835 − 1.015 × (words ÷ sentences) − 84.6 × (syllables ÷ words)',
		about:
			'The same two inputs on a 0–100 scale where higher is easier. 60–70 is plain English; below 30 reads like an academic paper.',
		link: 'https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests'
	},
	{
		id: 'gunning-fog',
		name: 'Gunning fog index',
		kind: 'grade',
		target: '10 or below',
		over: (n) => n > 10,
		compute: (c) => 0.4 * (per(c.words, c.sentences) + 100 * per(c.polysyllables, c.words)),
		formula: '0.4 × ((words ÷ sentences) + 100 × (complex words ÷ words))',
		about:
			'Sentence length plus the share of words with three or more syllables. It punishes long words harder than Flesch–Kincaid does.',
		link: 'https://en.wikipedia.org/wiki/Gunning_fog_index'
	},
	{
		id: 'smog',
		name: 'SMOG grade',
		kind: 'grade',
		target: '10 or below',
		over: (n) => n > 10,
		compute: (c) => 1.043 * Math.sqrt(per(c.polysyllables * 30, c.sentences)) + 3.1291,
		formula: '1.043 × √(polysyllables × 30 ÷ sentences) + 3.1291',
		about:
			'Counts only polysyllabic words per sentence. Health writers prefer it because it predicts full comprehension, not partial, so it runs a grade or two higher.',
		link: 'https://en.wikipedia.org/wiki/SMOG'
	},
	{
		id: 'coleman-liau',
		name: 'Coleman–Liau index',
		kind: 'grade',
		target: '9 or below',
		over: (n) => n > 9,
		compute: (c) =>
			0.0588 * per(c.letters, c.words) * 100 - 0.296 * per(c.sentences, c.words) * 100 - 15.8,
		formula: '0.0588 × (letters per 100 words) − 0.296 × (sentences per 100 words) − 15.8',
		about:
			'Uses letters per word instead of syllables, so it never has to guess how a word is pronounced.',
		link: 'https://en.wikipedia.org/wiki/Coleman%E2%80%93Liau_index'
	},
	{
		id: 'automated-readability',
		name: 'Automated readability index',
		kind: 'grade',
		target: '8 or below',
		over: (n) => n > 8,
		compute: (c) => 4.71 * per(c.letters, c.words) + 0.5 * per(c.words, c.sentences) - 21.43,
		formula: '4.71 × (letters ÷ words) + 0.5 × (words ÷ sentences) − 21.43',
		about:
			'Letters per word and words per sentence. Designed in 1967 to be computed by a typewriter attachment as text was typed.',
		link: 'https://en.wikipedia.org/wiki/Automated_readability_index'
	},
	{
		id: 'lix',
		name: 'LIX',
		kind: 'score',
		target: '35 or below',
		over: (n) => n > 35,
		compute: (c) => per(c.words, c.sentences) + per(c.longWords * 100, c.words),
		formula: '(words ÷ sentences) + (long words × 100 ÷ words)',
		about:
			'Sentence length plus the percentage of words longer than six letters. It needs no syllable count, so it works across languages. 30–40 is easy, 50 and up is hard.',
		link: 'https://en.wikipedia.org/wiki/Lix_(readability_test)'
	}
];

export type Score = { formula: Formula; value: number; over: boolean };

export function score(c: Counts): Score[] {
	return formulas.map((formula) => {
		const value = formula.compute(c);
		return { formula, value, over: formula.over(value) };
	});
}

/** The mean of the five grade-level formulas: one number to put in the headline. */
export function consensus(scores: Score[]): number {
	const grades = scores.filter((s) => s.formula.kind === 'grade').map((s) => s.value);
	return grades.reduce((a, b) => a + b, 0) / (grades.length || 1);
}

/** Who can read a text at this grade, in the terms people search for. */
export function audience(grade: number): { label: string; detail: string } {
	if (grade < 6) return { label: 'Very easy', detail: 'An 11-year-old reads this comfortably.' };
	if (grade < 9) return { label: 'Plain English', detail: 'Most adults read this without effort.' };
	if (grade < 12)
		return { label: 'Fairly difficult', detail: 'High-school level. Fine for engaged readers.' };
	if (grade < 16)
		return { label: 'Difficult', detail: 'College level. Many readers will skim or leave.' };
	return { label: 'Very difficult', detail: 'Graduate level. Reads like an academic paper.' };
}

/** A sentence's own Flesch–Kincaid grade, for marking the hard ones. */
export function sentenceGrade(wordCount: number, syllableCount: number): number {
	return 0.39 * wordCount + 11.8 * per(syllableCount, wordCount) - 15.59;
}
