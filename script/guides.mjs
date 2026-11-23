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
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { unzipSync, strFromU8 } from 'fflate';
import { parseAllDocuments } from 'yaml';
import { summarize, terms } from '../src/lib/tools/topics.ts';

const SRC = process.env.GUIDES_SRC ?? 'node_modules/.cache/guides';

/**
 * `styles` are the directories of rule files inside the repository; several
 * are read as one guide. `sparse` names what to check out of a large repo.
 * `guide` is the human-readable style guide the rules implement, given only
 * where it is certain; otherwise the page links to the repository.
 */
const GUIDES = [
	{
		id: 'google',
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
		name: 'Salesforce',
		full: 'Salesforce writing style guide',
		kind: 'Company',
		repo: 'sfadriaan/Salesforce',
		styles: ['Salesforce'],
		usedAs: ['Salesforce']
	},
	{
		id: 'docker',
		name: 'Docker',
		full: 'Docker documentation style guide',
		kind: 'Company',
		repo: 'docker/docs-toolkit',
		styles: [],
		usedAs: ['Docker']
	},
	{
		id: 'canonical',
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
		name: 'Spectro Cloud',
		full: 'Spectro Cloud style guide',
		kind: 'Company',
		repo: 'spectrocloud/spectro-vale-pkg',
		styles: ['packages/spectrocloud/styles/spectrocloud'],
		license: 'Apache-2.0',
		usedAs: ['spectrocloud']
	},
	{
		id: '18f',
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
	if (guide.zip) {
		const entries = unzipSync(new Uint8Array(readFileSync(join(root, guide.zip))));
		for (const [path, bytes] of Object.entries(entries)) {
			const m = path.match(new RegExp(`^${guide.styles[0]}/([^/]+)\\.yml$`));
			if (m) files.push([m[1], strFromU8(bytes)]);
		}
	} else {
		const dirs = guide.styles.length ? guide.styles.map((s) => join(root, s)) : findStyles(root);
		files = dirs.flatMap(ruleFiles);
	}

	const rules = [];
	for (const [name, text] of files) {
		let rule;
		try {
			rule = parseAllDocuments(text)[0]?.toJS();
		} catch {
			continue;
		}
		if (!rule || typeof rule !== 'object' || typeof rule.extends !== 'string') continue;
		rules.push({
			name: `${guide.id}.${name}`,
			extends: rule.extends,
			level: rule.level ?? 'warning',
			message: typeof rule.message === 'string' ? rule.message : '',
			link: typeof rule.link === 'string' ? rule.link : '',
			tokens: [rule.tokens, rule.raw].flat().filter((t) => typeof t === 'string'),
			swap: Object.entries(rule.swap ?? {}).map(([k, v]) => [String(k), String(v)]),
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
		rules: rules.map(summarize)
	});
	console.log(
		`  ${guide.id.padEnd(14)} ${commit}  ${String(rules.length).padStart(3)} rules  ${String(found.length).padStart(5)} terms  ${license || 'no license found'}`
	);
}

writeFileSync('src/lib/data/guides.json', JSON.stringify(guides) + '\n');
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
