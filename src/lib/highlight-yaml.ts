/**
 * A very small YAML highlighter for the rule snippets on the landing page.
 *
 * Shiki already runs on this site, but only through mdsvex, at build time, for
 * markdown pages. Reaching it from a component means threading highlighted
 * HTML down from a load function; for six short snippets of a grammar we fully
 * control, a tokenizer is the smaller thing to own.
 *
 * It handles exactly what those snippets contain: comments, `key:` pairs,
 * quoted scalars, list markers, and block scalars (`|`). Inside a block scalar
 * the body is no longer YAML -- it is a Tengo program or an arithmetic formula
 * -- so it gets its own minimal pass rather than being forced through the YAML
 * rules, which would color `text :=` as a key.
 *
 * It is deliberately not a YAML parser. Anchors, flow collections, multi-line
 * plain scalars, and `? :` keys are not handled because no snippet uses them.
 */
export type TokenKind = 'key' | 'string' | 'comment' | 'punct' | 'value' | 'plain';

export type Token = { t: TokenKind; v: string };

/** Tailwind classes per token kind, resolved in the component. */
export const tokenClass: Record<TokenKind, string> = {
	key: 'text-sky-700 dark:text-sky-300',
	string: 'text-lime-700 dark:text-lime-400',
	comment: 'italic text-muted-foreground/60',
	punct: 'text-muted-foreground/60',
	value: 'text-foreground/90',
	plain: 'text-foreground/80'
};

const KEY = /^(\s*)(?:(-\s+))?([A-Za-z_][\w-]*)(:)(\s*)(.*)$/;
const COMMENT = /^(\s*)(#.*)$/;
const LIST_ITEM = /^(\s*)(-\s+)(.*)$/;

/** Quoted scalar, or a bare value. `#` starts a trailing comment either way. */
function scalar(rest: string): Token[] {
	if (!rest) return [];

	const quoted = /^(['"])(.*?)\1(.*)$/.exec(rest);
	if (quoted) {
		const out: Token[] = [{ t: 'string', v: quoted[1] + quoted[2] + quoted[1] }];
		if (quoted[3]) out.push(...scalar(quoted[3].trimEnd()), { t: 'plain', v: '' });
		return out;
	}

	const hash = rest.indexOf('#');
	if (hash > 0) {
		return [
			{ t: 'value', v: rest.slice(0, hash) },
			{ t: 'comment', v: rest.slice(hash) }
		];
	}

	// `|` and `>` open a block scalar; they are structure, not a value.
	if (rest === '|' || rest === '>' || rest === '|-' || rest === '>-') {
		return [{ t: 'punct', v: rest }];
	}

	return [{ t: 'value', v: rest }];
}

/** Block-scalar bodies: Tengo and arithmetic. Comments and strings only. */
function blockLine(line: string): Token[] {
	const out: Token[] = [];
	const re = /(\/\/.*$)|("(?:[^"\\]|\\.)*")/g;

	let last = 0;
	let m: RegExpExecArray | null;

	while ((m = re.exec(line))) {
		if (m.index > last) out.push({ t: 'plain', v: line.slice(last, m.index) });
		out.push({ t: m[1] ? 'comment' : 'string', v: m[0] });
		last = m.index + m[0].length;
	}
	if (last < line.length) out.push({ t: 'plain', v: line.slice(last) });

	return out;
}

/**
 * Tokenize a YAML snippet, one array of tokens per line.
 *
 * Blank lines come back as empty arrays; the caller renders them as an empty
 * row so the snippet keeps its shape.
 */
export function highlightYaml(source: string): Token[][] {
	// Indentation of the `key: |` that opened the current block scalar, or null
	// when we are reading ordinary YAML. A line indented past it belongs to the
	// block; the first line that is not ends it.
	let blockIndent: number | null = null;

	return source.split('\n').map((line) => {
		if (line.trim() === '') return [];

		const indent = line.length - line.trimStart().length;

		if (blockIndent !== null) {
			if (indent > blockIndent) {
				return [
					{ t: 'plain' as const, v: line.slice(0, indent) },
					...blockLine(line.slice(indent))
				];
			}
			blockIndent = null;
		}

		const comment = COMMENT.exec(line);
		if (comment) {
			return [
				{ t: 'plain', v: comment[1] },
				{ t: 'comment', v: comment[2] }
			];
		}

		const key = KEY.exec(line);
		if (key) {
			const [, lead, dash, name, colon, space, rest] = key;

			if (rest === '|' || rest === '>' || rest === '|-' || rest === '>-') blockIndent = indent;

			const out: Token[] = [{ t: 'plain', v: lead }];
			if (dash) out.push({ t: 'punct', v: dash });
			out.push({ t: 'key', v: name }, { t: 'punct', v: colon });
			if (space) out.push({ t: 'plain', v: space });
			out.push(...scalar(rest));

			return out;
		}

		const item = LIST_ITEM.exec(line);
		if (item) {
			return [
				{ t: 'plain' as const, v: item[1] },
				{ t: 'punct' as const, v: item[2] },
				...scalar(item[3])
			];
		}

		return [{ t: 'plain', v: line }];
	});
}
