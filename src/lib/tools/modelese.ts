/**
 * The Modelese score: how much a text reads like a language model wrote it.
 *
 * A weighted sum of things that can be counted: how sentence lengths vary,
 * how often words repeat, how expected each word is, which function words
 * and punctuation marks turn up how often, and a few thousand phrases that
 * lean one way or the other. The weights, the word tables, and the
 * thresholds are data, built and measured in the Modelese repository
 * (script/export.py); this file is the same arithmetic as its
 * script/model.py, and tests/tools/modelese.test.mjs holds the two to the
 * same numbers.
 *
 * Nothing here decides who wrote a text. The thresholds are where 5% and 1%
 * of human writing lands, so a score over one still describes some people.
 */

export type ScoreData = {
	bias: number;
	features: { name: string; mean: number; sd: number; weight: number }[];
	phrases: Record<string, number>;
	/** The log-probability given to a word the table doesn't hold. */
	floor: number;
	words: Record<string, number>;
	/** null: the pair is known, but its first word is not in `words`. */
	pairs: Record<string, number | null>;
	thresholds: Record<string, { fp5: number; fp1: number; caught5?: number; caught1?: number }>;
};

const WORD = /[A-Za-z0-9]+(?:['’][A-Za-z]+)?/g;
const SENT = /(?<=[.!?])["')\]]*\s+/;
const PHRASE_WORD = /[a-z0-9]+(?:['’][a-z]+)?/g;

const FUNCTION = (
	'the of and to a in is that it for as with was on be by this are or an at from not have has had but ' +
	'which they you we he she his her their its can will would could should may might must been being were ' +
	'do does did if then than so such there these those what when where who how why all any some each many ' +
	'more most other also only just very into over about after before between through during under while ' +
	'because however therefore although though since until i me my your our us them him no nor yet both ' +
	'either neither one two often always never still even well too much own same out up down off again here'
).split(' ');
const MARKS = [...',.;:!?()"\'-/', '—', '–', '…', '%', '$', '&'];

const stats = (xs: number[]): [number, number] => {
	if (!xs.length) return [0, 0];
	const m = xs.reduce((a, b) => a + b, 0) / xs.length;
	return [m, Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / xs.length)];
};

const tally = <T>(xs: T[]) => {
	const out = new Map<T, number>();
	for (const x of xs) out.set(x, (out.get(x) ?? 0) + 1);
	return out;
};

const occurrences = (text: string, mark: string) => text.split(mark).length - 1;

/** Every measured feature of a text, by the name the data gives its weight under. */
export function measure(source: string, data: ScoreData): Map<string, number> {
	// Layout says where a text was collected, not how it was written.
	const text = source.split(/\s+/).filter(Boolean).join(' ');
	const f = new Map<string, number>();

	const words = text.match(WORD) ?? [];
	const lower = words.map((w) => w.toLowerCase());
	const n = Math.max(words.length, 1);
	const pieces = text.split(SENT);
	const sents = pieces.map((s) => (s.match(WORD) ?? []).length).filter((c) => c > 0);
	const count = Math.max(sents.length, 1);

	const [m, sd] = stats(sents);
	f.set('rhythm:sentence_mean', m);
	f.set('rhythm:sentence_cv', m ? sd / m : 0);
	f.set('rhythm:short', sents.filter((s) => s <= 6).length / count);
	f.set('rhythm:long', sents.filter((s) => s >= 30).length / count);
	let flat = 0;
	for (let i = 1; i < sents.length; i++) if (Math.abs(sents[i] - sents[i - 1]) <= 3) flat++;
	f.set('rhythm:flat', flat / Math.max(sents.length - 1, 1));

	const [lm, lsd] = stats(words.map((w) => w.length));
	f.set('words:length_mean', lm);
	f.set('words:length_sd', lsd);
	f.set('words:long', words.filter((w) => w.length > 6).length / n);
	const windows: number[] = [];
	if (lower.length >= 50) {
		for (let i = 0; i < Math.max(lower.length - 50, 1); i += 25) {
			windows.push(new Set(lower.slice(i, i + 50)).size / 50);
		}
	} else {
		windows.push(new Set(lower).size / n);
	}
	f.set('words:spread', windows.reduce((a, b) => a + b, 0) / windows.length);

	const counts = tally(lower);
	let once = 0;
	let top = 0;
	for (const c of counts.values()) {
		if (c === 1) once++;
		if (c > top) top = c;
	}
	f.set('words:once', once / n);
	f.set('words:top', top / n);

	const repeated = (size: number) => {
		const grams: string[] = [];
		for (let i = 0; i + size <= lower.length; i++) grams.push(lower.slice(i, i + size).join(' '));
		let total = 0;
		for (const c of tally(grams).values()) if (c > 1) total += c;
		return total / Math.max(lower.length - size + 1, 1);
	};
	f.set('words:repeated_pairs', repeated(2));
	f.set('words:repeated_triples', repeated(3));

	for (const w of FUNCTION) f.set('function:' + w, (counts.get(w) ?? 0) / n);

	const chars = Math.max(text.length, 1);
	for (const c of MARKS) f.set('marks:' + c, (occurrences(text, c) / chars) * 100);
	f.set('marks:upper', (text.match(/\p{Lu}/gu) ?? []).length / chars);
	f.set('marks:digit', (text.match(/\p{Nd}/gu) ?? []).length / chars);
	f.set('marks:contraction', words.filter((w) => /['’]/.test(w)).length / n);
	f.set('marks:lower_start', pieces.filter((s) => /^\p{Ll}/u.test(s)).length / count);

	const logp = (w: string) => data.words[w] ?? data.floor;
	const lp = lower.map(logp).sort((a, b) => a - b);
	const [sm, ssd] = stats(lp);
	f.set('surprise:mean', sm);
	f.set('surprise:sd', ssd);
	f.set('surprise:p10', lp.length ? lp[Math.floor(lp.length / 10)] : 0);
	f.set('surprise:p90', lp.length ? lp[Math.floor((lp.length * 9) / 10)] : 0);
	f.set('surprise:unknown', lower.filter((w) => !(w in data.words)).length / n);

	const cond: number[] = [];
	let known = 0;
	for (let i = 1; i < lower.length; i++) {
		const value = data.pairs[lower[i - 1] + ' ' + lower[i]];
		if (value !== undefined) known++;
		// A pair the table lacks backs off to the word alone, at a discount.
		cond.push(value != null ? value : logp(lower[i]) + Math.log(0.4));
	}
	const [pm, psd] = stats(cond);
	f.set('surprise:pair_mean', pm);
	f.set('surprise:pair_sd', psd);
	f.set('surprise:pair_known', known / Math.max(lower.length - 1, 1));

	return f;
}

export type Part = { name: string; value: number; contribution: number };

export type Scored = {
	score: number;
	/** What moved the score most, largest first: features, then phrases. */
	parts: Part[];
	words: number;
};

/** Scores a text, keeping what each feature and phrase added. */
export function score(text: string, data: ScoreData): Scored {
	const measured = measure(text, data);
	const parts: Part[] = [];
	let total = data.bias;

	for (const feature of data.features) {
		const value = measured.get(feature.name) ?? 0;
		const contribution = ((value - feature.mean) / feature.sd) * feature.weight;
		total += contribution;
		parts.push({ name: feature.name, value, contribution });
	}

	const tokens = text.toLowerCase().match(PHRASE_WORD) ?? [];
	const seen = new Set<string>();
	for (let size = 1; size <= 3; size++) {
		for (let i = 0; i + size <= tokens.length; i++) {
			const gram = tokens.slice(i, i + size).join(' ');
			const weight = data.phrases[gram];
			if (weight === undefined || seen.has(gram)) continue;
			seen.add(gram);
			total += weight;
			parts.push({ name: 'phrase:' + gram, value: 1, contribution: weight });
		}
	}

	parts.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
	return { score: total, parts, words: tokens.length };
}

/** Where a score sits against the share of human writing that exceeds it. */
export function band(
	value: number,
	data: ScoreData,
	register = 'general'
): { level: 0 | 1 | 2; label: string } {
	const t = data.thresholds[register] ?? data.thresholds.general;
	if (value > t.fp1) return { level: 2, label: 'Reads as model-written' };
	if (value > t.fp5) return { level: 1, label: 'Leans model-written' };
	return { level: 0, label: 'Within the range of human writing' };
}

const NAMED: Record<string, [more: string, less: string]> = {
	'rhythm:sentence_cv': ['Sentence lengths vary a lot', 'Sentence lengths barely vary'],
	'rhythm:sentence_mean': ['Long sentences', 'Short sentences'],
	'rhythm:short': ['Many short sentences', 'Few short sentences'],
	'rhythm:long': ['Many long sentences', 'Few long sentences'],
	'rhythm:flat': [
		'Neighboring sentences match in length',
		'Neighboring sentences differ in length'
	],
	'words:once': ['Many words used only once', 'Few words used only once'],
	'words:spread': ['A wide vocabulary', 'A narrow vocabulary'],
	'words:top': ['One word used very often', 'No word used very often'],
	'words:repeated_pairs': ['Word pairs repeat', 'Word pairs rarely repeat'],
	'words:repeated_triples': ['Three-word runs repeat', 'Three-word runs rarely repeat'],
	'words:length_mean': ['Long words', 'Short words'],
	'words:long': ['Many long words', 'Few long words'],
	'surprise:mean': ['Common words throughout', 'Uncommon words throughout'],
	'surprise:p10': ['Even the rarest words are common', 'Some very rare words'],
	'surprise:p90': ['The commonest words are very common', 'The commonest words are less common'],
	'surprise:unknown': ['Many unusual words', 'Few unusual words'],
	'surprise:pair_mean': [
		'Words follow each other predictably',
		'Words follow each other unpredictably'
	],
	'surprise:pair_known': ['Mostly familiar word pairs', 'Many unfamiliar word pairs'],
	'marks:contraction': ['Many contractions', 'Few contractions'],
	'marks:upper': ['Many capital letters', 'Few capital letters'],
	'marks:digit': ['Many digits', 'Few digits'],
	'marks:lower_start': ['Sentences starting in lowercase', 'No sentences starting in lowercase']
};

/**
 * Says what a part of the score is, in words a writer can act on. `more` is
 * whether the text has more of the thing than the average text does.
 */
export function describe(part: Part, data: ScoreData): string {
	const [group, name] = [
		part.name.slice(0, part.name.indexOf(':')),
		part.name.slice(part.name.indexOf(':') + 1)
	];
	if (group === 'phrase') return `Uses “${name}”`;

	const mean = data.features.find((f) => f.name === part.name)?.mean ?? 0;
	const more = part.value > mean;
	const named = NAMED[part.name];
	if (named) return named[more ? 0 : 1];
	if (group === 'function') return `${more ? 'Frequent' : 'Rare'} use of “${name}”`;
	if (group === 'marks') return `${more ? 'Frequent' : 'Rare'} use of “${name}”`;
	return `${more ? 'High' : 'Low'} ${name.replace(/_/g, ' ')}`;
}
