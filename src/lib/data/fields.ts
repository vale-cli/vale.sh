import FileCode from 'lucide-svelte/icons/file-code';
import Feather from 'lucide-svelte/icons/feather';
import FlaskConical from 'lucide-svelte/icons/flask-conical';
import GitCommitHorizontal from 'lucide-svelte/icons/git-commit-horizontal';
import Bot from 'lucide-svelte/icons/bot';
import Landmark from 'lucide-svelte/icons/landmark';

/**
 * The kinds of writing Vale is set up for: one card each on the home page,
 * and one guide each under /for/[id].
 *
 * Adding a field is adding an entry here. Every package, adopter, and post
 * named below exists in this repo (packages.json, adopters.json,
 * src/posts), and the build fails on one that doesn't, so a rename shows up
 * instead of a dead card.
 *
 * Checked against Vale 3.27.0: each guide's config syncs and loads, and
 * Research's prints only the W101 note its config explains.
 */

export type Link = { label: string; href: string; note?: string };

/** A package published outside the Explorer, installed by its URL. */
export type ExternalPackage = { name: string; description: string; href: string };

export type Field = {
	id: string;
	/** The card's label. */
	label: string;
	icon: typeof FileCode;
	/** The guide page's title and its one-line summary. */
	title: string;
	summary: string;
	/** The opening paragraph of the guide. */
	lede: string;

	/** Packages from the Explorer by name, or published elsewhere, most useful first. */
	packages: (string | ExternalPackage)[];
	/** A starting configuration, and what it does in one sentence. */
	config: { code: string; note: string };
	/** Where the prose lives, each with its page in the manual. */
	formats: Link[];
	/** Posts on this blog, by slug. */
	posts: string[];
	/** Teams in adopters.json who write this kind of text, by name. */
	adopters: string[];
	/** What those teams lint, said plainly: the lede of "Who runs it". */
	adoptersNote: string;
	/** Editors, CI, and platforms from $lib/data/integrations, by name. */
	integrations: string[];
	/** Why these, for this kind of writing: the lede of "Where it runs". */
	integrationsNote: string;
	/** Agent skills from $lib/data/skills, by name, in the order to reach for them. */
	skills: string[];
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
		adopters: [
			'GitLab',
			'Kong',
			'Red Hat',
			'Elastic',
			'Grafana Labs',
			'Datadog',
			'Microsoft',
			'Epic Games',
			'MetaMask',
			'Polkadot'
		],
		adoptersNote:
			'Documentation teams who run Vale on every change, from developer platforms and observability tools to blockchain protocols. Several publish their style as a package anyone can install.',
		integrations: [
			'VS Code',
			'JetBrains',
			'Oxygen XML',
			'GitHub Actions',
			'pre-commit',
			'Mintlify',
			'Promptless'
		],
		integrationsNote:
			'In the editor while the page is written, as a check on every pull request, and inside the docs platforms that run Vale themselves. Oxygen XML covers DITA.',
		skills: ['onboard', 'from-guide', 'triage', 'write-guide'],
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
		id: 'public',
		label: 'Public sector',
		icon: Landmark,
		title: 'Vale for the public sector',
		summary: 'Plain English for the public, held to a government style guide.',
		lede: 'Writing for the public has rules a product team’s docs don’t: plain English anyone can follow, words a government style guide tells you to avoid, acronyms defined the first time, and content that works with a screen reader. GOV.UK publishes its technical style guide as a Vale package any team can install, and the Readability, A11y, and alex packages check reading level, accessibility, and inclusive language on top.',
		packages: [
			{
				name: 'GOV.UK',
				description:
					'The GOV.UK Technical Style guide as Vale rules: words to avoid, words to avoid unless a condition holds, acronyms defined on first use, and common misspellings. Published by the Government Digital Service.',
				href: 'https://github.com/alphagov/tech-docs-linter'
			},
			'Readability',
			'A11y',
			'alex',
			'neighbor',
			'write-good'
		],
		config: {
			note: 'The GOV.UK style installs by its release URL. Readability scores the reading level, A11y checks alt text, link text, and headings, and alex flags insensitive language. On a short page the readability scores fire as suggestions; raise MinAlertLevel to warning to see only the rest.',
			code: `StylesPath = styles
MinAlertLevel = suggestion
Packages = https://github.com/alphagov/tech-docs-linter/releases/latest/download/tech-writing-style-guide.zip, \\
  Readability, A11y, alex

[content/*.md]
BasedOnStyles = Vale, tech-writing-style-guide, Readability, A11y, alex`
		},
		formats: [
			{ label: 'Markdown', href: docs('formats/markdown') },
			{ label: 'HTML', href: docs('formats/html') },
			{ label: 'AsciiDoc', href: docs('formats/asciidoc') },
			{ label: 'Quarto', href: docs('formats/quarto'), note: 'Decision records and reports' },
			{ label: 'reStructuredText', href: docs('formats/restructuredtext') },
			{
				label: 'Source code',
				href: docs('formats/code'),
				note: 'Comments, as GOV.UK One Login checks'
			}
		],
		posts: ['case-study-gov-uk'],
		adopters: [
			'GOV.UK',
			'GOV.UK One Login',
			'Defra',
			'DigitalService',
			'Government of Western Australia',
			'NASA',
			'Platform One',
			'ICTU',
			'OASIS Open',
			'HURIDOCS'
		],
		adoptersNote:
			'Governments, agencies, and public-interest groups running Vale on what they publish: service guidance, architecture decisions, specifications, and the docs for public platforms.',
		integrations: ['Browser', 'VS Code', 'GitHub Actions', 'pre-commit', 'Mintlify'],
		integrationsNote:
			'Content designers often write in a browser, not a code editor, so the extension checks text where it’s typed. The same rules then run in CI before anything is published.',
		skills: ['onboard', 'from-guide', 'tune', 'vocab'],
		docs: [
			{ label: 'Readability', href: docs('checks/readability'), note: 'Reading-level checks' },
			{
				label: 'Substitution',
				href: docs('checks/substitution'),
				note: 'Turning a words-to-avoid list into a rule'
			},
			{ label: 'Packages', href: docs('keys/packages'), note: 'Installing a style by its URL' },
			{ label: 'Vocabularies', href: docs('keys/vocabularies') }
		]
	},
	{
		id: 'research',
		label: 'Research',
		icon: FlaskConical,
		title: 'Vale for research',
		summary: 'Papers, notebooks, and the docs for the software research runs on.',
		lede: 'Research produces two kinds of writing, often in the same repository: the paper, and the docs for the code behind it. For the paper, the Journals package turns the conventions every journal shares, the Nature and PLOS ONE guidelines, and the CONSORT, STROBE, and PRISMA checklists into rules read section by section, in Jupyter notebooks, Quarto, R Markdown, Typst, and MyST. For the docs, research groups from rOpenSci to Rubin Observatory already run Vale with a published style or one of their own.',
		packages: ['Journals', 'Google', 'Readability', 'proselint', 'write-good', 'TechTerms'],
		config: {
			note: 'The paper gets the shared conventions, the IMRaD structure, one journal’s guidelines, and the checklist for the study design; the docs get Google’s style, the most common choice among the research groups below. Vale prints a note that the docs section replaces the styles Journals turns on for every Markdown file: that is the point, since a README has no Methods section.',
			code: `StylesPath = styles
MinAlertLevel = suggestion
Packages = Journals, Google
Vocab = Journals

[paper/*.{md,qmd,ipynb}]
BasedOnStyles = Journals, IMRaD, PLOS, CONSORT
IMRaD.AbstractLength[max] = 300

[docs/**/*.md]
BasedOnStyles = Vale, Google`
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
			{ label: 'reStructuredText', href: docs('formats/restructuredtext'), note: 'And Sphinx' },
			{ label: 'Org', href: docs('formats/org') }
		],
		posts: ['journals', 'case-study-rubin-observatory', 'spelling'],
		adoptersNote:
			'Research groups and institutes running Vale on the docs for the software their research depends on. The Journals package is new, so none of them lint papers with it yet.',
		adopters: [
			'Rubin Observatory',
			'rOpenSci',
			'pyOpenSci',
			'nf-core',
			'JuMP',
			'Qiskit',
			'Mesa',
			'NEST Simulator',
			'OpenSAFELY',
			'Lean'
		],
		integrations: ['VS Code', 'JetBrains', 'Emacs', 'Neovim', 'GitHub Actions', 'pre-commit'],
		integrationsNote:
			'The editors research is written in: VS Code and PyCharm for notebooks and Quarto, Emacs for Org. The same config runs in CI on the docs and the paper.',
		skills: ['onboard', 'vocab', 'ignore', 'ci'],
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
		adopters: [
			'Thinking in Python',
			'LinuxBoot',
			'Open Liberty',
			'Rackspace',
			'InnerSource Commons',
			'PostHog',
			'TrussWorks',
			'Matter',
			'Stakater',
			'Engineering Handbook'
		],
		adoptersNote:
			'Teams who lint long-form writing: the manuscript of a book, a blog, an open handbook. None in the directory lint fiction yet; the Fiction package is new.',
		integrations: ['Obsidian', 'Browser', 'VS Code', 'Emacs', 'Zed', 'Sublime Text'],
		integrationsNote:
			'Writers draft in notes apps and plain editors more than in IDEs. Each of these shows alerts as you type, from the same config the manuscript uses.',
		skills: ['setup', 'tune', 'rule', 'vocab'],
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
		packages: ['Commits', 'Comments', 'TechTerms', 'Std'],
		config: {
			note: 'Commit messages against Conventional Commits, and doc comments against their language’s conventions. Grammars has vale sync fetch the parsers that find the comments. For the descriptions in an OpenAPI spec, add the View from the Views docs.',
			code: `StylesPath = styles
Packages = Commits, Comments
Grammars = go, java, kotlin

[COMMIT_EDITMSG]
BasedOnStyles = Commits, Conventional

[*.{go,java,kt}]
BasedOnStyles = Vale, Comments`
		},
		formats: [
			{ label: 'Source code', href: docs('formats/code'), note: 'Comments in nineteen languages' },
			{ label: 'Views', href: docs('topics/views'), note: 'JSON, YAML, TOML, and plain text' },
			{ label: 'Commit messages', href: docs('guides/commit-messages') },
			{ label: 'TextFSM', href: docs('guides/textfsm') },
			{ label: 'Front matter', href: docs('formats/front-matter') }
		],
		posts: ['commits', 'openapi', 'case-study-pnpm', 'spelling'],
		adopters: [
			'pnpm',
			'Renovate',
			'Gravitee',
			'pgEdge',
			'Veecle',
			'TestNG',
			'Workflow Orchestrator',
			'DigitalService',
			'Open Podcast API',
			'Marigold'
		],
		adoptersNote:
			'Teams who lint the prose outside their docs: comments in Rust, Go, TypeScript, and Java, Python docstrings, API specs, and changesets.',
		integrations: [
			'pre-commit',
			'GitHub Actions',
			'Language server',
			'VS Code',
			'JetBrains',
			'Neovim',
			'Qt Creator'
		],
		integrationsNote:
			'A commit-msg or pre-commit hook checks the message and the comments before they land, CI checks them again, and the language server flags them in any editor that speaks LSP. Qt Creator covers QDoc comments.',
		skills: ['commits', 'ci', 'setup', 'ignore'],
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
		adopters: [
			'NVIDIA',
			'CircleCI',
			'Promptless',
			'Mastra',
			'Uniswap',
			'seedcord',
			'Modelplane',
			'gqlgen',
			'Broad Institute',
			'pgEdge'
		],
		adoptersNote:
			'Teams who use Vale on what models write, or on the docs for the agents they build: as a check an agent runs, a skill it follows, or a style that flags AI tells.',
		integrations: ['Promptless', 'Language server', 'VS Code', 'GitHub Actions', 'pre-commit'],
		integrationsNote:
			'Where agents write: Promptless runs Vale on every draft its agent makes, the language server reports to any LSP client, and VS Code covers Cursor and Windsurf. CI holds what an agent opens to the same rules.',
		skills: ['onboard', 'rule', 'fix', 'doctor'],
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
