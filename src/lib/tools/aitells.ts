import { maskMarkdown, sentences, type Span } from './text';

/**
 * Runs Vale rules in the browser, from the data script/tools.mjs builds out of
 * each package: the ai-tells patterns, the readability checker's word rules,
 * and the style guides.
 *
 * Each rule becomes one or two regular expressions, compiled once when the
 * data loads. A scan is then a pass per rule over the masked text, which keeps
 * a 10,000-word paste well under the debounce.
 *
 * This is not Vale. It evaluates the rule types a regular expression can
 * express and applies scopes approximately: headings are Markdown headings,
 * and a sentence is whatever ./text splits. The build lists what it left out.
 */

export type RuleData = {
	name: string;
	extends:
		| 'existence'
		| 'substitution'
		| 'repetition'
		| 'conditional'
		| 'occurrence'
		| 'capitalization';
	level: string;
	message: string;
	/** The section of the style guide the rule enforces. */
	link?: string;
	scope: string;
	/** conditional: `first` needs a `second` somewhere that defines it. */
	first?: string;
	second?: string;
	/** occurrence: at most `max` matches of `token` in a sentence. */
	token?: string;
	max?: number;
	/** capitalization: the share of a heading's words that must conform. */
	threshold?: number;
	indicators?: string[];
	ignorecase?: boolean;
	nonword?: boolean;
	raw?: string;
	tokens?: string[];
	itokens?: string[];
	exceptions?: string[];
	iexceptions?: string[];
	swap?: [string, string][];
	/** Set by script/tools.mjs for the readability checker's rules. */
	category?: string;
	guide?: string;
};

export type PackageData = {
	name: string;
	homepage: string;
	version: string;
	rules: RuleData[];
	skipped: { name: string; why: string }[];
};

export type Finding = Span & {
	rule: string;
	match: string;
	/** The rule's own message, with the match filled in. */
	message: string;
	/** For a substitution rule: what the rule says to write instead. */
	replacement?: string;
	/** A whole sentence or heading, which other findings may sit inside. */
	block?: boolean;
};

type Compiled = {
	rule: RuleData;
	patterns: RegExp[];
	exceptions: RegExp[];
	swaps?: { re: RegExp; to: string }[];
};

const safe = (source: string, flags: string) => {
	try {
		return new RegExp(source, flags);
	} catch {
		return null; // a pattern this browser's engine can't run
	}
};

function compile(rule: RuleData): Compiled {
	const patterns: RegExp[] = [];
	const wrap = (tokens: string[]) =>
		(rule.raw ?? '') + (rule.nonword ? `(?:${tokens.join('|')})` : `\\b(?:${tokens.join('|')})\\b`);

	if (rule.extends === 'existence') {
		if (rule.tokens?.length || rule.raw) {
			const re = safe(wrap(rule.tokens ?? []), rule.ignorecase ? 'gim' : 'gm');
			if (re) patterns.push(re);
		}
		if (rule.itokens?.length) {
			const re = safe(wrap(rule.itokens), 'gim');
			if (re) patterns.push(re);
		}
	} else if (rule.extends === 'repetition') {
		patterns.push(/\b(\p{L}+)(\s+\1)+\b/giu);
	}

	const exceptions: RegExp[] = [];
	if (rule.exceptions?.length) {
		const re = safe(`(?:${rule.exceptions.join('|')})`, rule.ignorecase ? 'i' : '');
		if (re) exceptions.push(re);
	}
	if (rule.iexceptions?.length) {
		const re = safe(`(?:${rule.iexceptions.join('|')})`, 'i');
		if (re) exceptions.push(re);
	}

	const swaps =
		rule.extends === 'substitution'
			? (rule.swap ?? []).flatMap(([from, to]) => {
					const re = safe(
						rule.nonword ? `(?:${from})` : `\\b(?:${from})\\b`,
						rule.ignorecase ? 'gim' : 'gm'
					);
					return re ? [{ re, to }] : [];
				})
			: undefined;

	return { rule, patterns, exceptions, swaps };
}

export type Detector = { rules: number; scan: (text: string) => Finding[] };

/** Fills a rule's %s placeholders in order. */
const fill = (message: string, ...args: string[]) => {
	let i = 0;
	return message.replace(/%s/g, () => args[Math.min(i++, args.length - 1)] ?? '');
};

export function createDetector(data: Pick<PackageData, 'rules'>): Detector {
	const compiled = data.rules.map(compile);
	const needSentences = data.rules.some((r) => r.scope === 'sentence');

	function scan(text: string): Finding[] {
		const prose = maskMarkdown(text);
		// Heading rules see only the heading lines; everything else is blanked.
		const headings = prose.replace(/^(?![ \t]{0,3}#{1,6}[ \t]).*$/gm, (l) => ' '.repeat(l.length));
		const split = needSentences ? sentences(prose) : [];
		const found: Finding[] = [];

		for (const c of compiled) {
			const rule = c.rule;
			const target = rule.scope === 'heading' ? headings : rule.scope === 'raw' ? text : prose;

			const add = (from: number, match: string, message: string, extra: Partial<Finding> = {}) => {
				if (!match.trim()) return;
				// Vale checks a paragraph at a time, so nothing matches across two.
				if (!extra.block && /\n[ \t]*\n/.test(match)) return;
				if (c.exceptions.some((e) => e.test(match))) return;
				// A pattern's leading or trailing space isn't part of what it found.
				const lead = match.length - match.trimStart().length;
				const body = match.trim();
				found.push({
					from: from + lead,
					to: from + lead + body.length,
					rule: rule.name,
					match: body,
					message,
					...extra
				});
			};

			/*
				A sentence-scoped rule is run one sentence at a time, because its
				pattern may anchor on the sentence's start or end.
			*/
			const pieces =
				rule.scope === 'sentence'
					? split.map((s) => ({ text: prose.slice(s.from, s.to), at: s.from }))
					: [{ text: target, at: 0 }];

			if (rule.extends === 'occurrence' && rule.token && rule.max != null) {
				const re = safe(rule.token, 'g');
				for (const piece of re ? pieces : []) {
					const n = (piece.text.match(re!) ?? []).length;
					if (n > rule.max) {
						add(piece.at, piece.text, rule.message.replace(/%[sd]/g, String(n)), { block: true });
					}
				}
				continue;
			}

			if (rule.extends === 'conditional' && rule.first && rule.second) {
				const first = safe(rule.first, rule.ignorecase ? 'gi' : 'g');
				const second = safe(rule.second, rule.ignorecase ? 'gi' : 'g');
				if (!first || !second) continue;
				// Everything the text defines: "Portable Document Format (PDF)".
				const defined = new Set([...prose.matchAll(second)].map((m) => m[1] ?? m[0]));
				const skip = new Set(rule.exceptions ?? []);
				const seen = new Set<string>();
				for (const m of prose.matchAll(first)) {
					const term = m[1] ?? m[0];
					// Once per term: the first use is where the definition belongs.
					if (defined.has(term) || skip.has(term) || seen.has(term)) continue;
					seen.add(term);
					found.push({
						from: m.index,
						to: m.index + m[0].length,
						rule: rule.name,
						match: m[0],
						message: fill(rule.message, term)
					});
				}
				continue;
			}

			if (rule.extends === 'capitalization') {
				const skip = new Set(rule.exceptions ?? []);
				for (const m of prose.matchAll(/^[ \t]{0,3}#{1,6}[ \t]+(.+?)[ \t#]*$/gm)) {
					const heading = m[1];
					const list = heading.split(/\s+/).filter((w) => /\p{L}/u.test(w));
					if (list.length < 2) continue;
					let ok = 0;
					list.forEach((raw, i) => {
						const w = raw.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
						const after = i > 0 && rule.indicators?.some((ind) => list[i - 1].endsWith(ind));
						const capital = /^\p{Lu}/u.test(w);
						if (i === 0 || after) ok += capital ? 1 : 0;
						// A name, an acronym, or a word with a capital inside is left alone.
						else if (!capital || skip.has(w) || w === w.toUpperCase() || /.\p{Lu}/u.test(w)) ok++;
					});
					if (ok / list.length < (rule.threshold ?? 0.8)) {
						const from = m.index + m[0].indexOf(heading);
						found.push({
							from,
							to: from + heading.length,
							rule: rule.name,
							match: heading,
							message: fill(rule.message, heading),
							block: true
						});
					}
				}
				continue;
			}

			for (const piece of pieces) {
				for (const re of c.patterns) {
					re.lastIndex = 0;
					for (const m of piece.text.matchAll(re)) {
						add(piece.at + m.index, m[0], fill(rule.message, m[0].trim()));
					}
				}
				for (const s of c.swaps ?? []) {
					s.re.lastIndex = 0;
					for (const m of piece.text.matchAll(s.re)) {
						// A rule can offer several words ("aim|goal"); the first is its
						// preferred one, and what a one-click fix writes.
						const options = s.to.split('|');
						if (options.some((o) => o.toLowerCase() === m[0].toLowerCase())) continue;
						add(piece.at + m.index, m[0], fill(rule.message, options.join('” or “'), m[0]), {
							replacement: options[0]
						});
					}
				}
			}
		}

		// Longest match first at each position, then drop anything a kept match
		// already covers: one phrase, one finding. Whole sentences and headings
		// are kept apart, since a word-level finding can sit inside one.
		found.sort((a, b) => a.from - b.from || b.to - a.to);
		const out: Finding[] = [];
		let end = -1;
		for (const f of found) {
			if (f.block) out.push(f);
			else if (f.from >= end) {
				out.push(f);
				end = f.to;
			}
		}
		return out;
	}

	return { rules: compiled.length, scan };
}

/** "OverusedVocabulary" → "Overused vocabulary". */
export const ruleLabel = (name: string) =>
	name
		.replace(/^AI(?=[A-Z])/, '')
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/^(.)(.*)$/, (_, a: string, b: string) => a + b.toLowerCase());

/**
 * Bands for tells per 1,000 words. These are a reading aid, not a calibrated
 * classifier: the thresholds are a rule of thumb, and the page says so.
 */
export function density(per1k: number): { label: string; level: 0 | 1 | 2 | 3 } {
	if (per1k === 0) return { label: 'None found', level: 0 };
	if (per1k < 5) return { label: 'Light', level: 1 };
	if (per1k < 15) return { label: 'Noticeable', level: 2 };
	return { label: 'Heavy', level: 3 };
}

/**
 * Sorts a rule into one of five kinds, by its name. The package has well over
 * a hundred rules; a writer needs to know what sort of fix each calls for, not
 * which of them fired.
 */
export function family(
	rule: string
): 'vocabulary' | 'structure' | 'filler' | 'figurative' | 'heading' {
	if (/^Modelese\./.test(rule)) return 'filler';
	if (/Headings$/.test(rule)) return 'heading';
	if (/^Figurative|Metaphors$|^Anthropomorphic|^Bare/.test(rule)) return 'figurative';
	if (
		/Vocabulary|CompoundPhrases|Buzzwords|Overuse$|Puffery|FormalRegister|HouseStyle|Urgency|Intensifier/.test(
			rule
		)
	) {
		return 'vocabulary';
	}
	if (
		/Hedg|Filler|Opening|Closing|Conclusion|Metacommentary|Sycophancy|Hollow|Transitions|Sequencing|ListIntro|Announcements|SelfReference|Restatement|Affirmative|Vague|Unpack|Padding|Precaution/.test(
			rule
		)
	) {
		return 'filler';
	}
	return 'structure';
}
