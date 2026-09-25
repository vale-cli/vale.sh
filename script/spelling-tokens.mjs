// Highlight the spell-checker post's excerpts with the site's palette.
//
//   node script/spelling-tokens.mjs
//
// The excerpts live in src/lib/data/spelling-samples.json as spans, so a
// marker can be lit by the tool that reported it. Highlighting has to be laid
// over that, and it is done here once rather than in the browser: shiki
// tokenizes each excerpt in both themes, and the tokens are written to
// src/lib/data/spelling-tokens.json for the component to merge with the
// spans. Rerun after regenerating the excerpts.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHighlighter } from 'shiki';
import { themes } from '../src/lib/shiki.mjs';

const samples = JSON.parse(
	readFileSync(new URL('../src/lib/data/spelling-samples.json', import.meta.url))
);
const langs = [...new Set(samples.map((s) => s.lang))];
const highlighter = await createHighlighter({ themes, langs });

const out = {};
for (const sample of samples) {
	const code = sample.lines.map((line) => line.map((s) => s.text).join('')).join('\n');
	const both = ['vale-light', 'vale-dark'].map((theme) => ({
		fg: highlighter.getTheme(theme).fg,
		lines: highlighter.codeToTokensBase(code, { lang: sample.lang, theme })
	}));
	// The grammar is the same under both themes, so the token boundaries
	// are; only the colors differ. Plain text has no scopes, so its tokens
	// carry the theme's foreground.
	out[sample.id] = both[0].lines.map((line, i) =>
		line.map((tok, j) => ({
			t: tok.content,
			l: tok.color ?? both[0].fg,
			d: both[1].lines[i][j].color ?? both[1].fg
		}))
	);
}

writeFileSync(
	new URL('../src/lib/data/spelling-tokens.json', import.meta.url),
	JSON.stringify(out) + '\n'
);
console.log(Object.keys(out).join(', '));
