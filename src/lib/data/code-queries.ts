/**
 * The language picker on /features/code. `prose: true` marks the lines a rule
 * actually sees — which is the argument: the boundary is drawn by the
 * grammar, not by looking for a `#` or a `//`. `query` is the tree-sitter
 * query that draws it.
 */
export type Line = { v: string; prose?: boolean };

export const languages: {
	id: string;
	label: string;
	file: string;
	query: string;
	note: string;
	lines: Line[];
}[] = [
	{
		id: 'go',
		label: 'Go',
		file: 'store.go',
		query: '(comment) @comment',
		note: 'One query covers line and block comments alike—the grammar already knows the difference.',
		lines: [
			{ v: 'package store' },
			{ v: '' },
			{ v: '// Get returns the record for id.', prose: true },
			{ v: '//', prose: true },
			{ v: '// It can utilize the cache when possible.', prose: true },
			{ v: 'func Get(id string) (*Record, error) {' },
			{ v: '\tkey := "// not a comment"' },
			{ v: '\treturn s.lookup(key + id)' },
			{ v: '}' }
		]
	},
	{
		id: 'py',
		label: 'Python',
		file: 'store.py',
		query: `((function_definition
  body: (block . (expression_statement (string) @docstring)))
 (#offset! @docstring 0 3 0 -3))`,
		note: 'Docstrings are string literals, not comments. Only a grammar can tell one apart from a string that happens to sit at the top of a function.',
		lines: [
			{ v: 'def get(id):' },
			{ v: '    """Return the record for id.', prose: true },
			{ v: '', prose: true },
			{ v: '    It can utilize the cache when possible.', prose: true },
			{ v: '    """', prose: true },
			{ v: '    marker = """not a docstring"""' },
			{ v: '    return lookup(marker + id)' }
		]
	},
	{
		id: 'rs',
		label: 'Rust',
		file: 'store.rs',
		query: '(line_comment)+ @comment',
		note: "Rust's grammar calls `///` and `//!` line comments, so doc comments come along without a special case. The trailing `+` groups a run of adjacent comments into one block, so a rule sees the whole passage rather than each line alone.",
		lines: [
			{ v: '/// Returns the record for `id`.', prose: true },
			{ v: '///', prose: true },
			{ v: '/// It can utilize the cache when possible.', prose: true },
			{ v: 'pub fn get(id: &str) -> Option<Record> {' },
			{ v: '    let key = "/// not a comment";' },
			{ v: '    lookup(&format!("{key}{id}"))' },
			{ v: '}' }
		]
	},
	{
		id: 'js',
		label: 'JavaScript',
		file: 'store.js',
		query: '(comment) @comment',
		note: 'JSDoc blocks are comments too. The leading asterisks are stripped before the body reaches a rule.',
		lines: [
			{ v: '/**', prose: true },
			{ v: ' * Returns the record for `id`.', prose: true },
			{ v: ' *', prose: true },
			{ v: ' * It can utilize the cache when possible.', prose: true },
			{ v: ' */', prose: true },
			{ v: 'export function get(id) {' },
			{ v: '  const key = "/* not a comment */";' },
			{ v: '  return lookup(key + id);' },
			{ v: '}' }
		]
	}
];
