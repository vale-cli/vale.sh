<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';

	// The last thing after a price table should close, not re-offer the free tier.
	// This used to repeat the hero's "open the sample, no account needed" — the
	// right *first* ask and the wrong last one, since a reader who has scrolled
	// past the prices has already decided the free tier isn't their question.
	//
	// The trial is the primary action now, with the sample kept as the secondary
	// for anyone still deciding. "A month" is what Polar is actually configured
	// to give (trial_interval: month on both Pro and Site) — don't round it to
	// "30 days" or inflate it.
</script>

<section class="relative overflow-hidden border-t border-border/60">
	<!-- Mirrors the hero's dotted grid, masked from the bottom, so the page closes on the note it opened with. -->
	<div
		class="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(hsl(var(--foreground)/0.06)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_100%,#000_50%,transparent_100%)]"
	></div>

	<div class="mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:px-8">
		<div class="mx-auto max-w-3xl text-center">
			<h2 class="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
				Stop shipping rules you
				<span class="text-lime-600 dark:text-lime-400">hope</span> work.
			</h2>
			<p class="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
				A month of the full editor and the MCP server, on your own repository. If it hasn't caught
				something your CI would have missed, cancel and keep using Vale for free.
			</p>

			<div class="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
				<a
					href="https://cms.vale.sh"
					class="group inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-primary px-7 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
				>
					Start your free month
					<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
				</a>
				<a
					href="https://cms.vale.sh"
					class="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
				>
					Or open the sample first
				</a>
			</div>

			<p class="mt-5 text-sm text-muted-foreground">
				Cancel anytime · the sample needs no account · Vale itself stays free and MIT licensed
			</p>
		</div>
	</div>
</section>
