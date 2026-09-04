import {
	createHighlighter,
	type Highlighter,
	type LanguageRegistration,
	type ThemeRegistrationRaw
} from 'shiki';
import { themes, valeIni } from '$lib/shiki.mjs';

/**
 * Code highlighting for pages, with the blog's own palette.
 *
 * Server-only: every page that shows code is prerendered, so this runs once
 * per build and the browser never loads a highlighter. A page's load function
 * highlights its snippets and hands the HTML to a CodeBlock.
 */
let instance: Promise<Highlighter> | undefined;

function highlighter() {
	instance ??= createHighlighter({
		langAlias: { ini: 'vale-ini' },
		// The palette and grammar are plain JS, shared with mdsvex.config.js,
		// so their shapes are asserted here rather than inferred.
		themes: themes as unknown as ThemeRegistrationRaw[],
		langs: [
			'bash',
			'console',
			'json',
			'plaintext',
			'scheme',
			'yaml',
			valeIni as LanguageRegistration
		]
	});
	return instance;
}

export type Lang = 'bash' | 'console' | 'ini' | 'json' | 'plaintext' | 'scheme' | 'yaml';

/** Renders code as highlighted HTML, light and dark themes both. */
export async function highlight(code: string, lang: Lang): Promise<string> {
	const h = await highlighter();
	return h.codeToHtml(code, { lang, themes: { light: 'vale-light', dark: 'vale-dark' } });
}

/** Highlights a keyed set of snippets, keeping the keys. */
export async function highlightAll<K extends string>(
	snippets: Record<K, { code: string; lang: Lang }>
): Promise<Record<K, string>> {
	const out = {} as Record<K, string>;
	for (const key of Object.keys(snippets) as K[]) {
		out[key] = await highlight(snippets[key].code, snippets[key].lang);
	}
	return out;
}
