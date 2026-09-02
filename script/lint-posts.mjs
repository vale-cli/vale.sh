// Generate the lint-and-metrics report each blog post shows in its footer.
//
//   node script/lint-posts.mjs
//
// Runs Vale twice per post -- once for alerts, once for text metrics -- and
// writes src/lib/data/lint.json. The file is committed rather than built on
// deploy, so the numbers are pinned to the Vale version that produced them
// and the site builds without a Vale binary present.
import { execFileSync } from 'node:child_process';
import { readdirSync, writeFileSync } from 'node:fs';

const root = new URL('..', import.meta.url).pathname;
const run = (...args) => execFileSync('vale', args, { cwd: root, encoding: 'utf8' });

const version = run('-v')
	.trim()
	.replace(/^vale version /, '');
const posts = {};

for (const file of readdirSync(`${root}src/posts`).sort()) {
	if (!file.endsWith('.md')) continue;
	const slug = file.replace(/\.md$/, '');
	const path = `src/posts/${file}`;

	// --no-exit: error-level alerts are data here, not a failed run. The timer
	// wraps the whole CLI invocation, so the figure is wall-clock time for one
	// `vale` run on this file -- startup included -- not parse time alone.
	const started = process.hrtime.bigint();
	const output = run('--output=JSON', '--no-exit', '--no-global', path);
	const ms = Number((process.hrtime.bigint() - started) / 1000000n);

	const alerts = Object.values(JSON.parse(output || '{}')).flat();
	const count = (sev) => alerts.filter((a) => a.Severity === sev).length;

	const m = JSON.parse(run('ls-metrics', path));
	const round = (n) => Math.round(n * 10) / 10;

	posts[slug] = {
		errors: count('error'),
		warnings: count('warning'),
		suggestions: count('suggestion'),
		words: m.words,
		sentences: m.sentences,
		paragraphs: m.paragraphs,
		// Flesch-Kincaid grade level, from the raw counts Vale reports.
		grade: round(0.39 * (m.words / m.sentences) + 11.8 * (m.syllables / m.words) - 15.59),
		// Flesch reading ease: higher is easier, 60-70 is plain English.
		ease: round(206.835 - 1.015 * (m.words / m.sentences) - 84.6 * (m.syllables / m.words)),
		// SMOG grade, from the polysyllabic-word count.
		smog: round(1.043 * Math.sqrt(m.polysyllabic_words * (30 / m.sentences)) + 3.1291),
		// Share of words Vale counts as complex.
		complex: Math.round((100 * m.complex_words) / m.words),
		// Reading time at 200 words per minute, floored at 1.
		minutes: Math.max(1, Math.round(m.words / 200)),
		ms
	};
}

const report = {
	vale: version,
	generated: new Date().toISOString().slice(0, 10),
	posts
};

writeFileSync(`${root}src/lib/data/lint.json`, JSON.stringify(report, null, '\t') + '\n');
console.log(`src/lib/data/lint.json: ${Object.keys(posts).length} post(s), vale ${version}`);
