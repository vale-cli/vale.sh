#!/usr/bin/env node
/**
 * Builds src/lib/data/tools/ai-tells.json — the patterns behind
 * /tools/ai-detector.
 *
 *   node script/tools.mjs        (or `make tools`)
 *
 * The detector runs in the reader's browser, so it needs its patterns as data.
 * This downloads the ai-tells archive `vale sync` would and writes out the
 * rules a browser can evaluate with a regular expression: `existence`,
 * `substitution` and `repetition`. Rules that need Vale's part-of-speech
 * tagger (`sequence`) or a scope a textarea doesn't have are listed under
 * `skipped`, so the page can say what it left out.
 *
 * Vale compiles patterns with regexp2; a browser has only its own engine. Each
 * pattern is compiled here first, and one that JavaScript rejects is dropped
 * and counted rather than shipped to fail on a reader's machine.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { unzipSync, strFromU8 } from 'fflate';
import { parseAllDocuments } from 'yaml';

const OUT = 'src/lib/data/tools';

const PACKAGES = [{ name: 'ai-tells', repo: 'tbhb/vale-ai-tells' }];

const SUPPORTED = new Set(['existence', 'substitution', 'repetition']);

/** A leading `(?i)` is Go's inline flag; JavaScript wants it on the RegExp. */
const INLINE_I = /^\(\?i\)/;

function compiles(source, flags = 'gm') {
	try {
		new RegExp(source, flags);
		return true;
	} catch {
		return false;
	}
}

const list = (v) => (Array.isArray(v) ? v.map(String) : v == null ? [] : [String(v)]);

/** Reads one rule into the fields the browser engine needs, or says why not. */
function convert(name, rule) {
	const base = {
		name,
		extends: rule.extends,
		level: rule.level ?? 'warning',
		message: typeof rule.message === 'string' ? rule.message : '',
		link: typeof rule.link === 'string' ? rule.link : '',
		scope: list(rule.scope)[0] ?? 'text'
	};

	if (!SUPPORTED.has(rule.extends)) {
		return { skipped: { name, why: `${rule.extends} rule` } };
	}
	// A rule can name several scopes or negate one; the browser handles the
	// plain cases only.
	if (
		list(rule.scope).length > 1 ||
		!['text', 'heading', 'raw', 'paragraph', 'sentence'].includes(base.scope)
	) {
		return { skipped: { name, why: `scope ${list(rule.scope).join(', ')}` } };
	}

	if (rule.extends === 'repetition') {
		return { rule: { ...base, ignorecase: rule.ignorecase === true } };
	}

	let dropped = 0;
	const keep = (source) => {
		const ok = compiles(source);
		if (!ok) dropped++;
		return ok;
	};

	if (rule.extends === 'substitution') {
		const swap = Object.entries(rule.swap ?? {})
			.map(([k, v]) => [String(k), String(v)])
			.filter(([k]) => keep(k));
		if (!swap.length) return { skipped: { name, why: 'no usable patterns' } };
		return {
			rule: {
				...base,
				ignorecase: rule.ignorecase === true,
				nonword: rule.nonword === true,
				swap
			},
			dropped
		};
	}

	// existence
	const raw = list(rule.raw).join('');
	if (raw && !compiles(raw)) return { skipped: { name, why: 'raw pattern' } };

	const tokens = [];
	const itokens = []; // carried their own (?i)
	for (const t of list(rule.tokens)) {
		if (INLINE_I.test(t)) {
			const bare = t.replace(INLINE_I, '');
			if (keep(bare)) itokens.push(bare);
		} else if (keep(t)) {
			tokens.push(t);
		}
	}
	if (!tokens.length && !itokens.length && !raw) {
		return { skipped: { name, why: 'no usable patterns' } };
	}

	return {
		rule: {
			...base,
			ignorecase: rule.ignorecase === true,
			nonword: rule.nonword === true,
			raw,
			tokens,
			itokens,
			// An exception with its own (?i) ignores case whatever the rule says.
			exceptions: list(rule.exceptions)
				.filter((e) => !INLINE_I.test(e))
				.filter(keep),
			iexceptions: list(rule.exceptions)
				.filter((e) => INLINE_I.test(e))
				.map((e) => e.replace(INLINE_I, ''))
				.filter(keep)
		},
		dropped
	};
}

mkdirSync(OUT, { recursive: true });

for (const pkg of PACKAGES) {
	const url = `https://github.com/${pkg.repo}/releases/latest/download/${pkg.name}.zip`;
	// The first redirect names the tag (.../download/<tag>/<name>.zip), which
	// is the only place the archive's version is stated.
	const head = await fetch(url, { redirect: 'manual' });
	const version = head.headers.get('location')?.match(/\/download\/([^/]+)\//)?.[1] ?? '';
	const res = await fetch(url);
	if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
	const files = unzipSync(new Uint8Array(await res.arrayBuffer()));

	const rules = [];
	const skipped = [];
	let dropped = 0;

	for (const path of Object.keys(files).sort()) {
		// Configuration packages nest the style under styles/<name>/.
		const m = path.match(new RegExp(`(?:^|/)${pkg.name}/([^/]+)\\.yml$`));
		if (!m || path.includes('/config/')) continue;

		let rule;
		try {
			// A trailing `---` makes a second, empty document; Vale reads the first.
			rule = parseAllDocuments(strFromU8(files[path]))[0]?.toJS();
		} catch {
			continue;
		}
		if (!rule || typeof rule !== 'object' || !rule.extends) continue;

		const out = convert(m[1], rule);
		if (out.skipped) skipped.push(out.skipped);
		else {
			rules.push(out.rule);
			dropped += out.dropped ?? 0;
		}
	}

	const data = {
		name: pkg.name,
		repo: pkg.repo,
		homepage: `https://github.com/${pkg.repo}`,
		version,
		rules,
		skipped,
		droppedPatterns: dropped
	};

	writeFileSync(`${OUT}/${pkg.name}.json`, JSON.stringify(data) + '\n');
	console.log(
		`  ${pkg.name.padEnd(12)} ${version.padEnd(9)} ${String(rules.length).padStart(3)} rules, ` +
			`${skipped.length} skipped, ${dropped} patterns dropped`
	);
}

/*
 * src/lib/data/tools/style.json — the word-level checks behind
 * /tools/readability-checker.
 *
 * These are picked rule by rule from packages that each trace to a published
 * style guide or a tested rule set, and sorted into the three kinds the page's
 * legend shows. Each rule keeps its package's name (`Microsoft.Wordiness`), so
 * a finding can say where its advice comes from.
 */
const STYLE = [
	{
		name: 'Microsoft',
		repo: 'vale-cli/Microsoft',
		dir: 'Microsoft',
		guide: 'Microsoft Writing Style Guide',
		rules: { Wordiness: 'simpler', Adverbs: 'adverb' }
	},
	{
		name: 'RedHat',
		repo: 'redhat-documentation/vale-at-red-hat',
		dir: 'RedHat',
		guide: 'Red Hat style guide',
		rules: { SimpleWords: 'simpler' }
	},
	{
		name: 'Voices',
		repo: 'jdkato/voices',
		dir: 'Voices',
		guide: 'Voices',
		rules: {
			InflatedWords: 'simpler',
			WeakVerbs: 'simpler',
			ThroatClearing: 'filler',
			Weasel: 'filler',
			Puffery: 'filler'
		}
	},
	{
		name: 'Voices',
		repo: 'jdkato/voices',
		dir: 'Direct',
		guide: 'Voices',
		rules: { Hedging: 'filler' }
	}
];

{
	const archives = new Map();
	const sources = [];
	const rules = [];

	for (const src of STYLE) {
		const url = `https://github.com/${src.repo}/releases/latest/download/${src.name}.zip`;
		if (!archives.has(url)) {
			const head = await fetch(url, { redirect: 'manual' });
			const version = head.headers.get('location')?.match(/\/download\/([^/]+)\//)?.[1] ?? '';
			const res = await fetch(url);
			if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
			archives.set(url, { version, files: unzipSync(new Uint8Array(await res.arrayBuffer())) });
			sources.push({
				name: src.name,
				guide: src.guide,
				homepage: `https://github.com/${src.repo}`,
				version
			});
		}
		const { files } = archives.get(url);

		for (const [name, category] of Object.entries(src.rules)) {
			const path = Object.keys(files).find((p) => `/${p}`.endsWith(`/${src.dir}/${name}.yml`));
			// A rule that has been renamed or removed upstream should stop the
			// build, not quietly drop a category from the page.
			if (!path) throw new Error(`${src.name}: no ${src.dir}/${name}.yml in the archive`);

			const out = convert(name, parseAllDocuments(strFromU8(files[path]))[0]?.toJS());
			if (out.skipped) throw new Error(`${src.dir}.${name}: ${out.skipped.why}`);
			rules.push({ ...out.rule, name: `${src.dir}.${name}`, category, guide: src.guide });
		}
	}

	writeFileSync(`${OUT}/style.json`, JSON.stringify({ sources, rules }) + '\n');
	const patterns = rules.reduce(
		(n, r) => n + (r.swap?.length ?? 0) + (r.tokens?.length ?? 0) + (r.itokens?.length ?? 0),
		0
	);
	console.log(`  style        ${rules.length} rules, ${patterns} patterns`);
}
