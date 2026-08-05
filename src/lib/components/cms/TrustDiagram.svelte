<script lang="ts">
	// The security section was four claim cards and no picture of where anything
	// goes — which is the one thing a reader actually wants to see before handing
	// over a private repository. Drawing the boundary makes "we don't keep it"
	// checkable instead of reassuring.
	//
	// Each row is taken from the CMS repo's SECURITY.md, which checks its own
	// claims against the source. Nothing here may be softened into a maybe: if a
	// row moves columns, it is a different product and this diagram is a lie.
	const stays = [
		{ what: 'Your GitHub / GitLab token', how: 'held in your browser, sent to them, never to us' },
		{ what: 'Your repository', how: 'we commit to it; we keep no second copy' },
		{ what: 'Your style guide', how: 'ordinary files, in your Git history' }
	];

	const passes = [
		{ what: 'The text being linted', how: 'held only long enough to lint, then dropped' },
		{ what: 'Your rules, to compile', how: 'same — nothing is written down' }
	];
</script>

<div class="rounded-2xl border border-border/60 bg-card p-6">
	<div class="grid gap-5 sm:grid-cols-2">
		<div class="rounded-xl border border-lime-500/40 bg-lime-500/5 p-5">
			<div class="flex items-baseline justify-between gap-3">
				<h3 class="text-sm font-semibold">Never leaves you</h3>
				<span
					class="font-mono text-[10.5px] uppercase tracking-wider text-lime-600 dark:text-lime-400"
				>
					your browser
				</span>
			</div>
			<ul class="mt-3.5 flex flex-col gap-3">
				{#each stays as row (row.what)}
					<li>
						<div class="text-sm font-medium">{row.what}</div>
						<div class="mt-0.5 text-xs leading-5 text-muted-foreground">{row.how}</div>
					</li>
				{/each}
			</ul>
		</div>

		<div class="rounded-xl border border-border/60 bg-background p-5">
			<div class="flex items-baseline justify-between gap-3">
				<h3 class="text-sm font-semibold">Passes through, unstored</h3>
				<span class="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
					our engine
				</span>
			</div>
			<ul class="mt-3.5 flex flex-col gap-3">
				{#each passes as row (row.what)}
					<li>
						<div class="text-sm font-medium">{row.what}</div>
						<div class="mt-0.5 text-xs leading-5 text-muted-foreground">{row.how}</div>
					</li>
				{/each}
			</ul>
			<div class="mt-4 border-t border-border/60 pt-3 text-xs leading-5 text-muted-foreground">
				Stateless: each request carries what it needs, is processed in memory, and leaves nothing
				behind.
			</div>
		</div>
	</div>

	<p class="mt-5 text-pretty text-center text-sm leading-6 text-muted-foreground">
		The column on the left is the reason the column on the right is short.
	</p>
</div>
