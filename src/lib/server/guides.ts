import raw from '$lib/data/guides.json';
import termData from '$lib/data/guide-terms.json';
import configs from '$lib/data/config-stats.json';
import { replacement, termSlug, topics, type RuleSummary, type TopicId } from '$lib/tools/topics';

/**
 * The style guide explorer's data, shaped for its pages.
 *
 * Everything here runs at build time over src/lib/data/guides.json and
 * guide-terms.json (see script/guides.mjs). The pages are prerendered, so
 * none of these computations reach a browser.
 */

export type Guide = {
	id: string;
	name: string;
	full: string;
	kind: string;
	repo: string;
	commit: string;
	license: string;
	guide: string;
	guideHost: string;
	note: string;
	usedAs: string[];
	terms: number;
	rules: RuleSummary[];
};

export const guides = raw as unknown as Guide[];

export type Row = { find: string; use: string; rule: string; level: string; guide: string };

const LEVELS = ['suggestion', 'warning', 'error'];
const packed = termData as unknown as {
	guides: string[];
	rows: [string, string, string, number, number][];
};

export const rows: Row[] = packed.rows.map(([find, use, rule, level, g]) => ({
	find,
	use,
	rule,
	level: LEVELS[level],
	guide: packed.guides[g]
}));

/** How many of the sampled public Vale configs name this guide's style. */
export function usedBy(guide: Guide): number {
	const styles = (configs as unknown as { styles: Record<string, number> }).styles;
	return guide.usedAs.reduce((n, s) => n + (styles[s] ?? 0), 0);
}
export const sampleSize = (configs as unknown as { sampleSize: number }).sampleSize;

/** Rules per topic, in the topics' fixed order: a guide's fingerprint. */
export const fingerprint = (guide: Guide): number[] =>
	topics.map((t) => guide.rules.filter((r) => r.topic === t.id).length);

export type Card = {
	id: string;
	name: string;
	full: string;
	kind: string;
	license: string;
	rules: number;
	terms: number;
	usedBy: number;
	fingerprint: number[];
};

export const cards = (): Card[] =>
	guides.map((g) => ({
		id: g.id,
		name: g.name,
		full: g.full,
		kind: g.kind,
		license: g.license,
		rules: g.rules.length,
		terms: g.terms,
		usedBy: usedBy(g),
		fingerprint: fingerprint(g)
	}));

/** term (lowercased) → guide → what it says. */
function index() {
	const by = new Map<string, Map<string, Row>>();
	for (const r of rows) {
		const key = r.find.toLowerCase();
		if (!by.has(key)) by.set(key, new Map());
		if (!by.get(key)!.has(r.guide)) by.get(key)!.set(r.guide, r);
	}
	return by;
}

export type Shared = {
	term: string;
	count: number;
	/** The replacement at least half of those guides give, if there is one. */
	use: string;
};

/** The terms the most guides have a rule about. */
export function mostShared(limit = 18): Shared[] {
	return [...index().entries()]
		.filter(([term]) => term.length > 2)
		.map(([term, m]) => {
			const uses = [...m.values()].map((r) => r.use.toLowerCase()).filter(Boolean);
			const tally = new Map<string, number>();
			for (const u of uses) tally.set(u, (tally.get(u) ?? 0) + 1);
			const [top, n] = [...tally.entries()].sort((a, b) => b[1] - a[1])[0] ?? ['', 0];
			return { term, count: m.size, use: n * 2 >= m.size && top.length < 30 ? top : '' };
		})
		.sort((a, b) => b.count - a.count || a.term.localeCompare(b.term))
		.slice(0, limit);
}

export type Split = {
	/** Guides on each side, and a few of the word pairs they split on. */
	prefer: string[];
	avoid: string[];
	pairs: { a: string; b: string }[];
};

/**
 * Direct contradictions: one guide says write B for A, another says write A
 * for B. Grouped by which guides are on each side, since one disagreement
 * (contractions, say) shows up as dozens of word pairs.
 */
export function splits(): Split[] {
	const by = index();
	const groups = new Map<string, Split>();
	for (const [a, m] of by) {
		// Each wording this term is replaced with, once.
		const targets = new Set([...m.values()].map((r) => r.use.toLowerCase()));
		for (const b of targets) {
			if (!b || b === a || !by.has(b)) continue;
			// Each pair is met from both ends; take it from one.
			if (a > b) continue;
			const against = [...by.get(b)!.values()].filter((r) => r.use.toLowerCase() === a);
			if (!against.length) continue;
			// `prefer` writes b; `avoid` writes a.
			let prefer = [...m.values()].filter((r) => r.use.toLowerCase() === b).map((r) => r.guide);
			let avoid = against.map((r) => r.guide);
			// A guide with rules pointing both ways isn't taking a side.
			const both = new Set(prefer.filter((g) => avoid.includes(g)));
			prefer = prefer.filter((g) => !both.has(g));
			avoid = avoid.filter((g) => !both.has(g));
			if (!prefer.length || !avoid.length) continue;
			const key = `${prefer.sort().join()}|${avoid.sort().join()}`;
			if (!groups.has(key)) groups.set(key, { prefer, avoid, pairs: [] });
			groups.get(key)!.pairs.push({ a, b });
		}
	}
	return [...groups.values()].sort((x, y) => y.pairs.length - x.pairs.length);
}

export type Ruling = {
	guide: string;
	name: string;
	/** The spelling this guide's rule names. */
	find: string;
	/** What to write instead, when the rule gives a plain replacement. */
	use: string;
	/** The rule's advice, when it gives a sentence and not a replacement. */
	note: string;
	rule: string;
	level: string;
};

export type TermPage = {
	slug: string;
	/** The spellings that share this page, the most common first. */
	variants: string[];
	rulings: Ruling[];
	/** Each replacement given, with the guides that give it, the most common first. */
	answers: { use: string; guides: string[] }[];
	/** `agree`: one replacement. `split`: several. `avoid`: none. */
	verdict: 'agree' | 'split' | 'avoid';
	/** Guides that tell writers to use this term in place of another. */
	endorsed: { guide: string; name: string; instead: string }[];
};

let pages: TermPage[] | null = null;

/** One page per term that two or more guides have a rule about. */
export function termPages(): TermPage[] {
	if (pages) return pages;
	const name = Object.fromEntries(guides.map((g) => [g.id, g.name]));
	const order = Object.fromEntries(guides.map((g, i) => [g.id, i]));

	const groups = new Map<string, Row[]>();
	for (const r of rows) {
		const slug = termSlug(r.find);
		if (!slug) continue;
		if (!groups.has(slug)) groups.set(slug, []);
		groups.get(slug)!.push(r);
	}

	pages = [];
	for (const [slug, group] of groups) {
		// A guide's first rule on each spelling.
		const seen = new Set<string>();
		const rulings: Ruling[] = [];
		for (const r of group) {
			const key = `${r.guide}|${r.find.toLowerCase()}`;
			if (seen.has(key)) continue;
			seen.add(key);
			const use = replacement(r.use);
			rulings.push({
				guide: r.guide,
				name: name[r.guide],
				find: r.find,
				use,
				note: use ? '' : r.use,
				rule: r.rule,
				level: r.level
			});
		}
		if (new Set(rulings.map((r) => r.guide)).size < 2) continue;
		rulings.sort((a, b) => order[a.guide] - order[b.guide]);

		const count = new Map<string, number>();
		for (const r of rulings) {
			const v = r.find.toLowerCase();
			count.set(v, (count.get(v) ?? 0) + 1);
		}
		const variants = [...count.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v);

		// A replacement that is only another spelling of the term says which
		// spelling to use; it is counted, but it is not a different word.
		const tally = new Map<string, { use: string; guides: string[] }>();
		for (const r of rulings) {
			if (!r.use) continue;
			const key = r.use.toLowerCase();
			if (!tally.has(key)) tally.set(key, { use: r.use, guides: [] });
			if (!tally.get(key)!.guides.includes(r.name)) tally.get(key)!.guides.push(r.name);
		}
		const answers = [...tally.values()].sort((a, b) => b.guides.length - a.guides.length);

		const endorsed: TermPage['endorsed'] = [];
		for (const r of rows) {
			const use = replacement(r.use).toLowerCase();
			if (!use || !variants.includes(use) || variants.includes(r.find.toLowerCase())) continue;
			if (endorsed.some((e) => e.guide === r.guide)) continue;
			endorsed.push({ guide: r.guide, name: name[r.guide], instead: r.find });
		}

		pages.push({
			slug,
			variants,
			rulings,
			answers,
			verdict: answers.length === 0 ? 'avoid' : answers.length === 1 ? 'agree' : 'split',
			endorsed
		});
	}
	pages.sort((a, b) => a.variants[0].localeCompare(b.variants[0], 'en', { sensitivity: 'base' }));
	return pages;
}

/** How many flagged terms two guides have in common. */
export function overlap(
	guide: Guide
): { id: string; name: string; shared: number; share: number }[] {
	const mine = new Set(rows.filter((r) => r.guide === guide.id).map((r) => r.find.toLowerCase()));
	if (!mine.size) return [];
	return guides
		.filter((g) => g.id !== guide.id)
		.map((g) => {
			const theirs = new Set(rows.filter((r) => r.guide === g.id).map((r) => r.find.toLowerCase()));
			let shared = 0;
			for (const t of theirs) if (mine.has(t)) shared++;
			return { id: g.id, name: g.name, shared, share: shared / mine.size };
		})
		.filter((o) => o.shared > 0)
		.sort((a, b) => b.shared - a.shared);
}

export const totals = () => ({
	guides: guides.length,
	rules: guides.reduce((n, g) => n + g.rules.length, 0),
	terms: rows.length,
	distinct: index().size
});

export type { TopicId };
