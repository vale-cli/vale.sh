import { createHighlighter } from 'shiki';
import { before, voices } from '$lib/data/voices';
import type { PageServerLoad } from './$types';

/**
 * Highlighting happens here rather than in the component because the site is
 * prerendered: Shiki runs once at build time and the page ships plain HTML,
 * with no highlighter in the bundle.
 *
 * The themes are the pair mdsvex.config.js uses, so a snippet here and a
 * snippet in the docs are coloured the same way.
 */
const snippets = {
	rule: {
		lang: 'yaml',
		code: `extends: substitution
message: "Weak verb: use '%s' instead of '%s'."
level: error
action:
  name: replace
swap:
  'ma(?:ke|de) a decision': decided
  'in order to': to`
	},
	budget: {
		lang: 'yaml',
		code: `extends: occurrence
message: "%d slang terms in one sentence. Budget is one."
level: error
scope: sentence
max: 1
token: '\\b(?:W|L|cooked|rizz|mid|no cap|based|delulu|cap)\\b'`
	},
	loop: {
		lang: 'console',
		code: `$ echo "The team made a decision in order to ship." | vale --ext=.md
stdin.md:1:10  use 'decided' instead of 'made a decision'
stdin.md:1:26  use 'to' instead of 'in order to'
exit=1

$ echo "The team decided to ship." | vale --ext=.md
exit=0`
	},
	json: {
		lang: 'json',
		code: `{
  "Match": "made a decision",
  "Action": { "Name": "replace", "Params": ["decided"] }
}`
	},
	brief: {
		lang: 'markdown',
		code: `- **Density** — at most 1 of (W, L, cooked, rizz, mid,
  no cap, based, delulu, cap) per sentence
- **Presence** — at least 1 of (…) per paragraph
- **Register** — never write: "furthermore", "moreover",
  "thus", "hence", "it is imperative"`
	},
	config: {
		lang: 'ini',
		code: `Packages = https://github.com/jdkato/voices/releases/latest/download/Voices.zip

[*.md]
BasedOnStyles = Voices, Direct`
	}
};

export const load: PageServerLoad = async () => {
	const highlighter = await createHighlighter({
		themes: ['github-light', 'slack-dark'],
		langs: ['yaml', 'json', 'ini', 'console', 'markdown']
	});

	// No `defaultColor: false` anywhere here: that emits CSS variables only,
	// and the stylesheet defines the dark half alone, so light mode came out
	// uncoloured. Leaving the default inlines the light theme and lets the
	// existing `html.dark .shiki` rule swap in the dark one -- the same way
	// every code block rendered through mdsvex works.
	const render = (code: string, lang: string) =>
		highlighter.codeToHtml(code, { lang, themes: { light: 'github-light', dark: 'slack-dark' } });

	const html: Record<string, string> = {};
	for (const [name, { lang, code }] of Object.entries(snippets)) {
		html[name] = render(code, lang);
	}

	// The drafts are real files from the package, so they are highlighted the
	// same way as everything else rather than dropped into a <pre>.
	const drafts = {
		before: render(before, 'markdown'),
		after: Object.fromEntries(voices.map((v) => [v.name, render(v.after, 'markdown')]))
	};

	return { code: html, drafts };
};
