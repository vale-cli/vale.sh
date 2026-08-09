/**
 * Stages the source lines the hero demo marks up, into
 * src/lib/data/demo-context.json.
 *
 * The demo used to print Vale's alerts and nothing else, which asks the reader
 * to take a judgement on faith about a file they cannot see: "avoid
 * first-person plural like 'we'" -- in which sentence? Showing the line the
 * alert lands on turns the panel from a list of complaints into a
 * demonstration of the call Vale made.
 *
 * Every line is fetched from the project's own repository at the commit
 * demo-runs.ts already pins, so the demo stays as verifiable as it was.
 *
 * Each alert records the text Vale flagged, because Vale prints where an alert
 * starts but not how long it runs. That claim is checked here against the real
 * file: if the recorded text is not sitting at the recorded column, this exits
 * non-zero rather than emitting an offset that would highlight the wrong
 * words.
 *
 * Run with: node script/demo/main.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const RUNS = new URL('../../src/lib/data/demo-runs.ts', import.meta.url);
const OUT = new URL('../../src/lib/data/demo-context.json', import.meta.url);

/**
 * demo-runs.ts is TypeScript, so it is read rather than imported: this script
 * runs under plain node, and the file is a literal with no logic in it.
 */
function parseRuns(source) {
	const runs = [];
	const blocks = source.split(/\n\t\{\n/).slice(1);

	// Both quote styles, because prettier rewrites a single-quoted string to
	// double quotes as soon as it contains an apostrophe -- which silently made
	// `match: "Debian Developer's Guide"` invisible to a single-quote-only
	// pattern, and paired that alert with the next one's match.
	const STRING = `(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)")`;
	const unescape = (v) => v?.replace(/\\(['"\\])/g, '$1');

	for (const block of blocks) {
		const str = (key) => {
			const m = block.match(new RegExp(`${key}: ${STRING}`));
			return m ? unescape(m[1] ?? m[2]) : undefined;
		};

		const id = str('id');
		const repo = str('repo');
		const commit = str('commit');
		const file = str('file');
		if (!id || !repo || !commit || !file) continue;

		const alerts = [
			...block.matchAll(new RegExp(`loc: ${STRING},[\\s\\S]*?match: ${STRING}`, 'g'))
		].map((m) => {
			const loc = unescape(m[1] ?? m[2]);
			const match = unescape(m[3] ?? m[4]);
			const [line, col] = loc.split(':').map(Number);
			return { loc, line, col, match };
		});

		runs.push({ id, repo, commit, file, alerts });
	}

	return runs;
}

/**
 * Widens an alert's line to the whole sentence around it.
 *
 * Docker hard-wraps its prose, so the line an alert lands on is usually a
 * fragment: line 91 of services.md is "really have a node which can satisfy
 * it." Showing that on its own is worse than showing nothing, because the
 * reader cannot tell what Vale objected to.
 *
 * Wrapped neighbours are joined until a sentence boundary in both directions.
 * The returned `offset` shifts the alert's column into the joined text, and
 * `line` is the first line of the run so two alerts wrapped across different
 * lines of one sentence still land in the same excerpt.
 */
function sentence(lines, lineNo, col) {
	/*
		Only flowing prose is joined. Markup that happens to sit on its own line
		is not a continuation of the sentence above it, and treating it as one
		walked TI's paragraph back through a run of reStructuredText directives
		and into the page title eleven lines earlier.
	*/
	const isProse = (t) =>
		t !== undefined &&
		t.trim() !== '' &&
		// Headings, quotes, fences, tables, rst directives and field lists.
		!/^\s*(#|>|\||\+|```|:::|\.\.\s|:[\w-]+:)/.test(t) &&
		// Rule-off and section-underline runs: ***, ===, ---, ~~~.
		!/^\s*([*=~^"'#+-])\1{2,}\s*$/.test(t);

	const ends = (t) => /[.!?:][)"'`\]]*\s*$/.test(t.trimEnd());

	// A line that is not flowing prose -- a heading, a table row, a list item
	// standing alone -- is its own excerpt.
	if (!isProse(lines[lineNo - 1])) {
		return { excerpt: lines[lineNo - 1], offset: 0, line: lineNo };
	}

	// A sentence wrapped over more than a handful of lines is a sign the rules
	// above missed something, so the walk is bounded either way.
	const REACH = 5;

	let first = lineNo;
	while (
		first > 1 &&
		lineNo - first < REACH &&
		isProse(lines[first - 2]) &&
		!ends(lines[first - 2])
	)
		first -= 1;

	let last = lineNo;
	while (
		last < lines.length &&
		last - lineNo < REACH &&
		!ends(lines[last - 1]) &&
		isProse(lines[last])
	)
		last += 1;

	const parts = lines.slice(first - 1, last).map((t) => t.trim());
	const excerpt = parts.join(' ');

	// Columns are 1-based within the original line; the joined text puts
	// everything before it in front, plus one space per join.
	let offset = 0;
	for (let n = first; n < lineNo; n += 1) offset += lines[n - 1].trim().length + 1;
	offset -= lines[lineNo - 1].length - lines[lineNo - 1].trimStart().length;

	// If the arithmetic and the text ever disagree, the caller's check catches
	// it -- the span is validated against the excerpt below.
	return { excerpt, offset, line: first };
}

const source = await readFile(RUNS, 'utf8');
const runs = parseRuns(source);
if (runs.length === 0) throw new Error('no runs parsed from demo-runs.ts');

const context = {};
const problems = [];

for (const run of runs) {
	const url = `https://raw.githubusercontent.com/${run.repo}/${run.commit}/${run.file}`;
	const resp = await fetch(url, { signal: AbortSignal.timeout(20000) });
	if (!resp.ok) {
		problems.push(`${run.id}: HTTP ${resp.status} for ${url}`);
		continue;
	}
	const lines = (await resp.text()).split(/\r?\n/);

	// One entry per excerpt, not per alert: two alerts in the same sentence are
	// two marks on it, not the sentence twice.
	const byLine = new Map();
	for (const alert of run.alerts) {
		const text = lines[alert.line - 1];
		if (text === undefined) {
			problems.push(`${run.id} ${alert.loc}: file has only ${lines.length} lines`);
			continue;
		}

		const found = text.slice(alert.col - 1, alert.col - 1 + alert.match.length);
		if (found !== alert.match) {
			problems.push(
				`${run.id} ${alert.loc}: expected ${JSON.stringify(alert.match)}, found ${JSON.stringify(found)}`
			);
			continue;
		}

		const { excerpt, offset, line } = sentence(lines, alert.line, alert.col);
		const col = alert.col + offset;

		// The join shifts every column, so the match is re-checked against the
		// joined text. Verifying it on the raw line above proves the recorded
		// text is right; this proves the arithmetic that moved it is too.
		const inExcerpt = excerpt.slice(col - 1, col - 1 + alert.match.length);
		if (inExcerpt !== alert.match) {
			problems.push(
				`${run.id} ${alert.loc}: after joining, expected ${JSON.stringify(alert.match)} at ${col}, found ${JSON.stringify(inExcerpt)}`
			);
			continue;
		}

		if (!byLine.has(line))
			byLine.set(line, { label: alert.line, text: excerpt, spans: [], locs: [] });
		const group = byLine.get(line);
		// The label is the first alert's line, which is the one a reader can look
		// up; `line` only keys the excerpt.
		group.spans.push({ col, length: alert.match.length });
		group.locs.push(alert.loc);
	}

	// An array of groups rather than a map keyed by line: an excerpt can cover
	// several alert lines once wrapped sentences are joined, so the alerts it
	// belongs to are named outright instead of inferred from a key.
	context[run.id] = [...byLine.entries()]
		.sort((a, b) => a[0] - b[0])
		.map(([, v]) => ({
			label: v.label,
			text: v.text,
			spans: v.spans.sort((a, b) => a.col - b.col),
			locs: v.locs
		}));

	const marks = [...byLine.values()].reduce((n, v) => n + v.spans.length, 0);
	console.log(`${run.id}: ${byLine.size} excerpts, ${marks} marks`);
}

if (problems.length) {
	console.error('\nfailed:');
	problems.forEach((p) => console.error(`  ${p}`));
	process.exit(1);
}

await mkdir(new URL('.', OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(context, null, '\t') + '\n');
console.log(`\nwrote ${OUT.pathname}`);
