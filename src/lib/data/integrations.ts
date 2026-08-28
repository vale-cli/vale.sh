/**
 * Where Vale runs besides the command line.
 *
 * Every entry is one somebody can install today, and `href` goes to the thing
 * that installs it rather than to a page about it. The list is the one the LSP
 * guide documents (https://docs.vale.sh/guides/lsp) plus the automation
 * integrations, so this file and the docs say the same thing.
 *
 * A hosted platform earns a place here only if it runs Vale itself. Several
 * vendors market "built-in Vale"; the test applied is what their own developer
 * docs say, not what their comparison pages claim. Fern is left out on that
 * basis -- its Vale page is a guide to installing the CLI yourself, where
 * automating it is "optional", which is true of any repository of Markdown.
 *
 * `slug` is a key from $lib/data/brand-icons. Leave it off and BrandIcon falls
 * back to a monogram, unless `avatar` names a file to use instead.
 */

export type Integration = {
	name: string;
	/** What it runs in, or which versions -- the line under the name. */
	detail: string;
	href: string;
	slug?: string;
	/** For a brand Simple Icons does not carry -- see static/users/avatars. */
	avatar?: string;
};

export type IntegrationGroup = {
	title: string;
	/** Why these belong together, for the group's subheading. */
	note: string;
	items: Integration[];
};

export const integrationGroups: IntegrationGroup[] = [
	{
		title: 'Apps',
		note: 'Wherever the prose gets written, with diagnostics as you type.',
		items: [
			{
				name: 'VS Code',
				detail: 'VS Code, Cursor, Windsurf',
				href: 'https://marketplace.visualstudio.com/items?itemName=ChrisChinchilla.vale-vscode',
				slug: 'vscode'
			},
			{
				name: 'Neovim',
				detail: 'via nvim-lspconfig',
				href: 'https://github.com/neovim/nvim-lspconfig',
				slug: 'neovim'
			},
			{
				name: 'Sublime Text',
				detail: 'LSP-vale-ls',
				href: 'https://packagecontrol.io/packages/LSP-vale-ls',
				slug: 'sublimetext'
			},
			{
				name: 'Zed',
				detail: 'zed-vale',
				href: 'https://github.com/koozz/zed-vale',
				slug: 'zedindustries'
			},
			{
				name: 'Emacs',
				detail: 'flymake-vale',
				href: 'https://github.com/tpeacock19/flymake-vale',
				slug: 'gnuemacs'
			},
			{
				name: 'JetBrains',
				detail: 'IntelliJ, PyCharm, WebStorm',
				href: 'https://plugins.jetbrains.com/plugin/19613-vale-cli/docs',
				slug: 'jetbrains'
			},
			{
				name: 'Obsidian',
				detail: 'obsidian-vale',
				href: 'https://github.com/ChrisChinchilla/obsidian-vale',
				slug: 'obsidian'
			},
			{
				name: 'Oxygen XML',
				detail: 'Vale linter add-on',
				href: 'https://www.oxygenxml.com/doc/versions/23.1/ug-editor/topics/vale-linter-addon.html',
				slug: 'xml'
			},
			{
				name: 'Qt Creator',
				detail: 'via the Qt wiki',
				href: 'https://wiki.qt.io/Setting_Up_Vale',
				slug: 'qt'
			},
			{
				name: 'ALE',
				detail: 'Vim, Neovim',
				href: 'https://github.com/dense-analysis/ale',
				slug: 'vim'
			}
		]
	},
	{
		title: 'Automation',
		note: 'The same run, before anything merges.',
		items: [
			{
				name: 'GitHub Actions',
				detail: 'vale-cli/vale-action',
				href: 'https://github.com/vale-cli/vale-action',
				slug: 'githubactions'
			},
			{
				name: 'pre-commit',
				detail: 'Local hooks',
				href: 'https://docs.vale.sh/integrations/pre-commit',
				slug: 'precommit'
			},
			{
				name: 'Language server',
				detail: 'Any LSP-capable editor',
				href: 'https://github.com/vale-cli/vale-ls',
				slug: 'github'
			}
		]
	},
	{
		title: 'Documentation platforms',
		note: 'Hosted docs that run Vale for you.',
		items: [
			{
				name: 'Mintlify',
				detail: 'Built-in CI check',
				href: 'https://www.mintlify.com/docs/deploy/ci',
				slug: 'mintlify'
			},
			{
				name: 'Promptless',
				detail: 'Lints every draft it writes',
				href: 'https://promptless.ai/docs/for-docs/audit/standards-enforcement/',
				avatar: '/users/avatars/Promptless.png'
			}
		]
	}
];
