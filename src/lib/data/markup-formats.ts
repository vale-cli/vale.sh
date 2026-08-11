/**
 * The twelve markup formats Vale parses, for the strip under the landing
 * page's markup row.
 *
 * Names, order, and extensions match the table on /features/markup, which is
 * itself taken from docs.vale.sh/formats.
 *
 * `slug` keys into brandIcons. Three of the twelve have no mark anywhere --
 * reStructuredText, MyST, and DITA -- and two borrow the mark of the project
 * that defines them rather than of the format itself: AsciiDoc shows
 * Asciidoctor, the parser Vale hands `.adoc` to, and QDoc shows Qt, whose tool
 * it is. The strip draws a generic document glyph for the three that have
 * none, which is honest and keeps the row visually even.
 */
export type MarkupFormat = {
	name: string;
	/** A key into `brandIcons`. Absent when no mark exists for the format. */
	slug?: string;
	ext: string;
};

export const markupFormats: MarkupFormat[] = [
	{ name: 'Markdown', slug: 'markdown', ext: '.md' },
	{ name: 'AsciiDoc', slug: 'asciidoctor', ext: '.adoc' },
	{ name: 'reStructuredText', ext: '.rst' },
	{ name: 'MDX', slug: 'mdx', ext: '.mdx' },
	{ name: 'MyST', ext: '.myst' },
	{ name: 'Quarto', slug: 'quarto', ext: '.qmd' },
	{ name: 'Typst', slug: 'typst', ext: '.typ' },
	{ name: 'HTML', slug: 'html5', ext: '.html' },
	{ name: 'XML', slug: 'xml', ext: '.xml' },
	{ name: 'DITA', ext: '.dita' },
	{ name: 'Org', slug: 'org', ext: '.org' },
	{ name: 'QDoc', slug: 'qt', ext: '.qdoc' }
];
