import { sentenceGrade } from './readability';
import type { Sentence } from './text';

/**
 * The word- and sentence-level checks the readability checker marks in the
 * editor: hard sentences, passive voice, adverbs, long words with a shorter
 * equivalent, and qualifiers.
 *
 * Every check is a guess from the surface of the text, and the messages are
 * worded that way. The point is to show a writer where to look, with the
 * numbers above as the reason to.
 */

export type Highlight = {
	from: number;
	to: number;
	/** Matches a Category id in the page's legend. */
	category: string;
	/** What was found, in a sentence. */
	message: string;
	/**
	 * A one-click edit: replace the span with this. An empty string deletes
	 * it, and `extend` takes that many characters after the span too, so
	 * cutting a word doesn't leave two spaces behind.
	 */
	fix?: { label: string; replacement: string; extend?: number };
};

/** Words ending in -ly that aren't adverbs, or that no one should cut. */
const NOT_ADVERBS = new Set(
	(
		'only family reply apply supply early likely unlikely daily weekly monthly yearly hourly ' +
		'nightly quarterly friendly lonely lovely ugly silly holy july italy rely ally belly bully ' +
		'jelly rally tally fly butterfly assembly anomaly monopoly multiply comply imply elderly ' +
		'orderly costly deadly lively timely worldly cowardly heavenly homely curly burly surly ' +
		'wobbly bubbly smelly hilly chilly oily wily jolly melancholy panoply probably previously'
	).split(' ')
);

/** Irregular past participles, for "was written" where -ed doesn't help. */
const IRREGULAR =
	'awoken|beaten|become|begun|bent|bitten|bled|blown|born|bought|bound|bred|broken|brought|built|' +
	'burnt|caught|chosen|cut|dealt|done|drawn|driven|eaten|fallen|fed|felt|fought|found|forbidden|' +
	'forgotten|forgiven|frozen|given|gone|grown|heard|held|hidden|hit|hurt|kept|known|laid|led|' +
	'left|lent|let|lost|made|meant|met|paid|put|read|ridden|risen|run|said|seen|sent|set|shaken|' +
	'shown|shut|sold|sought|spent|split|spoken|spread|stolen|struck|sung|sunk|sworn|swept|taken|' +
	'taught|thrown|told|thought|torn|understood|woken|won|worn|withdrawn|written';

/** -ed words after "is" or "was" that are adjectives far more often than verbs. */
const NOT_PARTICIPLES = new Set(
	'need indeed proceed exceed succeed speed feed seed bed red hundred sacred interested excited tired pleased supposed'.split(
		' '
	)
);

const PASSIVE = new RegExp(
	`\\b(am|are|is|was|were|be|been|being)\\s+(?:(?:not|never|also|just|already|\\w+ly)\\s+){0,2}(\\w{2,}ed|${IRREGULAR})\\b`,
	'gi'
);

/** A long word, and the short one that usually does the same job. */
const SIMPLER: Record<string, string> = {
	'a number of': 'many',
	accomplish: 'do',
	additional: 'more',
	additionally: 'also',
	advantageous: 'helpful',
	allocate: 'give',
	approximately: 'about',
	ascertain: 'find out',
	assistance: 'help',
	attempt: 'try',
	commence: 'start',
	component: 'part',
	consequently: 'so',
	demonstrate: 'show',
	determine: 'decide',
	'due to the fact that': 'because',
	eliminate: 'remove',
	endeavor: 'try',
	facilitate: 'help',
	'for the purpose of': 'to',
	frequently: 'often',
	functionality: 'feature',
	'has the ability to': 'can',
	implement: 'build',
	'in order to': 'to',
	'in the event that': 'if',
	indicate: 'show',
	individuals: 'people',
	initial: 'first',
	initiate: 'start',
	'is able to': 'can',
	methodology: 'method',
	modify: 'change',
	necessitate: 'need',
	necessitates: 'needs',
	numerous: 'many',
	obtain: 'get',
	'on a regular basis': 'regularly',
	optimal: 'best',
	participate: 'take part',
	'prior to': 'before',
	purchase: 'buy',
	regarding: 'about',
	remainder: 'rest',
	require: 'need',
	requires: 'needs',
	subsequently: 'later',
	sufficient: 'enough',
	terminate: 'end',
	'the majority of': 'most',
	utilization: 'use',
	utilize: 'use',
	utilizes: 'uses',
	utilizing: 'using',
	'with regard to': 'about',
	'with the exception of': 'except for'
};

const SIMPLER_RE = new RegExp(
	`\\b(${Object.keys(SIMPLER)
		.sort((a, b) => b.length - a.length)
		.join('|')})\\b`,
	'gi'
);

/** Words that soften a claim or pad a sentence. */
const QUALIFIERS = new RegExp(
	'\\b(' +
		[
			'very',
			'really',
			'quite',
			'rather',
			'somewhat',
			'just',
			'actually',
			'basically',
			'literally',
			'simply',
			'perhaps',
			'maybe',
			'sort of',
			'kind of',
			'a bit',
			'a little',
			'i think',
			'i believe',
			'i feel',
			'in my opinion',
			'it seems',
			'it appears',
			'needless to say',
			'to be honest'
		].join('|') +
		')\\b',
	'gi'
);

/** Carries a match's capitalization over to its replacement. */
const likeCase = (model: string, word: string) =>
	/^\p{Lu}/u.test(model) ? word[0].toUpperCase() + word.slice(1) : word;

/**
 * Finds everything worth marking. `prose` is the text with code and markup
 * blanked out (offsets unchanged), and `split` its sentences.
 */
export function analyze(prose: string, split: Sentence[]): Highlight[] {
	const out: Highlight[] = [];

	for (const s of split) {
		if (s.words < 12) continue;
		const grade = sentenceGrade(s.words, s.syllables);
		if (s.words > 30 || grade > 16) {
			out.push({
				from: s.from,
				to: s.to,
				category: 'very-hard',
				message: `${s.words} words, grade ${grade.toFixed(0)}. Split this sentence in two, or cut it down.`
			});
		} else if (s.words > 20 || grade > 12) {
			out.push({
				from: s.from,
				to: s.to,
				category: 'hard',
				message: `${s.words} words, grade ${grade.toFixed(0)}. Try shortening it or splitting it.`
			});
		}
	}

	const taken: [number, number][] = [];
	const free = (from: number, to: number) => !taken.some(([a, b]) => from < b && to > a);
	const add = (h: Highlight) => {
		if (!free(h.from, h.to)) return;
		taken.push([h.from, h.to]);
		out.push(h);
	};

	for (const m of prose.matchAll(SIMPLER_RE)) {
		const to = SIMPLER[m[0].toLowerCase()];
		add({
			from: m.index,
			to: m.index + m[0].length,
			category: 'simpler',
			message: `“${likeCase(m[0], to)}” says the same thing in fewer letters.`,
			fix: { label: `Use “${likeCase(m[0], to)}”`, replacement: likeCase(m[0], to) }
		});
	}

	for (const m of prose.matchAll(PASSIVE)) {
		if (NOT_PARTICIPLES.has(m[2].toLowerCase())) continue;
		add({
			from: m.index,
			to: m.index + m[0].length,
			category: 'passive',
			message: 'This may be passive voice. Say who did it, if that matters here.'
		});
	}

	for (const m of prose.matchAll(QUALIFIERS)) {
		// Deleting the word should take the space after it too.
		const space = prose[m.index + m[0].length] === ' ' ? 1 : 0;
		add({
			from: m.index,
			to: m.index + m[0].length,
			category: 'qualifier',
			message: 'A qualifier. The sentence is usually stronger without it.',
			fix: { label: 'Remove', replacement: '', extend: space }
		});
	}

	for (const m of prose.matchAll(/\b\p{L}{3,}ly\b/giu)) {
		if (NOT_ADVERBS.has(m[0].toLowerCase())) continue;
		add({
			from: m.index,
			to: m.index + m[0].length,
			category: 'adverb',
			message: 'An adverb. A more exact verb often makes it unnecessary.'
		});
	}

	return out.sort((a, b) => a.from - b.from || b.to - a.to);
}
