<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import type { Stats } from '$lib/types/stats';
	import { assistants } from '$lib/assistants';
	import adopters from '$lib/data/adopters.json';
	import FileCode from 'lucide-svelte/icons/file-code';
	import Feather from 'lucide-svelte/icons/feather';
	import FlaskConical from 'lucide-svelte/icons/flask-conical';

	type Kind = 'technical' | 'creative' | 'scientific';
	let { stats, rules }: { stats: Stats; rules: Record<Kind, string> } = $props();

	/*
		The flow figure, once per kind of writing. Each walks a real guideline
		to the alert a real rule raises: Microsoft-style terminology for docs,
		Elmore Leonard's fourth rule from the Fiction package, and the unit
		convention from Journals. The visitor picks the one that is theirs.
	*/
	const kinds: {
		id: Kind;
		label: string;
		icon: typeof FileCode;
		kicker: string;
		file: string;
		doc: string;
		heading: string;
		before: string;
		match: string;
		after: string;
		sev: 'error' | 'warning';
		msg: string;
		rule: string;
		starters: { name: string; href: string }[];
	}[] = [
		{
			id: 'technical',
			label: 'Technical',
			icon: FileCode,
			kicker: 'Writing guide · Terminology',
			file: 'styles/Docs/Terms.yml',
			doc: 'docs/install.md',
			heading: 'Installation',
			before: '',
			match: 'Vale cli',
			after: ' runs on macOS, Windows, and Linux.',
			sev: 'error',
			msg: "Use 'Vale CLI' instead of 'Vale cli'.",
			rule: 'Docs.Terms',
			starters: [
				{ name: 'Microsoft', href: '/explorer/Microsoft' },
				{ name: 'Google', href: '/explorer/Google' },
				{ name: 'Red Hat', href: '/explorer/RedHat' }
			]
		},
		{
			id: 'creative',
			label: 'Creative',
			icon: Feather,
			kicker: 'Elmore Leonard · Rule 4',
			file: 'styles/Leonard/Adverb.yml',
			doc: 'manuscript/chapter-01.md',
			heading: 'One',
			before: '“No,” he ',
			match: 'said gravely',
			after: '. She did not look up.',
			sev: 'warning',
			msg: "Drop the adverb on the tag: 'said gravely'.",
			rule: 'Leonard.Adverb',
			starters: [
				{ name: 'Fiction', href: '/explorer/Fiction' },
				{ name: 'proselint', href: '/explorer/proselint' },
				{ name: 'write-good', href: '/explorer/write-good' }
			]
		},
		{
			id: 'scientific',
			label: 'Scientific',
			icon: FlaskConical,
			kicker: 'Author guidelines · Units',
			file: 'styles/Journals/UnitSpacing.yml',
			doc: 'paper/results.md',
			heading: 'Results',
			before: 'Blood pressure fell ',
			match: '12mmHg',
			after: ' after 20 min (p = 0.03).',
			sev: 'warning',
			msg: "Put a space between the number and the unit: '12mmHg'.",
			rule: 'Journals.UnitSpacing',
			starters: [
				{ name: 'Journals', href: '/explorer/Journals' },
				{ name: 'Readability', href: '/explorer/Readability' }
			]
		}
	];
	let kind = $state<Kind>('technical');
	const current = $derived(kinds.find((k) => k.id === kind) ?? kinds[0]);

	// A link can open the figure on its own kind: /?for=creative.
	$effect(() => {
		try {
			const want = new URLSearchParams(location.search).get('for');
			if (kinds.some((k) => k.id === want)) kind = want as Kind;
		} catch {
			// No location to read: leave the default.
		}
	});

	const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
	// Three figures beside the headline. Each is a fact with a page behind it.
	const figures = $derived([
		{
			value: compact.format(stats.stars),
			label: 'GitHub stars',
			href: 'https://github.com/vale-cli/vale'
		},
		{ value: compact.format(stats.lifetime.value), label: 'downloads', href: '/library' },
		{ value: String(adopters.length), label: 'teams listed', href: '/adopters' }
	]);
	const starLabel = $derived(
		new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(
			stats.stars
		)
	);
</script>

<section class="hero-shell">
	<div class="landing-wrap hero-grid">
		<div class="hero-copy">
			<a class="eyebrow" href="https://github.com/vale-cli/vale"
				>OPEN SOURCE · MIT · {starLabel} STARS <span aria-hidden="true">↗</span></a
			>
			<h1>Your style.<br /><span>Our editor.</span></h1>
			<dl class="figures">
				{#each figures as f (f.label)}
					<div>
						<dt>{f.label}</dt>
						<dd><a href={f.href}>{f.value}</a></dd>
					</div>
				{/each}
			</dl>
			<div class="hero-description">
				<p class="intro">
					Vale brings code-like linting to prose. Turn a team’s style guide, a house voice, or a
					journal’s author guidelines into checks that run in your editor and alongside your code.
				</p>
				<div class="actions">
					<Button size="lg" href="https://docs.vale.sh/topics/quickstart"
						>Get started <ArrowRight data-icon="inline-end" /></Button
					>
					<Button size="lg" variant="outline" href="#how-it-works">See how it works</Button>
				</div>
				<p class="hero-note">macOS, Windows & Linux · Runs offline</p>
			</div>
		</div>

		<figure
			class="flow"
			aria-label="How a guideline becomes a rule, and a rule becomes an alert: a line from a writing guide, the YAML rule that encodes it, and the alert it raises in a file"
		>
			<!--
				Which kind of writing the figure walks through. A tab list, so
				the choice reads as a view of one thing and not three features.
			-->
			<div class="kinds" role="tablist" aria-label="Kind of writing">
				{#each kinds as k (k.id)}
					<button
						type="button"
						role="tab"
						id={`kind-${k.id}`}
						aria-selected={k.id === kind}
						aria-controls="flow-stages"
						tabindex={k.id === kind ? 0 : -1}
						onclick={() => (kind = k.id)}
					>
						<k.icon aria-hidden="true" />
						{k.label}
					</button>
				{/each}
			</div>

			<div class="stages" id="flow-stages" role="tabpanel" aria-labelledby={`kind-${kind}`}>
				<div class="stage">
					<div class="stage-label"><span class="n">01</span>Your guideline</div>
					<div class="stage-body">
						<p class="guide-kicker">{current.kicker}</p>
						{#if kind === 'technical'}
							<p class="guide-text">
								The product is <strong>Vale CLI</strong>. Don’t write <s>Vale cli</s> or
								<s>vale-cli</s>.
							</p>
						{:else if kind === 'creative'}
							<p class="guide-text">
								Never use an adverb to modify the verb <strong>“said”</strong>. Not
								<s>he admonished gravely</s>.
							</p>
						{:else}
							<p class="guide-text">
								A space between a number and its unit: <strong>12 mmHg</strong>, not
								<s>12mmHg</s>.
							</p>
						{/if}
					</div>
				</div>

				<div class="stage">
					<div class="stage-label"><span class="n">02</span>A rule you own</div>
					<div class="stage-body">
						<p class="file">{current.file}</p>
						{#key kind}
							<CodeBlock html={rules[kind]} bare />
						{/key}
					</div>
				</div>

				<div class="stage">
					<div class="stage-label"><span class="n">03</span>Feedback where you write</div>
					<div class="stage-body doc">
						<p class="file">{current.doc}</p>
						<ol class="lines">
							<li>
								<span class="src"
									><span class="syntax">{kind === 'scientific' ? '##' : '#'}</span>
									{current.heading}</span
								>
							</li>
							<li><span class="src"></span></li>
							<li>
								<span class="src"
									>{current.before}<mark class={current.sev}>{current.match}</mark
									>{current.after}</span
								>
							</li>
						</ol>
						<div class="diagnostic">
							<span class="sev {current.sev}">{current.sev}</span>
							<span>{current.msg}</span>
							<span class="rule-name">{current.rule}</span>
						</div>
					</div>
				</div>
			</div>

			<figcaption>
				Encode your guidelines in YAML, or start with a published style:
				{#each current.starters as st, i (st.name)}{#if i > 0}{i === current.starters.length - 1
							? ', or '
							: ', '}{/if}<a href={st.href}>{st.name}</a>{/each}. Browse them all in the
				<a href="/explorer">Explorer</a>.
			</figcaption>
		</figure>
	</div>
</section>

<div class="agent-strip landing-wrap">
	<div>
		<span>Setting up with an agent?</span>{#each assistants as assistant}<a
				href={assistant.href}
				target="_blank"
				rel="noreferrer">{assistant.label} ↗</a
			>{/each}<a href="/skills">Agent skills →</a>
	</div>
	<p>
		Thanks to <a href="https://claude.com/contact-sales/claude-for-oss">Claude for Open Source</a>.
	</p>
</div>

<style>
	.landing-wrap {
		max-width: 1152px;
		margin-inline: auto;
		padding-inline: 32px;
	}
	.hero-shell {
		position: relative;
		border-bottom: 1px solid hsl(var(--border));
	}
	/*
		A still backdrop: a fine dot grid that fades out toward the edges, and a
		faint wash of the accent in the corner the headline sits under. Both
		are pseudo-elements, so there is nothing in the DOM and nothing moves.
	*/
	.hero-shell::before,
	.hero-shell::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.hero-shell::before {
		background-image: radial-gradient(hsl(var(--foreground) / 0.08) 1px, transparent 1.2px);
		background-size: 24px 24px;
		mask-image: radial-gradient(ellipse 70% 80% at 30% 40%, #000 20%, transparent 75%);
	}
	.hero-shell::after {
		background: radial-gradient(
			ellipse 50% 60% at 12% 18%,
			hsl(var(--primary) / 0.08),
			transparent 70%
		);
	}
	.hero-grid {
		position: relative;
		padding-block: 64px 48px;
	}
	.hero-copy {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr);
		gap: 20px 64px;
		align-items: start;
	}
	.eyebrow {
		grid-column: 1 / -1;
		justify-self: start;
		font:
			500 11px/1.6 ui-monospace,
			monospace;
		letter-spacing: 0.08em;
		color: hsl(var(--muted-foreground));
	}
	h1 {
		font-size: clamp(3.5rem, 7.5vw, 6rem);
		font-weight: 500;
		line-height: 1;
		letter-spacing: -0.065em;
	}
	h1 span {
		color: hsl(var(--muted-foreground));
	}
	/*
		Under the headline on a wide screen, where the taller right column
		would otherwise leave a gap; beside it on a narrower one, where the
		headline alone would leave the right empty. Labels are set like the
		eyebrow; the numbers are the only thing with weight.
	*/
	.figures {
		grid-column: 1;
		grid-row: 3;
		display: flex;
		flex-wrap: wrap;
		gap: 12px 36px;
		margin: 8px 0 0;
	}
	.figures div {
		display: flex;
		flex-direction: column-reverse;
		gap: 2px;
	}
	.figures dt {
		font:
			500 11px/1.6 ui-monospace,
			monospace;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: hsl(var(--muted-foreground));
	}
	.figures dd {
		margin: 0;
		font-size: 28px;
		font-weight: 600;
		letter-spacing: -0.02em;
		font-variant-numeric: tabular-nums;
		line-height: 1.1;
	}
	.figures dd a {
		color: hsl(var(--foreground));
	}
	/*
		Pinned, not auto-placed: with the figures claiming column one, the
		description would otherwise land in the row beside them and leave the
		top right empty. It spans both rows and centers on the headline and
		figures together.
	*/
	.hero-description {
		grid-column: 2;
		grid-row: 2 / span 2;
		align-self: center;
		min-width: 0;
	}
	.intro {
		max-width: 44ch;
		font-size: 18px;
		line-height: 1.75;
		color: hsl(var(--foreground));
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 24px;
	}
	.hero-note {
		margin-top: 16px;
		font:
			11px/1.8 ui-monospace,
			monospace;
		color: hsl(var(--muted-foreground));
	}
	a:hover {
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	a:focus-visible {
		outline: 2px solid hsl(var(--ring));
		outline-offset: 4px;
	}
	.flow {
		--error: hsl(var(--destructive));
		--warning: #b45309;
		margin-top: 48px;
		border: 1px solid hsl(var(--border));
		border-radius: 12px;
		background: hsl(var(--card));
		overflow: hidden;
		box-shadow: var(--shadow-sm);
	}
	:global(html.dark) .flow {
		--warning: #fbbf24;
	}
	.kinds {
		display: flex;
		gap: 4px;
		padding: 8px 12px;
		border-bottom: 1px solid hsl(var(--border));
		background: hsl(var(--muted) / 0.5);
	}
	.kinds button {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 6px 12px;
		border: 1px solid transparent;
		border-radius: 8px;
		font-size: 12px;
		font-weight: 500;
		color: hsl(var(--muted-foreground));
		background: none;
		cursor: pointer;
	}
	.kinds button :global(svg) {
		width: 14px;
		height: 14px;
		opacity: 0.7;
	}
	.kinds button[aria-selected='true'] :global(svg) {
		opacity: 1;
		color: hsl(var(--primary));
	}
	.kinds button:hover {
		color: hsl(var(--foreground));
	}
	.kinds button[aria-selected='true'] {
		border-color: hsl(var(--border));
		background: hsl(var(--card));
		color: hsl(var(--foreground));
		box-shadow: var(--shadow-sm);
	}
	.kinds button:focus-visible {
		outline: 2px solid hsl(var(--ring));
		outline-offset: 2px;
	}
	.stages {
		display: grid;
		grid-template-columns: minmax(0, 0.85fr) minmax(0, 1fr) minmax(0, 1.1fr);
	}
	.stage {
		min-width: 0;
	}
	.stage + .stage {
		border-left: 1px solid hsl(var(--border));
	}
	.stage-label {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 16px 20px;
		border-bottom: 1px solid hsl(var(--border));
		font-size: 11px;
		font-weight: 500;
		background: hsl(var(--muted) / 0.5);
	}
	.n {
		font:
			10px ui-monospace,
			monospace;
		color: hsl(var(--muted-foreground));
	}
	.stage-body {
		padding: 20px;
		min-width: 0;
	}
	.file {
		margin-bottom: 16px;
		font:
			10px/1.6 ui-monospace,
			monospace;
		color: hsl(var(--muted-foreground));
		overflow-wrap: anywhere;
	}
	.guide-kicker {
		font:
			10px/1.6 ui-monospace,
			monospace;
		color: hsl(var(--muted-foreground));
	}
	.guide-text {
		margin-top: 20px;
		padding-left: 14px;
		border-left: 2px solid hsl(var(--primary));
		font:
			19px/1.65 Georgia,
			serif;
	}
	.guide-text strong {
		font-weight: 700;
	}
	.guide-text s {
		color: hsl(var(--muted-foreground));
		text-decoration-color: var(--error);
	}
	.doc {
		font:
			12px/1.8 ui-monospace,
			monospace;
	}
	.lines {
		list-style: none;
		margin: 0;
		padding: 0;
		counter-reset: line;
	}
	.lines li {
		display: grid;
		grid-template-columns: 12px minmax(0, 1fr);
		gap: 10px;
	}
	.lines li::before {
		counter-increment: line;
		content: counter(line);
		text-align: right;
		font-size: 10px;
		color: hsl(var(--muted-foreground));
	}
	.src {
		min-width: 0;
		min-height: 1.8em;
		overflow-wrap: anywhere;
	}
	.syntax {
		color: hsl(var(--muted-foreground));
	}
	mark {
		padding: 0 2px;
		border-bottom: 2px solid var(--error);
		background: color-mix(in srgb, var(--error) 10%, transparent);
		color: inherit;
	}
	mark.warning {
		border-bottom-color: var(--warning);
		background: color-mix(in srgb, var(--warning) 12%, transparent);
	}
	.diagnostic {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 8px;
		margin-top: 18px;
		padding-top: 12px;
		border-top: 1px solid hsl(var(--border));
		font:
			12px/1.6 system-ui,
			sans-serif;
	}
	.sev {
		color: var(--error);
		font-weight: 600;
	}
	.sev.warning {
		color: var(--warning);
	}
	.rule-name {
		width: 100%;
		font:
			10px/1.6 ui-monospace,
			monospace;
		color: hsl(var(--muted-foreground));
	}
	figcaption {
		padding: 14px 20px;
		border-top: 1px solid hsl(var(--border));
		font-size: 12px;
		line-height: 1.7;
		color: hsl(var(--muted-foreground));
	}
	figcaption a {
		color: hsl(var(--foreground));
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.agent-strip {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding-block: 20px;
		font-size: 12px;
		color: hsl(var(--muted-foreground));
	}
	.agent-strip > div {
		display: flex;
		flex-wrap: wrap;
		gap: 12px 22px;
	}
	.agent-strip a {
		color: hsl(var(--foreground));
		text-decoration: underline;
		text-underline-offset: 4px;
		text-decoration-color: hsl(var(--border));
	}
	.agent-strip > p {
		font-size: 10px;
	}
	@media (max-width: 1000px) {
		/* Two columns this narrow leave a hole under the headline, and one
		   column leaves the right half empty. So the headline takes the full
		   width, and under it the paragraph and the buttons share a row. */
		.hero-copy {
			grid-template-columns: minmax(0, 1fr) auto;
			gap: 24px 40px;
		}
		.figures {
			grid-column: 2;
			grid-row: 2;
			flex-direction: column;
			align-self: end;
			align-items: flex-end;
			gap: 14px;
			margin: 0;
			text-align: right;
		}
		.hero-description {
			grid-column: 1 / -1;
			grid-row: 3;
			align-self: start;
			display: grid;
			grid-template-columns: minmax(0, 1fr) auto;
			gap: 20px 40px;
			align-items: end;
			padding-top: 0;
		}
		.actions {
			margin-top: 0;
		}
		.hero-note {
			grid-column: 1 / -1;
			margin-top: 0;
		}
		.stages {
			grid-template-columns: 1fr 1fr;
		}
		.stage:first-child {
			grid-column: 1 / -1;
			border-bottom: 1px solid hsl(var(--border));
		}
		.stage:nth-child(2) {
			border-left: 0;
		}
		.guide-text {
			margin-top: 12px;
		}
	}
	@media (max-width: 700px) {
		.landing-wrap {
			padding-inline: 24px;
		}
		.hero-grid {
			padding-block: 40px 32px;
		}
		h1 {
			font-size: clamp(3.5rem, 12vw, 5rem);
		}
		.hero-copy {
			grid-template-columns: 1fr;
		}
		.figures {
			grid-column: 1;
			grid-row: 3;
			flex-direction: row;
			align-items: flex-start;
			gap: 12px 28px;
			text-align: left;
		}
		.hero-description {
			grid-row: 4;
			display: block;
		}
		.actions {
			margin-top: 24px;
		}
		.hero-note {
			margin-top: 16px;
		}
		.intro {
			font-size: 16px;
		}
		.flow {
			margin-top: 32px;
		}
		.stages {
			grid-template-columns: 1fr;
		}
		.stage + .stage {
			border-left: 0;
		}
		.stage:nth-child(3) {
			border-top: 1px solid hsl(var(--border));
		}
	}
	@media (max-width: 400px) {
		.actions {
			flex-direction: column;
			align-items: stretch;
		}
	}
</style>
