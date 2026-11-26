/**
 * What Vale can read, one entry per format the generator offers.
 *
 * The extensions and kinds mirror Vale's own format table
 * (internal/core/format.go); the site has no way to read that table at build
 * time, so this is kept by hand and checked against it when a format lands.
 */

export type Group = 'prose' | 'code' | 'structured';

export type Requirement = {
	/** The executable Vale looks for on the PATH. */
	tool: string;
	install: string;
	docs: string;
};

/** A View file the config depends on, written under the StylesPath. */
export type ViewFile = {
	name: string;
	contents: string;
};

/** A package that only makes sense alongside one format. */
export type Extra = {
	value: string;
	label: string;
	description: string;
};

export type Format = {
	id: string;
	label: string;
	group: Group;
	/** Extensions as they appear in a section glob, without the dot. */
	extensions: string[];
	/** A section pattern that is not a plain extension list. */
	glob?: string;
	description: string;
	docs: string;
	requires?: Requirement;
	extras?: Extra[];
	/** The section names this View, and the file is part of the output. */
	view?: ViewFile;
};

function format(f: Format): Format {
	return f;
}

const xsltproc: Requirement = {
	tool: 'xsltproc',
	install: 'brew install libxslt  # or: apt-get install xsltproc',
	docs: '/docs/formats/xml'
};
const ditaOT: Requirement = {
	tool: 'dita',
	install: 'DITA Open Toolkit, with its bin directory on the PATH',
	docs: '/docs/formats/dita'
};

const notebookView: ViewFile = {
	name: 'Notebook',
	contents: [
		'engine: dasel',
		'scopes:',
		'  - name: cell',
		'    expr: cells.all().filter(equal(cell_type,markdown)).source',
		'    join: ""',
		'    type: md',
		''
	].join('\n')
};

const openAPIView: ViewFile = {
	name: 'OpenAPI',
	contents: [
		'engine: dasel',
		'scopes:',
		'  - name: title',
		'    expr: info.title',
		'',
		'  - name: description',
		'    expr: search(has("description")).map(description)',
		'    type: md',
		'',
		'  - name: summary',
		'    expr: search(has("summary")).map(summary)',
		'    type: md',
		''
	].join('\n')
};

const schemaView: ViewFile = {
	name: 'Schema',
	contents: [
		'engine: dasel',
		'scopes:',
		'  - name: description',
		'    expr: definitions.search(has("description")).map(description)',
		'    type: md',
		''
	].join('\n')
};

// Single-quoted on purpose: `${Subject}` is TextFSM's own syntax.
const commitView: ViewFile = {
	name: 'Commit',
	contents: [
		'engine: textfsm',
		'template: |',
		'  Value Subject (.+)',
		'  Value List Body (.*)',
		'  Value List Trailer ((?:BREAKING CHANGE|[A-Z][\\w-]+): .+)',
		'',
		'  Start',
		'    ^${Subject} -> Body',
		'',
		'  Body',
		'    ^# -> Next',
		'    ^${Trailer}',
		'    ^${Body}',
		'scopes:',
		'  - name: subject',
		'    expr: Subject',
		'',
		'  - name: body',
		'    expr: Body',
		'    type: md',
		'',
		'  - name: trailer',
		'    expr: Trailer',
		''
	].join('\n')
};

export const formats: Format[] = [
	// Prose ---------------------------------------------------------------
	format({
		id: 'md',
		label: 'Markdown',
		group: 'prose',
		extensions: ['md'],
		description: 'CommonMark and GitHub-flavored Markdown, front matter included.',
		docs: '/docs/formats/markdown',
		extras: [
			{
				value: 'Hugo',
				label: 'Hugo shortcodes',
				description: 'Skips Hugo shortcodes and other non-standard markup.'
			}
		]
	}),
	format({
		id: 'mdx',
		label: 'MDX',
		group: 'prose',
		extensions: ['mdx'],
		description: 'Markdown with JSX. Expressions are skipped; the text inside elements is linted.',
		docs: '/docs/formats/mdx',
		extras: [
			{
				value: 'MDX',
				label: 'MDX comments',
				description: 'Reads Vale directives written as JSX comments.'
			}
		]
	}),
	format({
		id: 'rst',
		label: 'reStructuredText',
		group: 'prose',
		extensions: ['rst'],
		description: 'Sphinx and docutils documents.',
		docs: '/docs/formats/restructuredtext'
	}),
	format({
		id: 'adoc',
		label: 'AsciiDoc',
		group: 'prose',
		extensions: ['adoc'],
		description: 'Asciidoctor documents; literals and source blocks are skipped.',
		docs: '/docs/formats/asciidoc'
	}),
	format({
		id: 'html',
		label: 'HTML',
		group: 'prose',
		extensions: ['html'],
		description: 'Text content of the page; scripts, styles, and code are skipped.',
		docs: '/docs/formats/html'
	}),
	format({
		id: 'org',
		label: 'Org',
		group: 'prose',
		extensions: ['org'],
		description: 'Emacs Org mode documents.',
		docs: '/docs/formats/org'
	}),
	format({
		id: 'typ',
		label: 'Typst',
		group: 'prose',
		extensions: ['typ'],
		description: 'Typst documents, read with the compiler’s own parser.',
		docs: '/docs/formats/typst'
	}),
	format({
		id: 'tex',
		label: 'LaTeX',
		group: 'prose',
		extensions: ['tex'],
		description: 'LaTeX sources, read without running TeX; math, citations, and the preamble are skipped.',
		docs: '/docs/formats/latex'
	}),
	format({
		id: 'qmd',
		label: 'Quarto',
		group: 'prose',
		extensions: ['qmd'],
		description: 'Quarto documents; code cells are skipped.',
		docs: '/docs/formats/quarto'
	}),
	format({
		id: 'Rmd',
		label: 'R Markdown',
		group: 'prose',
		extensions: ['Rmd'],
		description: 'R Markdown documents; code chunks are skipped.',
		docs: '/docs/formats/rmarkdown'
	}),
	format({
		id: 'myst',
		label: 'MyST',
		group: 'prose',
		extensions: ['myst'],
		description: 'MyST Markdown, with its roles and directives.',
		docs: '/docs/formats/myst'
	}),
	format({
		id: 'xml',
		label: 'XML',
		group: 'prose',
		extensions: ['xml'],
		description: 'Any XML, through a stylesheet you provide with Transform.',
		docs: '/docs/formats/xml',
		requires: xsltproc
	}),
	format({
		id: 'dita',
		label: 'DITA',
		group: 'prose',
		extensions: ['dita'],
		description: 'DITA topics, through the DITA Open Toolkit.',
		docs: '/docs/formats/dita',
		requires: ditaOT
	}),
	format({
		id: 'qdoc',
		label: 'QDoc',
		group: 'prose',
		extensions: ['qdoc'],
		description: 'Qt documentation sources.',
		docs: '/docs/formats/qdoc'
	}),
	format({
		id: 'txt',
		label: 'Plain text',
		group: 'prose',
		extensions: ['txt'],
		description: 'Lines and paragraphs, with no markup to skip.',
		docs: '/docs/formats/text'
	}),

	// Code: the comments, with the same styles -----------------------------
	format({
		id: 'py',
		label: 'Python',
		group: 'code',
		extensions: ['py'],
		description: 'Comments and docstrings.',
		docs: '/docs/formats/code'
	}),
	format({
		id: 'go',
		label: 'Go',
		group: 'code',
		extensions: ['go'],
		description: 'Line and block comments.',
		docs: '/docs/formats/code'
	}),
	format({
		id: 'rs',
		label: 'Rust',
		group: 'code',
		extensions: ['rs'],
		description: 'Line comments, doc comments included.',
		docs: '/docs/formats/code'
	}),
	format({
		id: 'js',
		label: 'JavaScript',
		group: 'code',
		extensions: ['js', 'jsx'],
		description: 'Line and block comments, JSDoc included.',
		docs: '/docs/formats/code'
	}),
	format({
		id: 'ts',
		label: 'TypeScript',
		group: 'code',
		extensions: ['ts', 'tsx'],
		description: 'Line and block comments, TSDoc included.',
		docs: '/docs/formats/code'
	}),
	format({
		id: 'java',
		label: 'Java',
		group: 'code',
		extensions: ['java'],
		description: 'Line and block comments, Javadoc included.',
		docs: '/docs/formats/code'
	}),
	format({
		id: 'c',
		label: 'C and C++',
		group: 'code',
		extensions: ['c', 'h', 'cpp', 'hpp', 'cc'],
		description: 'Line and block comments.',
		docs: '/docs/formats/code'
	}),
	format({
		id: 'cs',
		label: 'C#',
		group: 'code',
		extensions: ['cs'],
		description: 'Line and block comments, XML doc comments included.',
		docs: '/docs/formats/code'
	}),
	format({
		id: 'rb',
		label: 'Ruby',
		group: 'code',
		extensions: ['rb'],
		description: 'Line comments and =begin blocks.',
		docs: '/docs/formats/code'
	}),
	format({
		id: 'php',
		label: 'PHP',
		group: 'code',
		extensions: ['php'],
		description: 'Line and block comments, PHPDoc included.',
		docs: '/docs/formats/code'
	}),
	format({
		id: 'swift',
		label: 'Swift',
		group: 'code',
		extensions: ['swift'],
		description: 'Line and block comments.',
		docs: '/docs/formats/code'
	}),
	format({
		id: 'scala',
		label: 'Scala',
		group: 'code',
		extensions: ['scala'],
		description: 'Line and block comments.',
		docs: '/docs/formats/code'
	}),
	format({
		id: 'ex',
		label: 'Elixir',
		group: 'code',
		extensions: ['ex', 'exs'],
		description: 'Comments and @doc strings.',
		docs: '/docs/formats/code'
	}),
	format({
		id: 'hs',
		label: 'Haskell',
		group: 'code',
		extensions: ['hs'],
		description: 'Line and block comments.',
		docs: '/docs/formats/code'
	}),
	format({
		id: 'jl',
		label: 'Julia',
		group: 'code',
		extensions: ['jl'],
		description: 'Line and block comments.',
		docs: '/docs/formats/code'
	}),
	format({
		id: 'lua',
		label: 'Lua',
		group: 'code',
		extensions: ['lua'],
		description: 'Line and block comments.',
		docs: '/docs/formats/code'
	}),
	format({
		id: 'r',
		label: 'R',
		group: 'code',
		extensions: ['r', 'R'],
		description: 'Line comments.',
		docs: '/docs/formats/code'
	}),
	format({
		id: 'pl',
		label: 'Perl',
		group: 'code',
		extensions: ['pl', 'pm'],
		description: 'Line comments and POD.',
		docs: '/docs/formats/code'
	}),
	format({
		id: 'ps1',
		label: 'PowerShell',
		group: 'code',
		extensions: ['ps1', 'psm1'],
		description: 'Line and block comments.',
		docs: '/docs/formats/code'
	}),
	format({
		id: 'proto',
		label: 'Protobuf',
		group: 'code',
		extensions: ['proto'],
		description: 'Line and block comments.',
		docs: '/docs/formats/code'
	}),
	format({
		id: 'css',
		label: 'CSS and Sass',
		group: 'code',
		extensions: ['css', 'scss', 'sass', 'less'],
		description: 'Block comments.',
		docs: '/docs/formats/code'
	}),
	format({
		id: 'clj',
		label: 'Clojure',
		group: 'code',
		extensions: ['clj', 'cljs'],
		description: 'Line comments.',
		docs: '/docs/formats/code'
	}),
	format({
		id: 'qml',
		label: 'QML',
		group: 'code',
		extensions: ['qml'],
		description: 'Line and block comments.',
		docs: '/docs/formats/code'
	}),

	// Structured files, through a View -------------------------------------
	format({
		id: 'ipynb',
		label: 'Jupyter notebooks',
		group: 'structured',
		extensions: ['ipynb'],
		description: 'The Markdown cells; code and outputs are never seen.',
		docs: '/docs/topics/views',
		view: notebookView
	}),
	format({
		id: 'openapi',
		label: 'OpenAPI specs',
		group: 'structured',
		extensions: ['yml', 'yaml', 'json'],
		glob: '{openapi,swagger}*.{yml,yaml,json}',
		description: 'The title, and every summary and description, read as Markdown.',
		docs: '/docs/topics/views',
		view: openAPIView
	}),
	format({
		id: 'schema',
		label: 'JSON Schema',
		group: 'structured',
		extensions: ['json'],
		glob: '*.schema.json',
		description: 'Every description under definitions, read as Markdown.',
		docs: '/docs/topics/views',
		view: schemaView
	}),
	format({
		id: 'commit',
		label: 'Commit messages',
		group: 'structured',
		extensions: [],
		glob: 'COMMIT_EDITMSG',
		description: 'Subject, body, and trailers as separate scopes; Git’s comment lines are skipped.',
		docs: '/docs/guides/textfsm',
		view: commitView
	})
];

export const groups: { id: Group; label: string; blurb: string }[] = [
	{
		id: 'prose',
		label: 'Markup',
		blurb: 'Documents. The markup is parsed and only the text is linted.'
	},
	{
		id: 'code',
		label: 'Code',
		blurb: 'Source files. Only the comments are linted, with the same styles.'
	},
	{
		id: 'structured',
		label: 'Data',
		blurb: 'Data files and conventions. A View says which fields are prose, and is written for you.'
	}
];

/** Targets a custom extension can be read as: the prose formats. */
export const readAs = formats.filter((f) => f.group === 'prose');

export const byId = new Map(formats.map((f) => [f.id, f]));
