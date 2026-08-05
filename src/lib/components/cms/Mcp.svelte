<script lang="ts">
	// This is section two, not a footnote, and the ordering is deliberate:
	// docs/pricing.md in the CMS repo calls MCP "the more differentiated feature
	// and the one worth polishing for launch". If this ever drifts back below
	// the fold, that decision is being reversed by accident.
	//
	// Scoped to MCP only. The in-editor BYOK chat assistant is gated off
	// (AI_ASSISTANT in the CMS repo's features.ts) and the CMS terms say so —
	// advertising it here would sell something nobody can reach.
	const clients = ['Claude Code', 'Cursor', 'VS Code', 'Claude Desktop', 'Claude.ai', 'ChatGPT'];
</script>

<section id="mcp" class="scroll-mt-20 border-b border-border/60 bg-muted/30 py-16 sm:py-20">
	<div class="mx-auto max-w-6xl px-6 lg:px-8">
		<div class="max-w-3xl">
			<h2 class="text-base font-semibold text-lime-500">Your assistant, connected to the engine</h2>
			<p class="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
				Models already know Vale. What they can't do is check.
			</p>
			<p class="mt-5 text-pretty text-lg leading-8 text-muted-foreground">
				Ask any assistant for a Vale rule and it will write you plausible YAML. Whether it compiles,
				whether the regex matches anything, whether the config still loads — it has no way to find
				out, so you find out later, in CI. A hosted MCP server gives it the real engine to check
				against, so a rule that doesn't work never reaches you.
			</p>
		</div>

		<div class="mt-12 grid items-start gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
			<div class="min-w-0">
				<!--
					The two failures are the point of the whole section. A demo where the
					model gets it right first time proves nothing — the argument is that
					verification catches what generation gets wrong. Don't "clean this up".

					Both errors are real output, not illustration: the regexp message is
					what diagnose_rule returns for an unbalanced group, and the trace_rule
					line is its actual summary when every slot matches but the sequence
					still does not — an adverb sitting between the slots with no `skip`.
					An earlier version invented an "unknown tag" error, which is exactly
					the kind of detail a reader can check and find wrong.
				-->
				<div
					class="overflow-hidden rounded-2xl border font-mono text-[13px] leading-[1.75]"
					style="background:#16180f; border-color:#2a2e1f; color:#d7d6c8"
					aria-hidden="true"
				>
					<div
						class="border-b px-4 py-2 text-[11px]"
						style="border-color:#2a2e1f; background:#14160e; color:#8a8d78"
					>
						vale-cms · MCP
					</div>
					<div class="overflow-x-auto p-4">
						<div><span class="text-lime-500">you</span> › add a rule that flags passive voice</div>
						<div class="mt-2">
							<span style="color:#7cc7f2">scaffold_rule</span>
							<span style="color:#8a8d78">sequence · styles/House/Passive.yml</span>
						</div>

						<div class="mt-2"><span style="color:#7cc7f2">diagnose_rule</span></div>
						<div class="text-[#f0745a]">&nbsp;&nbsp;✗ error parsing regexp: missing closing )</div>
						<div style="color:#6c7059">&nbsp;&nbsp;&nbsp;&nbsp;in `(?m)\b(?:(?&lt;!\bthe )(…`</div>
						<div style="color:#6c7059">&nbsp;&nbsp;↳ group balanced, retrying</div>
						<div>
							<span style="color:#7cc7f2">diagnose_rule</span>
							<span class="text-lime-400">✓ compiles</span>
						</div>

						<div class="mt-2"><span style="color:#7cc7f2">trace_rule</span></div>
						<div class="text-[#f0745a]">&nbsp;&nbsp;✗ did not fire, though every slot</div>
						<div class="text-[#f0745a]">&nbsp;&nbsp;&nbsp;&nbsp;accepts some word here</div>
						<div style="color:#6c7059">&nbsp;&nbsp;↳ "carefully" sits between them; skip: 1</div>
						<div>
							<span style="color:#7cc7f2">lint_text</span>
							<span class="text-lime-400">✓ 1 alert on your sample</span>
						</div>

						<div class="mt-2" style="color:#6c7059"># written to styles/House/Passive.yml</div>
						<div style="color:#6c7059"># enabled in .vale.ini</div>
					</div>
				</div>
				<p class="mt-4 text-sm leading-6 text-muted-foreground">
					Two mistakes, neither of which reached you: one the rule would not compile, one it
					compiled and silently matched nothing. The second is the kind CI does not catch either — a
					rule that never fires looks exactly like a rule with nothing to report.
				</p>
			</div>

			<div class="flex flex-col gap-6">
				<div>
					<h3 class="font-semibold">Works in what you already use</h3>
					<div class="mt-3 flex flex-wrap gap-2">
						{#each clients as client (client)}
							<span
								class="rounded-lg border border-border/60 bg-card px-2.5 py-1.5 font-mono text-xs text-foreground"
							>
								{client}
							</span>
						{/each}
					</div>
					<p class="mt-3 text-sm leading-6 text-muted-foreground">
						One token, pasted into your client's config. Nothing to install and nothing to run
						locally.
					</p>
				</div>

				<div class="rounded-2xl border border-border/60 bg-card p-6">
					<h3 class="font-semibold">It is a linter, not a lookup</h3>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">
						The tools your assistant calls run Vale's engine in process — not a reimplementation of
						it, and not a search over its documentation. A rule it says compiles, compiles. A rule
						it says fires, fires — on the text you gave it, with the severity you'll actually see.
					</p>
					<p class="mt-3 text-sm leading-6 text-muted-foreground">
						Included on <strong class="text-foreground">every paid plan</strong>, because one
						developer with one client is exactly who it's for.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>
