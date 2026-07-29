#!/usr/bin/env node
/**
 * Builds src/lib/data/packages.json — the data behind /explorer and the
 * per-package pages under /explorer/<name>.
 *
 *   node script/packages.mjs
 *
 * The upstream library.json says only what a package is called and where to
 * download it. What a package actually *checks* lives in the rules inside it,
 * so this downloads each one and reads them.
 *
 * It runs at build time rather than in the browser: the packages are small
 * (the Microsoft style is 19 KB for 40 rules), and doing it here means the
 * pages are static, work without JavaScript, and can be indexed.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { unzipSync, strFromU8 } from 'fflate';
import { parse } from 'yaml';

const LIBRARY =
	'https://raw.githubusercontent.com/vale-cli/packages/refs/heads/master/library.json';
const OUT = 'src/lib/data/packages.json';

/** Repairs the UTF-8 mojibake present in some upstream library.json entries. */
const fixEncoding = (s = '') =>
	s
		.replace(/â€™/g, '’')
		.replace(/â€˜/g, '‘')
		.replace(/â€œ/g, '“')
		.replace(/â€”/g, '—')
		.replace(/â€“/g, '–')
		.replace(/â€/g, '”');

/**
 * Reads one rule file into the fields a reader needs.
 *
 * A rule states its own severity, what it looks at, and what it says when it
 * fires — so a package's documentation can be generated from it rather than
 * written and left to drift. `link` is the style guide the rule enforces, and
 * is the most useful thing on the page when it's there.
 */
function summarize(name, body) {
	let rule;
	try {
		rule = parse(body);
	} catch {
		return null; // Not every .yml in a package is a rule.
	}
	if (!rule || typeof rule !== 'object' || !rule.extends) {
		return null;
	}

	const scope = Array.isArray(rule.scope) ? rule.scope.join(', ') : rule.scope;
	return {
		name,
		extends: rule.extends,
		level: rule.level ?? 'suggestion',
		scope: scope ?? 'text',
		message: typeof rule.message === 'string' ? rule.message : '',
		link: typeof rule.link === 'string' ? rule.link : ''
	};
}

async function rulesFor(pkg) {
	// `url` is the archive itself, not the directory holding it.
	const res = await fetch(pkg.url);
	if (!res.ok) {
		throw new Error(`${res.status} fetching ${pkg.url}`);
	}

	const files = unzipSync(new Uint8Array(await res.arrayBuffer()));
	const rules = [];

	for (const [path, bytes] of Object.entries(files)) {
		if (!path.endsWith('.yml') || path.endsWith('meta.json')) {
			continue;
		}
		const name = path.replace(/^.*\//, '').replace(/\.yml$/, '');
		const rule = summarize(name, strFromU8(bytes));
		if (rule) {
			rules.push(rule);
		}
	}

	rules.sort((a, b) => a.name.localeCompare(b.name));
	return rules;
}

const res = await fetch(LIBRARY);
if (!res.ok) {
	console.error(`packages: ${res.status} fetching library.json`);
	process.exit(1);
}

const library = await res.json();
const packages = [];
let failed = 0;

for (const pkg of library) {
	const entry = {
		...pkg,
		name: fixEncoding(pkg.name),
		description: fixEncoding(pkg.description)
	};

	try {
		entry.rules = await rulesFor(pkg);
	} catch (err) {
		// A package that won't download shouldn't take the whole build with it;
		// it still gets a page, just without the rule listing.
		console.warn(`packages: ${pkg.name}: ${err.message}`);
		entry.rules = [];
		failed++;
	}

	packages.push(entry);
	console.log(`  ${entry.name.padEnd(16)} ${String(entry.rules.length).padStart(3)} rules`);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(packages, null, 2) + '\n');

const total = packages.reduce((n, p) => n + p.rules.length, 0);
console.log(`\n${OUT}: ${packages.length} packages, ${total} rules`);
if (failed) {
	console.log(`${failed} package(s) had no readable rules`);
}
