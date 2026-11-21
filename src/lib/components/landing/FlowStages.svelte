<script lang="ts">
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import type { Field } from '$lib/data/fields';

	/*
		A guideline, the rule that encodes it, and the alert it raises, side by
		side. The home page's hero shows one per tab; each /for guide opens
		with its own. Both read the same entry in $lib/data/fields, so the
		figure on the home page is the figure the guide explains.

		Sized by its container, not the viewport: the hero gives it the full
		width and a guide gives it a column.
	*/
	let {
		demo,
		rule,
		id
	}: {
		demo: Field['demo'];
		/** The rule, highlighted by the page's load function. */
		rule: string;
		id?: string;
	} = $props();
</script>

<div class="wrap">
	<div class="stages" {id}>
		<div class="stage">
			<div class="stage-label"><span class="n">01</span>Your guideline</div>
			<div class="stage-body">
				<p class="guide-kicker">{demo.kicker}</p>
				<p class="guide-text">
					{#each demo.guideline as p, i (i)}{#if p.k === 'good'}<strong>{p.t}</strong
							>{:else if p.k === 'bad'}<s>{p.t}</s>{:else}{p.t}{/if}{/each}
				</p>
			</div>
		</div>

		<div class="stage">
			<div class="stage-label"><span class="n">02</span>A rule you own</div>
			<div class="stage-body">
				<p class="file">{demo.file}</p>
				{#key rule}
					<CodeBlock html={rule} bare />
				{/key}
			</div>
		</div>

		<div class="stage">
			<div class="stage-label"><span class="n">03</span>Feedback where you write</div>
			<div class="stage-body doc">
				<p class="file">{demo.doc}</p>
				<ol class="lines">
					{#each demo.lines as line, i (i)}
						<li>
							<span class="src"
								>{#if line.syntax}<span class="syntax">{line.syntax}</span>{' '}{/if}{line.text ??
									''}{line.before ?? ''}{#if line.match}<mark class={demo.sev}>{line.match}</mark
									>{/if}{line.after ?? ''}</span
							>
						</li>
					{/each}
				</ol>
				<div class="diagnostic">
					<span class="sev {demo.sev}">{demo.sev}</span>
					<span>{demo.msg}</span>
					<span class="rule-name">{demo.rule_name}</span>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.wrap {
		--error: hsl(var(--destructive));
		--warning: #b45309;
		--suggestion: #0369a1;
		container-type: inline-size;
	}
	:global(html.dark) .wrap {
		--warning: #fbbf24;
		--suggestion: #38bdf8;
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
	mark.suggestion {
		border-bottom-color: var(--suggestion);
		background: color-mix(in srgb, var(--suggestion) 12%, transparent);
	}
	.sev.suggestion {
		color: var(--suggestion);
	}
	/* The hero's old viewport breakpoints, as widths of the figure itself. */
	@container (max-width: 940px) {
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
	@container (max-width: 640px) {
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
</style>
