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
			'Twelve formats, each through a real parser rather than a pattern. Rules can target headings, lists, or table cells—and code spans, URLs, and fenced blocks are skipped before a rule ever runs.'
	},
	{
		slug: 'code',
		icon: FileCode,
		title: 'Code-aware',
		tagline: 'Your comments are documentation too',
		description:
			'Vale lifts comments out of nineteen languages with tree-sitter grammars, so it knows where a comment ends and a marker inside a string literal stays code. The Markdown inside a doc comment is linted as though it were its own file.'
	},
	{
		slug: 'extensible',
		icon: SlidersHorizontal,
		title: 'Extensible',
		tagline: 'Rules that read grammar, not just strings',
		description:
			'Part-of-speech patterns, cross-file relationships, readability formulas, and Tengo scripts sit alongside the token lists—twelve extension points in all. Each is a few lines of YAML in a folder you can hand around as a package.'
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
