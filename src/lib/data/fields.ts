import FileCode from 'lucide-svelte/icons/file-code';
import Feather from 'lucide-svelte/icons/feather';
import FlaskConical from 'lucide-svelte/icons/flask-conical';
import GitCommitHorizontal from 'lucide-svelte/icons/git-commit-horizontal';
import Bot from 'lucide-svelte/icons/bot';

/**
 * The kinds of writing Vale is set up for, one per tab in the home page's
 * flow figure and one guide each under /for/[id].
 *
 * Shared so the tab and its guide can't drift: the rule a tab walks through
 * is the rule its guide opens with, and adding a field is adding an entry
 * here. Every package, format, and post named below exists in this repo
 * (packages.json, docs/formats, src/posts); the build fails on a package
 * that doesn't, so a rename shows up instead of a dead card.
 */

export type Sev = 'error' | 'warning' | 'suggestion';

/** One line of the sample file in the figure. `match` is what the rule flags. */
export type DocLine = {
	syntax?: string;
	text?: string;
	before?: string;
	match?: string;
	after?: string;
};

/** A run of guideline text: plain, the form to use, or the form to avoid. */
export type Part = { t: string; k?: 'good' | 'bad' };

export type Link = { label: string; href: string; note?: string };

export type Field = {
	id: string;
	/** The tab's label. */
	label: string;
	icon: typeof FileCode;
	/** The guide page's title and its one-line summary. */
	title: string;
	summary: string;
	/** The opening paragraph of the guide. */
	lede: string;

	/** The figure: a guideline, the rule that encodes it, and the alert. */
	demo: {
		kicker: string;
		guideline: Part[];
		file: string;
		/** The rule as it ships, highlighted at build time. */
		rule: string;
		doc: string;
		lines: DocLine[];
		sev: Sev;
		msg: string;
		rule_name: string;
	};

	/** Packages from the Explorer, by name, most useful first. */
	packages: string[];
	/** A starting configuration, and what it does in one sentence. */
	config: { code: string; note: string };
	/** Where the prose lives, each with its page in the manual. */
	formats: Link[];
	/** Posts on this blog, by slug. */
	posts: string[];
	/** Further reading in the manual. */
	docs: Link[];
};

const docs = (path: string) => `https://docs.vale.sh/${path}`;

export const fields: Field[] = [
	{
		id: 'technical',
		label: 'Technical',
		icon: FileCode,
		title: 'Vale for technical writing',
		summary: 'Docs, references, and the style guide your team already follows.',
		lede: 'Technical writing is where Vale started: a style guide that lives in a wiki, turned into rules that run on every pull request. Start from a published guide like Microsoft’s, Google’s, or Red Hat’s, add the terms your product owns, and Vale reads Markdown, AsciiDoc, DITA, reStructuredText, and MDX through real parsers, so code blocks and URLs are never flagged.',
		demo: {
			kicker: 'Writing guide · Terminology',
			guideline: [
				{ t: 'The product is ' },
				{ t: 'Vale CLI', k: 'good' },
				{ t: '. Don’t write ' },
				{ t: 'Vale cli', k: 'bad' },
				{ t: ' or ' },
				{ t: 'vale-cli', k: 'bad' },
				{ t: '.' }
			],
			file: 'styles/Docs/Terms.yml',
			// The form that ships: a terminology table with a fix action. Only
			// the word list is trimmed.
			rule: `extends: substitution
message: "Use '%s' instead of '%s'."
level: error
action:
  name: replace
swap:
  'Vale cli|vale-cli': Vale CLI
  'style ?guide': style guide
  'e-?mail': email`,
			doc: 'docs/install.md',
			lines: [
				{ syntax: '#', text: 'Installation' },
				{},
				{ match: 'Vale cli', after: ' runs on macOS, Windows, and Linux.' }
			],
			sev: 'error',
			msg: "Use 'Vale CLI' instead of 'Vale cli'.",
			rule_name: 'Docs.Terms'
		},
		packages: ['Microsoft', 'Google', 'RedHat', 'Elastic', 'Diataxis', 'A11y', 'TechTerms', 'Std'],
		config: {
			note: 'A published style for the voice, plus Diátaxis to check that each page does the job its folder claims.',
			code: `StylesPath = styles
MinAlertLevel = suggestion
Packages = Microsoft, Diataxis

[docs/**/*.md]
BasedOnStyles = Vale, Microsoft

[docs/tutorials/*.md]
BasedOnStyles = Vale, Microsoft, Tutorial

[docs/how-to/*.md]
BasedOnStyles = Vale, Microsoft, HowTo`
		},
		formats: [
			{ label: 'Markdown', href: docs('formats/markdown') },
			{ label: 'AsciiDoc', href: docs('formats/asciidoc') },
			{ label: 'DITA', href: docs('formats/dita') },
			{ label: 'reStructuredText', href: docs('formats/restructuredtext') },
			{ label: 'Sphinx', href: docs('formats/sphinx') },
			{ label: 'MDX', href: docs('formats/mdx') },
			{ label: 'Markdoc', href: docs('formats/markdoc') },
			{ label: 'HTML', href: docs('formats/html') },
			{ label: 'XML', href: docs('formats/xml') }
		],
		posts: [
			'diataxis',
			'case-study-gov-uk',
			'case-study-pnpm',
			'case-study-epic-lore',
			'spelling',
			'testing-rules',
			'std'
		],
		docs: [
			{ label: 'Quickstart', href: docs('topics/quickstart') },
			{ label: 'Styles', href: docs('topics/styles'), note: 'Writing your own rules' },
			{ label: 'Testing rules', href: docs('topics/testing') },
			{
				label: 'Scopes',
				href: docs('topics/scopes'),
				note: 'Targeting headings, lists, and tables'
			}
		]
	},
	{
		id: 'scientific',
		label: 'Scientific',
		icon: FlaskConical,
		title: 'Vale for scientific writing',
		summary: 'Manuscripts, notebooks, and the checklists a journal asks for.',
		lede: 'A journal’s author guidelines and a reporting checklist are style guides with consequences. The Journals package turns the conventions every journal shares, the Nature and PLOS ONE guidelines, and the CONSORT, STROBE, and PRISMA checklists into rules read section by section. Vale reads the formats research is written in: Jupyter notebooks cell by cell, Quarto, R Markdown, Typst, and MyST.',
		demo: {
			kicker: 'Author guidelines · Units',
			guideline: [
				{ t: 'A space between a number and its unit: ' },
				{ t: '12 mmHg', k: 'good' },
				{ t: ', not ' },
				{ t: '12mmHg', k: 'bad' },
				{ t: '.' }
			],
			file: 'styles/Journals/UnitSpacing.yml',
			rule: `extends: existence
message: "Put a space between the number and the unit: '%s'."
link: https://github.com/jdkato/journals
level: warning
nonword: true
raw:
  - '(?<![\\w.])\\d+(?:\\.\\d+)?(?:mm|cm|kg|mg|mL|min|kPa|mmHg)\\b'`,
			doc: 'paper/results.md',
			lines: [
				{ syntax: '##', text: 'Results' },
				{},
				{ before: 'Blood pressure fell ', match: '12mmHg', after: ' after 20 min (p = 0.03).' }
			],
			sev: 'warning',
			msg: "Put a space between the number and the unit: '12mmHg'.",
			rule_name: 'Journals.UnitSpacing'
		},
		packages: ['Journals', 'Readability', 'TechTerms', 'A11y'],
		config: {
			note: 'The shared conventions, the IMRaD structure, one journal’s guidelines, and the checklist for the study design. The same styles apply to a notebook’s Markdown cells.',
			code: `StylesPath = styles
Packages = Journals
Vocab = Journals

[*.{md,qmd,ipynb}]
BasedOnStyles = Journals, IMRaD, PLOS, CONSORT
IMRaD.AbstractLength[max] = 300
IMRaD.AbstractCitations = error`
		},
		formats: [
			{
				label: 'Jupyter',
				href: docs('formats/jupyter'),
				note: 'Markdown cells, and comments in code cells'
			},
			{ label: 'Quarto', href: docs('formats/quarto') },
			{ label: 'R Markdown', href: docs('formats/rmarkdown') },
			{ label: 'Typst', href: docs('formats/typst') },
			{ label: 'MyST', href: docs('formats/myst') },
			{ label: 'reStructuredText', href: docs('formats/restructuredtext') },
			{ label: 'Org', href: docs('formats/org') }
		],
		posts: ['journals', 'case-study-rubin-observatory', 'spelling'],
		docs: [
			{ label: 'Jupyter notebooks', href: docs('formats/jupyter') },
			{ label: 'Vocabularies', href: docs('keys/vocabularies'), note: 'Terms your field accepts' },
			{ label: 'Spelling', href: docs('checks/spelling') },
			{ label: 'Scopes', href: docs('topics/scopes'), note: 'Rules for one section' }
		]
	},
	{
		id: 'creative',
		label: 'Creative',
		icon: Feather,
		title: 'Vale for creative writing',
		summary: 'Fiction, essays, and the rules writers have argued over for a century.',
		lede: 'The craft advice in a writing book is a list of things to watch for, which is what a linter does. The Fiction package flags filter words, told emotions, stock phrases, and dialogue punctuation, with Elmore Leonard’s rules, Chuck Palahniuk’s, and Strunk’s 1918 Elements of Style beside them. Most rules are suggestions: a second reader pointing, not a gate.',
		demo: {
			kicker: 'Elmore Leonard · Rule 4',
			guideline: [
				{ t: 'Never use an adverb to modify the verb ' },
				{ t: '“said”', k: 'good' },
				{ t: '. Not ' },
				{ t: 'he said gravely', k: 'bad' },
				{ t: '.' }
			],
			file: 'styles/Leonard/Adverb.yml',
			rule: `extends: existence
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
			doc: 'manuscript/chapter-01.md',
			lines: [
				{ syntax: '#', text: 'One' },
				{},
				{ before: '“No,” he ', match: 'said gravely', after: '. She did not look up.' }
			],
			sev: 'warning',
			msg: "Drop the adverb on the tag: 'said gravely'.",
			rule_name: 'Leonard.Adverb'
		},
		packages: ['Fiction', 'Voices', 'Readability', 'proselint', 'write-good'],
		config: {
			note: 'The Fiction package with Leonard’s rules on the manuscript. Readability scores stay suggestions, so they inform a revision rather than block one.',
			code: `StylesPath = styles
MinAlertLevel = suggestion
Packages = Fiction, Readability

[manuscript/*.md]
BasedOnStyles = Vale, Fiction, Leonard, Readability`
		},
		formats: [
			{ label: 'Markdown', href: docs('formats/markdown') },
			{ label: 'Org', href: docs('formats/org') },
			{ label: 'Plain text', href: docs('formats/text') },
			{ label: 'HTML', href: docs('formats/html') },
			{ label: 'Typst', href: docs('formats/typst') }
		],
		posts: ['voices', 'std'],
		docs: [
			{ label: 'Styles', href: docs('topics/styles'), note: 'Turning your own rules into checks' },
			{ label: 'Vocabularies', href: docs('keys/vocabularies'), note: 'Names and invented words' },
			{ label: 'Spelling', href: docs('checks/spelling') }
		]
	},
	{
		id: 'code',
		label: 'Code & data',
		icon: GitCommitHorizontal,
		title: 'Vale for code and data',
		summary: 'The prose inside files that aren’t prose: comments, API descriptions, and the log.',
		lede: 'A repository has prose all through it that no docs linter reads: doc comments, the descriptions in an OpenAPI spec, a commit’s subject and body. Vale finds it. Tree-sitter grammars lift comments out of source code, a View pulls named fields out of JSON and YAML, and a TextFSM template splits a commit message into its parts, so a rule reaches a commit subject the way it reaches a heading.',
		demo: {
			kicker: 'The seven rules · Rule 2',
			guideline: [
				{ t: 'Limit the subject line to ' },
				{ t: '50 characters', k: 'good' },
				{ t: '. Not ' },
				{ t: 'a subject that runs on past where the log cuts it off', k: 'bad' },
				{ t: '.' }
			],
			file: 'styles/SevenRules/Limit.yml',
			rule: `extends: Commits._shared.SubjectLength
message: 'A subject of %d characters. Shoot for 50; 72 is the hard limit.'
link: https://cbea.ms/git-commit/#limit-50
level: warning
max: 50`,
			doc: '.git/COMMIT_EDITMSG',
			lines: [
				{ match: 'Fixed the bug where vale sync skipped the StylesPath on Windows' },
				{},
				{ text: 'The path was joined before it was cleaned.' }
			],
			sev: 'warning',
			msg: 'A subject of 63 characters. Shoot for 50; 72 is the hard limit.',
			rule_name: 'SevenRules.Limit'
		},
		packages: ['Commits', 'Comments', 'TechTerms', 'Std'],
		config: {
			note: 'Commit messages against Conventional Commits, doc comments against their language’s conventions, and the descriptions in an OpenAPI spec through a View.',
			code: `StylesPath = styles
Packages = Commits, Comments

[COMMIT_EDITMSG]
BasedOnStyles = Commits, Conventional

[*.{go,java,kt}]
BasedOnStyles = Vale, Comments

[openapi.{yml,yaml,json}]
BasedOnStyles = Vale
View = OpenAPI`
		},
		formats: [
			{ label: 'Source code', href: docs('formats/code'), note: 'Comments in nineteen languages' },
			{ label: 'Views', href: docs('topics/views'), note: 'JSON, YAML, TOML, and plain text' },
			{ label: 'Commit messages', href: docs('guides/commit-messages') },
			{ label: 'TextFSM', href: docs('guides/textfsm') },
			{ label: 'Front matter', href: docs('formats/front-matter') }
		],
		posts: ['commits', 'openapi', 'case-study-pnpm', 'spelling'],
		docs: [
			{
				label: 'Commits',
				href: docs('guides/commit-messages'),
				note: 'Install, conventions, and the hook'
			},
			{ label: 'Views', href: docs('topics/views') },
			{ label: 'Code', href: docs('formats/code') },
			{ label: 'TextFSM', href: docs('guides/textfsm') }
		]
	},
	{
		id: 'agents',
		label: 'AI & agents',
		icon: Bot,
		title: 'Vale for AI and agents',
		summary: 'Hold what a model writes, and what you write for one, to a standard.',
		lede: 'A writing skill in a prompt is a list of constraints the model is asked to remember. As Vale rules, they are checked on every draft instead. Voices covers hedging, puffery, and throat clearing, with voices like Direct and Simple on top; AiTells flags the patterns of AI-written prose; and Prompts lints the instruction files themselves: AGENTS.md, CLAUDE.md, and SKILL.md.',
		demo: {
			kicker: 'Voices · Direct',
			guideline: [
				{ t: 'Don’t hedge. ' },
				{ t: 'State it', k: 'good' },
				{ t: ', not ' },
				{ t: 'it’s worth noting', k: 'bad' },
				{ t: ' that it is.' }
			],
			file: 'styles/Direct/Hedging.yml',
			rule: `extends: existence
message: "Hedge: '%s'. State it, or say why you're unsure."
level: error
ignorecase: true
tokens:
  - '(?:you )?may want to(?: consider)?'
  - is likely because
  - "it(?:'s| is) worth noting"
  - "it(?:'s| is) important to note"
  - 'one could argue'`,
			doc: 'reply.md',
			lines: [
				{ syntax: '#', text: 'Summary' },
				{},
				{ match: "It's worth noting", after: ' that the cache is rebuilt on every run.' }
			],
			sev: 'error',
			msg: "Hedge: 'It's worth noting'. State it, or say why you're unsure.",
			rule_name: 'Direct.Hedging'
		},
		packages: ['Voices', 'AiTells', 'Prompts', 'Readability'],
		config: {
			note: 'A voice for what the model writes, and the Prompts rules for the files that instruct it.',
			code: `StylesPath = styles
Packages = Voices, Prompts

[*.md]
BasedOnStyles = Voices, Direct

[{AGENTS,CLAUDE,SKILL}.md]
BasedOnStyles = Prompts`
		},
		formats: [
			{ label: 'Markdown', href: docs('formats/markdown') },
			{ label: 'Views', href: docs('topics/views'), note: 'Transcripts, one speaker at a time' },
			{ label: 'MCP', href: docs('guides/mcp') },
			{ label: 'LSP', href: docs('guides/lsp') }
		],
		posts: ['voices', 'onboard', 'quality-gate'],
		docs: [
			{ label: 'Agents', href: docs('guides/agents') },
			{ label: 'Setting up with an agent', href: docs('guides/agent-setup') },
			{ label: 'MCP', href: docs('guides/mcp') },
			{ label: 'Agent skills', href: '/skills' }
		]
	}
];

export function field(id: string): Field | undefined {
	return fields.find((f) => f.id === id);
}
