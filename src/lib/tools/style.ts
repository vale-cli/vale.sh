import type { Detector, RuleData } from './aitells';
import { sentenceGrade } from './readability';
import type { Sentence } from './text';

/**
 * What the readability checker marks in the editor.
 *
 * Hard sentences are computed here, from the same counts as the scores. The
 * word-level findings are not: they come from rules in the Microsoft, Red Hat
 * and Voices packages (src/lib/data/tools/style.json, built by
 * script/tools.mjs), so each one traces to a published style guide or a
 * tested rule set and names it.
 */

export type Highlight = {
	from: number;
	to: number;
	/** Matches a Category id in the page's legend. */
	category: string;
	/** What was found, in a sentence. */
	message: string;
	/** Where the advice comes from, shown under the message. */
	source?: string;
	/** A page to read more on, linked from the source line. */
	href?: string;
	/** Draw as a filled block or an underline, whatever the category says. */
	mark?: 'fill' | 'line';
	/**
	 * A one-click edit: replace the span with this. An empty string deletes
	 * it, and `extend` takes that many characters after the span too, so
	 * cutting a word doesn't leave two spaces behind.
	 */
	fix?: { label: string; replacement: string; extend?: number };
};

/** Carries a match's capitalization over to its replacement. */
const likeCase = (model: string, word: string) =>
	/^\p{Lu}/u.test(model) ? word[0].toUpperCase() + word.slice(1) : word;

/** Rule messages quote with straight apostrophes; the cards use real quotes. */
const quote = (message: string) => message.replace(/'([^']+)'/g, '“$1”');

/** Sentences long or dense enough to be worth splitting. */
export function hardSentences(split: Sentence[]): Highlight[] {
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
	return out;
}

/**
 * Runs the style rules over the text and turns each finding into a highlight,
 * with a fix where the rule defines one.
 */
export function wordFindings(text: string, detector: Detector, rules: RuleData[]): Highlight[] {
	const byName = new Map(rules.map((r) => [r.name, r]));

	return detector.scan(text).flatMap((f) => {
		const rule = byName.get(f.rule);
		if (!rule?.category) return [];

		const h: Highlight = {
			from: f.from,
			to: f.to,
			category: rule.category,
			message: quote(f.message),
			source: rule.guide
		};

		if (f.replacement) {
			const to = likeCase(f.match, f.replacement);
			h.fix = { label: `Use “${to}”`, replacement: to };
		} else if (rule.category === 'adverb') {
			h.fix = { label: 'Remove', replacement: '', extend: text[f.to] === ' ' ? 1 : 0 };
		}
		return [h];
	});
}
