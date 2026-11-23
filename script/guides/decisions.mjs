/**
 * Where a guide stands on the questions writers argue about, read from what
 * its rules do rather than what they are called.
 *
 * Each decision runs the guide's rules against a few probe sentences: a rule
 * that flags "e.g." and offers "for example" says the guide avoids Latin
 * abbreviations. A guide with no rule that reacts gets `none`, never a guess.
 */

import { decisions } from '../../src/lib/tools/decisions.ts';

/** The table's rows, in order. */
export const DECISIONS = decisions;

/* ---- Vale's regex flavor, in JavaScript ---------------------------------- */

const asList = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const strings = (v) => asList(v).filter((s) => typeof s === 'string');

/** Index of the `)` that closes the group opened at `start`, or -1. */
function closing(source, start) {
	let depth = 0;
	for (let i = start; i < source.length; i++) {
		if (source[i] === '\\') i++;
		else if (source[i] === '(') depth++;
		else if (source[i] === ')' && --depth === 0) return i;
	}
	return -1;
}

/** Every ASCII letter outside a class or escape as a two-case class. */
function caseless(body) {
	let out = '';
	let inClass = false;
	for (let i = 0; i < body.length; i++) {
		const c = body[i];
		if (c === '\\') {
			out += c + (body[i + 1] ?? '');
			i++;
		} else if (c === '[' || c === ']') {
			inClass = c === '[';
			out += c;
		} else if (!inClass && /[a-z]/i.test(c)) {
			out += `[${c.toLowerCase()}${c.toUpperCase()}]`;
		} else {
			out += c;
		}
	}
	return out;
}

/**
 * Case-insensitive parts of a pattern, which JavaScript can't scope: `(?i:x)`
 * and a mid-pattern `(?i)` both become explicit two-case classes.
 */
function scopeCase(source) {
	let out = source;
	// A bare `(?i)` lasts to the end of its group.
	for (let at = out.indexOf('(?i)'); at !== -1; at = out.indexOf('(?i)')) {
		let depth = 0;
		let end = out.length;
		for (let i = at + 4; i < out.length; i++) {
			if (out[i] === '\\') i++;
			else if (out[i] === '(') depth++;
			else if (out[i] === ')' && depth-- === 0) {
				end = i;
				break;
			}
		}
		out = `${out.slice(0, at)}(?i:${out.slice(at + 4, end)})${out.slice(end)}`;
	}
	for (let at = out.indexOf('(?i:'); at !== -1; at = out.indexOf('(?i:')) {
		const end = closing(out, at);
		if (end === -1) return null;
		out = `${out.slice(0, at)}(?:${caseless(out.slice(at + 4, end))})${out.slice(end + 1)}`;
	}
	return out;
}

/** A Vale pattern as a global RegExp, or null when JavaScript can't read it. */
export function compile(pattern, ignorecase = false) {
	let flags = ignorecase ? 'gi' : 'g';
	let body = pattern.replace(/^\(\?([ims]+)\)/, (_, f) => {
		for (const c of f) if (!flags.includes(c)) flags += c;
		return '';
	});
	body = scopeCase(
		body
			.replace(/\(\?-i\)/g, '')
			.replace(/\\z/g, '$')
			.replace(/\\A/g, '^')
	);
	if (body === null) return null;
	for (const f of [flags, `${flags}u`]) {
		try {
			return new RegExp(body, f);
		} catch {
			// try the next set of flags
		}
	}
	return null;
}

/** An existence rule's pattern, assembled as Vale assembles it. */
export function existencePattern(rule) {
	const tokens = strings(rule.tokens);
	const raw = strings(rule.raw).join('');
	let group = tokens.map((t) => `(?:${t})`).join('|');
	if (tokens.length) group = rule.nonword ? `(?:${group})` : `\\b(?:${group})\\b`;
	return rule.append ? group + raw : raw + group;
}

/** A rule's swap as [from, to] pairs; some guides write it as a list of maps. */
export function swaps(rule) {
	const pairs = [];
	for (const entry of asList(rule.swap)) {
		if (entry && typeof entry === 'object') {
			for (const [k, v] of Object.entries(entry)) pairs.push([String(k), String(v)]);
		}
	}
	return pairs;
}

/* ---- Running rules on probes --------------------------------------------- */

/** Whether a rule runs on body text, where the probes are. */
export function readsProse(rule) {
	const scopes = strings(rule.scope);
	return !scopes.length || scopes.some((s) => /^(?:~|text|sentence|paragraph|raw|summary)/.test(s));
}

/**
 * What a rule flags in `text`, as { match, use } where `use` is its
 * replacement. A match counts only if it takes in all of `target`, so a rule
 * about some other word in the probe doesn't answer the question.
 */
export function hits(rule, text, target) {
	if (!readsProse(rule)) return [];
	const at = text.indexOf(target);
	const covers = (m) => m.index <= at && m.index + m[0].length >= at + target.length;
	const exceptions = strings(rule.exceptions)
		.map((e) => compile(`^(?:${e})$`, !!rule.ignorecase))
		.filter(Boolean);
	const keep = (m) => covers(m) && !exceptions.some((e) => new RegExp(e).test(m[0]));

	const patterns =
		rule.extends === 'existence'
			? [[existencePattern(rule), undefined]]
			: rule.extends === 'substitution'
				? swaps(rule).map(([from, to]) => [
						rule.nonword ? `(?:${from})` : `\\b(?:${from})\\b`,
						to.split('|')[0]
					])
				: [];

	const out = [];
	for (const [pattern, use] of patterns) {
		const re = compile(pattern, !!rule.ignorecase);
		for (const m of re ? text.matchAll(re) : []) {
			if (keep(m)) out.push(use === undefined ? { match: m[0] } : { match: m[0], use });
		}
	}
	return out;
}

/** The first rule that reacts to any of the probes, and what it flagged. */
function first(rules, probes, accept = () => true) {
	for (const [text, target] of probes) {
		for (const rule of rules) {
			const h = hits(rule, text, target).find((x) => accept(x, rule));
			if (h) return { rule, target, ...h };
		}
	}
	return null;
}

/**
 * A cell: the answer, and the rule it came from. `example` is what the rule
 * flagged, with its replacement when it gives one.
 */
const cell = (value, label, found) =>
	found
		? {
				value,
				label,
				rule: found.rule.id,
				level: found.rule.level ?? 'warning',
				link: typeof found.rule.link === 'string' ? found.rule.link : '',
				example:
					found.use !== undefined
						? `${found.match.trim()} → ${found.use}`
						: (found.target ?? found.match).trim()
			}
		: { value: 'none', label: 'No rule' };

/* ---- The decisions -------------------------------------------------------- */

/** Heading case: a capitalization rule scoped to headings. */
function headings(rules) {
	for (const rule of rules) {
		if (rule.extends !== 'capitalization') continue;
		if (!strings(rule.scope).some((s) => s.startsWith('heading'))) continue;
		const found = { rule, match: rule.match };
		if (rule.match === '$sentence') return cell('sentence', 'Sentence case', found);
		if (rule.match === '$title') return cell('title', 'Title case', found);
	}
	return cell();
}

/** Serial comma: which of two four-item lists a rule objects to. */
function serialComma(rules) {
	const without = 'Install apples, pears, figs and plums.';
	const withIt = 'Install apples, pears, figs, and plums.';
	for (const rule of rules) {
		const a = hits(rule, without, 'figs and');
		const b = hits(rule, withIt, 'figs, and');
		if (a.length && !b.length) {
			return cell('required', 'Required', { rule, target: 'figs and plums', ...a[0] });
		}
		if (b.length && !a.length) {
			return cell('avoided', 'Avoided', { rule, target: 'figs, and plums', ...b[0] });
		}
	}
	return cell();
}

const CONTRACTED = /\w['’](?:t|s|re|ll|ve|d|m)\b/i;
const PAIRS = [
	["don't", 'do not'],
	["doesn't", 'does not'],
	["isn't", 'is not'],
	["can't", 'cannot'],
	["it's", 'it is'],
	["won't", 'will not'],
	["you're", 'you are']
];

/**
 * Contractions: a vote over common pairs. Only substitutions vote, since they
 * name a direction; a rule that merely flags "won't" is usually about tense.
 */
function contractions(rules) {
	let encourage = null;
	let discourage = null;
	let votes = 0;
	for (const [short, long] of PAIRS) {
		for (const rule of rules) {
			if (rule.extends !== 'substitution') continue;
			const toShort = hits(rule, `Note that ${long} matter.`, long).find((h) =>
				CONTRACTED.test(h.use)
			);
			const toLong = hits(rule, `Note that ${short} matter.`, short).find(
				(h) => !CONTRACTED.test(h.use)
			);
			if (toShort) {
				votes++;
				encourage ??= { rule, ...toShort };
			}
			if (toLong) {
				votes--;
				discourage ??= { rule, ...toLong };
			}
		}
	}
	if (votes > 0) return cell('encouraged', 'Encouraged', encourage);
	if (votes < 0) return cell('discouraged', 'Discouraged', discourage);
	if (encourage || discourage) return cell('mixed', 'Mixed', encourage ?? discourage);

	// No view on the common ones; a rule may still expand rarer ones.
	for (const rule of rules) {
		for (const [from, to] of swaps(rule)) {
			const word = from.replace(/\[[^\]]*['’][^\]]*\]/g, "'");
			if (/^[a-z]+['’][a-z]+$/i.test(word) && !CONTRACTED.test(to)) {
				return cell('uncommon', 'Rare ones only', { rule, match: word, use: to });
			}
		}
	}
	return cell();
}

/** First person plural: any rule that flags it. */
function we(rules) {
	const found = first(rules, [
		['We support three formats.', 'We'],
		["Let's install it.", "Let's"],
		['Our default is fine.', 'Our']
	]);
	return found ? cell('avoid', 'Avoid', found) : cell();
}

/** Second person: a rule that turns "the user" into "you", or one that flags "you". */
function you(rules) {
	const prefer = first(rules, [['Then the user restarts it.', 'the user']], (h) =>
		/\byou\b/i.test(h.use ?? '')
	);
	if (prefer) return cell('prefer', 'Prefer', prefer);
	const avoid = first(rules, [['Then you restart it.', 'you']], (h) => /^you$/i.test(h.match));
	return avoid ? cell('avoid', 'Avoid', avoid) : cell();
}

const LATIN = /\b(?:e\.g|i\.e)\b/i;

/**
 * Latin abbreviations. A rule that flags one wherever it appears and offers
 * English avoids them; one that fixes their punctuation or meaning uses them.
 */
function latin(rules) {
	const bare = [
		['Pick one, e.g. this one.', 'e.g'],
		['Pick one, i.e. this one.', 'i.e']
	];
	const uses = (h, rule) =>
		h.use !== undefined
			? LATIN.test(h.use)
			: /(?:use|write) ['"“‘]?(?:e\.g|i\.e)/i.test(String(rule.message ?? ''));
	const avoid = first(rules, bare, (h, rule) => !uses(h, rule));
	if (avoid) return cell('avoid', 'Avoid', avoid);
	const allow = first(rules, [...bare, ['Pick one, e.g., this one.', 'e.g']], uses);
	return allow ? cell('allow', 'Allowed', allow) : cell();
}

/** Numbers under 10: spelled out, or as numerals. */
function numbers(rules) {
	const words = first(rules, [['The cluster has 5 nodes.', '5']], (h) => !/\d/.test(h.use ?? ''));
	const numerals = first(rules, [['The cluster has five nodes.', 'five']], (h) =>
		/\d/.test(h.use ?? '')
	);
	if (words && numerals) return cell('mixed', 'Mixed', words);
	if (words) return cell('words', 'Spell out', words);
	if (numerals) return cell('numerals', 'Numerals', numerals);
	return cell();
}

/** Exclamation points in body text. */
function exclamation(rules) {
	const found = first(rules, [
		['This is great!', '!'],
		['Restart it now! Then continue.', '!']
	]);
	return found ? cell('avoid', 'Avoid', found) : cell();
}

/** Gendered terms, and other exclusionary ones. */
function inclusive(rules) {
	const gendered = first(rules, [
		['Ask the chairman first.', 'chairman'],
		['It takes more manpower.', 'manpower'],
		['Hi guys, welcome.', 'guys'],
		['Each user sets his password.', 'his'],
		['Ask him/her first.', 'him/her']
	]);
	const other = first(rules, [
		['Add the host to the whitelist.', 'whitelist'],
		['Add the host to the blacklist.', 'blacklist'],
		['Run a sanity check.', 'sanity check']
	]);
	if (gendered && other) return cell('both', 'Gendered + other', gendered);
	if (gendered) return cell('gendered', 'Gendered', gendered);
	if (other) return cell('other', 'Other only', other);
	return cell();
}

const DERIVE = {
	headings,
	serialComma,
	contractions,
	we,
	you,
	latin,
	numbers,
	exclamation,
	inclusive
};

/**
 * Every decision for one guide. `rules` are parsed rule files, each with an
 * `id` ("google.Latin") beside its own keys.
 */
export function decide(rules) {
	return Object.fromEntries(DECISIONS.map((d) => [d.id, DERIVE[d.id](rules)]));
}
