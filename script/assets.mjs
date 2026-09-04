#!/usr/bin/env node
/**
 * Builds src/lib/data/assets.json — the data behind /explorer/assets and the
 * per-asset pages under /explorer/assets/<name>.
 *
 *   node script/assets.mjs
 *   ASSETS_SOURCE=../path/to/packages node script/assets.mjs
 *
 * An asset is a single file to copy into a StylesPath — a view, a filter, a
 * script — rather than a package to sync. The registry lists them in
 * assets.json beside library.json, and this reads each file so the page can
 * show it whole, with a copy button, and the line of .vale.ini that turns it
 * on.
 *
 * ASSETS_SOURCE points at a local checkout of the registry, for working on
 * an asset before it is published.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const REGISTRY = 'https://raw.githubusercontent.com/vale-cli/packages/refs/heads/master/';
const OUT = 'src/lib/data/assets.json';

const source = process.env.ASSETS_SOURCE ?? '';

async function read(path) {
	if (source) {
		return readFileSync(join(source, path), 'utf8');
	}
	const res = await fetch(REGISTRY + path);
	if (!res.ok) {
		throw new Error(`${res.status} fetching ${path}`);
	}
	return res.text();
}

// Part of `make build`, so an unreachable registry must not stop a build: the
// last generated file is checked in, and rebuilding from it is what a local
// build without a network should do.
let index;
try {
	index = JSON.parse(await read('assets.json'));
} catch (err) {
	if (existsSync(OUT)) {
		console.warn(`assets: ${err.message}; keeping the existing ${OUT}`);
		process.exit(0);
	}
	console.error(`assets: ${err.message}`);
	process.exit(1);
}

/**
 * The .vale.ini lines, or the command, that put an asset to use. A view is
 * named in the section it is meant for; a filter and a template are named on
 * the command line; the rest are picked up by being in place.
 */
function usageFor(entry) {
	const file = entry.path.split('/').pop();
	switch (entry.kind) {
		case 'view':
			return `[${entry.section}]\nBasedOnStyles = Vale\n\nView = ${entry.name}`;
		case 'filter':
			return `vale --filter=${file} .`;
		case 'template':
			return `vale --output=${file} .`;
		default:
			return `# Saved under <StylesPath>/config/${entry.kind}s/${file}`;
	}
}

const assets = [];
for (const entry of index) {
	try {
		assets.push({
			...entry,
			tags: entry.tags ?? [],
			content: await read(entry.path),
			usage: usageFor(entry)
		});
		console.log(`  ${entry.kind.padEnd(8)} ${entry.name}`);
	} catch (err) {
		// One missing file shouldn't take the page with it.
		console.warn(`assets: ${entry.name}: ${err.message}`);
	}
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(assets, null, 2) + '\n');
console.log(`\n${OUT}: ${assets.length} assets`);
