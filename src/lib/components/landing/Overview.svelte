<script lang="ts">
	import Check from 'lucide-svelte/icons/check';
	import Copy from 'lucide-svelte/icons/copy';
	import { Button } from '$lib/components/ui/button';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import type { Stats } from '$lib/types/stats';
	import { assistants } from '$lib/assistants';
	import FlowStages from './FlowStages.svelte';
	import { fields } from '$lib/data/fields';

	let {
		stats,
		rules,
		adopters
	}: {
		stats: Stats;
		/** Each field's rule, highlighted at build time, by field id. */
		rules: Record<string, string>;
		/** How many teams the adopter list holds. */
		adopters: number;
	} = $props();

	/*
		The flow figure, once per kind of writing. Each walks a real guideline
		to the alert a real rule raises, and links the guide for that kind of
		writing. The entries live in $lib/data/fields, which the guides under
		/for read too. The visitor picks the one that is theirs.
	*/
	const kinds = fields;
	type Kind = string;
	let kind = $state<Kind>('technical');
	const current = $derived(kinds.find((k) => k.id === kind) ?? kinds[0]);
	// The caption names the first three packages the guide recommends.
	const starters = $derived(current.packages.slice(0, 3));

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
		{
			value: compact.format(stats.lifetime.value),
			label: 'downloads',
			href: 'https://github.com/vale-cli/vale/releases'
		},
		{ value: String(adopters), label: 'teams listed', href: '/adopters' }
	]);

	// Arrow keys move between the tabs, as the tab pattern expects: only the
	// selected one is in the tab order.
	function onTabKey(event: KeyboardEvent) {
		const i = kinds.findIndex((k) => k.id === kind);
		const last = kinds.length - 1;
		const next =
			event.key === 'ArrowRight'
				? (i + 1) % kinds.length
				: event.key === 'ArrowLeft'
					? (i + last) % kinds.length
					: event.key === 'Home'
						? 0
						: event.key === 'End'
							? last
							: -1;
		if (next < 0) return;
		event.preventDefault();
		kind = kinds[next].id;
		document.getElementById(`kind-${kind}`)?.focus();
	}

	const install = 'brew install vale';
	let copied = $state(false);
	async function copyInstall() {
		try {
			await navigator.clipboard.writeText(install);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// No clipboard permission: the command is still on the page to select.
		}
	}
</script>

<section class="hero-shell">
	<div class="landing-wrap hero-grid">
		<div class="hero-copy">
			<a class="eyebrow" href="https://github.com/vale-cli/vale"
				>OPEN SOURCE · MIT <span aria-hidden="true">↗</span></a
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
					<Button size="lg" href="#how-it-works"
						>Get started <ArrowRight data-icon="inline-end" /></Button
					>
					<Button size="lg" variant="outline" href="https://docs.vale.sh">Read the docs</Button>
				</div>
				<!-- The one command most visitors can run as it stands; the note
				     beside it covers everyone else. -->
				<button
					type="button"
					class="install"
					onclick={copyInstall}
					aria-label="Copy the install command: {install}"
				>
					<span aria-hidden="true" class="prompt">$</span>
					<code>{install}</code>
					{#if copied}<Check aria-hidden="true" />{:else}<Copy aria-hidden="true" />{/if}
					<span class="sr-only" aria-live="polite">{copied ? 'Copied' : ''}</span>
				</button>
				<p class="hero-note">
					macOS, Windows & Linux · Runs offline ·
					<a href="https://docs.vale.sh/topics/installation">Other installs</a>
				</p>
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
						onkeydown={onTabKey}
					>
						<k.icon aria-hidden="true" />
						{k.label}
					</button>
				{/each}
			</div>

			<div id="flow-stages" role="tabpanel" aria-labelledby={`kind-${kind}`}>
				<FlowStages demo={current.demo} rule={rules[current.id]} />
			</div>

			<figcaption>
				Encode your guidelines in YAML, or start with a published style:
				{#each starters as name, i (name)}{#if i > 0}{i === starters.length - 1
							? ', or '
							: ', '}{/if}<a href="/explorer/{name}">{name}</a>{/each}.
				<a class="guide-link" href="/for/{current.id}"
					>{current.title.replace('Vale for ', 'The guide to ')} →</a
				>
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
			>{/each}<a href="/agents">Agent tools →</a>
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
	.install {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		margin-top: 20px;
		padding: 8px 12px;
		border: 1px solid hsl(var(--border));
		border-radius: 8px;
		background: hsl(var(--card));
		font:
			13px/1.5 ui-monospace,
			monospace;
		color: hsl(var(--foreground));
		cursor: copy;
		transition: border-color 0.2s;
	}
	.install:hover {
		border-color: hsl(var(--primary) / 0.5);
	}
	.install:focus-visible {
		outline: 2px solid hsl(var(--ring));
		outline-offset: 3px;
	}
	.install .prompt {
		color: hsl(var(--primary));
	}
	.install :global(svg) {
		width: 14px;
		height: 14px;
		color: hsl(var(--muted-foreground));
	}
	.hero-note {
		margin-top: 12px;
		font:
			11px/1.8 ui-monospace,
			monospace;
		color: hsl(var(--muted-foreground));
	}
	.hero-note a {
		text-decoration: underline;
		text-underline-offset: 3px;
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
		margin-top: 48px;
		border: 1px solid hsl(var(--border));
		border-radius: 12px;
		background: hsl(var(--card));
		overflow: hidden;
		box-shadow: var(--shadow-sm);
	}
	/* Five kinds don't fit a phone's width: the row scrolls instead of wrapping. */
	.kinds {
		display: flex;
		gap: 4px;
		overflow-x: auto;
		scrollbar-width: none;
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
		white-space: nowrap;
		flex-shrink: 0;
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
	/* The way on: set apart from the sentence, in the accent. */
	figcaption .guide-link {
		margin-left: 6px;
		font-weight: 500;
		white-space: nowrap;
		text-decoration-color: hsl(var(--primary));
		text-decoration-thickness: 2px;
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
		.install {
			grid-column: 1 / -1;
			justify-self: start;
			margin-top: 0;
		}
		.hero-note {
			grid-column: 1 / -1;
			margin-top: -8px;
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
		/* One column: the description comes before the figures, so a first
		   visit reads what Vale is before how many people use it. */
		.figures {
			grid-column: 1;
			grid-row: 4;
			flex-direction: row;
			align-items: flex-start;
			gap: 12px 28px;
			margin-top: 8px;
			text-align: left;
		}
		.hero-description {
			grid-row: 3;
			display: block;
		}
		.actions {
			margin-top: 24px;
		}
		.install {
			margin-top: 16px;
		}
		.hero-note {
			margin-top: 12px;
		}
		.intro {
			font-size: 16px;
		}
		.flow {
			margin-top: 32px;
		}
	}
	@media (max-width: 400px) {
		.actions {
			flex-direction: column;
			align-items: stretch;
		}
	}
</style>
