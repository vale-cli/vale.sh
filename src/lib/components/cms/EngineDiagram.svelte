<script lang="ts">
	// The page's core claim, drawn: two front ends, one engine underneath. It was
	// two text cards saying so, which is the kind of architectural assertion a
	// reader skims past — the shape is the argument, so show the shape.
	//
	// Theme-aware, unlike EditorShot and AffixShot. Those two are screenshots of
	// an application and stay dark on purpose; this is a diagram, part of the
	// page, and should follow the reader's theme.
	const surfaces = [
		{ label: 'You', via: 'the hosted editor' },
		{ label: 'Your assistant', via: 'the MCP server' }
	];
</script>

<div class="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
	<div class="flex flex-col items-stretch gap-0">
		<!-- Two surfaces -->
		<div class="grid gap-4 sm:grid-cols-2">
			{#each surfaces as s (s.label)}
				<div class="rounded-xl border border-border/60 bg-background px-4 py-3.5 text-center">
					<div class="text-sm font-semibold">{s.label}</div>
					<div class="mt-0.5 font-mono text-[11.5px] text-muted-foreground">{s.via}</div>
				</div>
			{/each}
		</div>

		<!-- Converging connectors -->
		<div class="grid h-8 grid-cols-2" aria-hidden="true">
			<div class="border-r-2 border-t-0 border-lime-500/50"></div>
			<div class="border-l-2 border-lime-500/50"></div>
		</div>
		<div class="-mt-8 flex h-8 items-end justify-center" aria-hidden="true">
			<div class="h-4 w-px bg-lime-500/50"></div>
		</div>

		<!-- The engine -->
		<div class="rounded-xl border-2 border-lime-500 bg-lime-500/5 px-4 py-4 text-center">
			<div class="text-sm font-semibold">Vale's engine</div>
			<div
				class="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground"
			>
				<span>12 check types</span>
				<span>regex compilation</span>
				<span>POS tagging</span>
				<span>scopes</span>
			</div>
		</div>

		<div class="flex h-7 justify-center" aria-hidden="true">
			<div class="w-px bg-border"></div>
		</div>

		<!-- Where it lands -->
		<div class="rounded-xl border border-border/60 bg-background px-4 py-3.5 text-center">
			<div class="text-sm font-semibold">Your repository</div>
			<div class="mt-0.5 font-mono text-[11.5px] text-muted-foreground">
				ordinary files · the free CLI reads them in CI
			</div>
		</div>
	</div>

	<p class="mt-6 text-pretty text-center text-sm leading-6 text-muted-foreground">
		Nothing about a rule depends on which way in you took. A rule the assistant proves compiles is
		the same rule the editor lints with, in the same file your CI already reads.
	</p>
</div>
