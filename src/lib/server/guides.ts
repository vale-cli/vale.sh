import raw from '$lib/data/guides.json';
import termData from '$lib/data/guide-terms.json';
import configs from '$lib/data/config-stats.json';
import { topics, type RuleSummary, type TopicId } from '$lib/tools/topics';

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
