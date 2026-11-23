/**
 * The style decisions /guides compares guides on. script/guides/decisions.mjs
 * reads each guide's answer from its rules; the pages show them.
 */

export const decisions = [
	{ id: 'headings', label: 'Heading case', asks: 'Sentence case or title case in headings' },
	{ id: 'serialComma', label: 'Serial comma', asks: 'A comma before “and” in a list' },
	{ id: 'contractions', label: 'Contractions', asks: '“don’t” or “do not”' },
	{ id: 'we', label: 'First person “we”', asks: 'The writer speaking as “we”' },
	{ id: 'you', label: 'Second person “you”', asks: '“you” or “the user”' },
	{ id: 'latin', label: 'Latin abbreviations', asks: '“e.g.” and “i.e.”' },
	{ id: 'numbers', label: 'Numbers under 10', asks: '“five” or “5”' },
	{ id: 'exclamation', label: 'Exclamation points', asks: '“!” in body text' },
	{ id: 'inclusive', label: 'Gendered terms', asks: '“chairman”, “manpower”, “whitelist”' }
] as const;

export type DecisionId = (typeof decisions)[number]['id'];

export type Decision = {
	/** `none` when no rule answers it. */
	value: string;
	label: string;
	/** The rule that answers it: "google.Latin". */
	rule?: string;
	level?: string;
	link?: string;
	/** What the rule flagged, and its replacement when it gives one. */
	example?: string;
};
