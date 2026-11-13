<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';

	import CodeBlock from '$lib/components/CodeBlock.svelte';

	let { snippets }: { snippets: { config: string; rule: string; commands: string } } = $props();
</script>

<section id="how-it-works" class="workflow-shell">
	<div class="landing-wrap workflow-grid">
		<div class="section-heading">
			<h2>A few lines of config.<br />A consistent first draft.</h2>
			<p>
				Start with an existing style guide. Keep the configuration in your project so everyone runs
				the same checks.
			</p>
			<ol class="steps">
				<li>
					<strong>Install Vale.</strong><span
						><code>brew install vale</code> on macOS and Linux, <code>choco install vale</code> on
						Windows, or
						<a href="https://docs.vale.sh/topics/installation">another package</a>.</span
					>
				</li>
				<li>
					<strong>Pick your styles.</strong><span
						>Save this as <code>.vale.ini</code> in your project.</span
					>
				</li>
				<li>
					<strong>Sync, then lint.</strong><span>Download the styles and check your docs.</span>
				</li>
			</ol>
			<div class="actions">
				<Button size="lg" href="https://docs.vale.sh/topics/quickstart"
					>Get started <ArrowRight data-icon="inline-end" /></Button
				>
				<a class="text-link" href="https://github.com/vale-cli/vale"
					>Check out the source code <span aria-hidden="true">→</span></a
				>
			</div>
		</div>
		<div class="config-example">
			<div class="file-bar">
				<span>.vale.ini</span><a href="https://docs.vale.sh/topics/quickstart"
					>Config reference ↗</a
				>
			</div>
			<div class="snippet"><CodeBlock html={snippets.config} bare /></div>
			<div class="command-example">
				<CodeBlock html={snippets.commands} bare />
			</div>
			<details>
				<summary>Make it your own with a YAML rule <span aria-hidden="true">+</span></summary>
				<div class="snippet"><CodeBlock html={snippets.rule} bare /></div>
				<a class="text-link rule-link" href="https://docs.vale.sh/topics/styles"
					>Learn to write rules →</a
				>
			</details>
		</div>
	</div>
</section>

<style>
	.landing-wrap {
		max-width: 1152px;
		margin-inline: auto;
		padding-inline: 32px;
	}
	/* The section above already draws its own bottom rule. */
	.workflow-shell {
		background: hsl(var(--muted));
		border-bottom: 1px solid hsl(var(--border));
		scroll-margin-top: 100px;
	}
	.workflow-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: clamp(32px, 5vw, 64px);
		padding-block: 80px;
		align-items: start;
	}
	.section-heading h2 {
		font-size: clamp(2rem, 3.5vw, 2.9rem);
		font-weight: 500;
		line-height: 1.12;
		letter-spacing: -0.045em;
		margin-block: 0 18px;
		text-wrap: balance;
	}
	.section-heading > p {
		max-width: 450px;
		line-height: 1.8;
		color: hsl(var(--foreground) / 0.85);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 24px;
		margin-top: 36px;
	}
	.text-link {
		display: inline-flex;
		gap: 10px;
		align-items: center;
		font-size: 13px;
		font-weight: 500;
	}
	a:hover {
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	a:focus-visible,
	summary:focus-visible {
		outline: 2px solid hsl(var(--ring));
		outline-offset: 5px;
	}
	.steps {
		display: flex;
		flex-direction: column;
		gap: 22px;
		margin-top: 36px;
		counter-reset: step;
	}
	.steps li {
		display: grid;
		grid-template-columns: 26px 1fr;
		column-gap: 12px;
		font-size: 13px;
	}
	.steps li::before {
		counter-increment: step;
		content: counter(step, decimal-leading-zero);
		grid-row: span 2;
		font:
			11px/1.8 ui-monospace,
			monospace;
		color: hsl(var(--primary));
	}
	.steps span {
		color: hsl(var(--foreground) / 0.8);
		margin-top: 4px;
		line-height: 1.6;
	}
	.steps a {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.config-example {
		min-width: 0;
		border: 1px solid hsl(var(--border));
		border-radius: 10px;
		background: hsl(var(--card));
		overflow: hidden;
	}
	.file-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		padding: 16px 22px;
		border-bottom: 1px solid hsl(var(--border));
		font:
			12px/1.5 ui-monospace,
			monospace;
		color: hsl(var(--muted-foreground));
	}
	.file-bar a {
		font-size: 10px;
	}
	.snippet {
		padding: 28px;
	}
	.command-example {
		padding: 20px 28px;
		border-top: 1px solid hsl(var(--border));
		font:
			13px/2 ui-monospace,
			monospace;
	}
	details {
		border-top: 1px solid hsl(var(--border));
	}
	summary {
		cursor: pointer;
		padding: 20px 24px;
		font-size: 12px;
	}
	summary span {
		float: right;
	}
	.rule-link {
		margin: 0 28px 24px;
	}
	@media (max-width: 900px) {
		.workflow-grid {
			gap: 32px;
		}
	}
	@media (max-width: 800px) {
		.landing-wrap {
			padding-inline: 24px;
		}
		.workflow-grid {
			grid-template-columns: 1fr;
			padding-block: 48px;
			gap: 40px;
		}
	}
</style>
