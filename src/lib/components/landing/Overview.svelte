<script lang="ts">
	import Check from 'lucide-svelte/icons/check';
	import Copy from 'lucide-svelte/icons/copy';
	import { Button } from '$lib/components/ui/button';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import type { Stats } from '$lib/types/stats';
	import { assistants } from '$lib/assistants';
	import { fields } from '$lib/data/fields';

	let {
		stats,
		adopters
	}: {
		stats: Stats;
		/** How many teams the adopter list holds. */
		adopters: number;
	} = $props();

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

	/*
		The install command for the visitor's OS, from the installation docs:
		Homebrew on macOS, Chocolatey on Windows, and Snap on Linux, which works
		on any distribution. The page is prerendered, so it ships with Homebrew
		and swaps once the browser says where it's running; a phone, ChromeOS,
		or a browser that won't say keeps the default and the general note.
	*/
	type Os = 'mac' | 'windows' | 'linux';
	const commands: Record<Os, { name: string; prompt: string; command: string }> = {
		mac: { name: 'macOS', prompt: '$', command: 'brew install vale' },
		windows: { name: 'Windows', prompt: '>', command: 'choco install vale' },
		linux: { name: 'Linux', prompt: '$', command: 'sudo snap install vale' }
	};

	let os = $state<Os | undefined>(undefined);
	$effect(() => {
		try {
			// The platform hint where the browser gives one (Chromium does),
			// else the older fields; a phone is checked first, since Android
			// reports Linux.
			const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
			const platform = nav.userAgentData?.platform || `${nav.platform} ${nav.userAgent}`;
			if (/Android|iPhone|iPad|iPod|CrOS|Chrome OS/i.test(platform)) os = undefined;
			else if (/Win/i.test(platform)) os = 'windows';
			else if (/Mac/i.test(platform)) os = 'mac';
			else if (/Linux/i.test(platform)) os = 'linux';
		} catch {
			// Nothing to read: keep the default.
		}
	});

	const current = $derived(commands[os ?? 'mac']);
	let copied = $state(false);
	async function copyInstall() {
		try {
			await navigator.clipboard.writeText(current.command);
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
				<!-- The command for the visitor's OS; the note says which, and
				     links the rest. -->
				<button
					type="button"
					class="install"
					onclick={copyInstall}
					aria-label="Copy the install command: {current.command}"
				>
					<span aria-hidden="true" class="prompt">{current.prompt}</span>
					<code>{current.command}</code>
					{#if copied}<Check aria-hidden="true" />{:else}<Copy aria-hidden="true" />{/if}
					<span class="sr-only" aria-live="polite">{copied ? 'Copied' : ''}</span>
				</button>
				<p class="hero-note">
					{os ? `For ${current.name}` : 'macOS, Windows & Linux'} · Runs offline ·
					<a href="https://docs.vale.sh/topics/installation">Other installs</a>
				</p>
			</div>
		</div>

		<!--
			One card per kind of writing, each opening its guide: the packages,
			a starting config checked against Vale, and the teams who run it.
			The entries live in $lib/data/fields, which the guides read too.
		-->
		<nav class="guides" aria-labelledby="guides-title">
			<p class="guides-title" id="guides-title">Find the guide for what you write</p>
			<ul>
				{#each fields as f (f.id)}
					<li>
						<a href="/for/{f.id}">
							<span class="guide-icon"><f.icon aria-hidden="true" /></span>
							<span class="guide-name">{f.label}</span>
							<span class="guide-summary">{f.summary}</span>
							<span class="guide-more" aria-hidden="true">Read the guide →</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>
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
	/*
		Six cards, three across on a wide screen, two on a tablet, one on a
		phone. Each is a whole link: icon, name, a line on what it covers.
	*/
	.guides {
		margin-top: 48px;
	}
	.guides-title {
		font:
			500 11px/1.6 ui-monospace,
			monospace;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: hsl(var(--muted-foreground));
	}
	.guides ul {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 12px;
		margin: 16px 0 0;
		padding: 0;
		list-style: none;
	}
	.guides a {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		grid-template-rows: auto 1fr auto;
		gap: 4px 14px;
		height: 100%;
		padding: 18px 20px;
		border: 1px solid hsl(var(--border));
		border-radius: 12px;
		background: hsl(var(--card));
		box-shadow: var(--shadow-sm);
		color: hsl(var(--foreground));
		transition: border-color 0.15s;
	}
	.guides a:hover {
		text-decoration: none;
		border-color: hsl(var(--primary) / 0.5);
	}
	.guide-icon {
		grid-row: 1 / -1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: 1px solid hsl(var(--primary) / 0.2);
		border-radius: 9px;
		background: hsl(var(--primary) / 0.08);
		color: hsl(var(--primary));
	}
	.guide-icon :global(svg) {
		width: 17px;
		height: 17px;
	}
	.guide-name {
		font-size: 15px;
		font-weight: 500;
	}
	.guide-summary {
		font-size: 13px;
		line-height: 1.55;
		color: hsl(var(--muted-foreground));
	}
	.guide-more {
		margin-top: 8px;
		font-size: 12px;
		font-weight: 500;
		color: hsl(var(--primary));
	}
	.guides a:hover .guide-more {
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
		.guides ul {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
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
		.guides {
			margin-top: 32px;
		}
		.guides ul {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	@media (max-width: 400px) {
		.actions {
			flex-direction: column;
			align-items: stretch;
		}
	}
</style>
