import { highlightAll } from '$lib/server/highlight';
import { getStats } from '$lib/server/stats';
import { listPosts } from '$lib/posts';
import type { PageServerLoad } from './$types';

// The page is prerendered, so this runs once per build.
export const load: PageServerLoad = async ({ fetch }) => {
	const [stats, snippets] = await Promise.all([
		getStats(fetch),
		highlightAll({
			// The hero's flow figure, one rule per kind of writing, each in the
			// form that ships: a terminology table with a fix action, Leonard's
			// fourth rule from the Fiction package with its exceptions, and the
			// unit rule from Journals. Only the word lists are trimmed.
			heroTechnical: {
				code: `extends: substitution
message: "Use '%s' instead of '%s'."
level: error
action:
  name: replace
swap:
  'Vale cli|vale-cli': Vale CLI
  'style ?guide': style guide
  'e-?mail': email`,
				lang: 'yaml'
			},
			heroCreative: {
				code: `extends: existence
message: "Drop the adverb on the tag: '%s'."
link: https://github.com/jdkato/fiction
level: warning
ignorecase: true
tokens:
  - '(?:said|asked|replied) \\w+ly'
  - '\\w+ly,? (?:s?he|they|[A-Z]\\w+) said'
exceptions:
  - only
  - early
  - reply`,
				lang: 'yaml'
			},
			heroScientific: {
				code: `extends: existence
message: "Put a space between the number and the unit: '%s'."
link: https://github.com/jdkato/journals
level: warning
nonword: true
raw:
  - '(?<![\\w.])\\d+(?:\\.\\d+)?(?:mm|cm|kg|mg|mL|min|kPa|mmHg)\\b'`,
				lang: 'yaml'
			},
			config: {
				code: `StylesPath = styles
MinAlertLevel = suggestion
Packages = Microsoft

[*.md]
BasedOnStyles = Vale, Microsoft`,
				lang: 'ini'
			},
			rule: {
				code: `extends: substitution
message: "Use '%s' instead of '%s'."
level: warning
swap:
  utilize: use`,
				lang: 'yaml'
			},
			commands: { code: '$ vale sync\n$ vale docs/', lang: 'console' }
		})
	]);
	// The three newest posts; the blog index has the rest.
	const posts = listPosts();
	return { stats, snippets, posts: posts.slice(0, 3), postCount: posts.length };
};
