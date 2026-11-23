#!/usr/bin/env node
/**
 * Builds src/lib/data/guides.json and src/lib/data/guide-terms.json — the data
 * behind the style guide explorer at /guides.
 *
 *   node script/guides.mjs        (or `make guides`)
 *
 * An open style guide that someone has written down as Vale rules can be read
 * as data: which topics it rules on, how firmly, which terms it bans and what
 * it prefers. This reads each guide's rules out of its own repository and
 * summarises them — nothing here is typed in by hand except where a guide
 * lives.
 *
 * Each repository is cloned shallowly, and sparsely where the rules are a
 * small corner of a large one. Set GUIDES_SRC to a directory of existing
 * checkouts (<owner>/<repo>) to reuse them; missing ones are cloned into it.
 *
 * The output is committed, like packages.json, so the site's build needs
 * neither git nor the network. Every guide carries its license and the commit
 * it was read at.
 *
 * Beside the rules, each guide gets: where it stands on common style
 * decisions (script/guides/decisions.mjs), when its rules last changed, how
 * to install it, and how many alerts it raises on a fixed sample
 * (script/guides/strictness.mjs). The dates and install lines use `gh`; the
 * sample needs Vale ($VALE or on PATH), and without it the last numbers stay.
 */

import { execFileSync } from 'node:child_process';
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	rmSync,
	statSync,
	writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { unzipSync, strFromU8 } from 'fflate';
import { parseAllDocuments } from 'yaml';
import { summarize, terms } from '../src/lib/tools/topics.ts';
import { decide, swaps } from './guides/decisions.mjs';
import { corpusWords, findVale, measure } from './guides/strictness.mjs';

const SRC = process.env.GUIDES_SRC ?? 'node_modules/.cache/guides';
const OUT = 'src/lib/data/guides.json';
const LIBRARY =
	process.env.VALE_LIBRARY ??
	'https://raw.githubusercontent.com/vale-cli/packages/master/library.json';

/**
 * `styles` are the directories of rule files inside the repository; several
 * are read as one guide. `sparse` names what to check out of a large repo.
 * `guide` is the human-readable style guide the rules implement, given only
 * where it is certain; otherwise the page links to the repository.
 */
const GUIDES = [
	{
		id: 'google',
		official: false,
		name: 'Google',
		full: 'Google developer documentation style guide',
		kind: 'Company',
		repo: 'vale-cli/Google',
		styles: ['Google'],
		license: 'MIT',
		guide: 'https://developers.google.com/style',
		usedAs: ['Google']
	},
	{
		id: 'microsoft',
		official: false,
		name: 'Microsoft',
		full: 'Microsoft Writing Style Guide',
		kind: 'Company',
		repo: 'vale-cli/Microsoft',
		styles: ['Microsoft'],
		license: 'MIT',
		guide: 'https://learn.microsoft.com/en-us/style-guide/welcome/',
		usedAs: ['Microsoft']
	},
	{
		id: 'red-hat',
		official: true,
		name: 'Red Hat',
		full: 'Red Hat supplementary style guide',
		kind: 'Company',
		repo: 'redhat-documentation/vale-at-red-hat',
		styles: ['.vale/styles/RedHat'],
		license: 'MIT',
		guide: 'https://redhat-documentation.github.io/supplementary-style-guide/',
		usedAs: ['RedHat']
	},
	{
		id: 'gitlab',
		official: true,
		name: 'GitLab',
		full: 'GitLab documentation style guide',
		kind: 'Open-source project',
		repo: 'gitlabhq/gitlabhq',
		sparse: ['doc/.vale'],
		styles: ['doc/.vale/gitlab_base', 'doc/.vale/gitlab_docs'],
		license: 'CC-BY-SA-4.0',
		guide: 'https://docs.gitlab.com/development/documentation/styleguide/',
		usedAs: ['gitlab_base', 'gitlab_docs', 'gitlab']
	},
	{
		id: 'grafana',
		official: true,
		name: 'Grafana',
		full: 'Grafana Writers’ Toolkit',
		kind: 'Open-source project',
		repo: 'grafana/writers-toolkit',
		styles: ['vale/Grafana/styles/Grafana'],
		license: 'Apache-2.0',
		guide: 'https://grafana.com/docs/writers-toolkit/',
		usedAs: ['Grafana']
	},
	{
		id: 'elastic',
		official: true,
		name: 'Elastic',
		full: 'Elastic docs style guide',
		kind: 'Company',
		repo: 'elastic/vale-rules',
		styles: ['styles/Elastic'],
		license: 'Apache-2.0',
		usedAs: ['Elastic']
	},
	{
		id: 'datadog',
		official: true,
		name: 'Datadog',
		full: 'Datadog documentation style guide',
		kind: 'Company',
		repo: 'DataDog/datadog-vale',
		styles: ['styles/Datadog'],
		license: 'Apache-2.0',
		usedAs: ['Datadog']
	},
	{
		id: 'splunk',
		official: true,
		name: 'Splunk',
		full: 'Splunk style guide',
		kind: 'Company',
		repo: 'splunk/vale-splunk-style-guide',
		styles: ['styles/Splunk'],
		license: 'Apache-2.0',
		usedAs: ['Splunk']
	},
	{
		id: 'salesforce',
		official: false,
		name: 'Salesforce',
		full: 'Salesforce writing style guide',
		kind: 'Company',
		repo: 'sfadriaan/Salesforce',
		styles: ['Salesforce'],
		usedAs: ['Salesforce']
	},
	{
		id: 'docker',
		official: true,
		name: 'Docker',
		full: 'Docker documentation style guide',
		kind: 'Company',
		repo: 'docker/docs-toolkit',
		styles: [],
		usedAs: ['Docker']
	},
	{
		id: 'canonical',
		official: true,
		name: 'Canonical',
		full: 'Canonical documentation style guide',
		kind: 'Open-source project',
		repo: 'canonical/documentation-style-guide',
		styles: ['styles/Canonical'],
		license: 'CC-BY-SA-4.0',
		usedAs: ['Canonical']
	},
	{
		id: 'apify',
		official: true,
		name: 'Apify',
		full: 'Apify writing style guide',
		kind: 'Company',
		repo: 'apify/vale-rules',
		styles: ['styles/Apify', 'styles/ApifyDocs'],
		license: 'Apache-2.0',
		usedAs: ['Apify', 'ApifyStyleGuide']
	},
	{
		id: 'spectro-cloud',
		official: true,
		name: 'Spectro Cloud',
		full: 'Spectro Cloud style guide',
		kind: 'Company',
		repo: 'spectrocloud/spectro-vale-pkg',
		styles: ['packages/spectrocloud/styles/spectrocloud'],
		license: 'Apache-2.0',
		usedAs: ['spectrocloud']
	},
	{
		id: 'digitalocean',
		official: true,
		name: 'DigitalOcean',
		full: 'DigitalOcean style guide',
		kind: 'Company',
		repo: 'digitalocean/vale-package',
		styles: ['styles/DigitalOcean', 'styles/PDocs'],
		license: 'MIT',
		guide: 'https://docs.digitalocean.com/style/',
		usedAs: ['DigitalOcean', 'PDocs']
	},
	{
		id: 'suse',
		official: true,
		name: 'SUSE',
		full: 'SUSE documentation style guide',
		kind: 'Company',
		repo: 'openSUSE/suse-vale-styleguide',
		styles: ['common', 'docbook', 'asciidoc'],
		license: 'GPL-3.0',
		guide: 'https://documentation.suse.com/style/current/html/docu_styleguide/index.html',
		// Its style names are generic enough to match other projects' styles,
		// so a count of configs that name them would overstate its use.
		usedAs: []
	},
	{
		id: 'amd-rocm',
		official: true,
		name: 'AMD ROCm',
		full: 'ROCm documentation style guide',
		kind: 'Company',
		repo: 'ROCm/rocm-docs-style',
		styles: ['vale/styles/ROCm'],
		license: 'MIT',
		usedAs: ['ROCm']
	},
	{
		id: 'foundries',
		official: true,
		name: 'Foundries.io',
		full: 'FoundriesFactory style guide',
		kind: 'Company',
		repo: 'foundriesio/fio-style',
		styles: ['Fio-docs'],
		license: 'MIT',
		usedAs: ['Fio-docs']
	},
	{
		id: 'albert-heijn',
		official: true,
		name: 'Albert Heijn',
		full: 'Albert Heijn Technology writing style guide',
		kind: 'Company',
		repo: 'albert-heijn-technology/style-guide',
		styles: ['styles/ah-technology'],
		license: 'MIT',
		guide: 'https://style-guide.ah.technology/',
		usedAs: ['ah-technology']
	},
	{
		id: '18f',
		official: false,
		name: '18F',
		full: '18F content guide',
		kind: 'Government',
		repo: 'testthedocs/18F',
		styles: ['18F'],
		license: 'MIT',
		usedAs: ['18F']
	},
	{
		id: 'gov-uk',
		official: false,
		name: 'GOV.UK',
		full: 'GOV.UK style guide',
		kind: 'Government',
		repo: 'martinwake/vale-gov-style',
		zip: 'gov-uk.zip',
		styles: ['gov-uk'],
		license: 'MIT',
		guide: 'https://www.gov.uk/guidance/style-guide/a-to-z',
		note: 'An unofficial implementation, not maintained by GOV.UK.',
		usedAs: ['gov-uk']
	}
];

const git = (args, cwd) =>
	execFileSync('git', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] })
		.toString()
		.trim();

/** Returns a checkout of the repository, cloning it if there isn't one. */
function checkout(guide) {
	// A reused directory may have the owner in any letter case.
	const [owner, name] = guide.repo.split('/');
	const ownerDir =
		existsSync(SRC) && readdirSync(SRC).find((d) => d.toLowerCase() === owner.toLowerCase());
	const dir = join(SRC, ownerDir || owner, name);
	if (existsSync(join(dir, '.git'))) return dir;

	mkdirSync(join(SRC, owner), { recursive: true });
	const url = `https://github.com/${guide.repo}`;
	const env = { ...process.env, GIT_LFS_SKIP_SMUDGE: '1' };
	if (guide.sparse) {
		execFileSync(
			'git',
			['clone', '-q', '--depth', '1', '--filter=blob:none', '--sparse', url, dir],
			{ env }
		);
		git(['sparse-checkout', 'set', ...guide.sparse], dir);
	} else {
		execFileSync('git', ['clone', '-q', '--depth', '1', url, dir], { env });
	}
	return dir;
}

/** `gh api`, or null when it fails (no network, no auth, no such thing). */
function gh(path, jq) {
	try {
		return execFileSync('gh', ['api', path, '--jq', jq], { stdio: ['ignore', 'pipe', 'ignore'] })
			.toString()
			.trim();
	} catch {
		return null;
	}
}

/**
 * When the rules last changed: the newest commit touching any of `paths`,
 * or the checkout's own commit when GitHub can't say.
 */
function rulesUpdated(guide, root, paths) {
	const dates = paths
		.map((p) =>
			gh(
				`repos/${guide.repo}/commits?path=${encodeURIComponent(p)}&per_page=1`,
				'.[0].commit.committer.date'
			)
		)
		.filter(Boolean);
	return (dates.sort().pop() ?? git(['log', '-1', '--format=%cI'], root)).slice(0, 10);
}

/** The style directories in a zip, by name. */
async function zipStyles(url) {
	try {
		const res = await fetch(url);
		if (!res.ok) return [];
		const names = Object.keys(unzipSync(new Uint8Array(await res.arrayBuffer())));
		const dirs = names.filter((n) => /\.ya?ml$/.test(n)).map((n) => n.split('/').slice(-2, -1)[0]);
		return [...new Set(dirs)].filter((d) => d && d !== 'config');
	} catch {
		return [];
	}
}

/**
 * How to install a guide: its name when it's in the package library, its
 * latest release's zip, a zip committed to the repo, or else the repo itself.
 * `styles` is what BasedOnStyles needs, read from the zip where there is one;
 * `paths` says what to copy when there's nothing to install from.
 */
async function installFor(guide, root, styleNames, rulePaths, library) {
	const repo = `https://github.com/${guide.repo}`.toLowerCase();
	const pick = async (url, line) => {
		const inZip = await zipStyles(url);
		const ours = inZip.filter((s) => styleNames.includes(s));
		return {
			kind: line.kind,
			line: `Packages = ${line.value}`,
			styles: ours.length ? ours : inZip
		};
	};
	const pkg = library.find(
		(p) =>
			guide.usedAs.includes(p.name) &&
			[p.url, p.homepage].some((u) =>
				String(u ?? '')
					.toLowerCase()
					.startsWith(repo)
			)
	);
	if (pkg) return pick(pkg.url, { kind: 'package', value: pkg.name });

	const assets = gh(`repos/${guide.repo}/releases/latest`, '[.assets[].name] | join("\\n")');
	const zips = (assets ?? '').split('\n').filter((a) => a.endsWith('.zip'));
	const asset =
		zips.find((a) => guide.usedAs.some((u) => a.toLowerCase() === `${u.toLowerCase()}.zip`)) ??
		zips[0];
	if (asset) {
		const url = `https://github.com/${guide.repo}/releases/latest/download/${asset}`;
		return pick(url, { kind: 'release', value: url });
	}
	if (guide.zip) {
		const branch = git(['rev-parse', '--abbrev-ref', 'HEAD'], root);
		const url = `https://raw.githubusercontent.com/${guide.repo}/${branch}/${guide.zip}`;
		return { kind: 'zip', line: `Packages = ${url}`, styles: styleNames };
	}
	return { kind: 'repo', line: '', styles: styleNames, paths: rulePaths };
}

/** Every .yml under a directory, as [name, text]. */
function ruleFiles(dir) {
	const out = [];
	const walk = (d, prefix) => {
		for (const entry of readdirSync(d).sort()) {
			const path = join(d, entry);
			if (statSync(path).isDirectory()) {
				// A directory starting with . or _ never loads in Vale.
				if (!/^[._]/.test(entry)) walk(path, `${prefix}${entry}.`);
			} else if (/\.ya?ml$/.test(entry)) {
				out.push([prefix + entry.replace(/\.ya?ml$/, ''), readFileSync(path, 'utf8')]);
			}
		}
	};
	if (existsSync(dir)) walk(dir, '');
	return out;
}

/** Finds a style directory by name anywhere in the repository. */
function findStyles(root) {
	const found = [];
	const walk = (d, depth) => {
		if (depth > 5) return;
		for (const entry of readdirSync(d)) {
			if (entry === '.git' || entry === 'node_modules') continue;
			const path = join(d, entry);
			if (!statSync(path).isDirectory()) continue;
			const rules = readdirSync(path).filter((f) => /\.yml$/.test(f));
			if (rules.some((f) => /^extends:/m.test(readFileSync(join(path, f), 'utf8'))))
				found.push(path);
			else walk(path, depth + 1);
		}
	};
	walk(root, 0);
	return found;
}

const guides = [];
const allTerms = [];

const library = await fetch(LIBRARY)
	.then((r) => r.json())
	.catch(() => []);
const vale = findVale();
const words = corpusWords();
// Without Vale, a guide keeps the strictness it was last measured at.
const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : [];
console.log(
	vale
		? `  strictness: ${vale.version}, ${words} words`
		: '  strictness: no Vale found, keeping the last numbers'
);

for (const guide of GUIDES) {
	const root = checkout(guide);
	const commit = git(['rev-parse', '--short', 'HEAD'], root);
	const license =
		guide.license ??
		(() => {
			const file = readdirSync(root).find((f) => /^(LICEN[CS]E|COPYING)/i.test(f));
			const head = file ? readFileSync(join(root, file), 'utf8').slice(0, 300) : '';
			if (/MIT License/i.test(head)) return 'MIT';
			if (/Apache License/i.test(head)) return 'Apache-2.0';
			return '';
		})();

	let files = [];
	let dirs = [];
	if (guide.zip) {
		const entries = unzipSync(new Uint8Array(readFileSync(join(root, guide.zip))));
		for (const [path, bytes] of Object.entries(entries)) {
			const m = path.match(new RegExp(`^${guide.styles[0]}/([^/]+)\\.yml$`));
			if (m) files.push([m[1], strFromU8(bytes)]);
		}
	} else {
		dirs = guide.styles.length ? guide.styles.map((s) => join(root, s)) : findStyles(root);
		files = dirs.flatMap(ruleFiles);
	}

	const rules = [];
	const parsed = [];
	for (const [name, text] of files) {
		let rule;
		try {
			rule = parseAllDocuments(text)[0]?.toJS();
		} catch {
			continue;
		}
		if (!rule || typeof rule !== 'object' || typeof rule.extends !== 'string') continue;
		parsed.push({ ...rule, id: `${guide.id}.${name}` });
		rules.push({
			name: `${guide.id}.${name}`,
			extends: rule.extends,
			level: rule.level ?? 'warning',
			message: typeof rule.message === 'string' ? rule.message : '',
			link: typeof rule.link === 'string' ? rule.link : '',
			tokens: [rule.tokens, rule.raw].flat().filter((t) => typeof t === 'string'),
			swap: swaps(rule),
			max: typeof rule.max === 'number' ? rule.max : undefined
		});
	}
	if (!rules.length) {
		console.log(`  ${guide.id.padEnd(14)} no rules found, skipped`);
		continue;
	}

	// Where a guide isn't named above, the rules' own links say where it lives.
	const hosts = {};
	for (const r of rules) {
		try {
			const host = new URL(r.link).origin;
			hosts[host] = (hosts[host] ?? 0) + 1;
		} catch {
			// no link
		}
	}
	const linked = Object.entries(hosts).sort((a, b) => b[1] - a[1])[0];

	const found = rules.flatMap((r) => terms(r).map((t) => ({ ...t, guide: guide.id })));
	allTerms.push(...found);

	// The rules as Vale loads them: a StylesPath and the styles in it.
	const styleNames = guide.zip ? [guide.styles[0]] : dirs.map((d) => basename(d));
	const rulePaths = guide.zip ? [guide.zip] : dirs.map((d) => relative(root, d));
	let strictness = previous.find((g) => g.id === guide.id)?.strictness ?? null;
	if (vale) {
		let stylesPath = resolve(dirname(dirs[0] ?? ''));
		let unpacked = '';
		if (guide.zip) {
			unpacked = mkdtempSync(join(tmpdir(), 'guide-zip-'));
			const entries = unzipSync(new Uint8Array(readFileSync(join(root, guide.zip))));
			for (const [path, bytes] of Object.entries(entries)) {
				if (path.endsWith('/')) continue;
				mkdirSync(dirname(join(unpacked, path)), { recursive: true });
				writeFileSync(join(unpacked, path), bytes);
			}
			stylesPath = unpacked;
		}
		strictness = {
			...measure(vale.bin, stylesPath, styleNames, words),
			vale: vale.version
		};
		if (unpacked) rmSync(unpacked, { recursive: true, force: true });
	}

	guides.push({
		id: guide.id,
		name: guide.name,
		full: guide.full,
		kind: guide.kind,
		repo: `https://github.com/${guide.repo}`,
		commit,
		license,
		guide: guide.guide ?? '',
		guideHost: guide.guide ? '' : (linked?.[0] ?? ''),
		note: guide.note ?? '',
		usedAs: guide.usedAs,
		terms: found.length,
		official: guide.official,
		owner: guide.repo.split('/')[0],
		updated: rulesUpdated(guide, root, rulePaths),
		install: await installFor(guide, root, styleNames, rulePaths, library),
		decisions: decide(parsed),
		strictness,
		rules: rules.map(summarize)
	});
	console.log(
		`  ${guide.id.padEnd(14)} ${commit}  ${String(rules.length).padStart(3)} rules  ${String(found.length).padStart(5)} terms  ${license || 'no license found'}  ${strictness ? `${strictness.per1k.total}/1k` : ''}`
	);
}

writeFileSync(OUT, JSON.stringify(guides) + '\n');
// Packed as rows, since this is the one file the lookup downloads:
// [term, replacement, rule, severity, guide].
const LEVELS = ['suggestion', 'warning', 'error'];
writeFileSync(
	'src/lib/data/guide-terms.json',
	JSON.stringify({
		guides: guides.map((g) => g.id),
		rows: allTerms.map((t) => [
			t.find,
			t.use ?? '',
			t.rule.slice(t.rule.indexOf('.') + 1),
			Math.max(0, LEVELS.indexOf(t.level)),
			guides.findIndex((g) => g.id === t.guide)
		])
	}) + '\n'
);
console.log(
	`  ${guides.length} guides, ${guides.reduce((n, g) => n + g.rules.length, 0)} rules, ${allTerms.length} terms`
);
