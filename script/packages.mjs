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

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { unzipSync, strFromU8 } from 'fflate';
import { parse } from 'yaml';

// `VALE_LIBRARY` points the build at another copy of the library: a commit's
// raw URL when the branch's is still cached, or a fork's while an entry is
// in review.
const LIBRARY =
	process.env.VALE_LIBRARY ??
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

/**
 * Derives a rule's addressable name from its path in the archive.
 *
 * A subdirectory joins a rule's name (`Std/Abbreviations/Acronyms.yml` is
 * `Abbreviations.Acronyms` within the Std style), so the name has to keep the
 * path — the basename alone gives a name Vale doesn't answer to. The archive
 * root and, for configuration packages, the `styles/<name>` wrapper are the
 * style's own identity and are dropped; a directory prefixed with `.` or `_`
 * never loads, so its files are skipped.
 */
function ruleName(path) {
	const segments = path.replace(/\.yml$/, '').split('/');
	const file = segments.pop();

	segments.shift(); // The archive's root directory: the style itself.
	if (segments[0] === 'styles') {
		segments.splice(0, 2); // `styles/<name>` in a configuration package.
	}
	if (segments.some((dir) => dir.startsWith('.') || dir.startsWith('_'))) {
		return null;
	}

	return [...segments, file].join('.');
}

/** The directories under `config/` Vale reads, and the kind each holds. */
const ASSET_DIRS = {
	views: 'view',
	filters: 'filter',
	scripts: 'script',
	actions: 'action',
	vocabularies: 'vocabulary',
	templates: 'template',
	dictionaries: 'dictionary',
	ignore: 'ignore'
};

/**
 * Reads one file under `config/` into a listing entry.
 *
 * A view says the most about itself -- its engine and the scopes it exposes
 * -- so those are read out of it. A vocabulary is two word lists, so it is
 * counted. Everything else is listed by name.
 */
function asset(kind, name, body) {
	if (kind === 'view') {
		try {
			const view = parse(body);
			return {
				kind,
				name: name.replace(/\.yml$/, ''),
				engine: view?.engine ?? '',
				scopes: (view?.scopes ?? []).map((s) => s.name).filter(Boolean)
			};
		} catch {
			return { kind, name };
		}
	}
	return { kind, name };
}

/**
 * Collects the assets a package ships under `config/`, keyed by kind and
 * name. A vocabulary's accept.txt and reject.txt land on one entry.
 */
function collectAsset(assets, path, bytes) {
	const m = path.match(/\/config\/([^/]+)\/(.+)$/);
	if (!m || !ASSET_DIRS[m[1]]) {
		return;
	}
	const kind = ASSET_DIRS[m[1]];
	const rest = m[2];

	if (kind === 'vocabulary') {
		const [name, file] = rest.split('/');
		if (!file) {
			return;
		}
		const key = `${kind}/${name}`;
		const entry = assets.get(key) ?? { kind, name, accept: 0, reject: 0 };
		const words = strFromU8(bytes)
			.split('\n')
			.filter((w) => w.trim() && !w.startsWith('#')).length;
		if (file === 'accept.txt') entry.accept += words;
		if (file === 'reject.txt') entry.reject += words;
		assets.set(key, entry);
		return;
	}

	if (rest.includes('/')) {
		return; // Nothing else nests.
	}
	assets.set(`${kind}/${rest}`, asset(kind, rest, strFromU8(bytes)));
}

/**
 * Where a package lives, read off its download URL: every entry in the
 * library is a GitHub release asset, so the URL names the repository and the
 * archive. The Red Hat repository publishes three packages from one release,
 * which is why downloads are counted per archive rather than per repository.
 */
function sourceOf(pkg) {
	const m = pkg.url.match(/^https:\/\/github\.com\/([^/]+\/[^/]+)\/releases\/.*\/([^/]+)$/);
	if (!m) {
		return null;
	}
	return { repo: m[1], asset: m[2] };
}

/**
 * The site a package points readers at, for a card: which kind of host it
 * is, and a short name for it. A forge homepage is shown as its repository
 * path under the forge's own mark; anything else is a website, shown by host.
 */
function siteOf(homepage) {
	try {
		const u = new URL(homepage);
		const path = u.pathname.replace(/\/$/, '');
		if (u.hostname === 'github.com') {
			return { host: 'github', site: path.replace(/^\//, '') };
		}
		if (u.hostname === 'gitlab.com' || u.hostname.startsWith('gitlab.')) {
			return { host: 'gitlab', site: path.replace(/^\//, '') };
		}
		return { host: 'web', site: u.hostname };
	} catch {
		return { host: 'web', site: '' };
	}
}

const ghHeaders = {
	Accept: 'application/vnd.github+json',
	'User-Agent': 'vale.sh-build',
	...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {})
};

async function github(path) {
	const res = await fetch(`https://api.github.com${path}`, { headers: ghHeaders });
	if (!res.ok) {
		throw new Error(`${res.status} fetching ${path}`);
	}
	return { body: await res.json(), link: res.headers.get('link') ?? '' };
}

/** Stargazers on the repository. */
async function starsFor(repo) {
	const { body } = await github(`/repos/${repo}`);
	if (typeof body.stargazers_count !== 'number') {
		throw new Error(`no star count for ${repo}`);
	}
	return body.stargazers_count;
}

/**
 * What the releases say about one archive: downloads summed over every
 * release that shipped it, and the tag and date of the newest one that did.
 * The list comes newest first, so the first release carrying the asset is
 * the one `releases/latest/download` resolves to, drafts and pre-releases
 * aside. It is paged, so the Link header is followed to the end.
 */
async function releasesFor(repo, asset) {
	let downloads = 0;
	let version = '';
	let released = '';
	let page = 1;
	for (;;) {
		const { body, link } = await github(`/repos/${repo}/releases?per_page=100&page=${page}`);
		for (const release of body) {
			for (const a of release.assets ?? []) {
				if (a.name !== asset) {
					continue;
				}
				downloads += a.download_count ?? 0;
				if (!version && !release.draft && !release.prerelease) {
					version = release.tag_name ?? '';
					released = (release.published_at ?? '').slice(0, 10);
				}
			}
		}
		if (!/rel="next"/.test(link)) {
			return { downloads, version, released };
		}
		page++;
	}
}

async function rulesFor(pkg) {
	// `url` is the archive itself, not the directory holding it.
	const res = await fetch(pkg.url);
	if (!res.ok) {
		throw new Error(`${res.status} fetching ${pkg.url}`);
	}

	const files = unzipSync(new Uint8Array(await res.arrayBuffer()));
	const rules = [];
	const assets = new Map();

	// A package's meta.json states the Vale version its rules need -- the one
	// fact a reader has to know before `vale sync` will do them any good.
	let valeVersion = '';

	// A release archive may carry its directory under two spellings, `Name/`
	// and `name/`, so that a download by either URL unpacks to a directory
	// Vale can find. The second copy is the same package, not more rules.
	const seen = new Set();

	for (const [path, bytes] of Object.entries(files)) {
		const key = path.toLowerCase();
		if (seen.has(key)) {
			continue;
		}
		seen.add(key);
		if (path.endsWith('meta.json')) {
			try {
				valeVersion = JSON.parse(strFromU8(bytes)).vale_version ?? '';
			} catch {
				// A malformed meta.json shouldn't cost the package its page.
			}
			continue;
		}
		if (path.includes('/config/')) {
			collectAsset(assets, path, bytes);
			continue;
		}
		if (!path.endsWith('.yml')) {
			continue;
		}
		const name = ruleName(path);
		if (!name) {
			continue;
		}
		const rule = summarize(name, strFromU8(bytes));
		if (rule) {
			rules.push(rule);
		}
	}

	rules.sort((a, b) => a.name.localeCompare(b.name));
	const listed = [...assets.values()].sort(
		(a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name)
	);
	return { rules, assets: listed, valeVersion };
}

// Part of `make build`, so an unreachable library must not stop a build: the
// last generated file is checked in, and rebuilding from it is what a local
// build without a network -- or a GitHub outage mid-deploy -- should do. Only
// a first run, with nothing to fall back to, has no page to render.
let library;
try {
	const res = await fetch(LIBRARY);
	if (!res.ok) {
		throw new Error(`${res.status} fetching library.json`);
	}
	library = await res.json();
} catch (err) {
	if (existsSync(OUT)) {
		console.warn(`packages: ${err.message}; keeping the existing ${OUT}`);
		process.exit(0);
	}
	console.error(`packages: ${err.message}`);
	process.exit(1);
}
// The last generated file, so a package whose GitHub lookup fails keeps the
// numbers it had rather than losing them for one build.
const previous = new Map();
if (existsSync(OUT)) {
	try {
		for (const p of JSON.parse(readFileSync(OUT, 'utf8'))) {
			previous.set(p.name, p);
		}
	} catch {
		// Unreadable is the same as absent.
	}
}

const packages = [];
let failed = 0;

for (const pkg of library) {
	const entry = {
		...pkg,
		name: fixEncoding(pkg.name),
		description: fixEncoding(pkg.description),
		...siteOf(pkg.homepage)
	};

	const source = sourceOf(pkg);
	const last = previous.get(entry.name);
	if (source) {
		entry.repo = source.repo;
		try {
			const [stars, releases] = await Promise.all([
				starsFor(source.repo),
				releasesFor(source.repo, source.asset)
			]);
			entry.stars = stars;
			entry.downloads = releases.downloads;
			entry.version = releases.version;
			entry.released = releases.released;
		} catch (err) {
			console.warn(`packages: ${pkg.name}: ${err.message}`);
			entry.stars = last?.stars;
			entry.downloads = last?.downloads;
			entry.version = last?.version;
			entry.released = last?.released;
		}
	}

	try {
		const { rules, assets, valeVersion } = await rulesFor(pkg);
		entry.rules = rules;
		entry.assets = assets;
		entry.valeVersion = valeVersion;
	} catch (err) {
		// A package that won't download shouldn't take the whole build with it;
		// it still gets a page, just without the rule listing.
		console.warn(`packages: ${pkg.name}: ${err.message}`);
		entry.rules = [];
		entry.assets = [];
		entry.valeVersion = '';
		failed++;
	}

	packages.push(entry);
	const extra = entry.assets.length ? `, ${entry.assets.length} assets` : '';
	const counts =
		entry.stars !== undefined ? `, ${entry.stars} stars, ${entry.downloads} downloads` : '';
	const version = entry.version ? `, ${entry.version}` : '';
	console.log(
		`  ${entry.name.padEnd(16)} ${String(entry.rules.length).padStart(3)} rules${extra}${counts}${version}`
	);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(packages, null, 2) + '\n');

const total = packages.reduce((n, p) => n + p.rules.length, 0);
console.log(`\n${OUT}: ${packages.length} packages, ${total} rules`);
if (failed) {
	console.log(`${failed} package(s) had no readable rules`);
}
