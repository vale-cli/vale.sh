/**
 * The text analysis every page under /tools shares: what counts as a word, a
 * sentence, a syllable. One definition, so the word counter and the
 * readability checker never disagree about the same paste.
 *
 * Everything here is a single pass over the string or close to it. The pages
 * re-run it on each keystroke (debounced), and a 50,000-word manuscript has to
 * stay under a frame or two.
 */

export type Span = { from: number; to: number };

export type Sentence = Span & { text: string; words: number; syllables: number };

/** A word: letters and digits, with inner apostrophes and hyphens kept. */
const WORD = /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu;

/**
 * Abbreviations whose period doesn't end a sentence. Without these, "Dr. Lee"
 * is two sentences and every readability score on the page drops a grade.
 */
const ABBREVIATIONS = new Set(
	(
		'mr mrs ms dr prof sr jr st vs etc inc ltd co corp no fig eq vol ed eds pp ' +
		'approx dept est gen gov rep sen col lt sgt capt e.g i.e a.m p.m u.s u.k'
	).split(' ')
);

/**
 * Blanks out the parts of Markdown that aren't prose — fenced and inline code,
 * URLs, HTML tags, comments — with spaces, so offsets into the result still
 * point at the same characters in the original.
 */
export function maskMarkdown(text: string): string {
	const blank = (m: string) => m.replace(/[^\n]/g, ' ');
	return text
		.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, blank)
		.replace(/<!--[\s\S]*?-->/g, blank)
		.replace(/`[^`\n]*`/g, blank)
		.replace(/https?:\/\/[^\s)>\]]+/g, blank)
		.replace(/<\/?[a-zA-Z][^>\n]*>/g, blank);
}

/** Drops Markdown's own punctuation so "## Title" counts as one word, not two. */
export function stripMarkdownSyntax(text: string): string {
	return text
		.replace(/^[ \t]{0,3}(#{1,6}|>|[-*+]|\d+[.)])[ \t]+/gm, (m) => ' '.repeat(m.length))
		.replace(/!?\[([^\]\n]*)\]\([^)\n]*\)/g, (m, label: string) =>
			(' ' + label).padEnd(m.length, ' ')
		)
		.replace(/[*_~|]/g, ' ');
}

export function words(text: string): string[] {
	return text.match(WORD) ?? [];
}

/**
 * Counts syllables by vowel groups, taking off the silent e and the -ed and
 * -es endings. This is the count Vale's Readability package documents for its
 * own rules, so a score here matches what `vale` reports on the same text.
 */
export function syllables(word: string): number {
	const w = word.toLowerCase().replace(/[^a-z]/g, '');
	if (!w) return 0;
	if (w.length <= 3) return 1;

	let n = (w.match(/[aeiouy]+/g) ?? []).length;
	if (w.endsWith('e') && !w.endsWith('le') && !w.endsWith('ee')) n--;
	if (w.endsWith('ed') && !/[td]ed$/.test(w)) n--;
	if (w.endsWith('es') && !/[sxz]es$|[cs]hes$/.test(w)) n--;
	return Math.max(n, 1);
}

/**
 * Splits prose into sentences, keeping each one's offsets.
 *
 * A sentence ends at ., ! or ? followed by whitespace and something that can
 * start a sentence — unless the word before the period is an abbreviation, a
 * single initial, or part of a number. A line break ends one too, which is
 * what makes headings and list items count without closing punctuation.
 */
export function sentences(text: string): Sentence[] {
	const out: Sentence[] = [];
	const push = (from: number, to: number) => {
		const raw = text.slice(from, to);
		const lead = raw.length - raw.trimStart().length;
		const body = raw.trim();
		if (!body) return;
		const list = words(body);
		if (!list.length) return;
		let syl = 0;
		for (const w of list) syl += syllables(w);
		out.push({
			from: from + lead,
			to: from + lead + body.length,
			text: body,
			words: list.length,
			syllables: syl
		});
	};

	const END = /([.!?]+["'”’)\]]*)(\s+)|\n\s*\n|\n/g;
	let start = 0;
	for (const m of text.matchAll(END)) {
		const at = m.index ?? 0;
		if (m[1]) {
			if (m[1].startsWith('.')) {
				const before = text.slice(Math.max(start, at - 12), at);
				const last = (before.match(/[\p{L}.]+$/u)?.[0] ?? '').toLowerCase();
				// "Dr.", "e.g.", a lone initial, or the next word isn't a start.
				if (ABBREVIATIONS.has(last) || /^\p{L}$/u.test(last)) continue;
				const next = text[at + m[0].length] ?? '';
				if (/[\p{Ll},;:]/u.test(next)) continue;
			}
			push(start, at + m[1].length);
			start = at + m[0].length;
		} else {
			push(start, at);
			start = at + m[0].length;
		}
	}
	push(start, text.length);
	return out;
}

export function paragraphs(text: string): number {
	return text.split(/\n\s*\n/).filter((p) => /\S/.test(p)).length;
}

export type Counts = {
	words: number;
	characters: number;
	charactersNoSpaces: number;
	letters: number;
	sentences: number;
	paragraphs: number;
	lines: number;
	syllables: number;
	/** Three syllables or more. */
	polysyllables: number;
	/** More than six letters, as LIX defines a long word. */
	longWords: number;
};

/** Counts over prose. Pass text already masked if code shouldn't count. */
export function count(text: string, split: Sentence[] = sentences(text)): Counts {
	const list = words(text);
	let syl = 0;
	let poly = 0;
	let long = 0;
	let letters = 0;
	for (const w of list) {
		const s = syllables(w);
		syl += s;
		if (s >= 3) poly++;
		const n = w.replace(/[^\p{L}\p{N}]/gu, '').length;
		letters += n;
		if (n > 6) long++;
	}
	return {
		words: list.length,
		// Code points, not UTF-16 units: an emoji is one character to a reader.
		characters: [...text].length,
		charactersNoSpaces: [...text.replace(/\s/g, '')].length,
		letters,
		sentences: split.length,
		paragraphs: paragraphs(text),
		lines: text ? text.split('\n').length : 0,
		syllables: syl,
		polysyllables: poly,
		longWords: long
	};
}

/** "3 min 20 sec" at a given pace, or "under a minute". */
export function duration(wordCount: number, wordsPerMinute: number): string {
	const seconds = Math.round((wordCount / wordsPerMinute) * 60);
	if (seconds < 1) return '0 sec';
	if (seconds < 60) return `${seconds} sec`;
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	if (m >= 60) return `${Math.floor(m / 60)} hr ${m % 60} min`;
	return s ? `${m} min ${s} sec` : `${m} min`;
}

/** Words too common to say anything about what a text is about. */
const STOP = new Set(
	(
		'a about above after again against all am an and any are as at be because been before being ' +
		'below between both but by can could did do does doing down during each few for from further ' +
		'had has have having he her here hers him his how i if in into is it its just me more most my ' +
		'no nor not now of off on once only or other our ours out over own same she should so some ' +
		'such than that the their theirs them then there these they this those through to too under ' +
		'until up very was we were what when where which while who whom why will with would you your ' +
		'yours also may might must shall s t d ll re ve m'
	).split(' ')
);

export type Keyword = { term: string; count: number; share: number };

/** The most frequent content words or phrases, with each one's share of the text. */
export function keywords(text: string, size: 1 | 2 | 3 = 1, limit = 10): Keyword[] {
	const list = words(text).map((w) => w.toLowerCase());
	if (!list.length) return [];
	const tally = new Map<string, number>();
	for (let i = 0; i + size <= list.length; i++) {
		const gram = list.slice(i, i + size);
		// A phrase that starts or ends on a stop word is a fragment of a better one.
		if (STOP.has(gram[0]) || STOP.has(gram[size - 1])) continue;
		if (gram.some((w) => /^\d+$/.test(w))) continue;
		const key = gram.join(' ');
		tally.set(key, (tally.get(key) ?? 0) + 1);
	}
	return [...tally.entries()]
		.filter(([, n]) => size === 1 || n > 1)
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
		.slice(0, limit)
		.map(([term, n]) => ({ term, count: n, share: (n * size) / list.length }));
}
