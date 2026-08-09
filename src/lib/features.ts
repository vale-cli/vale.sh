import Code from 'lucide-svelte/icons/code';
import FileCode from 'lucide-svelte/icons/file-code-2';
import SlidersHorizontal from 'lucide-svelte/icons/sliders-horizontal';
import Gauge from 'lucide-svelte/icons/gauge';

/**
 * The four deep-dive pages under /features.
 *
 * Shared so the landing cards, the in-page "keep reading" rail, and the
 * metadata on each page all read from one list — a fifth feature only has to
 * be added here and given a route.
 */
export const features = [
	{
		slug: 'markup',
		icon: Code,
		title: 'Markup-aware',
		tagline: 'Parses your markup instead of guessing at it',
		description:
			'Markdown, AsciiDoc, reStructuredText, MDX, MyST, Quarto, Typst, HTML, XML, DITA, Org, and QDoc each go through a real parser. Rules can target headings, lists, or table cells—and code spans, URLs, and fenced blocks are skipped before a rule ever runs.'
	},
	{
		slug: 'code',
		icon: FileCode,
		title: 'Code-aware',
		tagline: 'Your comments are documentation too',
		description:
			'Vale lifts comments out of more than twenty languages with tree-sitter grammars, so it knows where a comment ends and a marker inside a string literal stays code. The Markdown inside a doc comment is linted as though it were its own file.'
	},
	{
		slug: 'extensible',
		icon: SlidersHorizontal,
		title: 'Extensible',
		tagline: 'Rules are YAML—no plugin API, no compile step',
		description:
			'Twelve extension points, from banned terms to readability scores to part-of-speech patterns. Write one in a text editor, drop it in a folder, and share the folder as a package.'
	},
	{
		slug: 'speed',
		icon: Gauge,
		title: 'Fast',
		tagline: 'One binary, nothing to install alongside it',
		description:
			'Written in Go, with no runtime and files linted in parallel. GitLab runs 82 rules across all 2,827 pages of its documentation in under twenty seconds.'
	}
] as const;

export type Feature = (typeof features)[number];

export function otherFeatures(slug: string): readonly Feature[] {
	return features.filter((f) => f.slug !== slug);
}
