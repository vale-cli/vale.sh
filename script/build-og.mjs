// Render each blog post's banner as a 1200x630 social card.
//
//   node script/build-og.mjs
//
// Crawlers need a raster, so the live HTML banners are mirrored here as SVG
// and rasterized with resvg into static/blog/og/<slug>.png. The files are
// committed, like lint.json, so the site builds without this toolchain. A
// post with its own `image` in the frontmatter is skipped -- that image is
// already the card. Fonts come from the system (the output is generated on
// one machine and committed), and the palette is the site's dark theme.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import { parse } from 'yaml';

const root = new URL('..', import.meta.url).pathname;

const W = 1200;
const H = 630;

const C = {
	bg: '#101310',
	card: '#171b15',
	bar: '#20251d',
	border: '#2b3128',
	fg: '#f2f4ee',
	muted: '#9aa093',
	faint: '#3a4036',
	lime: '#84cc16',
	rose: '#fb7185',
	amber: '#fbbf24'
};

const MONO = 'Menlo, Monaco, monospace';
const SANS = 'Helvetica Neue, Helvetica, Arial, sans-serif';

const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

// FNV-1a + mulberry32, matching PostBanner so the fallback sketch agrees.
const hash = (s) => {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
};
const mulberry32 = (a) => () => {
	a |= 0;
	a = (a + 0x6d2b79f5) | 0;
	let t = Math.imul(a ^ (a >>> 15), 1 | a);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// The terminal window: x 64, y 64, 1072 wide, 336 tall; content pane inside.
const WIN = { x: 64, y: 72, w: 1072, h: 312, bar: 48 };
const PANE = { x: WIN.x + 48, y: WIN.y + WIN.bar + 32, w: WIN.w - 96, h: WIN.h - WIN.bar - 64 };

function window_(title) {
	return `
	<rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="18" fill="${C.card}" stroke="${C.border}" stroke-width="2"/>
	<path d="M${WIN.x} ${WIN.y + WIN.bar} h${WIN.w}" stroke="${C.border}" stroke-width="2"/>
	<rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.bar}" rx="18" fill="${C.bar}"/>
	<rect x="${WIN.x}" y="${WIN.y + 24}" width="${WIN.w}" height="${WIN.bar - 24}" fill="${C.bar}"/>
	<circle cx="${WIN.x + 32}" cy="${WIN.y + 24}" r="7" fill="${C.rose}"/>
	<circle cx="${WIN.x + 58}" cy="${WIN.y + 24}" r="7" fill="${C.amber}"/>
	<circle cx="${WIN.x + 84}" cy="${WIN.y + 24}" r="7" fill="${C.lime}"/>
	<text x="${WIN.x + 112}" y="${WIN.y + 31}" font-family="${MONO}" font-size="19" fill="${C.muted}">${esc(title)}</text>`;
}

function meter(values) {
	const max = Math.max(...values);
	const least = Math.min(...values);
	const SEGS = 20;
	const rowH = PANE.h / values.length;
	const segGap = 6;
	const countW = 110;
	const segW = (PANE.w - countW - (SEGS - 1) * segGap) / SEGS;
	let out = '';
	values.forEach((v, i) => {
		const frac = max === 0 ? 0 : v / max;
		const filled = Math.round(frac * SEGS);
		const y = PANE.y + i * rowH + (rowH - 22) / 2;
		const tone = v === least ? C.lime : frac > 0.66 ? C.rose : frac > 0.25 ? C.amber : C.lime;
		for (let s = 0; s < SEGS; s++) {
			out += `<rect x="${PANE.x + s * (segW + segGap)}" y="${y}" width="${segW}" height="22" rx="4" fill="${s < filled ? tone : C.faint}"/>`;
		}
		out += `<text x="${PANE.x + PANE.w}" y="${y + 19}" text-anchor="end" font-family="${MONO}" font-size="26" fill="${v === least ? C.lime : C.fg}" ${v === least ? 'font-weight="bold"' : ''}>${v}</text>`;
	});
	return out;
}

function view() {
	const lines = [
		{ indent: 0, key: 100, value: 0 },
		{ indent: 1, key: 55, value: 165, prose: true },
		{ indent: 1, key: 132, value: 340, prose: true, alert: '9:34' },
		{ indent: 0, key: 87, value: 0 },
		{ indent: 1, key: 46, value: 200 },
		{ indent: 2, key: 105, value: 255, prose: true },
		{ indent: 1, key: 78, value: 145 }
	];
	const rowH = PANE.h / lines.length;
	let out = '';
	lines.forEach((l, i) => {
		const y = PANE.y + i * rowH + (rowH - 18) / 2;
		const x = PANE.x + l.indent * 42;
		out += `<rect x="${x}" y="${y}" width="${l.key}" height="18" rx="4" fill="${C.muted}" opacity="0.5"/>`;
		if (l.value > 0) {
			out += `<rect x="${x + l.key + 18}" y="${y}" width="${l.value}" height="18" rx="4" fill="${l.prose ? C.lime : C.faint}"/>`;
		}
		if (l.alert) {
			out += `<circle cx="${PANE.x + PANE.w - 92}" cy="${y + 9}" r="7" fill="${C.rose}"/>`;
			out += `<text x="${PANE.x + PANE.w}" y="${y + 16}" text-anchor="end" font-family="${MONO}" font-size="22" fill="${C.rose}">${l.alert}</text>`;
		}
	});
	return out;
}

function tree() {
	const lines = [
		['', 'Std/', ''],
		['├── ', 'Abbreviations/', 'Acronyms, Latin'],
		['├── ', 'DateTime/', 'DateFormat, TimeFormat'],
		['├── ', 'Grammar/', 'Contractions, PassiveVoice'],
		['├── ', 'Punctuation/', 'OxfordComma, Ellipses, Spacing'],
		['├── ', 'Readability/', 'SentenceLength'],
		['└── ', 'Usage/', 'GenderedTerms, FirstPerson…']
	];
	const rowH = PANE.h / lines.length;
	let out = '';
	lines.forEach(([glyph, dir, rules], i) => {
		const y = PANE.y + i * rowH + rowH / 2 + 8;
		out += `<text x="${PANE.x}" y="${y}" font-family="${MONO}" font-size="25" xml:space="preserve"><tspan fill="${C.faint}">${esc(glyph)}</tspan><tspan fill="${C.lime}" font-weight="bold">${esc(dir)}</tspan><tspan fill="${C.muted}">   ${esc(rules)}</tspan></text>`;
	});
	return out;
}

function sketch(seed) {
	const rand = mulberry32(hash(seed));
	const LINES = 6;
	const rows = [];
	for (let l = 0; l < LINES; l++) {
		const words = [];
		const count = 5 + Math.floor(rand() * 3);
		for (let w = 0; w < count; w++) words.push({ w: 50 + Math.floor(rand() * 130) });
		if (l === LINES - 1) words.length = Math.max(2, words.length - 3);
		rows.push(words);
	}
	const marks = ['rose', 'rose', 'lime'];
	const used = new Set();
	for (const mark of marks) {
		let l = Math.floor(rand() * LINES);
		while (used.has(l)) l = (l + 1) % LINES;
		used.add(l);
		rows[l][Math.floor(rand() * rows[l].length)].mark = mark;
	}
	const rowH = PANE.h / LINES;
	let out = '';
	rows.forEach((words, i) => {
		const y = PANE.y + i * rowH + (rowH - 18) / 2;
		let x = PANE.x;
		for (const word of words) {
			const fill = word.mark === 'rose' ? C.rose : word.mark === 'lime' ? C.lime : C.faint;
			out += `<rect x="${x}" y="${y}" width="${word.w}" height="18" rx="4" fill="${fill}"/>`;
			x += word.w + 14;
		}
	});
	return out;
}

function savings() {
	// Cumulative cost over fifty requests: resident context as straight
	// lines, rules as a band. Endpoints from the measured per-request costs.
	const labelW = 250;
	const x0 = PANE.x;
	const x1 = PANE.x + PANE.w - labelW;
	const y0 = PANE.y + PANE.h;
	const rows = [
		{ frac: 1, label: 'skill \u00b7 188,850', color: C.rose, bold: false },
		{ frac: 1535 / 3777, label: 'briefs \u00b7 76,750', color: C.amber, bold: false },
		{ frac: 735 / 3777, label: 'rules, worst \u00b7 36,750', color: C.lime, bold: false },
		{ frac: 0, label: 'rules, clean \u00b7 0', color: C.lime, bold: true }
	];
	const yFor = (frac) => y0 - frac * PANE.h;
	let out = `<polygon points="${x0},${y0} ${x1},${yFor(735 / 3777)} ${x1},${y0}" fill="${C.lime}" opacity="0.14"/>`;
	for (const r of rows) {
		out += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${yFor(r.frac)}" stroke="${r.color}" stroke-width="3"/>`;
		out += `<text x="${x1 + 16}" y="${yFor(r.frac) + 7}" font-family="${MONO}" font-size="22" ${r.bold ? 'font-weight="bold"' : ''} fill="${r.color}">${r.label}</text>`;
	}
	return out;
}

// Rough two-line wrap for the title; 44 characters fits at 46px.
function wrap(title) {
	if (title.length <= 46) return [title];
	const words = title.split(' ');
	let first = '';
	while (words.length && (first + words[0]).length <= 46) first += words.shift() + ' ';
	return [first.trim(), words.join(' ')];
}

mkdirSync(`${root}static/blog/og`, { recursive: true });

let made = 0;
for (const file of readdirSync(`${root}src/posts`).sort()) {
	if (!file.endsWith('.md')) continue;
	const slug = file.replace(/\.md$/, '');
	const src = readFileSync(`${root}src/posts/${file}`, 'utf8');
	const meta = parse(src.match(/^---\n([\s\S]+?)\n---\n/)[1]);
	if (meta.image) continue;

	const title =
		meta.motif === 'view' ? 'vale API.yml' : meta.motif === 'tree' ? 'tree Std' : `vale ${slug}.md`;
	const art =
		meta.motif === 'savings'
			? savings()
			: meta.poster
				? meter(meta.poster)
				: meta.motif === 'view'
					? view()
					: meta.motif === 'tree'
						? tree()
						: sketch(slug);

	const lines = wrap(meta.title);
	const text = lines
		.map(
			(line, i) =>
				`<text x="64" y="${516 + i * 60}" font-family="${SANS}" font-size="46" font-weight="bold" fill="${C.fg}">${esc(line)}</text>`
		)
		.join('');

	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
	<rect width="${W}" height="${H}" fill="${C.bg}"/>
	${window_(title)}
	${art}
	<text x="64" y="472" font-family="${MONO}" font-size="20" letter-spacing="4" fill="${C.lime}">THE VALE BLOG</text>
	${text}
	<text x="${W - 64}" y="472" text-anchor="end" font-family="${MONO}" font-size="22" fill="${C.muted}">vale.sh/blog/${esc(slug)}</text>
</svg>`;

	const png = new Resvg(svg, {
		fitTo: { mode: 'width', value: W },
		font: { loadSystemFonts: true }
	}).render();
	writeFileSync(`${root}static/blog/og/${slug}.png`, png.asPng());
	made++;
}
console.log(`static/blog/og: ${made} card(s)`);
