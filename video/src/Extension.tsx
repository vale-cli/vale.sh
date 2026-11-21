/*
	The browser extension in half a minute, for its store listings: marks as
	you type, a card's fix, the keyboard, your own style, and privacy. The
	comment, rules, and messages are the store screenshots' (vale-web
	scripts/screenshots/shoot.mjs), so the two tell one story.
*/
import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, Sequence, Series, interpolate, useCurrentFrame } from 'remotion';
import {
	C,
	CLAIM,
	Claim,
	Cursor,
	FPS,
	MONO,
	Mark,
	Muted,
	Panel,
	SANS,
	Scene,
	type SceneDef,
	Background,
	Wordmark,
	clamp,
	ease,
	enter,
	tween
} from './Promo';

type Sev = 'error' | 'warning' | 'suggestion';
const SEV: Record<Sev, string> = { error: C.red, warning: C.amber, suggestion: C.sky };

// The comment, wrapped by hand so a column is a fixed distance across.
const FONT = 36;
const CW = FONT * 0.6021; // Menlo's advance
const LH = FONT * 1.8;
const LINES = [
	'The new cache makes the build really fast in every',
	'enviroment. We can utilize it in order to skip the',
	"slow step, and it's very simple to turn on."
];
type Hit = { line: number; col: number; len: number; sev: Sev; id: string };
const HITS: Hit[] = [
	{ line: 0, col: 30, len: 6, sev: 'warning', id: 'really' },
	{ line: 1, col: 0, len: 10, sev: 'error', id: 'enviroment' },
	{ line: 1, col: 19, len: 7, sev: 'suggestion', id: 'utilize' },
	{ line: 1, col: 30, len: 11, sev: 'suggestion', id: 'order' },
	{ line: 2, col: 20, len: 4, sev: 'warning', id: 'very' }
];
const offset = (line: number, col: number) =>
	LINES.slice(0, line).reduce((n, l) => n + l.length + 1, 0) + col;
const at = (line: number, col: number) => ({ x: col * CW, y: line * LH });

/** The comment as it stands: typed so far, marks shown, words replaced. */
const Comment = ({
	shown = Infinity,
	mark = () => 1,
	swap = {},
	flash = 0,
	caret,
	children
}: {
	shown?: number;
	mark?: (hit: Hit) => number;
	swap?: Record<string, string>;
	flash?: number;
	caret?: { line: number; col: number; on: boolean };
	children?: ReactNode;
}) => (
	<div
		style={{
			position: 'relative',
			font: `${FONT}px/${LH}px ${MONO}`,
			color: C.fg,
			minHeight: LH * 7.8
		}}
	>
		{LINES.map((text, line) => {
			const start = offset(line, 0);
			const visible = text.slice(0, Math.max(0, shown - start));
			const parts: ReactNode[] = [];
			let col = 0;
			for (const hit of HITS.filter((h) => h.line === line)) {
				if (hit.col >= visible.length) break;
				parts.push(visible.slice(col, hit.col));
				const word = visible.slice(hit.col, hit.col + hit.len);
				const swapped = swap[hit.id];
				parts.push(
					<span
						key={hit.id}
						style={{
							borderBottom: `4px solid ${swapped ? 'transparent' : alpha(SEV[hit.sev], mark(hit))}`,
							background: `rgba(144,212,84,${swapped ? flash * 0.35 : 0})`,
							borderRadius: 4
						}}
					>
						{swapped ?? word}
					</span>
				);
				col = hit.col + hit.len;
			}
			parts.push(visible.slice(col));
			return <div key={line}>{parts.length ? parts : ' '}</div>;
		})}
		{caret ? (
			<span
				style={{
					position: 'absolute',
					left: at(caret.line, caret.col).x - 2,
					top: at(caret.line, caret.col).y + 10,
					width: 3,
					height: LH - 20,
					background: C.fg,
					opacity: caret.on ? 1 : 0
				}}
			/>
		) : null}
		{children}
	</div>
);

/** A hex color at an opacity, for a mark fading in. */
const alpha = (hex: string, a: number) =>
	hex +
	Math.round(Math.max(0, Math.min(1, a)) * 255)
		.toString(16)
		.padStart(2, '0');

const button = (focus: number, press = 0): CSSProperties => ({
	padding: '8px 18px',
	borderRadius: 10,
	border: `2px solid ${focus ? C.lime : C.border}`,
	background: `rgba(144,212,84,${0.06 + press * 0.3})`,
	font: `500 28px ${SANS}`,
	color: C.fg
});

/** The card, as the extension draws it. */
const Card = ({
	x,
	y,
	sev,
	check,
	message,
	fixes,
	tools,
	focus = -1,
	press = 0,
	style
}: {
	x: number;
	y: number;
	sev: Sev;
	check: string;
	message: string;
	fixes: string[];
	tools: string[];
	focus?: number;
	press?: number;
	style?: CSSProperties;
}) => (
	<div
		style={{
			position: 'absolute',
			left: x,
			top: y,
			width: 560,
			padding: '22px 26px',
			background: C.bg,
			border: `2px solid ${C.border}`,
			borderRadius: 16,
			boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
			font: `28px/1.4 ${SANS}`,
			...style
		}}
	>
		<div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
			<span style={{ color: SEV[sev], font: `700 22px ${SANS}`, letterSpacing: 1.5 }}>
				{sev.toUpperCase()}
			</span>
			<span style={{ font: `22px ${MONO}`, color: C.muted }}>{check}</span>
		</div>
		<div style={{ marginTop: 10, color: C.fg }}>{message}</div>
		<div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
			{fixes.map((f, i) => (
				<span key={f} style={button(i === focus ? 1 : 0, i === focus ? press : 0)}>
					{f}
				</span>
			))}
		</div>
		<div
			style={{
				marginTop: 18,
				paddingTop: 14,
				borderTop: `2px solid ${C.border}`,
				display: 'grid',
				gap: 6,
				font: `24px ${SANS}`,
				color: C.muted
			}}
		>
			{tools.map((t) => (
				<span key={t}>{t}</span>
			))}
		</div>
	</div>
);

/** A key, pressed when `down` is near 1. */
const Key = ({ label, down }: { label: string; down: number }) => (
	<span
		style={{
			display: 'inline-block',
			padding: '12px 24px',
			borderRadius: 12,
			border: `2px solid ${down > 0.5 ? C.lime : C.border}`,
			borderBottomWidth: 6 - down * 4,
			background: C.card,
			font: `500 34px ${MONO}`,
			color: down > 0.5 ? C.lime : C.fg,
			transform: `translateY(${down * 4}px)`
		}}
	>
		{label}
	</span>
);

const URL = 'github.com/vale-cli/vale/pull/1236';

/** The comment box a scene happens in. */
const Box = ({ children, frame }: { children: ReactNode; frame: number }) => (
	<Panel title={URL} style={{ ...enter(frame, 10, 22), marginTop: 40 }}>
		<div style={{ font: `26px ${SANS}`, color: C.muted, marginBottom: 22 }}>Add a comment</div>
		{children}
	</Panel>
);

const Lead = ({ frame, children }: { frame: number; children: ReactNode }) => (
	<div style={{ ...enter(frame, 18), font: `34px ${SANS}`, color: C.muted }}>{children}</div>
);

// --- scenes ----------------------------------------------------------------

const Intro = () => {
	const frame = useCurrentFrame();
	return (
		<Scene>
			<AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
					<div style={enter(frame, 0, 16, 0)}>
						<Mark size={170} />
					</div>
					<div style={enter(frame, 6, 18, 0)}>
						<Wordmark height={154} />
					</div>
				</div>
				<div
					style={{
						...enter(frame, 22),
						marginTop: 56,
						font: `600 70px ${SANS}`,
						letterSpacing: -3,
						color: C.fg
					}}
				>
					Your style guide, <Muted>in your browser.</Muted>
				</div>
			</AbsoluteFill>
		</Scene>
	);
};

const TYPE_AT = 24;
const PER_FRAME = 1.25;

const AsYouType = () => {
	const frame = useCurrentFrame();
	const shown = Math.floor(Math.max(0, frame - TYPE_AT) * PER_FRAME);
	// A mark lands a few frames after its word is typed: there's no wait.
	const mark = (hit: Hit) => {
		const done = TYPE_AT + (offset(hit.line, hit.col) + hit.len + 1) / PER_FRAME;
		return tween(frame, done + 3, 6);
	};
	const end = offset(2, LINES[2].length);
	const caret = (() => {
		const n = Math.min(shown, end);
		let line = 0;
		while (line < 2 && n > offset(line + 1, 0) - 1) line++;
		return { line, col: n - offset(line, 0), on: shown < end || Math.floor(frame / 15) % 2 === 0 };
	})();
	return (
		<Scene>
			<Lead frame={frame}>In comments, inputs, and rich editors, on the sites you choose.</Lead>
			<Box frame={frame}>
				<Comment shown={shown} mark={mark} caret={caret} />
			</Box>
		</Scene>
	);
};

const Click = () => {
	const frame = useCurrentFrame();
	const hit = HITS[2]; // utilize
	const p = at(hit.line, hit.col);
	const OPEN = 46;
	const FIXED = 100;
	const press1 = tween(frame, 36, 6) - tween(frame, 44, 6);
	const press2 = tween(frame, 86, 6) - tween(frame, 94, 6);
	const done = frame >= FIXED;
	const card = { x: p.x - 20, y: p.y + LH + 8 };
	const cx = interpolate(frame, [12, 34, 60, 84], [1200, p.x + 60, p.x + 60, card.x + 80], {
		...clamp,
		easing: ease
	});
	const cy = interpolate(frame, [12, 34, 60, 84], [-40, p.y + 26, p.y + 26, card.y + 142], {
		...clamp,
		easing: ease
	});
	return (
		<Scene>
			<Lead frame={frame}>Click a mark for the card: the fix, and what to do about it.</Lead>
			<Box frame={frame}>
				<Comment
					swap={done ? { utilize: 'use' } : {}}
					flash={done ? interpolate(frame, [FIXED, FIXED + 30], [1, 0], clamp) : 0}
				>
					<Card
						{...card}
						sev="suggestion"
						check="Demo.Wordy"
						message="Use 'use' instead of 'utilize'."
						fixes={['use']}
						tools={['Dismiss', 'Turn off Demo.Wordy']}
						focus={frame > 84 ? 0 : -1}
						press={press2}
						style={{
							opacity:
								tween(frame, OPEN, 8) * interpolate(frame, [FIXED, FIXED + 10], [1, 0], clamp),
							transform: `translateY(${(1 - tween(frame, OPEN, 8)) * 10}px)`
						}}
					/>
					<Cursor
						x={cx}
						y={cy}
						press={press1 + press2}
						opacity={
							tween(frame, 10, 8) * interpolate(frame, [FIXED + 6, FIXED + 18], [1, 0], clamp)
						}
					/>
				</Comment>
			</Box>
		</Scene>
	);
};

const Keyboard = () => {
	const frame = useCurrentFrame();
	const hit = HITS[1]; // enviroment
	const p = at(hit.line, hit.col);
	const OPEN = 40;
	const FIXED = 96;
	const alt = tween(frame, 26, 5) - tween(frame, 44, 5);
	const enterDown = tween(frame, 30, 5) - tween(frame, 44, 5);
	const enter2 = tween(frame, 84, 5) - tween(frame, 96, 5);
	const done = frame >= FIXED;
	return (
		<Scene>
			<Lead frame={frame}>
				<span style={{ color: C.fg }}>Alt+Enter</span> opens the card at the cursor;{' '}
				<span style={{ color: C.fg }}>Enter</span> takes the first fix.
			</Lead>
			<Box frame={frame}>
				<Comment
					swap={done ? { enviroment: 'environment' } : {}}
					flash={done ? interpolate(frame, [FIXED, FIXED + 30], [1, 0], clamp) : 0}
					caret={{
						line: 1,
						col: done ? 11 : 4,
						on: frame < 24 || frame > FIXED ? Math.floor(frame / 15) % 2 === 0 : true
					}}
				>
					<Card
						x={p.x + 40}
						y={p.y + LH + 8}
						sev="error"
						check="Vale.Spelling"
						message="Did you really mean 'enviroment'?"
						fixes={['environment', 'environments', 'environmental']}
						tools={['Dismiss', 'Add “enviroment” to vocabulary', 'Turn off Vale.Spelling']}
						focus={0}
						press={enter2}
						style={{
							opacity:
								tween(frame, OPEN, 8) * interpolate(frame, [FIXED, FIXED + 10], [1, 0], clamp)
						}}
					/>
					<div
						style={{
							position: 'absolute',
							right: 0,
							top: LH * 2 + 30,
							display: 'flex',
							gap: 14,
							alignItems: 'center',
							opacity:
								tween(frame, 18, 8) * interpolate(frame, [FIXED + 20, FIXED + 30], [1, 0], clamp)
						}}
					>
						{frame < 70 ? (
							<>
								<Key label="Alt" down={alt} />
								<span style={{ font: `30px ${SANS}`, color: C.muted }}>+</span>
								<Key label="Enter" down={enterDown} />
							</>
						) : (
							<Key label="Enter" down={enter2} />
						)}
					</div>
				</Comment>
			</Box>
		</Scene>
	);
};

const INI: [string, string][] = [
	['StylesPath', ' = styles'],
	['MinAlertLevel', ' = suggestion'],
	['Packages', ' = Microsoft'],
	['', ''],
	['[*]', ''],
	['BasedOnStyles', ' = Vale, Microsoft, ']
];

const Badge = ({ children, lime = false }: { children: ReactNode; lime?: boolean }) => (
	<span
		style={{
			padding: '4px 14px',
			borderRadius: 999,
			border: `2px solid ${lime ? C.lime : C.border}`,
			font: `22px ${SANS}`,
			color: lime ? C.lime : C.muted
		}}
	>
		{children}
	</span>
);

const Style = () => {
	const frame = useCurrentFrame();
	const UPLOAD = 66; // the frame the archive is added
	const press = tween(frame, 56, 6) - tween(frame, 64, 6);
	const added = frame >= UPLOAD;
	const row: CSSProperties = {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: '18px 0',
		borderBottom: `2px solid ${C.border}`,
		font: `30px ${MONO}`,
		color: C.fg
	};
	return (
		<Scene>
			<Lead frame={frame}>
				Upload your house style as a .zip. One configuration, every site you turn on.
			</Lead>
			<div style={{ display: 'flex', gap: 60, marginTop: 40, alignItems: 'flex-start' }}>
				<Panel title="Options · .vale.ini" style={{ ...enter(frame, 10, 22), flex: 1 }}>
					<div style={{ font: `32px/1.7 ${MONO}` }}>
						{INI.map(([k, v], i) => (
							<div key={i} style={enter(frame, 16 + i * 3, 12, 8)}>
								<span style={{ color: k.startsWith('[') ? C.amber : C.sky }}>{k || ' '}</span>
								<Muted>{v}</Muted>
								{i === INI.length - 1 ? (
									<span style={{ color: C.lime, opacity: tween(frame, UPLOAD + 4, 10) }}>Acme</span>
								) : null}
							</div>
						))}
					</div>
				</Panel>
				<div
					style={{
						...enter(frame, 24, 22),
						width: 620,
						padding: '24px 34px 34px',
						background: C.card,
						border: `2px solid ${C.border}`,
						borderRadius: 22,
						boxShadow: '0 40px 80px rgba(0,0,0,0.35)',
						position: 'relative'
					}}
				>
					<div style={{ font: `600 30px ${SANS}`, color: C.fg, paddingBottom: 8 }}>Packages</div>
					<div style={row}>
						Microsoft <Badge>library</Badge>
					</div>
					<div
						style={{
							...row,
							opacity: tween(frame, UPLOAD, 10),
							background: `rgba(144,212,84,${added ? interpolate(frame, [UPLOAD, UPLOAD + 30], [0.18, 0], clamp) : 0})`
						}}
					>
						Acme <Badge lime>uploaded</Badge>
					</div>
					<div style={{ display: 'flex', gap: 16, marginTop: 26, alignItems: 'center' }}>
						<span
							style={{
								flex: 1,
								padding: '12px 18px',
								border: `2px dashed ${C.border}`,
								borderRadius: 12,
								font: `26px ${MONO}`,
								color: frame > 30 && !added ? C.fg : C.muted
							}}
						>
							{frame > 30 && !added ? 'Acme.zip' : 'Choose a .zip'}
						</span>
						<span style={button(press > 0.2 ? 1 : 0, press)}>Upload archive</span>
					</div>
					<Cursor
						x={interpolate(frame, [26, 50], [700, 470], { ...clamp, easing: ease })}
						y={interpolate(frame, [26, 50], [-60, 268], { ...clamp, easing: ease })}
						press={press}
						opacity={
							tween(frame, 24, 8) * interpolate(frame, [UPLOAD + 8, UPLOAD + 18], [1, 0], clamp)
						}
					/>
				</div>
			</div>
		</Scene>
	);
};

const POINTS = [
	'Vale runs inside the extension.',
	'Your text never leaves the browser.',
	'No account, no analytics, no telemetry.'
];

const Private = () => {
	const frame = useCurrentFrame();
	return (
		<Scene>
			<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
				<div style={{ display: 'grid', gap: 40 }}>
					{POINTS.map((p, i) => (
						<div
							key={p}
							style={{
								...enter(frame, 10 + i * 14),
								font: `600 64px ${SANS}`,
								letterSpacing: -2,
								color: C.fg
							}}
						>
							<span style={{ color: C.lime, marginRight: 28 }}>✔</span>
							{p}
						</div>
					))}
				</div>
			</AbsoluteFill>
		</Scene>
	);
};

const BROWSERS = ['Chrome', 'Edge', 'Firefox'];

const Outro = () => {
	const frame = useCurrentFrame();
	return (
		<Scene>
			<AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
				<div style={{ ...enter(frame, 0), display: 'flex', alignItems: 'center', gap: 28 }}>
					<Mark size={110} />
					<Wordmark height={98} />
				</div>
				<div
					style={{
						...enter(frame, 10),
						marginTop: 36,
						font: `600 72px ${SANS}`,
						letterSpacing: -3,
						color: C.fg
					}}
				>
					Your style guide, as you type.
				</div>
				<div style={{ display: 'flex', gap: 20, marginTop: 50 }}>
					{BROWSERS.map((b, i) => (
						<div
							key={b}
							style={{
								...enter(frame, 22 + i * 5, 14, 14),
								padding: '18px 36px',
								background: C.card,
								border: `2px solid ${C.border}`,
								borderRadius: 16,
								font: `500 36px ${SANS}`,
								color: C.fg
							}}
						>
							{b}
						</div>
					))}
				</div>
				<div style={{ ...enter(frame, 44), marginTop: 50, font: `34px ${MONO}`, color: C.lime }}>
					vale.sh
				</div>
			</AbsoluteFill>
		</Scene>
	);
};

export const EXTENSION_SCENES: SceneDef[] = [
	{ Shot: Intro, seconds: 3 },
	{
		Shot: AsYouType,
		seconds: 6.5,
		eyebrow: '01 · As you type',
		claim: ['Marks as you type.', 'No wait.']
	},
	{ Shot: Click, seconds: 5, eyebrow: '02 · Cards', claim: ['The fix is', 'one click away.'] },
	{
		Shot: Keyboard,
		seconds: 5,
		eyebrow: '03 · Keyboard',
		claim: ['Or keep your hands', 'on the keys.']
	},
	{
		Shot: Style,
		seconds: 4.5,
		eyebrow: '04 · Your style',
		claim: ['Your own style,', 'on every site.']
	},
	{
		Shot: Private,
		seconds: 3.5,
		eyebrow: '05 · Private',
		claim: ['Nothing leaves', 'your browser.']
	},
	{ Shot: Outro, seconds: 4.5 }
];

const frames = (scene: SceneDef) => Math.round(scene.seconds * FPS) + (scene.claim ? CLAIM : 0);

export const EXTENSION_TOTAL = EXTENSION_SCENES.reduce((n, scene) => n + frames(scene), 0);

export const ExtensionPromo = () => (
	<AbsoluteFill>
		<Background />
		<Series>
			{EXTENSION_SCENES.map((scene) => (
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

/** The video's thumbnail: the claim, large, beside a card open on a mark. */
export const ExtensionThumb = () => {
	const hit = HITS[2]; // utilize
	const p = at(hit.line, hit.col);
	return (
		<AbsoluteFill>
			<Background />
			<AbsoluteFill
				style={{ padding: '110px 100px', flexDirection: 'row', gap: 50, alignItems: 'center' }}
			>
				<div style={{ width: 640, flexShrink: 0 }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
						<Mark size={92} />
						<Wordmark height={82} />
					</div>
					<div
						style={{
							marginTop: 48,
							font: `700 108px/1.02 ${SANS}`,
							letterSpacing: -5,
							color: C.fg
						}}
					>
						Your style guide,
						<br />
						<span style={{ color: C.lime }}>as you type.</span>
					</div>
					<div style={{ marginTop: 40, font: `500 38px ${SANS}`, color: C.muted }}>
						Chrome · Edge · Firefox
					</div>
				</div>
				<div
					style={{
						width: 1200,
						flexShrink: 0,
						transform: 'scale(0.84)',
						transformOrigin: 'left center'
					}}
				>
					<Panel title="Add a comment">
						<Comment>
							<Card
								x={p.x - 20}
								y={p.y + LH + 8}
								sev="suggestion"
								check="Demo.Wordy"
								message="Use 'use' instead of 'utilize'."
								fixes={['use']}
								tools={['Dismiss', 'Turn off Demo.Wordy']}
								focus={0}
							/>
						</Comment>
					</Panel>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
