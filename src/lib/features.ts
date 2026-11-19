import Code from 'lucide-svelte/icons/code';
import FileCode from 'lucide-svelte/icons/file-code-2';
import Layers from 'lucide-svelte/icons/layers';
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
		title: 'Scopes',
		tagline: 'Parses your markup instead of guessing at it',
		description:
			'Twelve formats, each through a real parser rather than a pattern. Rules can target headings, lists, or table cells—and code spans, URLs, and fenced blocks are skipped before a rule ever runs.'
	},
	{
		slug: 'code',
		icon: FileCode,
		title: 'Code',
		tagline: 'Your comments are documentation too',
		description:
			'Vale lifts comments out of nineteen languages with tree-sitter grammars, so it knows where a comment ends and a marker inside a string literal stays code. The Markdown inside a doc comment is linted as though it were its own file.'
	},
	{
		slug: 'views',
		icon: Layers,
		title: 'Views',
		tagline: 'Prose inside files that aren’t prose',
		description:
			'An OpenAPI description, a notebook cell, the body of a commit, a docstring: a View says where the prose is in a file that isn’t a document, so Vale lints that and passes over the rest. A rule can target any one part by name.'
	},
	{
		slug: 'speed',
		icon: Gauge,
		title: 'Speed',
		tagline: 'One binary, nothing to install alongside it',
		description:
			'Written in Go, with no runtime and files linted in parallel. GitLab runs 82 rules across all 2,826 pages of its documentation in under thirteen seconds.'
	}
] as const;

export type Feature = (typeof features)[number];

export function otherFeatures(slug: string): readonly Feature[] {
	return features.filter((f) => f.slug !== slug);
}
