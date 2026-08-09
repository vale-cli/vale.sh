/**
 * Reads the public `.vale.ini` files the adopters list points at and tallies
 * what they actually contain, into src/lib/data/config-stats.json.
 *
 * The generator used to present its options as a flat list in an order nobody
 * chose, which leaves the one real question -- "which of these should I pick?"
 * -- entirely to the visitor. These counts answer it with the same evidence
 * the rest of the site leans on: configurations you can open and read.
 *
 * Only adopters whose URL points straight at a `.vale.ini` on GitHub are
 * counted; a link to a docs page or a styles directory is not a config. The
 * sample is therefore a subset of the adopters list, and every number is
 * reported against that subset rather than against all 90.
 *
 * Run with: node script/configs/main.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const ADOPTERS = new URL('../../src/lib/data/adopters.json', import.meta.url);
const OUT = new URL('../../src/lib/data/config-stats.json', import.meta.url);

/** github.com/o/r/blob/ref/path -> raw.githubusercontent.com/o/r/ref/path */
function toRaw(url) {
	const m = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/);
	if (!m) return null;
	const [, owner, repo, ref, path] = m;
	return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`;
}

/**
 * Pulls the fields the generator asks about out of a `.vale.ini`.
 *
 * Vale's INI allows repeated and continued keys, and sections are globs rather
 * than names, so this is deliberately forgiving: it reads what it recognises
 * and ignores the rest rather than trying to be a second implementation of the
 * parser. See internal/core/ini.go in vale-cli/vale for the real one.
 */
function parse(text) {
	const styles = new Set();
	const packages = new Set();
	const formats = new Set();
	let minAlertLevel = null;

	// Join continuation lines: a trailing backslash, or an indented line under
	// a key, both show up in real configs.
	const lines = text.replace(/\\\r?\n\s*/g, ' ').split(/\r?\n/);

	for (const raw of lines) {
		const line = raw.trim();
		if (!line || line.startsWith('#') || line.startsWith(';')) continue;

		const section = line.match(/^\[(.+)\]$/);
		if (section) {
			// `[*.{md,rst}]` and `[*.md]` both name the formats they apply to.
			// Sections are globs, so plenty of them are paths rather than
			// extensions -- `[content/manuals/**/release-notes.md]`. Only a short
			// alphanumeric token is an extension worth counting.
			const braces = section[1].match(/\{([^}]*)\}/);
			const exts = braces
				? braces[1].split(',')
				: (section[1].match(/\*\.([A-Za-z0-9]+)$/) ?? []).slice(1);
			for (const ext of exts) {
				const e = ext.trim().replace(/^\./, '').toLowerCase();
				if (/^[a-z0-9]{1,6}$/.test(e)) formats.add(e);
			}
			continue;
		}

		const kv = line.match(/^([A-Za-z]+)\s*=\s*(.*)$/);
		if (!kv) continue;
		const key = kv[1].toLowerCase();
		// Values carry trailing comments in real configs -- `MinAlertLevel =
		// warning # suggestion, warning or error` -- which otherwise become part
		// of the value and split into nonsense on the comma.
		const val = kv[2].replace(/\s+[#;].*$/, '').trim();

		if (key === 'basedonstyles') {
			for (const s of val.split(',')) {
				const name = s.trim();
				if (name && name !== 'Vale' && /^[A-Za-z0-9][\w.-]*$/.test(name)) styles.add(name);
			}
		} else if (key === 'packages') {
			for (const p of val.split(',')) {
				const name = p.trim();
				if (!name) continue;
				// A package can be a URL or a bare name; the last path segment,
				// minus any extension, is the name Vale installs it under.
				const bare = name
					.split('/')
					.pop()
					.replace(/\.zip$/i, '');
				if (bare) packages.add(bare);
			}
		} else if (key === 'minalertlevel') {
			minAlertLevel = val.toLowerCase();
		}
	}

	return { styles: [...styles], packages: [...packages], formats: [...formats], minAlertLevel };
}

const adopters = JSON.parse(await readFile(ADOPTERS, 'utf8'));
const targets = adopters
	.map((a) => ({ ...a, raw: toRaw(a.url) }))
	.filter((a) => a.raw && /\.vale\.ini$/i.test(a.url));

console.log(`${targets.length} of ${adopters.length} adopters link at a .vale.ini`);

const styleCounts = new Map();
const packageCounts = new Map();
const formatCounts = new Map();
const levelCounts = new Map();
const pairs = new Map(); // style -> Map(otherStyle -> count)
const sampled = [];
const failures = [];

const bump = (map, key) => map.set(key, (map.get(key) ?? 0) + 1);

// Sequential on purpose: this runs by hand, and hammering raw.githubusercontent
// with 55 parallel requests is a good way to get rate-limited.
for (const target of targets) {
	try {
		const resp = await fetch(target.raw, { signal: AbortSignal.timeout(15000) });
		if (!resp.ok) {
			failures.push(`${target.name}: HTTP ${resp.status}`);
			continue;
		}
		const parsed = parse(await resp.text());

		parsed.styles.forEach((s) => bump(styleCounts, s));
		parsed.packages.forEach((p) => bump(packageCounts, p));
		parsed.formats.forEach((f) => bump(formatCounts, f));
		if (parsed.minAlertLevel) bump(levelCounts, parsed.minAlertLevel);

		for (const a of parsed.styles) {
			if (!pairs.has(a)) pairs.set(a, new Map());
			for (const b of parsed.styles) if (a !== b) bump(pairs.get(a), b);
		}

		sampled.push({ name: target.name, url: target.url, styles: parsed.styles });
		console.log(`  ${target.name}: ${parsed.styles.join(', ') || '(Vale only)'}`);
	} catch (err) {
		failures.push(`${target.name}: ${err.message}`);
	}
}

const sortDesc = (map) =>
	Object.fromEntries([...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));

const stats = {
	// Everything is a count out of this, not out of the full adopters list.
	sampleSize: sampled.length,
	adopterCount: adopters.length,
	styles: sortDesc(styleCounts),
	packages: sortDesc(packageCounts),
	formats: sortDesc(formatCounts),
	minAlertLevels: sortDesc(levelCounts),
	pairedWith: Object.fromEntries([...pairs.entries()].map(([k, v]) => [k, sortDesc(v)])),
	sampled
};

await mkdir(new URL('.', OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(stats, null, '\t') + '\n');

console.log(`\nsampled ${sampled.length}, failed ${failures.length}`);
failures.forEach((f) => console.log(`  warn: ${f}`));
console.log(`wrote ${OUT.pathname}`);
