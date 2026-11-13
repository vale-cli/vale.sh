/*
	The landing page in forty seconds: a guideline, the rule that encodes it,
	a run, what Vale sees in a document, where it runs, how fast, and how to
	get it. Every example and figure is the page's own -- the hero's
	terminology rule, the session from Terminal.svelte, the GitLab run from
	the speed feature -- so when one changes there, change it here.

	Colors are the social cards' (script/build-og-home.mjs). Type is Inter
	and a system monospace, both read from the machine that renders.
*/
import type { CSSProperties, ReactNode } from 'react';
import {
	AbsoluteFill,
	Easing,
	Series,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig
} from 'remotion';

export const FPS = 30;

const C = {
	bg: '#101310',
	card: '#171b15',
	border: '#2b3128',
	fg: '#f2f4ee',
	muted: '#9aa093',
	lime: '#90d454',
	red: '#fb7185',
	amber: '#fbbf24',
	sky: '#7dd3fc'
};
const SANS = 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif';
const MONO = 'Menlo, Monaco, "DejaVu Sans Mono", monospace';
const SERIF = 'Newsreader, Georgia, "DejaVu Serif", serif';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = Easing.bezier(0.2, 0.7, 0.2, 1);

/** 0 to 1 over `len` frames starting at `at`, eased. */
const tween = (frame: number, at: number, len = 18) =>
	interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: ease });

/** Rise-and-fade entrance for anything. */
const enter = (frame: number, at: number, len = 18, dy = 28): CSSProperties => {
	const t = tween(frame, at, len);
	return { opacity: t, transform: `translateY(${(1 - t) * dy}px)` };
};

const typed = (text: string, frame: number, at: number, perFrame = 1.6) =>
	text.slice(0, Math.max(0, Math.floor((frame - at) * perFrame)));

// --- shared pieces ---------------------------------------------------------

const Mark = ({ size }: { size: number }) => (
	<svg viewBox="0 0 128 120" width={size} height={(size * 120) / 128}>
		<path fill={C.lime} d="M0 40 32 40 72 120 40 120ZM96 0 128 0 86 84 70 52Z" />
	</svg>
);

// "Vale" in Newsreader Semibold as paths, from icons/wordmark.svelte.
const WORD =
	'M107 -1350 -49 -1397V-1430H643V-1397L468 -1352L956 -259L903 -238L1295 -1350L1117 -1398V-1430H1529V-1398L1376 -1347L881 12H726ZM2016 -655 2018 -607Q1913 -571 1847.5 -538Q1782 -505 1747.5 -470.5Q1713 -436 1700 -396.5Q1687 -357 1687 -309Q1687 -226 1725.5 -187Q1764 -148 1823 -148Q1865 -148 1896.5 -165Q1928 -182 1945.5 -216.5Q1963 -251 1963 -304V-774Q1963 -862 1917 -910Q1871 -958 1778 -958Q1731 -958 1689.5 -952.5Q1648 -947 1622 -937L1667 -990Q1661 -932 1654 -889Q1647 -846 1637.5 -816.5Q1628 -787 1616 -771Q1600 -751 1570 -738.5Q1540 -726 1504 -726Q1458 -726 1434 -742.5Q1410 -759 1410 -790Q1410 -834 1454 -879Q1498 -924 1570 -962.5Q1642 -1001 1729.5 -1024.5Q1817 -1048 1905 -1048Q2032 -1048 2108.5 -1011.5Q2185 -975 2219.5 -907.5Q2254 -840 2254 -749V-192Q2254 -164 2263 -146.5Q2272 -129 2288.5 -121Q2305 -113 2327 -113Q2355 -113 2382.5 -121Q2410 -129 2439 -147V-105Q2363 -27 2299 -1.5Q2235 24 2158 24Q2087 24 2045 -4Q2003 -32 1984 -88.5Q1965 -145 1962 -231L1972 -225Q1953 -145 1914 -90Q1875 -35 1820 -6Q1765 23 1698 23Q1560 23 1480.5 -46.5Q1401 -116 1401 -240Q1401 -303 1423 -353Q1445 -403 1508 -448Q1571 -493 1693.5 -542.5Q1816 -592 2016 -655ZM2871 -62 2990 -30V0H2460V-30L2579 -62V-1253Q2566 -1262 2543 -1278Q2520 -1294 2488 -1316Q2456 -1338 2417 -1366V-1390L2857 -1488H2871V-1296ZM3600 -1048Q3719 -1048 3804 -1000.5Q3889 -953 3938 -862.5Q3987 -772 3996 -642H3324V-714H3859L3729 -668Q3721 -786 3701.5 -855.5Q3682 -925 3649 -955.5Q3616 -986 3567 -986Q3505 -986 3460.5 -949Q3416 -912 3393 -831Q3370 -750 3370 -619Q3370 -460 3409 -362Q3448 -264 3524 -219.5Q3600 -175 3710 -175Q3765 -175 3814 -188Q3863 -201 3908.5 -230Q3954 -259 3995 -305L4016 -288Q3949 -171 3881 -103Q3813 -35 3738.5 -5.5Q3664 24 3575 24Q3433 24 3323 -36Q3213 -96 3151 -211.5Q3089 -327 3089 -492Q3089 -642 3148 -768.5Q3207 -895 3321 -971.5Q3435 -1048 3600 -1048Z';
const Wordmark = ({ height }: { height: number }) => (
	<svg viewBox="0 0 303.36 112.84" height={height} width={(height * 303.36) / 112.84}>
		<path fill="#fff" transform="translate(3.66 111.04) scale(0.074627)" d={WORD} />
	</svg>
);

const Background = () => (
	<AbsoluteFill style={{ background: C.bg }}>
		<AbsoluteFill
			style={{
				backgroundImage: 'radial-gradient(rgba(242,244,238,0.07) 1.5px, transparent 1.8px)',
				backgroundSize: '36px 36px',
				WebkitMaskImage: 'radial-gradient(ellipse 75% 80% at 50% 45%, #000 25%, transparent 80%)'
			}}
		/>
		<AbsoluteFill
			style={{
				background:
					'radial-gradient(ellipse 45% 50% at 14% 10%, rgba(144,212,84,0.10), transparent 70%)'
			}}
		/>
	</AbsoluteFill>
);

/** Fades its scene in and out, so cuts between scenes are soft. */
const Scene = ({ children }: { children: ReactNode }) => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	const opacity = Math.min(
		interpolate(frame, [0, 10], [0, 1], clamp),
		interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], clamp)
	);
	return (
		<AbsoluteFill style={{ opacity, padding: '100px 160px', justifyContent: 'center' }}>
			{children}
		</AbsoluteFill>
	);
};

const Heading = ({ eyebrow, children }: { eyebrow: string; children: ReactNode }) => {
	const frame = useCurrentFrame();
	return (
		<div>
			<div
				style={{
					...enter(frame, 0),
					font: `500 26px ${MONO}`,
					letterSpacing: 5,
					color: C.lime,
					textTransform: 'uppercase'
				}}
			>
				{eyebrow}
			</div>
			<div
				style={{
					...enter(frame, 5),
					marginTop: 22,
					font: `600 84px/1.08 ${SANS}`,
					letterSpacing: -3.4,
					color: C.fg
				}}
			>
				{children}
			</div>
		</div>
	);
};

const Panel = ({
	title,
	style,
	children
}: {
	title: string;
	style?: CSSProperties;
	children: ReactNode;
}) => (
	<div
		style={{
			background: C.card,
			border: `2px solid ${C.border}`,
			borderRadius: 22,
			overflow: 'hidden',
			boxShadow: '0 40px 80px rgba(0,0,0,0.35)',
			...style
		}}
	>
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 12,
				padding: '20px 28px',
				borderBottom: `2px solid ${C.border}`,
				font: `24px ${MONO}`,
				color: C.muted
			}}
		>
			{['#f87171', '#fbbf24', '#84cc16'].map((c) => (
				<span
					key={c}
					style={{ width: 16, height: 16, borderRadius: 8, background: c, opacity: 0.8 }}
				/>
			))}
			<span style={{ marginLeft: 12 }}>{title}</span>
		</div>
		<div style={{ padding: '32px 36px' }}>{children}</div>
	</div>
);

const Muted = ({ children }: { children: ReactNode }) => (
	<span style={{ color: C.muted }}>{children}</span>
);

// --- scenes ----------------------------------------------------------------

const Intro = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const pop = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
	return (
		<Scene>
			<AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 44 }}>
					<div style={{ transform: `scale(${pop})` }}>
						<Mark size={210} />
					</div>
					<div style={enter(frame, 8, 20, 0)}>
						<Wordmark height={190} />
					</div>
				</div>
				<div style={{ marginTop: 64, font: `600 76px ${SANS}`, letterSpacing: -3 }}>
					<span style={{ ...enter(frame, 24), display: 'inline-block', color: C.fg }}>
						Your style.
					</span>{' '}
					<span style={{ ...enter(frame, 38), display: 'inline-block', color: C.muted }}>
						Our editor.
					</span>
				</div>
			</AbsoluteFill>
		</Scene>
	);
};

const Guideline = () => {
	const frame = useCurrentFrame();
	const strike = tween(frame, 70, 16);
	const struck = (text: string) => (
		<span style={{ position: 'relative', color: strike > 0 ? C.red : C.fg }}>
			{text}
			<span
				style={{
					position: 'absolute',
					left: 0,
					top: '54%',
					height: 4,
					width: `${strike * 100}%`,
					background: C.red
				}}
			/>
		</span>
	);
	return (
		<Scene>
			<Heading eyebrow="01 · Your guideline">
				Every team has a style guide.
				<br />
				<Muted>Nobody rereads it.</Muted>
			</Heading>
			<div
				style={{
					...enter(frame, 28, 22),
					marginTop: 90,
					padding: '48px 56px',
					background: C.card,
					border: `2px solid ${C.border}`,
					borderRadius: 22,
					width: 1240
				}}
			>
				<div style={{ font: `24px ${MONO}`, color: C.muted }}>Writing guide · Terminology</div>
				<div
					style={{
						marginTop: 28,
						paddingLeft: 32,
						borderLeft: `5px solid ${C.lime}`,
						font: `52px/1.45 ${SERIF}`,
						color: C.fg
					}}
				>
					The product is <b>Vale CLI</b>. Don’t write {struck('Vale cli')} or {struck('vale-cli')}.
				</div>
			</div>
		</Scene>
	);
};

const RULE: [string, string][] = [
	['extends', ' substitution'],
	['message', ` "Use '%s' instead of '%s'."`],
	['level', ' error'],
	['action', ''],
	['  name', ' replace'],
	['swap', ''],
	["  'Vale cli|vale-cli'", ' Vale CLI'],
	["  'style ?guide'", ' style guide'],
	["  'e-?mail'", ' email']
];

const Rule = () => {
	const frame = useCurrentFrame();
	// Type the file line by line: each line starts when the last has finished.
	let at = 30;
	return (
		<Scene>
			<div style={{ display: 'flex', gap: 90, alignItems: 'flex-start' }}>
				<div style={{ width: 660, flexShrink: 0 }}>
					<Heading eyebrow="02 · A rule you own">
						Write it down
						<br />
						once, as a rule.
					</Heading>
					<div
						style={{
							...enter(frame, 20),
							marginTop: 44,
							font: `36px/1.5 ${SANS}`,
							color: C.muted
						}}
					>
						Plain YAML, in your repository, reviewed like any other change.
					</div>
				</div>
				<Panel title="styles/Docs/Terms.yml" style={{ ...enter(frame, 14, 22), flex: 1 }}>
					<div style={{ font: `32px/1.62 ${MONO}`, whiteSpace: 'pre', minHeight: 470 }}>
						{RULE.map(([key, value]) => {
							const line = `${key}:${value}`;
							const shown = typed(line, frame, at, 2.2);
							at += Math.ceil(line.length / 2.2) + 2;
							const k = shown.slice(0, key.length + 1);
							const v = shown.slice(key.length + 1);
							return (
								<div key={key}>
									<span style={{ color: C.lime }}>{k}</span>
									<span style={{ color: '#e9b872' }}>{v}</span>
									{shown.length > 0 && shown.length < line.length ? (
										<span style={{ color: C.fg }}>▍</span>
									) : null}
								</div>
							);
						})}
					</div>
				</Panel>
			</div>
		</Scene>
	);
};

type Sev = 'error' | 'warning' | 'suggestion';
const SEV: Record<Sev, string> = { error: C.red, warning: C.amber, suggestion: C.sky };
// The session from src/lib/components/landing/Terminal.svelte.
const SESSION: { path: string; alerts: [string, Sev, string, string][] }[] = [
	{
		path: 'docs/configure.md',
		alerts: [
			['3:7', 'suggestion', "Consider using 'use' instead of 'utilize'.", 'Microsoft.Wordiness'],
			['3:44', 'suggestion', "'are loaded' looks like passive voice.", 'Microsoft.Passive'],
			['9:12', 'error', "Use 'Vale CLI' instead of 'Vale cli'.", 'Docs.Terms']
		]
	},
	{
		path: 'docs/install.md',
		alerts: [
			[
				'3:40',
				'warning',
				"Use 'select' instead of the input-specific verb 'Click'.",
				'Microsoft.UIVerbs'
			],
			['4:28', 'error', "Did you really mean 'existant'?", 'Vale.Spelling']
		]
	}
];

const Run = () => {
	const frame = useCurrentFrame();
	const cmd = 'vale docs/';
	const START = 50; // first line of output
	let row = 0;
	const show = (): CSSProperties => {
		const at = START + row++ * 7;
		return { opacity: tween(frame, at, 6) };
	};
	return (
		<Scene>
			<Heading eyebrow="03 · Feedback where you write">Then run it. Everywhere.</Heading>
			<Panel title="bash — vale" style={{ ...enter(frame, 12, 22), marginTop: 56 }}>
				<div style={{ font: `28px/1.7 ${MONO}`, whiteSpace: 'pre', color: C.fg, minHeight: 560 }}>
					<div>
						<span style={{ color: C.lime }}>$</span> {typed(cmd, frame, 26, 0.7)}
						{frame < START ? <span>▍</span> : null}
					</div>
					{SESSION.map((file) => (
						<div key={file.path} style={{ marginTop: 22 }}>
							<div style={{ ...show(), textDecoration: 'underline', textUnderlineOffset: 8 }}>
								{file.path}
							</div>
							{file.alerts.map(([loc, sev, msg, rule]) => (
								<div key={loc + rule} style={{ ...show(), display: 'flex' }}>
									<span style={{ width: 110, color: C.muted }}>{loc}</span>
									<span style={{ width: 210, color: SEV[sev] }}>{sev}</span>
									<span style={{ width: 990 }}>{msg}</span>
									<span style={{ color: C.muted }}>{rule}</span>
								</div>
							))}
						</div>
					))}
					<div style={{ ...show(), marginTop: 22, color: C.muted }}>
						<span style={{ color: C.red }}>✖</span> 2 errors, 1 warning and 2 suggestions in 2
						files.
					</div>
				</div>
			</Panel>
		</Scene>
	);
};

const SCOPES: [string, string, boolean][] = [
	['# Getting started', 'heading', true],
	['Write with your team’s voice.', 'paragraph', true],
	['- Keep instructions clear.', 'list', true],
	['[Read the guide](https://example.com)', 'URL skipped', false],
	['```sh\nvale docs/\n```', 'code skipped', false]
];

const Scopes = () => {
	const frame = useCurrentFrame();
	return (
		<Scene>
			<Heading eyebrow="Markup-aware">
				Most tools see text. <Muted>Vale sees a document.</Muted>
			</Heading>
			<div style={{ ...enter(frame, 20), marginTop: 28, font: `36px/1.5 ${SANS}`, color: C.muted }}>
				Check the prose in headings, lists, and comments. Leave the code and the URLs alone.
			</div>
			<div style={{ marginTop: 50 }}>
				<Panel title="guide.md" style={enter(frame, 14, 22)}>
					<div style={{ font: `28px/1.5 ${MONO}` }}>
						{SCOPES.map(([src, tag, checked], i) => {
							const at = 34 + i * 16;
							return (
								<div
									key={tag}
									style={{
										display: 'flex',
										alignItems: 'flex-start',
										justifyContent: 'space-between',
										gap: 20,
										padding: '12px 0',
										borderTop: i ? `2px solid ${C.border}` : undefined,
										opacity: checked ? 1 : interpolate(tween(frame, at), [0, 1], [1, 0.45])
									}}
								>
									<span style={{ whiteSpace: 'pre', color: C.fg }}>{src}</span>
									<span
										style={{
											...enter(frame, at, 14, 0),
											flexShrink: 0,
											padding: '4px 14px',
											borderRadius: 8,
											font: `22px ${MONO}`,
											color: checked ? C.bg : C.muted,
											background: checked ? C.lime : 'transparent',
											border: `2px solid ${checked ? C.lime : C.border}`
										}}
									>
										{tag}
									</span>
								</div>
							);
						})}
					</div>
				</Panel>
			</div>
		</Scene>
	);
};

const FIGURES: [number, string, string, string][] = [
	[2827, '', 'Markdown pages', ''],
	[82, '', 'rules applied', ''],
	[20, '<', 'start to finish', 's']
];

const Speed = () => {
	const frame = useCurrentFrame();
	return (
		<Scene>
			<Heading eyebrow="One Go binary · Runs offline">Built for the whole repository.</Heading>
			<div style={{ ...enter(frame, 18), marginTop: 36, font: `36px ${SANS}`, color: C.muted }}>
				One run over the GitLab documentation.
			</div>
			<div style={{ display: 'flex', gap: 48, marginTop: 80 }}>
				{FIGURES.map(([value, prefix, label, unit], i) => {
					const at = 26 + i * 10;
					const n = Math.round(
						interpolate(frame, [at, at + 40], [0, value], {
							...clamp,
							easing: Easing.out(Easing.cubic)
						})
					);
					return (
						<div
							key={label}
							style={{
								...enter(frame, at),
								flex: 1,
								padding: '48px 52px',
								background: C.card,
								border: `2px solid ${C.border}`,
								borderRadius: 22
							}}
						>
							<div
								style={{
									font: `600 150px/1 ${SANS}`,
									letterSpacing: -6,
									color: i === 2 ? C.lime : C.fg,
									fontVariantNumeric: 'tabular-nums'
								}}
							>
								{prefix}
								{n.toLocaleString('en-US')}
								<span style={{ fontSize: 80, letterSpacing: 0 }}>{unit}</span>
							</div>
							<div style={{ marginTop: 20, font: `30px ${MONO}`, color: C.muted }}>{label}</div>
						</div>
					);
				})}
			</div>
			<div style={{ display: 'flex', gap: 18, marginTop: 64, flexWrap: 'wrap' }}>
				{['VS Code', 'Neovim', 'JetBrains', 'Zed', 'Obsidian', 'GitHub Actions', 'pre-commit'].map(
					(name, i) => (
						<span
							key={name}
							style={{
								...enter(frame, 70 + i * 4, 14, 16),
								padding: '14px 28px',
								border: `2px solid ${C.border}`,
								borderRadius: 999,
								background: C.card,
								font: `500 30px ${SANS}`,
								color: C.fg
							}}
						>
							{name}
						</span>
					)
				)}
			</div>
		</Scene>
	);
};

const Outro = () => {
	const frame = useCurrentFrame();
	const cmd = 'brew install vale';
	return (
		<Scene>
			<AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
				<div style={{ ...enter(frame, 0), display: 'flex', alignItems: 'center', gap: 30 }}>
					<Mark size={120} />
					<Wordmark height={108} />
				</div>
				<div
					style={{
						...enter(frame, 10),
						marginTop: 50,
						font: `600 80px ${SANS}`,
						letterSpacing: -3,
						color: C.fg
					}}
				>
					A linter for prose.
				</div>
				<div
					style={{
						...enter(frame, 22),
						marginTop: 60,
						padding: '26px 44px',
						background: C.card,
						border: `2px solid ${C.border}`,
						borderRadius: 18,
						font: `40px ${MONO}`,
						color: C.fg,
						minWidth: 620
					}}
				>
					<span style={{ color: C.lime }}>$</span> {typed(cmd, frame, 34, 0.8)}
					<span style={{ opacity: Math.floor(frame / 15) % 2 ? 0 : 1 }}>▍</span>
				</div>
				<div style={{ ...enter(frame, 64), marginTop: 48, font: `34px ${MONO}`, color: C.lime }}>
					vale.sh
				</div>
				<div style={{ ...enter(frame, 70), marginTop: 14, font: `26px ${MONO}`, color: C.muted }}>
					OPEN SOURCE · MIT
				</div>
			</AbsoluteFill>
		</Scene>
	);
};

const SCENES: [() => ReactNode, number][] = [
	[Intro, 3.5],
	[Guideline, 5.5],
	[Rule, 7.5],
	[Run, 7],
	[Scopes, 6],
	[Speed, 6],
	[Outro, 5]
];

export const TOTAL = SCENES.reduce((n, [, s]) => n + Math.round(s * FPS), 0);

export const Promo = () => (
	<AbsoluteFill>
		<Background />
		<Series>
			{SCENES.map(([Component, seconds]) => (
				<Series.Sequence key={Component.name} durationInFrames={Math.round(seconds * FPS)}>
					<Component />
				</Series.Sequence>
			))}
		</Series>
	</AbsoluteFill>
);
