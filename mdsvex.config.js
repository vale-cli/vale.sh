import { escapeSvelte } from 'mdsvex';
import { createHighlighter } from 'shiki';
import { h } from 'hastscript';
import rehypeSlug from 'rehype-slug';
import { visit } from 'unist-util-visit';
import {
	siDocker,
	siGnubash,
	siGo,
	siHtml5,
	siJson,
	siMarkdown,
	siPython,
	siRust,
	siYaml
} from 'simple-icons';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { themes, valeIni } from './src/lib/shiki.mjs';

const transformerMeta = () => ({
	name: 'transformer-meta',
	pre() {
		const metaRaw = this.options.meta?.__raw;
		let meta = {};
		if (metaRaw) {
			const parts = metaRaw.split(/\s+/);
			for (const part of parts) {
				const [key, value] = part.split('=');
				if (key && value) {
					meta[key] = value;
				}
			}
		}
		this.meta = meta;
	}
});

// The header's language identity: an icon where one exists, the brand square
// otherwise (CSS supplies the square when this map comes up empty).
const langIcons = {
	// One hand-drawn glyph for the language Vale lives in and simple-icons
	// doesn't cover: sliders for config, because a voice is a set of dials.
	ini: {
		path: 'M3 5h12v2H3V5Zm16 0h2v2h-2V5ZM3 11h4v2H3v-2Zm8 0h10v2H11v-2ZM3 17h8v2H3v-2Zm12 0h6v2h-6v-2ZM15 4h2v4h-2V4ZM7 10h2v4H7v-4Zm4 6h2v4h-2v-4Z'
	},
	console: siGnubash,
	yaml: siYaml,
	json: siJson,
	bash: siGnubash,
	markdown: siMarkdown,
	python: siPython,
	go: siGo,
	rust: siRust,
	dockerfile: siDocker,
	html: siHtml5
};

// Output listings get no line numbers -- nothing cites their lines -- and
// tiny snippets don't earn the gutter.
const unnumbered = new Set(['console', 'plaintext', 'text', 'ini']);

const transformerLineNumbers = () => ({
	name: 'transformer-line-numbers',
	code(node) {
		const lang = this.options.lang;
		const lines = this.source.split('\n').length;
		if (!unnumbered.has(lang) && lines > 4) {
			this.addClassToHast(node, 'numbered');
		}
	}
});

const transformerCreateCodeBlockHeader = () => ({
	name: 'transformer-create-code-block-header',
	pre(node) {
		const preHeaderDiv = h('div', {
			class: 'pre-header'
		});
		node.children.unshift(preHeaderDiv);
	}
});

const transformerCopyButton = () => ({
	name: 'transformer-color-lines',
	pre(node) {
		const preHeaderDiv = node.children[0];

		let lang = this.options.lang;
		let code = this.source;

		if (lang === 'coffeescript') {
			// tengo is not supported by shiki
			lang = 'tengo';
		} else if (lang === 'properties') {
			lang = 'org';
		} else if (lang === 'git-rebase') {
			lang = 'gitignore';
		}

		if (lang === 'bash') {
			code = this.source
				.split('\n')
				.map((line) => (line.startsWith('$') ? line.slice(1).trim() : line))
				.join('\n');
		} else if (lang === 'powershell') {
			code = this.source
				.split('\n')
				.map((line) => (line.startsWith('>') ? line.slice(1).trim() : line))
				.join('\n');
		}

		const icon = langIcons[lang];
		const unlabeled = !lang || lang === 'text' || lang === 'plaintext';
		const wrapperClass = unlabeled ? 'wrapper-copy-code unlabeled' : 'wrapper-copy-code';
		const title = () =>
			unlabeled
				? h('div', { class: 'code-block-title unlabeled' })
				: h(
						'div',
						{ class: icon ? 'code-block-title has-icon' : 'code-block-title' },
						...(icon
							? [
									h(
										'svg',
										{
											viewBox: '0 0 24 24',
											width: 12,
											height: 12,
											fill: 'currentColor',
											'aria-hidden': 'true'
										},
										h('path', { d: icon.path })
									)
								]
							: []),
						lang
					);

		let copyCodeButton = h(
			'div',
			{
				class: wrapperClass
			},
			title()
		);

		if (lang !== 'console') {
			// Add copy button; we don't show it for console output.
			copyCodeButton = h(
				'div',
				{
					class: wrapperClass
				},
				title(),
				h(
					'button',
					{
						class: 'copy-code',
						'data-code': code,
						onclick: `
                  navigator.clipboard.writeText(this.dataset.code);
                  this.textContent = 'Copied!';
                  setTimeout(() => this.textContent = 'Copy', 1000)
              `
					},
					'Copy'
				)
			);
		}

		preHeaderDiv.children.push(copyCodeButton);
	}
});

const highlighter = await createHighlighter({
	// Bundled langs (markdown, mdx) embed the stock ini grammar; the alias
	// makes every ``ini`` fence resolve to the Vale-aware one instead.
	langAlias: { ini: 'vale-ini' },
	themes: themes,
	langs: [
		// Commands and output
		'bash',
		'console',
		'powershell',

		// Data and configuration
		'json',
		'yaml',
		valeIni,

		// Markup
		'markdown',
		'plaintext',
		'mdx',
		'adoc',
		'rst',
		'html',
		'properties', // Org

		// Programming languages
		'rust',
		'go',
		'coffeescript', // Tengo

		// Other
		'dockerfile',
		'regex',
		'git-rebase' // .gitignore
	]
});

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: ['.md'],
	smartypants: { dashes: 'oldschool' },
	rehypePlugins: [
		rehypeSlug,
		// Off-site links open in a new tab; the reader keeps their place in
		// the post. Same-site navigation stays in the tab.
		() => (tree) => {
			visit(tree, 'element', (node) => {
				const href = node.properties?.href;
				if (
					node.tagName === 'a' &&
					typeof href === 'string' &&
					/^https?:\/\//.test(href) &&
					!href.startsWith('https://vale.sh')
				) {
					node.properties.target = '_blank';
					node.properties.rel = 'noopener noreferrer';
				}
			});
		},
		[
			rehypeAutolinkHeadings,
			{
				behavior: 'wrap',
				properties: { className: 'anchor' }
			}
		]
	],
	highlight: {
		highlighter: async (code, lang = 'text') => {
			const html = escapeSvelte(
				highlighter.codeToHtml(code, {
					lang,
					themes: {
						light: 'vale-light',
						dark: 'vale-dark'
					},
					transformers: [
						transformerMeta(),
						transformerLineNumbers(),
						transformerCreateCodeBlockHeader(),
						transformerCopyButton()
					]
				})
			);
			return `{@html \`${html}\` }`;
		}
	},
	layout: './src/lib/mdsvex/wrapper.svelte'
};

export default mdsvexOptions;
