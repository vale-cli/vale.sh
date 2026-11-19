/*
	The product in a minute: a guideline in three kinds of writing, the rule
	that encodes it, published styles, a run, the fix, what Vale sees in a
	document, where it runs, tests and speed, and who uses it. Every example and figure is the page's own -- the hero's
	terminology rule, the session from Terminal.svelte, the GitLab run from
	the speed feature -- so when one changes there, change it here.

	Colors are the social cards' (script/build-og-home.mjs). Type is Inter
	and a system monospace, both read from the machine that renders.
*/
import { createContext, useContext } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import adopters from '../../src/lib/data/adopters.json';
import { brandIcons } from '../../src/lib/data/brand-icons';
import {
	AbsoluteFill,
	Easing,
	Sequence,
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

/** A loop is framed tighter than the film: less margin, and no camera move. */
const Tight = createContext(false);

/** Fades its scene in and out, so cuts between scenes are soft. */
const Scene = ({ children }: { children: ReactNode }) => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	const opacity = Math.min(
		interpolate(frame, [0, 10], [0, 1], clamp),
		interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], clamp)
	);
	const tight = useContext(Tight);
	// A slow push-in, so a still shot reads as a camera on the product.
	const zoom = tight ? 1 : interpolate(frame, [0, durationInFrames], [1.03, 1.08]);
	return (
		<AbsoluteFill
			style={{
				opacity,
				padding: tight ? '30px 56px' : '100px 160px',
				justifyContent: 'center',
				transform: `scale(${zoom})`
			}}
		>
			{children}
		</AbsoluteFill>
	);
};

const Muted = ({ children }: { children: ReactNode }) => (
	<span style={{ color: C.muted }}>{children}</span>
);

/** How long a scene's claim holds the screen before its shot, in frames. */
export const CLAIM = 36;

/** One claim, alone on the screen, before the shot that proves it. */
const Claim = ({ eyebrow, lines }: { eyebrow: string; lines: [string, string?] }) => {
	const frame = useCurrentFrame();
	const opacity = Math.min(
		tween(frame, 0, 8),
		interpolate(frame, [CLAIM - 8, CLAIM], [1, 0], clamp)
	);
	return (
		<AbsoluteFill style={{ opacity, alignItems: 'center', justifyContent: 'center', padding: 160 }}>
			<div
				style={{
					font: `500 28px ${MONO}`,
					letterSpacing: 6,
					color: C.lime,
					textTransform: 'uppercase'
				}}
			>
				{eyebrow}
			</div>
			<div
				style={{
					marginTop: 30,
					font: `600 124px/1.05 ${SANS}`,
					letterSpacing: -5.5,
					textAlign: 'center',
					color: C.fg,
					transform: `scale(${interpolate(frame, [0, CLAIM], [0.97, 1.02])})`
				}}
			>
				{lines[0]}
				{lines[1] ? (
					<>
						<br />
						<Muted>{lines[1]}</Muted>
					</>
				) : null}
			</div>
		</AbsoluteFill>
	);
};

/** A pointer, so the eye knows where the next thing happens. */
const Cursor = ({
	x,
	y,
	press = 0,
	opacity = 1
}: {
	x: number;
	y: number;
	press?: number;
	opacity?: number;
}) => (
	<svg
		viewBox="0 0 24 24"
		width={54}
		height={54}
		style={{
			position: 'absolute',
			left: x,
			top: y,
			opacity,
			transform: `scale(${1 - press * 0.18})`,
			transformOrigin: 'top left',
			filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.6))'
		}}
	>
		<path
			d="M4 2l15 9.5-6.6 1.3L16 20l-3 1.4-3.5-7.2L4 19z"
			fill="#fff"
			stroke="#101310"
			strokeWidth={1.2}
		/>
	</svg>
);

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

// The hero's three kinds of writing, each with the wording it bans.
const GUIDES: { kicker: string; before: string; keep: string; mid: string; ban: string }[] = [
	{
		kicker: 'Writing guide · Terminology',
		before: 'The product is ',
		keep: 'Vale CLI',
		mid: '. Don’t write ',
		ban: 'Vale cli'
	},
	{
		kicker: 'Elmore Leonard · Rule 4',
		before: 'Never use an adverb to modify ',
		keep: '“said”',
		mid: '. Not ',
		ban: 'he admonished gravely'
	},
	{
		kicker: 'Author guidelines · Units',
		before: 'A space between a number and its unit: ',
		keep: '12 mmHg',
		mid: ', not ',
		ban: '12mmHg'
	}
];

const Guideline = () => {
	const frame = useCurrentFrame();
	return (
		<Scene>
			<div style={{ display: 'flex', gap: 32, marginTop: 64 }}>
				{GUIDES.map((g, i) => {
					const at = 26 + i * 34;
					const strike = tween(frame, at + 34, 14);
					return (
						<div
							key={g.kicker}
							style={{
								...enter(frame, at, 20),
								flex: 1,
								padding: '40px 44px 48px',
								background: C.card,
								border: `2px solid ${C.border}`,
								borderRadius: 22
							}}
						>
							<div style={{ font: `22px ${MONO}`, color: C.muted }}>{g.kicker}</div>
							<div
								style={{
									marginTop: 26,
									paddingLeft: 28,
									borderLeft: `5px solid ${C.lime}`,
									font: `40px/1.45 ${SERIF}`,
									color: C.fg
								}}
							>
								{g.before}
								<b>{g.keep}</b>
								{g.mid}
								<span style={{ position: 'relative', color: strike > 0 ? C.red : C.fg }}>
									{g.ban}
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
								.
							</div>
						</div>
					);
				})}
			</div>
			<div style={{ ...enter(frame, 150), marginTop: 44, font: `32px ${SANS}`, color: C.muted }}>
				Technical docs, fiction, or a journal’s author guidelines.
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
// The twelve extension points, in the docs' order.
const CHECKS = [
	'existence',
	'substitution',
	'occurrence',
	'repetition',
	'consistency',
	'conditional',
	'capitalization',
	'metric',
	'readability',
	'spelling',
	'sequence',
	'script'
];

const Rule = () => {
	const frame = useCurrentFrame();
	// Type the file line by line: each line starts when the last has finished.
	let at = 26;
	return (
		<Scene>
			<div style={{ display: 'flex', gap: 90, alignItems: 'flex-start' }}>
				<div style={{ width: 700, flexShrink: 0 }}>
					<div
						style={{ ...enter(frame, 20), marginTop: 36, font: `34px/1.5 ${SANS}`, color: C.muted }}
					>
						Plain YAML, in your repository, built on one of twelve kinds of check.
					</div>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 36 }}>
						{CHECKS.map((name, i) => {
							const on = name === 'substitution';
							return (
								<span
									key={name}
									style={{
										...enter(frame, 60 + i * 4, 10, 12),
										padding: '8px 18px',
										borderRadius: 10,
										border: `2px solid ${on ? C.lime : C.border}`,
										background: on ? C.lime : C.card,
										color: on ? C.bg : C.fg,
										font: `24px ${MONO}`
									}}
								>
									{name}
								</span>
							);
						})}
					</div>
				</div>
				<Panel title="styles/Docs/Terms.yml" style={{ ...enter(frame, 14, 22), flex: 1 }}>
					<div style={{ font: `32px/1.62 ${MONO}`, whiteSpace: 'pre', minHeight: 470 }}>
						{RULE.map(([key, value]) => {
							const line = `${key}:${value}`;
							const shown = typed(line, frame, at, 2.6);
							at += Math.ceil(line.length / 2.6) + 2;
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

const INI: [string, string][] = [
	['StylesPath', 'styles'],
	['Packages', 'Microsoft, Google'],
	['', ''],
	['[*.md]', ''],
	['BasedOnStyles', 'Vale, Microsoft, Google']
];

const Styles = () => {
	const frame = useCurrentFrame();
	return (
		<Scene>
			<div style={{ display: 'flex', gap: 48, marginTop: 64, alignItems: 'stretch' }}>
				<Panel title=".vale.ini" style={{ ...enter(frame, 14, 22), flex: 1 }}>
					<div style={{ font: `27px/1.75 ${MONO}`, whiteSpace: 'pre' }}>
						{INI.map(([key, value], i) => (
							<div key={i} style={{ minHeight: 47 }}>
								<span style={{ color: key.startsWith('[') ? C.muted : C.lime }}>{key}</span>
								{value ? <Muted> = </Muted> : null}
								<span style={{ color: C.fg }}>{value}</span>
							</div>
						))}
					</div>
				</Panel>
				<div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 32 }}>
					<Panel title="bash — vale" style={enter(frame, 30, 22)}>
						<div style={{ font: `30px/1.7 ${MONO}`, whiteSpace: 'pre', color: C.fg }}>
							<div>
								<span style={{ color: C.lime }}>$</span> {typed('vale sync', frame, 44, 0.7)}
							</div>
							<div style={{ opacity: tween(frame, 66, 8) }}>
								<span
									style={{
										padding: '2px 12px',
										borderRadius: 6,
										background: 'rgba(144,212,84,0.18)',
										color: C.lime,
										fontWeight: 700
									}}
								>
									SUCCESS
								</span>
								<Muted> Synced 2 package(s) to 'styles'.</Muted>
							</div>
						</div>
					</Panel>
					<div
						style={{
							...enter(frame, 84, 20),
							flex: 1,
							padding: '30px 36px',
							background: C.card,
							border: `2px solid ${C.border}`,
							borderRadius: 22
						}}
					>
						<div style={{ font: `24px ${MONO}`, color: C.muted }}>vocabularies/Docs/accept.txt</div>
						<div style={{ marginTop: 14, font: `32px/1.5 ${MONO}`, color: C.fg }}>
							Kubernetes
							<br />
							kubectl
						</div>
						<div style={{ marginTop: 14, font: `28px ${SANS}`, color: C.muted }}>
							Your own terms, accepted everywhere.
						</div>
					</div>
				</div>
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
	const START = 44; // first line of output
	let row = 0;
	const show = (): CSSProperties => {
		const at = START + row++ * 6;
		return { opacity: tween(frame, at, 6) };
	};
	return (
		<Scene>
			<Panel title="bash — vale" style={{ ...enter(frame, 12, 22), marginTop: 56 }}>
				<div style={{ font: `28px/1.7 ${MONO}`, whiteSpace: 'pre', color: C.fg, minHeight: 560 }}>
					<div>
						<span style={{ color: C.lime }}>$</span> {typed(cmd, frame, 22, 0.7)}
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

const Fix = () => {
	const frame = useCurrentFrame();
	const FIXED = 96; // the frame the quick fix lands
	const done = frame >= FIXED;
	const press = tween(frame, 80, 8) - tween(frame, 90, 8);
	const flash = done ? interpolate(frame, [FIXED, FIXED + 30], [1, 0], clamp) : 0;
	return (
		<Scene>
			<div style={{ ...enter(frame, 20), marginTop: 28, font: `34px ${SANS}`, color: C.muted }}>
				A rule can carry its own correction: suggest, replace, remove, edit, or convert.
			</div>
			<Panel title="docs/install.md" style={{ ...enter(frame, 14, 22), marginTop: 50 }}>
				<div
					style={{ font: `34px/1.8 ${MONO}`, color: C.fg, minHeight: 365, position: 'relative' }}
				>
					<div>
						<Muted>1 </Muted> <Muted>#</Muted> Installation
					</div>
					<div>
						<Muted>2</Muted>
					</div>
					<div>
						<Muted>3 </Muted>{' '}
						<span
							style={{
								borderBottom: done ? '4px solid transparent' : `4px solid ${C.red}`,
								background: `rgba(144,212,84,${flash * 0.35})`,
								borderRadius: 4
							}}
						>
							{done ? 'Vale CLI' : 'Vale cli'}
						</span>{' '}
						runs on macOS, Windows, and Linux.
					</div>
					<div
						style={{
							position: 'absolute',
							left: 70,
							top: 210,
							width: 900,
							opacity:
								tween(frame, 40, 10) * interpolate(frame, [FIXED, FIXED + 12], [1, 0], clamp),
							background: C.bg,
							border: `2px solid ${C.border}`,
							borderRadius: 16,
							boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
							overflow: 'hidden'
						}}
					>
						<div style={{ padding: '22px 28px', font: `30px/1.4 ${SANS}` }}>
							<span style={{ color: C.red, fontWeight: 700 }}>error</span> Use 'Vale CLI' instead of
							'Vale cli'. <span style={{ font: `24px ${MONO}`, color: C.muted }}>Docs.Terms</span>
						</div>
						<div
							style={{
								padding: '18px 28px',
								borderTop: `2px solid ${C.border}`,
								font: `500 30px ${SANS}`,
								color: C.lime,
								background: `rgba(144,212,84,${0.08 + press * 0.25})`
							}}
						>
							Quick fix: replace with 'Vale CLI'
						</div>
					</div>
					<Cursor
						x={interpolate(frame, [48, 78], [1250, 360], { ...clamp, easing: ease })}
						y={interpolate(frame, [48, 78], [40, 318], { ...clamp, easing: ease })}
						press={press}
						opacity={
							tween(frame, 44, 8) * interpolate(frame, [FIXED + 6, FIXED + 18], [1, 0], clamp)
						}
					/>
					<div
						style={{
							...enter(frame, FIXED + 10, 14, 12),
							position: 'absolute',
							left: 0,
							bottom: 0,
							font: `30px ${MONO}`,
							color: C.muted
						}}
					>
						<span style={{ color: C.lime }}>✔</span> 0 errors, 0 warnings and 0 suggestions in 1
						file.
					</div>
				</div>
			</Panel>
		</Scene>
	);
};

// Three files, one idea: the markup decides what is prose. From the features
// section of the landing page.
const FILES: { name: string; lines: [string, string, boolean][] }[] = [
	{
		name: 'guide.md',
		lines: [
			['# Getting started', 'heading', true],
			['Write with your team’s voice.', 'paragraph', true],
			['- Keep instructions clear.', 'list', true],
			['[Read the guide](https://example.com)', 'URL skipped', false],
			['```sh\nvale docs/\n```', 'code skipped', false]
		]
	},
	{
		name: 'person.rs',
		lines: [
			['/// Creates a person with the given name.', 'paragraph', true],
			['/// # Examples', 'heading', true],
			['/// ```\n/// let person = Person::new("name");\n/// ```', 'code skipped', false],
			['pub fn new(name: &str) -> Person {', 'not a comment', false]
		]
	},
	{
		name: 'openapi.yml',
		lines: [
			['openapi: 3.1.0', 'skipped', false],
			['info:\n  title: Example API', 'skipped', false],
			['  description: Manage your projects.', 'description', true],
			['paths:\n  /projects: {}', 'skipped', false]
		]
	}
];
const PER_FILE = 76;

const Document = () => {
	const frame = useCurrentFrame();
	const active = Math.min(FILES.length - 1, Math.max(0, Math.floor((frame - 14) / PER_FILE)));
	return (
		<Scene>
			<div style={{ display: 'flex', gap: 14, marginTop: 44 }}>
				{FILES.map((file, i) => (
					<span
						key={file.name}
						style={{
							...enter(frame, 12 + i * 4, 12, 10),
							padding: '10px 24px',
							borderRadius: 12,
							font: `26px ${MONO}`,
							border: `2px solid ${i === active ? C.lime : C.border}`,
							color: i === active ? C.lime : C.muted,
							background: C.card
						}}
					>
						{file.name}
					</span>
				))}
			</div>
			<div style={{ position: 'relative', height: 500, marginTop: 24 }}>
				{FILES.map((file, i) => {
					const start = 14 + i * PER_FILE;
					const local = frame - start;
					const visible = i === active ? tween(frame, start, 10) : i < active ? 0 : 0;
					return (
						<div
							key={file.name}
							style={{
								position: 'absolute',
								inset: 0,
								opacity: visible,
								background: C.card,
								border: `2px solid ${C.border}`,
								borderRadius: 22,
								padding: '18px 36px',
								font: `28px/1.5 ${MONO}`
							}}
						>
							{file.lines.map(([src, tag, checked], j) => {
								const at = 12 + j * 9;
								return (
									<div
										key={src}
										style={{
											display: 'flex',
											alignItems: 'flex-start',
											justifyContent: 'space-between',
											gap: 20,
											padding: '13px 0',
											borderTop: j ? `2px solid ${C.border}` : undefined,
											opacity: checked ? 1 : interpolate(tween(local, at), [0, 1], [1, 0.45])
										}}
									>
										<span style={{ whiteSpace: 'pre', color: C.fg }}>{src}</span>
										<span
											style={{
												opacity: tween(local, at, 10),
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
					);
				})}
			</div>
			<div style={{ ...enter(frame, 30), marginTop: 28, font: `28px ${SANS}`, color: C.muted }}>
				12 markup formats · comments in 19 languages · API specs, notebooks, commit messages
			</div>
		</Scene>
	);
};

const PLACES: { title: string; note: string; body: ReactNode }[] = [
	{
		title: 'In your editor',
		note: 'VS Code · Neovim · JetBrains · Zed · Obsidian · any LSP client',
		body: (
			<>
				<span style={{ borderBottom: `4px solid ${C.red}` }}>Vale cli</span> runs on macOS…
			</>
		)
	},
	{
		title: 'On the pull request',
		note: 'GitHub Actions · pre-commit · Docker · code scanning',
		body: (
			<>
				<span style={{ color: C.red }}>✖</span> vale <Muted>— 2 errors on changed lines</Muted>
			</>
		)
	},
	{
		title: 'In the commit message',
		note: 'A hook that stops a bad commit',
		body: (
			<>
				<span style={{ color: C.red }}>✖</span> A subject does not end with a period.
			</>
		)
	},
	{
		title: 'With your agent',
		note: 'Agent skills · an MCP server that writes and tests rules',
		body: (
			<>
				scaffold_rule <Muted>→</Muted> test_rule <span style={{ color: C.lime }}>✔</span>
			</>
		)
	}
];

const Everywhere = () => {
	const frame = useCurrentFrame();
	return (
		<Scene>
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 64 }}>
				{PLACES.map((place, i) => (
					<div
						key={place.title}
						style={{
							...enter(frame, 20 + i * 14, 18),
							padding: '36px 40px',
							background: C.card,
							border: `2px solid ${C.border}`,
							borderRadius: 22
						}}
					>
						<div style={{ font: `600 40px ${SANS}`, letterSpacing: -1, color: C.fg }}>
							{place.title}
						</div>
						<div
							style={{
								marginTop: 22,
								padding: '16px 22px',
								borderRadius: 12,
								background: C.bg,
								border: `2px solid ${C.border}`,
								font: `28px ${MONO}`,
								color: C.fg,
								whiteSpace: 'nowrap',
								overflow: 'hidden'
							}}
						>
							{place.body}
						</div>
						<div style={{ marginTop: 20, font: `26px ${SANS}`, color: C.muted }}>{place.note}</div>
					</div>
				))}
			</div>
		</Scene>
	);
};

const FIGURES: [number, string, string, string][] = [
	[2827, '', 'Markdown pages', ''],
	[82, '', 'rules applied', ''],
	[20, '<', 'start to finish', 's']
];

const Tested = () => {
	const frame = useCurrentFrame();
	let row = 0;
	const show = (): CSSProperties => ({ opacity: tween(frame, 46 + row++ * 6, 6) });
	return (
		<Scene>
			<div style={{ display: 'flex', gap: 48, marginTop: 60, alignItems: 'stretch' }}>
				<Panel title="bash — vale test" style={{ ...enter(frame, 14, 22), flex: 1.25 }}>
					<div
						style={{ font: `23px/1.65 ${MONO}`, whiteSpace: 'pre', color: C.fg, minHeight: 440 }}
					>
						<div>
							<span style={{ color: C.lime }}>$</span> {typed('vale test', frame, 26, 0.7)}
						</div>
						<div style={{ ...show(), marginTop: 16 }}>
							<span style={{ color: C.red }}>✗</span> flags a hedge{' '}
							<Muted>— output does not match</Muted>
						</div>
						<div style={{ ...show(), marginTop: 10 }}>
							<Muted>{'  from  styles/House/Hedging.yml'}</Muted>
						</div>
						<div style={{ ...show(), marginTop: 10, color: C.red }}>
							{"    - 1:2:House.Hedging:Consider removing 'Perhaps'."}
						</div>
						<div style={{ ...show(), color: C.lime }}>
							{"    + 1:1:House.Hedging:Consider removing 'Perhaps'."}
						</div>
						<div style={{ ...show(), marginTop: 16 }}>
							<span style={{ color: C.red, fontWeight: 700 }}>{'  ERROR'}</span>
							{'   2 files — 4 passed, 1 failed'}
						</div>
					</div>
				</Panel>
				<div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
					<div style={{ ...enter(frame, 80), font: `28px ${SANS}`, color: C.muted }}>
						One run over the GitLab documentation
					</div>
					{FIGURES.map(([value, prefix, label, unit], i) => {
						const at = 90 + i * 10;
						const n = Math.round(
							interpolate(frame, [at, at + 36], [0, value], {
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
									display: 'flex',
									alignItems: 'baseline',
									gap: 28,
									padding: '18px 40px',
									background: C.card,
									border: `2px solid ${C.border}`,
									borderRadius: 22
								}}
							>
								<span
									style={{
										font: `600 96px/1.1 ${SANS}`,
										letterSpacing: -4,
										color: i === 2 ? C.lime : C.fg,
										fontVariantNumeric: 'tabular-nums'
									}}
								>
									{prefix}
									{n.toLocaleString('en-US')}
									<span style={{ fontSize: 56, letterSpacing: 0 }}>{unit}</span>
								</span>
								<span style={{ font: `28px ${MONO}`, color: C.muted }}>{label}</span>
							</div>
						);
					})}
				</div>
			</div>
		</Scene>
	);
};

// Marks from the landing page's adopter band that Simple Icons carries.
const MARKS = [
	'nvidia',
	'epicgames',
	'github',
	'docker',
	'redhat',
	'gitlab',
	'datadog',
	'mongodb',
	'grafana',
	'spotify',
	'sap'
];

const Outro = () => {
	const frame = useCurrentFrame();
	const cmd = 'brew install vale';
	return (
		<Scene>
			<AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
				<div
					style={{ ...enter(frame, 0), font: `500 26px ${MONO}`, letterSpacing: 5, color: C.lime }}
				>
					{adopters.length} TEAMS LISTED, EACH WITH A PUBLIC CONFIG
				</div>
				<div style={{ display: 'flex', gap: 22, marginTop: 36 }}>
					{MARKS.map((slug, i) => (
						<div
							key={slug}
							style={{
								...enter(frame, 8 + i * 3, 14, 16),
								width: 104,
								height: 104,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: C.card,
								border: `2px solid ${C.border}`,
								borderRadius: 20
							}}
						>
							<svg viewBox="0 0 24 24" width={56} height={56}>
								<path d={brandIcons[slug]} fill={C.fg} />
							</svg>
						</div>
					))}
				</div>
				<div
					style={{
						...enter(frame, 56),
						display: 'flex',
						alignItems: 'center',
						gap: 28,
						marginTop: 90
					}}
				>
					<Mark size={110} />
					<Wordmark height={98} />
				</div>
				<div
					style={{
						...enter(frame, 64),
						marginTop: 36,
						font: `600 72px ${SANS}`,
						letterSpacing: -3,
						color: C.fg
					}}
				>
					A linter for prose.
				</div>
				<div
					style={{
						...enter(frame, 74),
						marginTop: 44,
						padding: '24px 44px',
						background: C.card,
						border: `2px solid ${C.border}`,
						borderRadius: 18,
						font: `40px ${MONO}`,
						color: C.fg,
						minWidth: 620
					}}
				>
					<span style={{ color: C.lime }}>$</span> {typed(cmd, frame, 84, 0.8)}
					<span style={{ opacity: Math.floor(frame / 15) % 2 ? 0 : 1 }}>▍</span>
				</div>
				<div style={{ ...enter(frame, 110), marginTop: 36, font: `34px ${MONO}`, color: C.lime }}>
					vale.sh <Muted>· open source · MIT</Muted>
				</div>
			</AbsoluteFill>
		</Scene>
	);
};

type SceneDef = {
	Shot: () => ReactNode;
	/** Length of the shot in seconds, not counting its claim. */
	seconds: number;
	eyebrow?: string;
	claim?: [string, string?];
};

// The film: a claim, then the shot that proves it. The landing page's chapter
// list (src/lib/components/landing/Promo.svelte) names where each starts.
export const SCENES: SceneDef[] = [
	{ Shot: Intro, seconds: 3 },
	{
		Shot: Guideline,
		seconds: 6,
		eyebrow: '01 · Your guideline',
		claim: ['Every team has a style guide.', 'Nobody rereads it.']
	},
	{
		Shot: Rule,
		seconds: 6.5,
		eyebrow: '02 · A rule you own',
		claim: ['Write it down once,', 'as a rule.']
	},
	{
		Shot: Styles,
		seconds: 4.5,
		eyebrow: 'Packages',
		claim: ['Or start from', 'a published style.']
	},
	{ Shot: Run, seconds: 5, eyebrow: '03 · Feedback where you write', claim: ['Then run it.'] },
	{ Shot: Fix, seconds: 5.5, eyebrow: 'Actions', claim: ['The fix comes', 'with the alert.'] },
	{
		Shot: Document,
		seconds: 8,
		eyebrow: 'Markup-aware',
		claim: ['Most tools see text.', 'Vale sees a document.']
	},
	{ Shot: Everywhere, seconds: 6, eyebrow: 'One engine', claim: ['Wherever', 'you write.'] },
	{
		Shot: Tested,
		seconds: 6.5,
		eyebrow: 'vale test · one binary · offline',
		claim: ['Tested like code.', 'Fast like a linter.']
	},
	{ Shot: Outro, seconds: 7 }
];

const frames = (scene: SceneDef) => Math.round(scene.seconds * FPS) + (scene.claim ? CLAIM : 0);

export const TOTAL = SCENES.reduce((n, scene) => n + frames(scene), 0);

export const Promo = () => (
	<AbsoluteFill>
		<Background />
		<Series>
			{SCENES.map((scene) => (
				<Series.Sequence key={scene.Shot.name} durationInFrames={frames(scene)}>
					{scene.claim ? <Claim eyebrow={scene.eyebrow ?? ''} lines={scene.claim} /> : null}
					<Sequence
						from={scene.claim ? CLAIM - 4 : 0}
						durationInFrames={frames(scene) - (scene.claim ? CLAIM - 4 : 0)}
					>
						<scene.Shot />
					</Sequence>
				</Series.Sequence>
			))}
		</Series>
	</AbsoluteFill>
);

// The loops: one shot each, with no claim, for the page section it proves.
// Each fades in and out, so the seam of the loop is the dark ground.
export const LOOPS: Record<string, SceneDef> = {
	LoopRule: SCENES[2],
	LoopRun: SCENES[4],
	LoopFix: SCENES[5],
	LoopDocument: SCENES[6]
};

export const Loop = ({ id }: { id: string }) => {
	const { Shot } = LOOPS[id];
	return (
		<AbsoluteFill>
			<Background />
			<Tight.Provider value={true}>
				<Shot />
			</Tight.Provider>
		</AbsoluteFill>
	);
};
