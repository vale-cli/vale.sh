<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import Check from 'lucide-svelte/icons/check';
	import { catalog, costs, coverage, repo, voices } from '$lib/data/voices';

	let { data } = $props();

	const description =
		'A house style your agent can run. The voice a prompt describes, written as rules that report the exact span and the fix.';

	let active = $state(voices[1]);

	// Long alert lists are collapsed to a readable window; Simple reports 55 on
	// this draft, which is the point but not worth the scroll.
	const WINDOW = 8;
	let expanded = $state(false);
	$effect(() => {
		active;
		expanded = false;
	});
	const shown = $derived(expanded ? active.alerts : active.alerts.slice(0, WINDOW));

	// The chart is drawn against the largest bar rather than a round number, so
	// the 0 row stays visible as a label instead of vanishing.
	const widest = Math.max(...costs.map((c) => c.tokens));
	const barWidth = (n: number) => (n === 0 ? 0 : Math.max((n / widest) * 100, 1.5));

	const codeBox =
		'overflow-x-auto rounded-xl border border-border [&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!p-4 [&_pre]:text-xs [&_pre]:leading-relaxed';

	// The drafts are hard-wrapped at 56 columns and still overrun a third of the
	// grid, so these panes wrap rather than scroll: a clipped word is worse than
	// a soft break in prose that is being read, not copied.
	const draftBox =
		'overflow-hidden rounded-xl border [&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!p-4 [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre]:text-[11px] [&_pre]:leading-relaxed';

	// Voices.ThroatClearing -> Voices/styles/Voices/ThroatClearing.yml
	const ruleUrl = (rule: string) => `${repo}/Voices/styles/${rule.replace('.', '/')}.yml`;
	const sourceLink =
		'inline-flex items-center gap-1 text-[11px] font-normal normal-case tracking-normal text-muted-foreground/70 underline decoration-dotted underline-offset-4 hover:text-foreground';
</script>

<MetaTags
	title="Voices — Vale"
	{description}
	canonical="https://vale.sh/voices"
	openGraph={{ url: 'https://vale.sh/voices', title: 'Voices', description }}
/>

<section class="relative overflow-hidden border-b border-border/60">
	<div
		class="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(hsl(var(--foreground)/0.05)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_60%,transparent_100%)]"
	></div>
	<div class="mx-auto max-w-4xl px-6 py-16 text-center lg:px-8">
		<p class="text-base font-semibold text-lime-500">Voices</p>
		<h1 class="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
			A house style your agent can run
		</h1>
		<p class="mx-auto mt-4 max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
			A prompt describes a voice. A style executes it.
		</p>

		<!--
			The loop, drawn once: everything below is a detail of one of these four
			steps. currentColor throughout, so it follows the theme.
		-->
		<svg
			viewBox="0 0 620 96"
			class="mx-auto mt-10 w-full max-w-2xl text-muted-foreground"
			role="img"
			aria-label="The agent writes a draft, Vale checks it, the agent applies the fix, and a clean run ends the loop."
		>
			<defs>
				<marker id="vh" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
					<path d="M0 0 L7 3.5 L0 7 z" fill="currentColor" />
				</marker>
			</defs>
			{#each [{ x: 0, label: 'agent writes' }, { x: 160, label: 'vale checks' }, { x: 320, label: 'agent fixes' }] as step}
				<rect
					x={step.x}
					y="26"
					width="136"
					height="44"
					rx="8"
					class="fill-card stroke-border"
					stroke-width="1"
				/>
				<text
					x={step.x + 68}
					y="53"
					text-anchor="middle"
					class="fill-foreground text-[13px]"
					font-family="ui-monospace, monospace">{step.label}</text
				>
				<line
					x1={step.x + 140}
					y1="48"
					x2={step.x + 156}
					y2="48"
					stroke="currentColor"
					stroke-width="1.5"
					marker-end="url(#vh)"
				/>
			{/each}
			<rect
				x="480"
				y="26"
				width="136"
				height="44"
				rx="8"
				class="fill-lime-500/10 stroke-lime-500/50"
				stroke-width="1"
			/>
			<text
				x="548"
				y="53"
				text-anchor="middle"
				class="fill-foreground text-[13px]"
				font-family="ui-monospace, monospace">exit 0</text
			>
			<!-- The failing branch: back to the top until the run is clean. -->
			<path
				d="M228 74 L228 88 L388 88"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-dasharray="3 3"
			/>
			<text x="300" y="84" text-anchor="middle" class="fill-muted-foreground text-[11px]"
				>exit 1</text
			>
		</svg>
	</div>
</section>

<!--
	The split. An output style is three things wearing one coat, and only the
	middle one is a linting problem.
-->
<section class="border-b border-border/60">
	<div class="mx-auto max-w-5xl px-6 py-14 sm:py-16 lg:px-8">
		<h2 class="text-2xl font-semibold">What a rule can take from a prompt</h2>
		<p class="mt-3 max-w-2xl text-muted-foreground">
			Open any output style and it splits three ways.
		</p>

		<svg
			viewBox="0 0 700 210"
			class="mt-8 w-full text-muted-foreground"
			role="img"
			aria-label="An output style splits into a persona that stays a prompt, constraints that become rules, and guardrails Vale gets for free."
		>
			<defs>
				<marker id="sp" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
					<path d="M0 0 L7 3.5 L0 7 z" fill="currentColor" />
				</marker>
			</defs>
			<rect
				x="0"
				y="72"
				width="150"
				height="60"
				rx="8"
				class="fill-card stroke-border"
				stroke-width="1"
			/>
			<text
				x="75"
				y="97"
				text-anchor="middle"
				class="fill-foreground text-[13px]"
				font-family="ui-monospace, monospace">gen-z.md</text
			>
			<text x="75" y="115" text-anchor="middle" class="fill-muted-foreground text-[11px]"
				>745 tokens</text
			>

			{#each [{ y: 18, label: 'persona', note: 'stays a prompt', tone: 'muted' }, { y: 88, label: 'constraints', note: 'become rules', tone: 'lime' }, { y: 158, label: 'guardrails', note: 'free — Vale skips code', tone: 'muted' }] as lane}
				<path
					d="M154 102 C 210 102, 210 {lane.y + 22}, 266 {lane.y + 22}"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					marker-end="url(#sp)"
					opacity={lane.tone === 'lime' ? '1' : '0.45'}
				/>
				<rect
					x="274"
					y={lane.y}
					width="180"
					height="44"
					rx="8"
					class={lane.tone === 'lime'
						? 'fill-lime-500/10 stroke-lime-500/50'
						: 'fill-card stroke-border'}
					stroke-width="1"
				/>
				<text
					x="364"
					y={lane.y + 27}
					text-anchor="middle"
					class="fill-foreground text-[13px]"
					font-family="ui-monospace, monospace">{lane.label}</text
				>
				<text x="470" y={lane.y + 27} class="fill-muted-foreground text-[12px]">{lane.note}</text>
			{/each}
		</svg>

		<div class="mt-8 grid gap-6 lg:grid-cols-3">
			<div>
				<h3 class="text-sm font-semibold">A persona</h3>
				<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
					“Answer like the group chat's most technical member.” Nothing here touches it, and nothing
					should. Models have never once failed to sound like Yoda.
				</p>
			</div>
			<div>
				<h3 class="text-sm font-semibold text-lime-600 dark:text-lime-400">A set of constraints</h3>
				<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
					One slang term per sentence. Six words in a headline. Only these 850 words. The prompt
					states it, then asks the model to check by re-reading its own draft and counting. That is
					a linter.
				</p>
			</div>
			<div>
				<h3 class="text-sm font-semibold">Structural guardrails</h3>
				<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
					“Slang never enters code, commands, file paths or identifiers.” A prompt says this and
					hopes. Vale parses the markup, so the rules only ever see prose.
				</p>
			</div>
		</div>

		<div class="mt-8 grid gap-4 lg:grid-cols-2">
			<div>
				<p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					The instruction: “one slang hit per sentence, max”
				</p>
				<div class={codeBox}>{@html data.code.budget}</div>
			</div>
			<div>
				<p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					The same rules, generated back into a brief
				</p>
				<div class={codeBox}>{@html data.code.brief}</div>
				<p class="mt-3 text-sm leading-relaxed text-muted-foreground">
					Derived from the checks, so the two cannot drift. CI regenerates them and fails on a diff.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- The demo: one draft, every voice, real output. -->
<section class="border-b border-border/60">
	<div class="mx-auto max-w-7xl px-6 py-14 sm:py-16 lg:px-8">
		<h2 class="text-2xl font-semibold">One draft, six voices</h2>
		<p class="mt-3 max-w-2xl text-muted-foreground">
			The same hedged paragraph, checked against each voice and then rewritten until Vale returned
			zero. Every rewrite below is a file in the package's test suite, and CI fails if it stops
			coming back clean.
		</p>

		<div class="mt-8 flex flex-wrap gap-2">
			{#each voices as voice}
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

		<div class="mt-6 flex flex-wrap items-baseline justify-between gap-3">
			<p class="text-sm text-muted-foreground">{active.summary}</p>
			<code class="rounded bg-muted px-2 py-1 font-mono text-xs"
				>BasedOnStyles = {active.basedOn}</code
			>
		</div>

		<div class="mt-6 grid gap-5 lg:grid-cols-3">
			<!-- 1 -->
			<div class="flex flex-col">
				<div class="mb-2 flex items-baseline justify-between gap-2">
					<p class="flex items-baseline gap-2 text-xs font-semibold uppercase tracking-wide">
						<span
							class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[10px] text-muted-foreground"
							>1</span
						>
						<span class="text-muted-foreground">Draft</span>
						<span
							class="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] normal-case tracking-normal text-muted-foreground"
							>exit 1</span
						>
					</p>
					<a class={sourceLink} href="{repo}/fixtures/before.md">before.md</a>
				</div>
				<div class="{draftBox} flex-1 border-border">{@html data.drafts.before}</div>
			</div>

			<!-- 2 -->
			<div class="flex flex-col">
				<div class="mb-2 flex items-baseline justify-between gap-2">
					<p class="flex items-baseline gap-2 text-xs font-semibold uppercase tracking-wide">
						<span
							class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[10px] text-muted-foreground"
							>2</span
						>
						<span class="text-muted-foreground">What Vale returned</span>
						<span
							class="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] normal-case tabular-nums tracking-normal text-muted-foreground"
							>{active.alerts.length}</span
						>
					</p>
				</div>
				<div class="flex-1 rounded-xl border border-border bg-card p-1.5">
					<ul>
						{#each shown as alert}
							<!-- Each rule links to the file that defines it: the message is the
							     instruction, the YAML is the reason. -->
							<a
								href={ruleUrl(alert.rule)}
								class="flex gap-2 rounded-lg px-2 py-1.5 text-xs leading-relaxed transition-colors hover:bg-muted/60"
							>
								<span
									class="w-5 shrink-0 text-right font-mono tabular-nums text-muted-foreground/50"
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

			<!-- 3 -->
			<div class="flex flex-col">
				<div class="mb-2 flex items-baseline justify-between gap-2">
					<p class="flex items-baseline gap-2 text-xs font-semibold uppercase tracking-wide">
						<span
							class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-lime-500/15 font-mono text-[10px] text-lime-600 dark:text-lime-400"
							>3</span
						>
						<span class="text-muted-foreground">Rewrite</span>
						<span
							class="inline-flex items-center gap-1 rounded bg-lime-500/10 px-1.5 py-0.5 font-mono text-[10px] normal-case tracking-normal text-lime-600 dark:text-lime-400"
						>
							<Check class="h-2.5 w-2.5" /> exit 0
						</span>
					</p>
					<a class={sourceLink} href="{repo}/fixtures/after/{active.name}.md">{active.name}.md</a>
				</div>
				<div class="{draftBox} flex-1 border-lime-500/40">
					{@html data.drafts.after[active.name]}
				</div>
			</div>
		</div>

		{#if active.name === 'Simple'}
			<p class="mt-4 text-xs leading-relaxed text-muted-foreground/80">
				<strong class="font-medium text-foreground">Simple</strong> checks against Basic English — C.
				K. Ogden's 850 words, from 1930. The heading had to be rewritten too: “understanding” and “component”
				are not in the list. A closed vocabulary is the constraint a model cannot hold in its head and
				a lookup table gets exactly right.
			</p>
		{:else if active.name === 'Brevity'}
			<p class="mt-4 text-xs leading-relaxed text-muted-foreground/80">
				Voices can disagree. Smart Brevity's <code class="font-mono">Why it matters:</code> is,
				structurally, the colon reveal the shared core forbids — so this one wants
				<code class="font-mono">Voices.ColonReveal = NO</code> in your config. Two contradictory instructions
				in one context window just produce whichever the model weighted higher.
			</p>
		{/if}
	</div>
</section>

<!-- Coverage: the honest half. -->
<section class="border-b border-border/60">
	<div class="mx-auto max-w-4xl px-6 py-14 sm:py-16 lg:px-8">
		<h2 class="text-2xl font-semibold">Where each voice comes from</h2>
		<p class="mt-3 max-w-2xl text-muted-foreground">
			Each one is an entry in the output-style catalogue, rewritten as the constraint its
			description states.
		</p>

		<div class="mt-8 overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead>
					<tr class="border-b border-border">
						<th class="pb-2 pr-4 font-medium text-muted-foreground">Style</th>
						<th class="pb-2 pr-4 font-medium text-muted-foreground">Voice</th>
						<th class="pb-2 pr-4 font-medium text-muted-foreground">Why</th>
						<th class="pb-2 font-medium text-muted-foreground">License</th>
					</tr>
				</thead>
				<tbody>
					{#each coverage as row}
						<tr class="border-b border-border/50 last:border-0">
							<td class="py-2.5 pr-4 font-mono text-xs">
								{#each row.styles as style, i}{#if i > 0}<span class="text-muted-foreground/50"
											>,
										</span>{/if}<a
										href="{catalog}/{style}.md"
										class="underline decoration-dotted underline-offset-4 hover:text-lime-600 dark:hover:text-lime-400"
										>{style}</a
									>{/each}
							</td>
							<td class="whitespace-nowrap py-2.5 pr-4">
								<a
									href="{repo}/Voices/styles/{row.voice.split(' + ').pop()}"
									class="text-lime-600 underline decoration-dotted underline-offset-4 dark:text-lime-400"
									>{row.voice}</a
								>
							</td>
							<td class="py-2.5 pr-4 text-muted-foreground">{row.why}</td>
							<td class="whitespace-nowrap py-2.5">
								<a href={row.source.href} class="group inline-flex items-baseline gap-1.5">
									<span
										class="rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-foreground group-hover:border-lime-500/50"
										>{row.source.spdx}</span
									>
									<span class="text-xs text-muted-foreground/70">{row.source.holder}</span>
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<p class="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
			Only the first row contributed text: the word list and most of the shared core are a
			translation of no-ai-slop's <code class="font-mono">SKILL.md</code> into check syntax. The
			rest were written from the constraint each entry describes. Both upstreams are MIT, every
			derived file names its source, and
			<a
				href="{repo}/NOTICE"
				class="underline decoration-dotted underline-offset-4 hover:text-foreground">NOTICE</a
			>
			ships inside the archive alongside the license.
		</p>
	</div>
</section>

<!-- One rule, both halves: what you write, what the agent receives. -->
<section class="border-b border-border/60">
	<div class="mx-auto max-w-5xl px-6 py-14 sm:py-16 lg:px-8">
		<h2 class="text-2xl font-semibold">You write the rule. The agent gets the fix.</h2>
		<div class="mt-8 grid gap-4 lg:grid-cols-2">
			<div>
				<p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					The rule — eight lines of YAML
				</p>
				<div class={codeBox}>{@html data.code.rule}</div>
			</div>
			<div>
				<p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					What comes back — in JSON
				</p>
				<div class={codeBox}>{@html data.code.json}</div>
				<p class="mt-3 text-sm leading-relaxed text-muted-foreground">
					The span to cut and the text to put there. Not advice — an edit.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Cost, as a chart. The bars are the argument. -->
<section class="border-b border-border/60">
	<div class="mx-auto max-w-4xl px-6 py-14 sm:py-16 lg:px-8">
		<h2 class="text-2xl font-semibold">Tokens</h2>
		<p class="mt-3 max-w-xl text-muted-foreground">
			A prompt is paid for every session. Rules are paid for when the prose breaks them.
		</p>

		<div class="mt-8 space-y-4">
			{#each costs as cost}
				<div>
					<div class="flex items-baseline justify-between gap-4 text-sm">
						<span>{cost.label}</span>
						<span class="font-mono tabular-nums text-muted-foreground">{cost.tokens}</span>
					</div>
					<div class="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
						<div
							class="h-full rounded-full {cost.tokens > 1000
								? 'bg-muted-foreground/60'
								: 'bg-lime-500'}"
							style="width: {barWidth(cost.tokens)}%"
						></div>
					</div>
					<p class="mt-1 text-xs text-muted-foreground/80">{cost.when}</p>
				</div>
			{/each}
		</div>

		<p class="mt-6 max-w-2xl text-xs leading-relaxed text-muted-foreground/80">
			Real BPE counts, not an estimate — OpenAI's <code class="font-mono">o200k_base</code>, since
			Anthropic publishes no offline tokenizer for Claude 3 and later. The prompt measured is
			no-ai-slop's <code class="font-mono">SKILL.md</code> at
			<code class="font-mono">b53e265</code>; the alert counts come from running Vale on the two
			drafts above.
			<a
				href="{repo}/script/tokens/count.py"
				class="underline decoration-dotted underline-offset-4 hover:text-foreground">count.py</a
			>
			reproduces every figure, and takes an <code class="font-mono">--backend anthropic</code> flag for
			Claude's own count.
		</p>
	</div>
</section>

<!-- The loop, for real. -->
<section class="border-b border-border/60">
	<div class="mx-auto max-w-4xl px-6 py-14 sm:py-16 lg:px-8">
		<h2 class="text-2xl font-semibold">No file, no server</h2>
		<p class="mt-3 max-w-xl text-muted-foreground">
			The agent lints the draft it is about to send. The exit code is the part a prompt cannot
			supply.
		</p>
		<div class="mt-6 {codeBox} [&_pre]:!p-5">{@html data.code.loop}</div>
	</div>
</section>

<div class="mx-auto max-w-4xl px-6 py-14 sm:py-16 lg:px-8">
	<div class="rounded-2xl border border-border bg-card p-6">
		<h2 class="text-sm font-semibold">Try it</h2>
		<div class="mt-3 {codeBox}">{@html data.code.config}</div>
		<p class="mt-3 text-sm text-muted-foreground">
			Then <code class="font-mono">vale sync</code>.
		</p>
		<div class="mt-4 flex flex-wrap gap-3">
			<a
				href="https://github.com/jdkato/voices"
				class="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:border-lime-500/40"
			>
				The package
				<ArrowUpRight class="h-3.5 w-3.5" />
			</a>
			<a
				href="/skills"
				class="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:border-lime-500/40"
			>
				Agent skills and the edit hook
				<ArrowUpRight class="h-3.5 w-3.5" />
			</a>
			<a
				href="/explorer"
				class="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:border-lime-500/40"
			>
				Every package
				<ArrowUpRight class="h-3.5 w-3.5" />
			</a>
		</div>
	</div>
</div>
