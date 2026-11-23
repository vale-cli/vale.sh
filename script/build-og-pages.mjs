// Render the social cards for the site's main pages as 1200x630 PNGs.
//
//   node script/build-og-pages.mjs
//
// One layout: the lockup, the page's path, a headline, and a line or two on
// what the page is. Each guide under /guides/[id] and each field under
// /for/[id] gets one too, read from their data. Built like the home card
// (script/build-og-home.mjs) into static/media/og and committed. Re-run it
// when a headline, guides.json, or fields.ts changes.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const root = new URL('..', import.meta.url).pathname;

const W = 1200;
const H = 630;

const C = {
	bg: '#101310',
	fg: '#f2f4ee',
	muted: '#9aa093',
	lime: '#84cc16'
};

const MONO = 'Menlo, Monaco, DejaVu Sans Mono, monospace';
const SANS = 'Inter, Helvetica Neue, Helvetica, Arial, sans-serif';

const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const logo = readFileSync(`${root}static/brand/vale-logo-dark.svg`, 'utf8');
const [, , , , lh] = logo.match(/viewBox="([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"/);
const logoBody = logo.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const k = 52 / Number(lh);

const guides = JSON.parse(readFileSync(`${root}src/lib/data/guides.json`, 'utf8')).length;

// Headlines and lines are broken by hand: resvg has no text wrapping.
export const PAGES = [
	{
		name: 'guides',
		path: '/guides',
		head: [`${guides} open style guides,`, 'side by side'],
		lines: [
			'Google, Microsoft, GitLab, Red Hat, GOV.UK, and more,',
			'read from the rules each one publishes.'
		]
	},
	{
		name: 'cms',
		path: '/cms',
		head: ['Vale CMS'],
		lines: [
			'Author your style guide with the linter running:',
			'config, rules, and vocabularies, shipped to your repo.'
		]
	},
	{
		name: 'agents',
		path: '/agents',
		head: ['Your assistant writes', 'the docs. Vale checks them.'],
		lines: [
			'Skills, hooks, and an MCP server for coding agents,',
			'installed as a Claude Code plugin.'
		]
	},
	{
		name: 'tools',
		path: '/tools',
		head: ['Tools for people', 'who write'],
		lines: [
			'Word counters, readability, case converters, and more.',
			'Free, in your browser, no sign-up.'
		]
	},
	{
		name: 'speed',
		path: '/features/speed',
		head: ['Built for speed'],
		lines: [
			'About 220 documentation pages a second: GitLab’s',
			'2,826-page repository in under 13 seconds.'
		]
	},
	{
		name: 'code',
		path: '/features/code',
		head: ['Code-aware linting'],
		lines: [
			'Comments and docstrings, read with tree-sitter,',
			'linted like the Markdown they contain.'
		]
	},
	{
		name: 'markup',
		path: '/features/markup',
		head: ['Scopes'],
		lines: [
			'Real parsers for Markdown, AsciiDoc, reST, MDX, and more,',
			'so a rule can target a heading and skip the code.'
		]
	},
	{
		name: 'views',
		path: '/features/views',
		head: ['Views'],
		lines: [
			'Lint the prose in files that aren’t documents:',
			'OpenAPI, notebooks, commit bodies, docstrings.'
		]
	}
];

function card(p) {
	// A one-line headline sits lower, so the block stays centered.
	const top = p.head.length === 1 ? 300 : 250;
	let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
	<rect width="${W}" height="${H}" fill="${C.bg}"/>
	<g transform="translate(64 60) scale(${k.toFixed(5)})">${logoBody}</g>
	<text x="${W - 64}" y="96" text-anchor="end" font-family="${MONO}" font-size="20" letter-spacing="4" fill="${C.lime}">${esc(p.path.toUpperCase())}</text>
`;
	p.head.forEach((t, i) => {
		svg += `	<text x="60" y="${top + i * 92}" font-family="${SANS}" font-size="80" font-weight="600" letter-spacing="-3" fill="${i ? C.muted : C.fg}">${esc(t)}</text>
`;
	});
	const sub = top + (p.head.length - 1) * 92 + 76;
	p.lines.forEach((t, i) => {
		svg += `	<text x="64" y="${sub + i * 42}" font-family="${SANS}" font-size="30" fill="${C.muted}">${esc(t)}</text>
`;
	});
	if (p.mark) svg += p.mark;
	svg += `	<text x="${W - 64}" y="${H - 44}" text-anchor="end" font-family="${MONO}" font-size="22" fill="${C.lime}">vale.sh</text>
</svg>`;
	return svg;
}

/** Greedy word wrap by character count; resvg can't measure text. */
function wrap(text, max) {
	const out = [];
	let line = '';
	for (const word of text.split(' ')) {
		if (line && line.length + 1 + word.length > max) {
			out.push(line);
			line = word;
		} else line = line ? `${line} ${word}` : word;
	}
	if (line) out.push(line);
	return out;
}

// brand-icons.ts and guide-logos.ts are TypeScript; both are plain enough to
// read with a pattern, as script/build-og-adopters.mjs does.
const icons = readFileSync(`${root}src/lib/data/brand-icons.ts`, 'utf8');
const paths = {};
const colors = {};
for (const m of icons.matchAll(/\n\t([a-z0-9]+):\s*\n?\s*'([^']*)'/g)) {
	if (m[2].startsWith('#')) colors[m[1]] = m[2];
	else paths[m[1]] ??= m[2];
}
const logos = {};
for (const m of readFileSync(`${root}src/lib/tools/guide-logos.ts`, 'utf8').matchAll(
	/\n\t'?([a-z0-9-]+)'?: \{([^}]*)\}/g
)) {
	const field = (k) => m[2].match(new RegExp(`${k}: '([^']*)'`))?.[1];
	logos[m[1]] = {
		slug: field('slug'),
		avatar: field('avatar'),
		letters: field('letters'),
		mono: /mono: true/.test(m[2])
	};
}

/** A guide's mark on a tile, resolved the way GuideLogo.svelte does. */
function mark(id, name, x, y, size) {
	const logo = logos[id] ?? {};
	const tile = `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="28" fill="#171b15" stroke="#2b3128"/>`;
	const pad = size * 0.22;
	const inner = size - 2 * pad;
	if (logo.slug && paths[logo.slug]) {
		const fill = (!logo.mono && colors[logo.slug]) || C.fg;
		return `${tile}<g transform="translate(${x + pad} ${y + pad}) scale(${inner / 24})"><path d="${paths[logo.slug]}" fill="${fill}"/></g>`;
	}
	if (logo.avatar) {
		const png = readFileSync(`${root}static${logo.avatar}`).toString('base64');
		return `${tile}<rect x="${x + pad - 6}" y="${y + pad - 6}" width="${inner + 12}" height="${inner + 12}" rx="14" fill="#ffffff"/>
	<image x="${x + pad}" y="${y + pad}" width="${inner}" height="${inner}" href="data:image/png;base64,${png}"/>`;
	}
	const letters = (logo.letters ?? name)
		.replace(/[^A-Za-z0-9]/g, '')
		.slice(0, 2)
		.toUpperCase();
	return `${tile}<text x="${x + size / 2}" y="${y + size / 2 + 20}" text-anchor="middle" font-family="${SANS}" font-size="56" font-weight="600" fill="${C.muted}">${letters}</text>`;
}

// One card per guide under /guides/[id]: its mark, name, and what it holds.
const GUIDES = JSON.parse(readFileSync(`${root}src/lib/data/guides.json`, 'utf8')).map((g) => ({
	name: `guides/${g.id}`,
	path: `/guides/${g.id}`,
	head: [g.name],
	lines: [
		...wrap(g.full, 44),
		`${g.rules.length} rules · ${g.terms.toLocaleString('en-US')} terms · ${g.license || 'no license'}`
	],
	mark: mark(g.id, g.name, W - 64 - 180, 220, 180)
}));

// One card per field under /for/[id], read from fields.ts.
const fieldsSrc = readFileSync(`${root}src/lib/data/fields.ts`, 'utf8');
const FIELDS = [
	...fieldsSrc.matchAll(
		/\n\t\tid: '([^']+)',[\s\S]*?\n\t\ttitle: '([^']+)',\n\t\tsummary: '([^']+)'/g
	)
].map(([, id, title, summary]) => ({
	name: `for/${id}`,
	path: `/for/${id}`,
	head: wrap(title, 24),
	lines: wrap(summary, 56)
}));
if (FIELDS.length < 8) throw new Error(`read ${FIELDS.length} fields from fields.ts`);

for (const p of [...PAGES, ...GUIDES, ...FIELDS]) {
	const out = `${root}static/media/og/${p.name}.png`;
	mkdirSync(out.slice(0, out.lastIndexOf('/')), { recursive: true });
	const png = new Resvg(card(p), {
		fitTo: { mode: 'width', value: W },
		font: { loadSystemFonts: true }
	}).render();
	writeFileSync(out, png.asPng());
}
console.log(
	`wrote ${PAGES.length} page, ${GUIDES.length} guide, and ${FIELDS.length} field cards to static/media/og`
);
