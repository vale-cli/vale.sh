/**
 * Measured strictness: the alerts a guide's rules raise on one fixed sample
 * of prose, per 1,000 words, by level.
 *
 * The sample in ./corpus is seven pages of the Vale docs (packages, globbing,
 * lsp, urls, vocabularies, spelling, commit-messages), committed so the
 * numbers can be reproduced. Spelling rules are switched off, since they measure the
 * sample's product names rather than the guide.
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const CORPUS = fileURLToPath(new URL('./corpus/', import.meta.url));
const LEVELS = ['error', 'warning', 'suggestion'];

/** Words of prose in Markdown, leaving out code, link targets, and markup. */
export function proseWords(md) {
	const text = md
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`[^`\n]*`/g, ' ')
		.replace(/\]\([^)]*\)/g, ']')
		.replace(/<[^>]+>/g, ' ');
	return (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu) ?? []).length;
}

/** The sample's size in words. */
export const corpusWords = () =>
	readdirSync(CORPUS)
		.filter((f) => f.endsWith('.md'))
		.reduce((n, f) => n + proseWords(readFileSync(join(CORPUS, f), 'utf8')), 0);

/** $VALE, or `vale` on PATH; null when neither runs. */
export function findVale() {
	for (const bin of [process.env.VALE, 'vale'].filter(Boolean)) {
		try {
			const version = execFileSync(bin, ['--version'], { stdio: ['ignore', 'pipe', 'ignore'] })
				.toString()
				.trim();
			return { bin, version };
		} catch {
			// try the next one
		}
	}
	return null;
}

/** Spelling rules in a style directory, as "Style.Rule". */
function spellingRules(stylesPath, style) {
	return readdirSync(join(stylesPath, style))
		.filter((f) => /\.ya?ml$/.test(f))
		.filter((f) => /^extends:\s*spelling\b/m.test(readFileSync(join(stylesPath, style, f), 'utf8')))
		.map((f) => `${style}.${f.replace(/\.ya?ml$/, '')}`);
}

/**
 * Runs `styles` (directories under `stylesPath`) over the sample. A rule
 * Vale can't load is switched off and listed in `skipped`.
 */
export function measure(vale, stylesPath, styles, words = corpusWords()) {
	const dir = mkdtempSync(join(tmpdir(), 'guide-strictness-'));
	const off = styles.flatMap((s) => spellingRules(stylesPath, s));
	const skipped = [];
	try {
		for (;;) {
			const ini = join(dir, '.vale.ini');
			writeFileSync(
				ini,
				[
					`StylesPath = ${stylesPath}`,
					'MinAlertLevel = suggestion',
					'[*.md]',
					`BasedOnStyles = ${styles.join(', ')}`,
					...[...off, ...skipped].map((r) => `${r} = NO`)
				].join('\n') + '\n'
			);
			let out;
			try {
				out = execFileSync(vale, ['--config', ini, '--output=JSON', '--no-exit', CORPUS], {
					cwd: dir,
					maxBuffer: 1 << 28,
					stdio: ['ignore', 'pipe', 'pipe']
				}).toString();
			} catch (e) {
				out = `${e.stdout ?? ''}${e.stderr ?? ''}`;
			}
			let alerts;
			try {
				alerts = JSON.parse(out);
			} catch {
				alerts = null;
			}
			if (alerts && !alerts.Code) {
				const counts = { error: 0, warning: 0, suggestion: 0 };
				for (const list of Object.values(alerts)) for (const a of list) counts[a.Severity]++;
				const per1k = Object.fromEntries(
					LEVELS.map((l) => [l, Math.round((counts[l] / words) * 10000) / 10])
				);
				const total =
					Math.round(((counts.error + counts.warning + counts.suggestion) / words) * 10000) / 10;
				return { words, counts, per1k: { ...per1k, total }, skipped };
			}
			// A rule that fails to load names its file; switch it off and go again.
			const bad = /([^/\s"]+)[/\\]([^/\s"]+)\.ya?ml/.exec(out);
			const rule = bad && `${bad[1]}.${bad[2]}`;
			if (!rule || skipped.includes(rule) || skipped.length > 20) {
				throw new Error(`vale failed on ${styles.join(', ')}:\n${out.slice(0, 800)}`);
			}
			skipped.push(rule);
		}
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}
