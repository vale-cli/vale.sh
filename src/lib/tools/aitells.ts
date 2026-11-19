import { maskMarkdown, type Span } from './text';

/**
 * Runs the ai-tells patterns (src/lib/data/tools/ai-tells.json, built by
 * script/tools.mjs) over a piece of text.
 *
 * Each rule becomes one or two regular expressions, compiled once when the
 * data loads. A scan is then a single pass per rule over the masked text,
 * which keeps a 10,000-word paste well under the debounce.
 */

export type RuleData = {
	name: string;
	extends: 'existence' | 'substitution' | 'repetition';
	level: string;
	message: string;
	scope: string;
	ignorecase?: boolean;
	nonword?: boolean;
	raw?: string;
	tokens?: string[];
	itokens?: string[];
	exceptions?: string[];
	iexceptions?: string[];
	swap?: [string, string][];
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

export function createDetector(data: PackageData): Detector {
	const compiled = data.rules.map(compile);

	function scan(text: string): Finding[] {
		const prose = maskMarkdown(text);
		// Heading rules see only the heading lines; everything else is blanked.
		const headings = prose.replace(/^(?![ \t]{0,3}#{1,6}[ \t]).*$/gm, (l) => ' '.repeat(l.length));
		const found: Finding[] = [];

		for (const c of compiled) {
			const target = c.rule.scope === 'heading' ? headings : c.rule.scope === 'raw' ? text : prose;

			const add = (from: number, match: string, message: string) => {
				if (!match.trim()) return;
				if (c.exceptions.some((e) => e.test(match))) return;
				found.push({ from, to: from + match.length, rule: c.rule.name, match, message });
			};

			for (const re of c.patterns) {
				re.lastIndex = 0;
				for (const m of target.matchAll(re)) {
					add(m.index ?? 0, m[0], fill(c.rule.message, m[0].trim()));
				}
			}
			for (const s of c.swaps ?? []) {
				s.re.lastIndex = 0;
				for (const m of target.matchAll(s.re)) {
					if (m[0].toLowerCase() === s.to.toLowerCase()) continue;
					add(m.index ?? 0, m[0], fill(c.rule.message, s.to, m[0]));
				}
			}
		}

		// Longest match first at each position, then drop anything a kept match
		// already covers: one phrase, one finding.
		found.sort((a, b) => a.from - b.from || b.to - a.to);
		const out: Finding[] = [];
		let end = -1;
		for (const f of found) {
			if (f.from >= end) {
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
