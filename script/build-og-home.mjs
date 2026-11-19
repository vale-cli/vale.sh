// Render the social card for the home page as a 1200x630 PNG.
//
//   node script/build-og-home.mjs
//
// The hero in one frame: the lockup, the headline, one line on what Vale is,
// and the last panel of the hero's figure -- a line of a document with the
// alert a rule raised on it. Built the same way as the other cards
// (script/build-og.mjs): an SVG rasterized with resvg into
// static/media/home-og.png and committed, so the site builds without this
// toolchain. Re-run it when the headline or the hero's example changes.
import { readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const root = new URL('..', import.meta.url).pathname;

const W = 1200;
const H = 630;

const C = {
	bg: '#101310',
	card: '#171b15',
	border: '#2b3128',
	fg: '#f2f4ee',
	muted: '#9aa093',
	lime: '#84cc16',
	red: '#fb7185'
};

const MONO = 'Menlo, Monaco, DejaVu Sans Mono, monospace';
const SANS = 'Inter, Helvetica Neue, Helvetica, Arial, sans-serif';

// The dark lockup, mark plus wordmark, as static/brand ships it.
const logo = readFileSync(`${root}static/brand/vale-logo-dark.svg`, 'utf8');
const [, , , lw, lh] = logo.match(/viewBox="([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"/);
const logoBody = logo.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const LOGO_H = 52;
const k = LOGO_H / Number(lh);

// The panel: a file, three numbered lines, and the alert under them.
const PX = 664;
const PY = 150;
const PW = 472;
const PH = 330;
const line = (n, y) =>
	`<text x="${PX + 28}" y="${y}" font-family="${MONO}" font-size="17" fill="${C.muted}">${n}</text>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
	<rect width="${W}" height="${H}" fill="${C.bg}"/>
	<g transform="translate(64 60) scale(${k.toFixed(5)})">${logoBody}</g>
	<text x="${W - 64}" y="96" text-anchor="end" font-family="${MONO}" font-size="20" letter-spacing="4" fill="${C.muted}">OPEN SOURCE · MIT</text>

	<text x="60" y="270" font-family="${SANS}" font-size="92" font-weight="600" letter-spacing="-4" fill="${C.fg}">Your style.</text>
	<text x="60" y="366" font-family="${SANS}" font-size="92" font-weight="600" letter-spacing="-4" fill="${C.muted}">Our editor.</text>
	<text x="64" y="438" font-family="${SANS}" font-size="30" fill="${C.fg}">A linter for prose.</text>
	<text x="64" y="480" font-family="${SANS}" font-size="30" fill="${C.muted}">Your style guide, as checks that run</text>
	<text x="64" y="520" font-family="${SANS}" font-size="30" fill="${C.muted}">in your editor and alongside your code.</text>

	<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="16" fill="${C.card}" stroke="${C.border}"/>
	<text x="${PX + 28}" y="${PY + 44}" font-family="${MONO}" font-size="17" fill="${C.muted}">docs/install.md</text>
	<line x1="${PX}" y1="${PY + 68}" x2="${PX + PW}" y2="${PY + 68}" stroke="${C.border}"/>
	${line(1, PY + 114)}
	<text x="${PX + 64}" y="${PY + 114}" font-family="${MONO}" font-size="19" fill="${C.fg}"><tspan fill="${C.muted}">#</tspan> Installation</text>
	${line(2, PY + 150)}
	${line(3, PY + 186)}
	<text x="${PX + 64}" y="${PY + 186}" font-family="${MONO}" font-size="19" fill="${C.fg}">Vale cli runs on macOS and Linux.</text>
	<rect x="${PX + 62}" y="${PY + 194}" width="96" height="3" fill="${C.red}"/>
	<line x1="${PX + 28}" y1="${PY + 228}" x2="${PX + PW - 28}" y2="${PY + 228}" stroke="${C.border}"/>
	<text x="${PX + 28}" y="${PY + 268}" font-family="${SANS}" font-size="20" fill="${C.fg}"><tspan font-weight="700" fill="${C.red}">error</tspan>  Use 'Vale CLI' instead of 'Vale cli'.</text>
	<text x="${PX + 28}" y="${PY + 300}" font-family="${MONO}" font-size="16" fill="${C.muted}">Docs.Terms</text>

	<text x="${W - 64}" y="${H - 44}" text-anchor="end" font-family="${MONO}" font-size="22" fill="${C.lime}">vale.sh</text>
</svg>`;

const png = new Resvg(svg, {
	fitTo: { mode: 'width', value: W },
	font: { loadSystemFonts: true }
}).render();
writeFileSync(`${root}static/media/home-og.png`, png.asPng());
console.log('wrote static/media/home-og.png');
