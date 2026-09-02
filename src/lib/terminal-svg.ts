import type { File, Sev } from '$lib/components/landing/Terminal.svelte';

/*
	Renders a Terminal session as a standalone SVG, for downloading from /brand.
	The layout mirrors Terminal.svelte: a title bar, the two commands, each file
	under its path, and the summary. Text is set in the viewer's monospace font,
	so column positions assume a 0.62em advance and stay slightly generous.
*/

type Theme = 'light' | 'dark';

// The theme tokens from app.css, resolved to hex. Alert colors are Tailwind's
// red/amber/sky at the steps the component uses; the prompt and badge are
// the Grass ramp from tailwind.config.ts.
const palette: Record<Theme, Record<string, string>> = {
	light: {
		card: '#FFFFFF',
		bar: '#F5F7F0',
		border: '#E0E4D8',
		text: '#12150E',
		muted: '#5C6454',
		faint: '#8A917F',
		prompt: '#497E1B',
		badge: '#376115',
		badgeBg: '#E8F4DB',
		error: '#DC2626',
		warning: '#D97706',
		suggestion: '#0284C7'
	},
	dark: {
		card: '#161813',
		bar: '#1B1E18',
		border: '#2B2F27',
		text: '#F5F7F0',
		muted: '#AFB6A5',
		faint: '#7E8576',
		prompt: '#90D454',
		badge: '#90D454',
		badgeBg: '#294110',
		error: '#F87171',
		warning: '#FBBF24',
		suggestion: '#38BDF8'
	}
};

const FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const SIZE = 13;
const CH = SIZE * 0.62;
const LINE = 22;
const PAD = 16;
const BAR = 40;
// Column offsets, as in the component: 56px location, 76px severity, 16px gaps.
const X_SEV = PAD + 56 + 16;
const X_MSG = X_SEV + 76 + 16;

const esc = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function terminalSvg(files: File[], packages: number, theme: Theme): string {
	const c = palette[theme];
	const shown = files.filter((f) => f.alerts.length > 0);
	const all = shown.flatMap((f) => f.alerts);
	const n = (sev: Sev) => all.filter((a) => a.sev === sev).length;
	const summary = `${plural(n('error'), 'error')}, ${plural(n('warning'), 'warning')} and ${plural(n('suggestion'), 'suggestion')} in ${plural(shown.length, 'file')}.`;

	const lines: string[] = [];
	let width = 640;
	let y = BAR + PAD + SIZE;

	const text = (x: number, s: string, fill: string, extra = '') =>
		`<text x="${x}" y="${y}" fill="${fill}"${extra}>${esc(s)}</text>`;
	const measure = (x: number, s: string) => (width = Math.max(width, x + s.length * CH + PAD));

	lines.push(
		`<text x="${PAD}" y="${y}" fill="${c.prompt}">$</text>`,
		text(PAD + 2 * CH, 'vale sync', c.text)
	);
	y += LINE;
	lines.push(
		`<rect x="${PAD - 2}" y="${y - SIZE}" width="${7 * CH + 8}" height="${SIZE + 6}" rx="2" fill="${c.badgeBg}"/>`,
		text(PAD + 2, 'SUCCESS', c.badge, ' font-weight="600"'),
		text(PAD + 9 * CH + 4, `Synced ${packages} package(s) to 'styles'.`, c.muted)
	);
	y += LINE * 2;
	lines.push(
		`<text x="${PAD}" y="${y}" fill="${c.prompt}">$</text>`,
		text(PAD + 2 * CH, 'vale docs/', c.text)
	);

	for (const file of shown) {
		y += LINE * 2;
		lines.push(text(PAD, file.path, c.text, ' font-weight="500" text-decoration="underline"'));
		for (const a of file.alerts) {
			y += LINE;
			const xRule = X_MSG + a.msg.length * CH + 16;
			measure(xRule, a.rule);
			lines.push(
				text(PAD, a.loc, c.muted),
				text(X_SEV, a.sev, c[a.sev]),
				text(X_MSG, a.msg, c.text),
				text(xRule, a.rule, c.faint)
			);
		}
	}

	y += LINE * 2;
	if (all.length === 0) {
		lines.push(
			text(PAD, '✔', c.prompt),
			text(PAD + 2 * CH, '0 errors, 0 warnings and 0 suggestions in 0 files.', c.muted)
		);
	} else {
		lines.push(text(PAD, '✖', c.error), text(PAD + 2 * CH, summary, c.muted));
	}
	const height = y + PAD + 4;
	width = Math.round(width);

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="${FONT}" font-size="${SIZE}">
<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="12" fill="${c.card}" stroke="${c.border}"/>
<path d="M0.5 ${BAR}H${width - 0.5}" stroke="${c.border}"/>
<path d="M12.5 0.5H${width - 12.5}A12 12 0 0 1 ${width - 0.5} 12.5V${BAR}H0.5V12.5A12 12 0 0 1 12.5 0.5Z" fill="${c.bar}"/>
<circle cx="22" cy="20" r="6" fill="#EF4444" opacity="0.8"/>
<circle cx="42" cy="20" r="6" fill="#F59E0B" opacity="0.8"/>
<circle cx="62" cy="20" r="6" fill="#62A527" opacity="0.8"/>
<text x="80" y="24" fill="${c.muted}" font-size="12">bash — vale</text>
${lines.join('\n')}
</svg>
`;
}
