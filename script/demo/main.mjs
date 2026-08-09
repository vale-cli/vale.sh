/**
 * Stages the hero demo's marked-up prose into src/lib/data/demo-context.json.
 *
 * The panel used to print Vale's alerts and nothing else, which asks the reader
 * to accept a judgement about a file they cannot see: "avoid first-person
 * plural like 'we'" never said in which sentence. It is a compiler error list
 * with the source withheld.
 *
 * The sample is demo-sample.md, in this repository, and the alerts in
 * demo-runs.ts are the real output of running Vale over it once per style. The
 * prose is hard-wrapped like the docs it imitates, so the four lines are joined
 * into one paragraph here and every column is shifted to match.
 *
 * Each alert records the text Vale flagged, because Vale prints where an alert
 * starts but not how far it runs. Both the raw column and the shifted one are
 * checked against the sample, and this exits non-zero rather than emitting an
 * offset that would highlight the wrong words.
 *
 * Run with: node script/demo/main.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';

const RUNS = new URL('../../src/lib/data/demo-runs.ts', import.meta.url);
const SAMPLE = new URL('../../src/lib/data/demo-sample.md', import.meta.url);
const OUT = new URL('../../src/lib/data/demo-context.json', import.meta.url);

/**
 * demo-runs.ts is TypeScript, so it is read rather than imported: this runs
 * under plain node, and the file is a literal with no logic in it.
 */
function parseRuns(source) {
	// Both quote styles, because prettier rewrites a single-quoted string to
	// double quotes as soon as it contains an apostrophe -- which silently made
	// one alert's match invisible to a single-quote-only pattern, and paired it
	// with the next alert's instead.
	const STRING = `(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)")`;
	const unescape = (v) => v?.replace(/\\(['"\\])/g, '$1');

	return source
		.split(/\n\t\{\n/)
		.slice(1)
		.map((block) => {
			const idMatch = block.match(new RegExp(`id: ${STRING}`));
			if (!idMatch) return null;

			const alerts = [
				...block.matchAll(new RegExp(`loc: ${STRING},[\\s\\S]*?match: ${STRING}`, 'g'))
			].map((m) => {
				const loc = unescape(m[1] ?? m[2]);
				const [line, col] = loc.split(':').map(Number);
				return { loc, line, col, match: unescape(m[3] ?? m[4]) };
			});

			return { id: unescape(idMatch[1] ?? idMatch[2]), alerts };
		})
		.filter((r) => r && r.alerts.length);
}

const lines = (await readFile(SAMPLE, 'utf8')).replace(/\n+$/, '').split('\n');

/*
	The sample is one hard-wrapped paragraph, so it renders as a single block
	with every mark in place rather than as four fragments. `starts` holds where
	each source line begins inside the joined text, which is what shifts the
	columns.
*/
const paragraph = lines.map((l) => l.trim()).join(' ');
const starts = [];
let at = 0;
for (const line of lines) {
	starts.push(at);
	at += line.trim().length + 1;
}

const runs = parseRuns(await readFile(RUNS, 'utf8'));
if (runs.length === 0) throw new Error('no runs parsed from demo-runs.ts');

const context = {};
const problems = [];

for (const run of runs) {
	const spans = [];

	for (const alert of run.alerts) {
		const raw = lines[alert.line - 1];
		if (raw === undefined) {
			problems.push(`${run.id} ${alert.loc}: sample has only ${lines.length} lines`);
			continue;
		}

		const found = raw.slice(alert.col - 1, alert.col - 1 + alert.match.length);
		if (found !== alert.match) {
			problems.push(
				`${run.id} ${alert.loc}: expected ${JSON.stringify(alert.match)}, found ${JSON.stringify(found)}`
			);
			continue;
		}

		// Shift into the joined paragraph: the lines before it, less the leading
		// whitespace this line lost when it was trimmed.
		const indent = raw.length - raw.trimStart().length;
		const col = starts[alert.line - 1] + (alert.col - 1 - indent) + 1;

		const shifted = paragraph.slice(col - 1, col - 1 + alert.match.length);
		if (shifted !== alert.match) {
			problems.push(
				`${run.id} ${alert.loc}: after joining, expected ${JSON.stringify(alert.match)} at ${col}, found ${JSON.stringify(shifted)}`
			);
			continue;
		}

		spans.push({ col, length: alert.match.length, loc: alert.loc });
	}

	context[run.id] = spans.sort((a, b) => a.col - b.col);
	console.log(`${run.id}: ${spans.length} marks`);
}

if (problems.length) {
	console.error('\nfailed:');
	problems.forEach((p) => console.error(`  ${p}`));
	process.exit(1);
}

await writeFile(OUT, JSON.stringify({ paragraph, runs: context }, null, '\t') + '\n');
console.log(`\nwrote ${OUT.pathname}`);
