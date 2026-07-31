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
		tagline: 'Parses your source instead of pattern-matching it',
		description:
			'Markdown, AsciiDoc, reStructuredText, HTML, DITA, and Org—each parsed by a real parser, so rules can target headings, lists, or table cells and skip code and URLs entirely.'
	},
	{
		slug: 'code',
		icon: FileCode,
		title: 'Code-aware',
		tagline: 'Reads comments with tree-sitter, in 20+ languages',
		description:
			'Comments are prose. Vale extracts them with a real grammar—never a regex—and can lint the Markdown inside them as if it were a standalone file.'
	},
	{
		slug: 'extensible',
		icon: SlidersHorizontal,
		title: 'Extensible',
		tagline: 'Rules are YAML—no plugin API, no compile step',
		description:
			'Twelve extension points cover everything from banned terms to readability scores and part-of-speech patterns. Write a rule in a text editor, share it as a package.'
	},
	{
		slug: 'speed',
		icon: Gauge,
		title: 'Fast',
		tagline: 'One binary, no runtime, files linted in parallel',
		description:
			'A single Go executable with nothing to install alongside it. GitLab checks all 2,827 pages of its documentation with it.'
	}
] as const;

export type Feature = (typeof features)[number];

export function otherFeatures(slug: string): readonly Feature[] {
	return features.filter((f) => f.slug !== slug);
}
