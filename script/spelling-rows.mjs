// Turn a textbench results.json into the rows the spell-checker post shows.
//
//   node script/spelling-rows.mjs path/to/results.json
//
// Writes src/lib/data/spelling-results.json: one row per format with each
// tool's cell, and a `tuned` cell beside it for the tools that have a tuned
// run. The numbers are copied, never edited here; the labels and families
// are the post's.
import { readFileSync, writeFileSync } from 'node:fs';

const [, , path] = process.argv;
if (!path) {
	console.error('usage: node script/spelling-rows.mjs results.json');
	process.exit(1);
}
const report = JSON.parse(readFileSync(path, 'utf8'));

const formats = [
	['md', 'Markdown', 'prose'],
	['adoc', 'AsciiDoc', 'prose'],
	['rst', 'reStructuredText', 'prose'],
	['html', 'HTML', 'prose'],
	['org', 'Org', 'prose'],
	['txt', 'Plain text', 'prose'],
	['mdx', 'MDX', 'prose'],
	['myst', 'MyST', 'prose'],
	['qmd', 'Quarto', 'prose'],
	['typ', 'Typst', 'prose'],
	['xml', 'XML', 'prose'],
	['dita', 'DITA', 'prose'],
	['qdoc', 'QDoc', 'prose'],
	['ipynb', 'Jupyter', 'prose'],
	['js', 'JavaScript', 'source'],
	['go', 'Go', 'source'],
	['py', 'Python', 'source'],
	['rs', 'Rust', 'source'],
	['java', 'Java', 'source'],
	['kt', 'Kotlin', 'source'],
	['yml', 'YAML', 'data'],
	['json', 'JSON', 'data'],
	['toml', 'TOML', 'data']
];

const cell = (r) => ({
	found: r.accuracy.totals.found,
	leaked: r.accuracy.totals.leaked,
	seconds: Number(r.speed.meanSeconds.toFixed(3)),
	mb: Math.round(r.memory.peakRSSBytes / 1048576)
});

const rows = [];
const versions = {};
for (const [format, label, family] of formats) {
	const file = `bench.${format}`;
	const results = report.results.filter((r) => r.file === file);
	if (results.length === 0) continue;
	const row = { format, label, family, expected: results[0].accuracy.expected, tools: {} };
	for (const r of results) {
		versions[r.tool] = r.version;
		if (r.tool.endsWith('-tuned')) {
			const base = r.tool.slice(0, -'-tuned'.length);
			row.tools[base] = { ...(row.tools[base] ?? {}), tuned: cell(r) };
		} else {
			row.tools[r.tool] = { ...cell(r), ...(row.tools[r.tool] ?? {}) };
		}
	}
	rows.push(row);
}

writeFileSync(
	new URL('../src/lib/data/spelling-results.json', import.meta.url),
	JSON.stringify({ generated: report.generated, versions, rows }, null, '\t') + '\n'
);
console.log(
	rows.length,
	'rows;',
	Object.entries(versions)
		.map(([k, v]) => `${k} ${v}`)
		.join(', ')
);
