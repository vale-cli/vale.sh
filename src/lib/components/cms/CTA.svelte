<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
</script>

<section class="mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:px-8">
	<div class="lg:flex lg:items-center lg:justify-between">
		<div class="max-w-2xl">
			<h2 class="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
				Open the sample project. <br class="hidden sm:inline" />No account needed.
			</h2>
			<p class="mt-4 text-pretty text-lg leading-8 text-muted-foreground">
				See the engine lint, the regex compile, and the config validate before you decide anything.
			</p>
		</div>
		<div class="mt-8 flex flex-wrap items-center gap-4 lg:mt-0 lg:shrink-0">
			<a
				href="https://cms.vale.sh"
				class="group inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
			>
				Open Vale CMS
				<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
			</a>
			<a href="https://docs.vale.sh" class="text-sm font-semibold">
				Read the Vale docs <span aria-hidden="true">→</span>
			</a>
		</div>
	</div>
</section>
