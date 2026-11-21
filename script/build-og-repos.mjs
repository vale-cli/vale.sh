// Render a social preview for each major vale-cli repository, 1280x640 as
// GitHub asks for, into static/media/repos/<name>.png.
//
//   node script/build-og-repos.mjs
//
// GitHub takes these only through a repository's Settings > Social preview,
// so they are uploaded by hand; they're committed here so the next change
// starts from the last one. Same ground, type, and colors as the site's own
// cards (script/build-og-home.mjs): the lockup, the repository, a claim, and
// a panel showing the thing working.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const root = new URL('..', import.meta.url).pathname;
const out = `${root}static/media/repos`;
mkdirSync(out, { recursive: true });

const W = 1280;
const H = 640;

const C = {
	bg: '#101310',
	card: '#171b15',
	border: '#2b3128',
	fg: '#f2f4ee',
	muted: '#9aa093',
	lime: '#84cc16',
	red: '#fb7185',
	amber: '#fbbf24',
	sky: '#7dd3fc'
};
const MONO = 'Menlo, Monaco, DejaVu Sans Mono, monospace';
const SANS = 'Inter, Helvetica Neue, Helvetica, Arial, sans-serif';

const logo = readFileSync(`${root}static/brand/vale-logo-dark.svg`, 'utf8');
const [, , , , lh] = logo.match(/viewBox="([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"/);
const logoBody = logo.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const LOGO_H = 46;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/*
	A panel line is a list of segments, each [text, style]. A style is a
	color name, or `~color` for text underlined in that color, the way an
	editor marks an alert. Monospace, so a segment's width is its length.
*/
const FS = 16;
const CW = FS * 0.6021;
const LH = 30;

function panelLine(segs, x, y) {
	let col = 0;
	let text = '';
	let marks = '';
	for (const [t, style = 'fg'] of segs) {
		const under = style.startsWith('~');
		const color = C[under ? style.slice(1) : style] ?? C.fg;
		text += `<tspan fill="${under ? C.fg : color}">${esc(t)}</tspan>`;
		if (under) {
			const x0 = x + col * CW;
			marks += `<rect x="${x0.toFixed(1)}" y="${y + 6}" width="${(t.length * CW).toFixed(1)}" height="3" rx="1.5" fill="${color}"/>`;
		}
		col += t.length;
	}
	return `<text x="${x}" y="${y}" font-family="${MONO}" font-size="${FS}" xml:space="preserve">${text}</text>${marks}`;
}

const PX = 668;
const PY = 150;
const PW = 548;

/** The panel: a title bar, lines, and optionally a popover under a line. */
function panel({ title, lines, pop }) {
	const body = lines.length * LH + 40 + (pop ? pop.lines.length * 28 + 44 : 0);
	const PH = 68 + body;
	let s = `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="16" fill="${C.card}" stroke="${C.border}" stroke-width="1.5"/>`;
	s += ['#f87171', '#fbbf24', '#84cc16']
		.map(
			(c, i) => `<circle cx="${PX + 28 + i * 20}" cy="${PY + 34}" r="6" fill="${c}" opacity="0.8"/>`
		)
		.join('');
	s += `<text x="${PX + 96}" y="${PY + 40}" font-family="${MONO}" font-size="15" fill="${C.muted}">${esc(title)}</text>`;
	s += `<line x1="${PX}" y1="${PY + 68}" x2="${PX + PW}" y2="${PY + 68}" stroke="${C.border}" stroke-width="1.5"/>`;
	let y = PY + 108;
	lines.forEach((segs, i) => {
		s += panelLine(segs, PX + 28, y);
		y += LH;
		if (pop && pop.after === i) {
			const ph = pop.lines.length * 28 + 26;
			s += `<rect x="${PX + 40}" y="${y - 12}" width="${PW - 70}" height="${ph}" rx="12" fill="${C.bg}" stroke="${C.border}" stroke-width="1.5"/>`;
			pop.lines.forEach((pl, j) => (s += panelLine(pl, PX + 60, y + 16 + j * 28)));
			y += ph + 6;
		}
	});
	return s;
}

function card({ repo, headline, sub, show }) {
	const k = LOGO_H / Number(lh);
	const head = headline
		.map(
			(l, i) =>
				`<text x="62" y="${250 + i * 74}" font-family="${SANS}" font-size="64" font-weight="600" letter-spacing="-2.5" fill="${i ? C.muted : C.fg}">${esc(l)}</text>`
		)
		.join('');
	const top = 250 + (headline.length - 1) * 74 + 64;
	const lede = sub
		.map(
			(l, i) =>
				`<text x="64" y="${top + i * 38}" font-family="${SANS}" font-size="26" fill="${C.muted}">${esc(l)}</text>`
		)
		.join('');
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
	<defs><radialGradient id="glow" cx="0.12" cy="0" r="0.6"><stop offset="0" stop-color="#90d454" stop-opacity="0.14"/><stop offset="1" stop-color="#90d454" stop-opacity="0"/></radialGradient></defs>
	<rect width="${W}" height="${H}" fill="${C.bg}"/>
	<rect width="${W}" height="${H}" fill="url(#glow)"/>
	<g transform="translate(64 58) scale(${k.toFixed(5)})">${logoBody}</g>
	<text x="${W - 64}" y="92" text-anchor="end" font-family="${MONO}" font-size="20" fill="${C.lime}">${esc(repo)}</text>
	${head}${lede}
	${show ? panel(show) : ''}
	<text x="64" y="${H - 48}" font-family="${MONO}" font-size="20" fill="${C.muted}">vale.sh · open source · MIT</text>
</svg>`;
}

const cards = {
	vale: {
		repo: 'vale-cli/vale',
		headline: ['Your style.', 'Our editor.'],
		sub: [
			'A linter for prose. Your style guide,',
			'as checks that run in your editor',
			'and alongside your code.'
		],
		show: {
			title: 'Terminal',
			lines: [
				[['$ ', 'lime'], ['vale docs/']],
				[],
				[[' docs/install.md', 'fg']],
				[[' 3:1   '], ['error      ', 'red'], ["Use 'Vale CLI' instead of"]],
				[['                  '], ["'Vale cli'."]],
				[[' 7:12  '], ['warning    ', 'amber'], ["Avoid 'simply'."]],
				[[' 12:5  '], ['suggestion ', 'sky'], ["'is configured' looks like"]],
				[['                  '], ['passive voice.']],
				[],
				[['✖ 1 error, 1 warning and 1 suggestion in 1 file.', 'muted']]
			]
		}
	},
	'vale-ls': {
		repo: 'vale-cli/vale-ls',
		headline: ['Vale in', 'your editor.'],
		sub: ['The language server: alerts, hovers,', 'and quick fixes in any LSP client.'],
		show: {
			title: 'docs/install.md',
			lines: [
				[['1  ', 'muted'], ['# ', 'muted'], ['Installation']],
				[['2', 'muted']],
				[['3  ', 'muted'], ['Vale cli', '~red'], [' runs on macOS and Linux.']],
				[['4', 'muted']],
				[['5', 'muted']]
			],
			pop: {
				after: 2,
				lines: [
					[["Use 'Vale CLI' instead of 'Vale cli'."]],
					[['vale-ls(Docs.Terms)', 'muted']],
					[
						['Quick Fix: ', 'muted'],
						["Replace with 'Vale CLI'", 'lime']
					]
				]
			}
		}
	},
	'vale-action': {
		repo: 'vale-cli/vale-action',
		headline: ['Vale on every', 'pull request.'],
		sub: [
			'Install, sync, and run Vale in GitHub',
			'Actions, with each alert on the line',
			'it’s about.'
		],
		show: {
			title: 'Files changed · docs/install.md',
			lines: [
				[[' 2  ', 'muted'], [' ']],
				[[' 3  ', 'muted'], ['+ ', 'lime'], ['Vale cli', '~red'], [' runs on macOS and Linux.']],
				[[' 4  ', 'muted'], [' ']]
			],
			pop: {
				after: 1,
				lines: [
					[
						['vale', 'lime'],
						[' · reviewdog', 'muted']
					],
					[['error ', 'red'], ["Use 'Vale CLI' instead of 'Vale cli'."]],
					[['Docs.Terms', 'muted']]
				]
			}
		}
	},
	'vale-web': {
		repo: 'vale-cli/vale-web',
		headline: ['Your style guide,', 'as you type.'],
		sub: [
			'The browser extension for Chrome,',
			'Edge, and Firefox. Nothing leaves',
			'your browser.'
		],
		show: {
			title: 'Add a comment',
			lines: [
				[['We can '], ['utilize', '~sky'], [' it '], ['in order to', '~sky'], [' skip the slow']],
				[['step, and it’s '], ['very', '~amber'], [' simple to turn on.']]
			],
			pop: {
				after: 1,
				lines: [
					[
						['SUGGESTION ', 'sky'],
						['Microsoft.Wordiness', 'muted']
					],
					[["Consider using 'use' instead of 'utilize'."]],
					[
						['[ use ]', 'lime'],
						['  Dismiss  Turn off', 'muted']
					]
				]
			}
		}
	},
	packages: {
		repo: 'vale-cli/packages',
		headline: ['Published styles,', 'one line away.'],
		sub: [
			'Microsoft, Google, Red Hat, write-good,',
			'proselint, alex, and more: name one,',
			'then sync.'
		],
		show: {
			title: '.vale.ini',
			lines: [
				[
					['StylesPath', 'sky'],
					[' = styles', 'muted']
				],
				[
					['Packages', 'sky'],
					[' = Microsoft, write-good', 'muted']
				],
				[],
				[['[*.md]', 'amber']],
				[
					['BasedOnStyles', 'sky'],
					[' = Vale, Microsoft', 'muted']
				],
				[],
				[['$ ', 'lime'], ['vale sync']],
				[[' SUCCESS ', 'lime'], [" Synced 2 package(s) to 'styles'."]]
			]
		}
	},
	'agent-tools': {
		repo: 'vale-cli/agent-tools',
		headline: ['Your assistant', 'writes the docs.'],
		sub: [
			'Skills, an edit-time hook, and an MCP',
			'server, so Vale checks what it writes',
			'in the turn it writes it.'
		],
		show: {
			title: 'edit hook · docs/install.md',
			lines: [
				[['assistant', 'lime'], [' › Edit docs/install.md']],
				[['Vale reports 1 alert(s) at error level', 'muted']],
				[['or above in this file:', 'muted']],
				[['  line 4: House.Terms [error] — Use', 'red']],
				[["  'allowlist' instead of 'whitelist'.", 'red']],
				[['assistant', 'lime'], [' › Edit docs/install.md']],
				[['  ↳ no output: nothing left to fix', 'muted']]
			]
		}
	},
	Microsoft: {
		repo: 'vale-cli/Microsoft',
		headline: ['Microsoft’s', 'style guide.'],
		sub: ['The Microsoft Writing Style Guide,', 'as Vale rules. Packages = Microsoft.'],
		show: {
			title: 'Microsoft/Wordiness.yml',
			lines: [
				[
					['extends', 'sky'],
					[': substitution', 'muted']
				],
				[
					['message', 'sky'],
					[": \"Consider using '%s' instead", 'muted']
				],
				[["  of '%s'.\"", 'muted']],
				[
					['level', 'sky'],
					[': suggestion', 'muted']
				],
				[
					['action', 'sky'],
					[':', 'muted']
				],
				[
					['  name', 'sky'],
					[': replace', 'muted']
				],
				[
					['swap', 'sky'],
					[':', 'muted']
				],
				[
					['  (?:in order to|as a means to)', 'amber'],
					[': to', 'muted']
				],
				[
					['  (?:inform|let me know)', 'amber'],
					[': tell', 'muted']
				]
			]
		}
	},
	Google: {
		repo: 'vale-cli/Google',
		headline: ['Google’s', 'style guide.'],
		sub: [
			'The Google developer documentation',
			'style guide, as Vale rules.',
			'Packages = Google.'
		],
		show: {
			title: 'Google/WordList.yml',
			lines: [
				[
					['extends', 'sky'],
					[': substitution', 'muted']
				],
				[
					['message', 'sky'],
					[": \"Use '%s' instead of '%s'.\"", 'muted']
				],
				[
					['level', 'sky'],
					[': warning', 'muted']
				],
				[
					['action', 'sky'],
					[':', 'muted']
				],
				[
					['  name', 'sky'],
					[': replace', 'muted']
				],
				[
					['swap', 'sky'],
					[':', 'muted']
				],
				[
					['  Ajax', 'amber'],
					[': AJAX', 'muted']
				],
				[
					['  Android device', 'amber'],
					[': Android-powered device', 'muted']
				],
				[
					['  android', 'amber'],
					[': Android', 'muted']
				]
			]
		}
	}
};

for (const [name, spec] of Object.entries(cards)) {
	const png = new Resvg(card(spec), {
		fitTo: { mode: 'width', value: W },
		font: { loadSystemFonts: true }
	}).render();
	writeFileSync(`${out}/${name}.png`, png.asPng());
	console.log(`static/media/repos/${name}.png`);
}
