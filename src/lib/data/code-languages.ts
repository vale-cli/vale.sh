/**
 * The languages Vale lifts comments out of, for the strip under the landing
 * page's code row.
 *
 * Taken from `GetLanguageFromExt` in internal/lint/code/lang.go, which is the
 * authority: nineteen entries, one per tree-sitter grammar Vale links in.
 * `.jsx` maps to the JavaScript grammar and is not listed separately here.
 *
 * `slug` keys into brandIcons. Java shows OpenJDK and TSX shows React because
 * Simple Icons carries neither a Java nor a TSX mark, and QML shows Qt, whose
 * language it is. Protobuf has no mark and falls back to the generic glyph the
 * strip supplies.
 */
export type CodeLanguage = {
	name: string;
	/** A key into `brandIcons`. Absent when no mark exists for the language. */
	slug?: string;
	ext: string;
};

export const codeLanguages: CodeLanguage[] = [
	{ name: 'Go', slug: 'go', ext: '.go' },
	{ name: 'Rust', slug: 'rust', ext: '.rs' },
	{ name: 'Python', slug: 'python', ext: '.py' },
	{ name: 'Ruby', slug: 'ruby', ext: '.rb' },
	{ name: 'C++', slug: 'cplusplus', ext: '.cpp' },
	{ name: 'C', slug: 'c', ext: '.c' },
	{ name: 'JavaScript', slug: 'javascript', ext: '.js, .jsx' },
	{ name: 'TypeScript', slug: 'typescript', ext: '.ts' },
	{ name: 'TSX', slug: 'react', ext: '.tsx' },
	{ name: 'Java', slug: 'openjdk', ext: '.java' },
	{ name: 'Haskell', slug: 'haskell', ext: '.hs' },
	{ name: 'Julia', slug: 'julia', ext: '.jl' },
	{ name: 'Lua', slug: 'lua', ext: '.lua' },
	{ name: 'PHP', slug: 'php', ext: '.php' },
	{ name: 'R', slug: 'r', ext: '.r' },
	{ name: 'QML', slug: 'qt', ext: '.qml' },
	{ name: 'Protobuf', ext: '.proto' },
	{ name: 'YAML', slug: 'yaml', ext: '.yml' },
	{ name: 'CSS', slug: 'css', ext: '.css' }
];
