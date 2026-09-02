<script lang="ts">
	// One draft, every voice, real output -- the demo that used to live at
	// /voices. The draft, its rewrite, and the redline between them share a
	// tabbed pane; what Vale reported sits beneath.
	import { before, repo, voices } from '$lib/data/voices';

	import DraftTabs from './DraftTabs.svelte';

	// The shared core isn't a voice you pick -- it's on under every one of
	// them -- so it doesn't get a pill.
	const selectable = voices.filter((voice) => voice.name !== 'Voices');

	let active = $state(selectable[0]);

	// Long alert lists are collapsed to a readable window; Direct reports 17
	// on this draft, which is the point but not worth the scroll.
	const WINDOW = 8;
	let expanded = $state(false);
	$effect(() => {
		active;
		expanded = false;
	});
	const shown = $derived(expanded ? active.alerts : active.alerts.slice(0, WINDOW));

	// Voices.ThroatClearing -> Voices/styles/Voices/ThroatClearing.yml
	const ruleUrl = (rule: string) => `${repo}/Voices/styles/${rule.replace('.', '/')}.yml`;
</script>

<div class="not-prose my-8">
	<div class="flex flex-wrap gap-2">
		{#each selectable as voice (voice.name)}
			<button
				type="button"
				onclick={() => (active = voice)}
				class="rounded-full border px-4 py-1.5 text-sm font-medium transition-colors {active.name ===
				voice.name
					? 'border-lime-500 bg-lime-500/10 text-foreground'
					: 'border-border text-muted-foreground hover:border-lime-500/40'}"
			>
				{voice.name}
			</button>
		{/each}
	</div>

	<div class="mt-5 flex flex-wrap items-baseline justify-between gap-3">
		<p class="text-sm text-muted-foreground">{active.summary}</p>
		<code class="rounded bg-muted px-2 py-1 font-mono text-xs"
			>BasedOnStyles = {active.basedOn}</code
		>
	</div>

	<DraftTabs
		{before}
		after={active.after}
		beforeLabel="Draft"
		afterLabel="Rewrite"
		beforeHref="{repo}/fixtures/before.md"
		afterHref="{repo}/fixtures/after/{active.name}.md"
		initial="after"
	/>

	<div class="mt-5">
		<p class="mb-2 flex items-baseline gap-2 text-xs font-semibold uppercase tracking-wide">
			<span class="text-muted-foreground">What Vale returned on the draft</span>
			<span
				class="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] normal-case tabular-nums tracking-normal text-muted-foreground"
				>{active.alerts.length}</span
			>
		</p>
		<div class="rounded-xl border border-border bg-card p-1.5">
			<ul>
				{#each shown as alert (alert.line + alert.rule + alert.message)}
					<!-- Each rule links to the file that defines it: the message is
					     the instruction, the YAML is the reason. -->
					<a
						href={ruleUrl(alert.rule)}
						class="flex gap-2 rounded-lg px-2 py-1.5 text-xs leading-relaxed transition-colors hover:bg-muted/60"
					>
						<span class="w-5 shrink-0 text-right font-mono tabular-nums text-muted-foreground/50"
							>{alert.line}</span
						>
						<span class="min-w-0">
							<span class="font-mono text-[11px] text-lime-600 dark:text-lime-400"
								>{alert.rule}</span
							>
							<span class="text-muted-foreground">{alert.message}</span>
						</span>
					</a>
				{/each}
			</ul>
			{#if active.alerts.length > WINDOW}
				<button
					type="button"
					onclick={() => (expanded = !expanded)}
					class="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
				>
					{expanded ? '− Show fewer' : `+ Show the other ${active.alerts.length - WINDOW}`}
				</button>
			{/if}
		</div>
	</div>

	{#if active.name === 'Coach'}
		<p class="mt-4 text-xs leading-relaxed text-muted-foreground/80">
			Voices can disagree. Coach's required <code class="font-mono">Next:</code> label is,
			structurally, the colon reveal the shared core forbids — so this one wants
			<code class="font-mono">Voices.ColonReveal = NO</code> in your config. Two contradictory instructions
			in one context window just produce whichever the model weighted higher.
		</p>
	{:else if active.name === 'GenZ'}
		<p class="mt-4 text-xs leading-relaxed text-muted-foreground/80">
			<strong class="font-medium text-foreground">GenZ</strong> counts one slang list three ways — per
			sentence, per paragraph, and for presence — and the test suite fails if the three copies of the
			list ever drift. Slang never enters code, commands, or identifiers, because Vale parses the markup
			and the rules only see prose.
		</p>
	{:else if active.name === 'Simple'}
		<p class="mt-4 text-xs leading-relaxed text-muted-foreground/80">
			<strong class="font-medium text-foreground">Simple</strong> checks against Basic English — C. K.
			Ogden's 850 words, from 1930, shipped as a Hunspell dictionary. The heading had to be rewritten
			too: “understanding” and “component” are not in the list. A closed vocabulary is the constraint
			a model cannot hold in its head and a lookup table gets exactly right.
		</p>
	{/if}
</div>
