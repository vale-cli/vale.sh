#!/usr/bin/env node
/**
 * Pins the docs' install examples to a Vale release.
 *
 *   node script/release.mjs v3.20.0
 *
 * The docs carry two kinds of version. A "requires Vale vX.Y.Z" note records
 * when a feature arrived and must never move. An install example -- a `mise`
 * line, a Docker tag, a pre-commit `rev` -- should always show the current
 * release, and those are the only strings this touches. Each pattern below
 * names one of them, and a pattern that matches nothing fails the run, so a
 * rewrite that drops an example is noticed rather than left behind.
 *
 * .github/workflows/release.yml runs this when Vale publishes a release.
 */

import { readFileSync, writeFileSync } from 'node:fs';

const version = process.argv[2];
if (!/^v\d+\.\d+\.\d+$/.test(version ?? '')) {
	console.error('usage: node script/release.mjs vX.Y.Z');
	process.exit(2);
}
const bare = version.slice(1);

/** Each pin: the file, the pattern that finds it, and the line to write. */
const pins = [
	{
		file: 'docs/topics/installation.md',
		pattern: /mise use vale@\d+\.\d+\.\d+/g,
		replace: `mise use vale@${bare}`
	},
	{
		file: 'docs/topics/installation.md',
		pattern: /FROM jdkato\/vale:v\d+\.\d+\.\d+/g,
		replace: `FROM jdkato/vale:${version}`
	},
	{
		file: 'docs/integrations/pre-commit.md',
		pattern: /rev: v\d+\.\d+\.\d+/g,
		replace: `rev: ${version}`
	}
];

let failed = false;
const changed = new Set();

for (const pin of pins) {
	const before = readFileSync(pin.file, 'utf8');
	if (!pin.pattern.test(before)) {
		console.error(`${pin.file}: nothing matches ${pin.pattern}`);
		failed = true;
		continue;
	}
	pin.pattern.lastIndex = 0;
	const after = before.replace(pin.pattern, pin.replace);
	if (after !== before) {
		writeFileSync(pin.file, after);
		changed.add(pin.file);
	}
}

if (failed) {
	process.exit(1);
}
for (const file of changed) {
	console.log(`${file}: pinned to ${version}`);
}
if (changed.size === 0) {
	console.log(`already at ${version}`);
}
