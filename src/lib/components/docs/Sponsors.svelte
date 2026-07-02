<script lang="ts">
	import Heart from 'lucide-svelte/icons/heart';

	// OpenCollective's SVG embeds have transparent backgrounds, so they render
	// correctly in both light and dark mode—no theme-specific branching needed.
	const embeds = [
		{ label: 'Organizations', src: 'https://opencollective.com/vale/organizations.svg?width=880&button=false' },
		{ label: 'Individuals', src: 'https://opencollective.com/vale/individuals.svg?width=880&button=false' }
	];
</script>

<section class="border-b border-border/60 py-20 sm:py-28">
	<div class="mx-auto max-w-6xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-base font-semibold text-lime-500">Supported by a community</h2>
			<p class="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
				Sponsors &amp; backers
			</p>
			<p class="mt-6 text-pretty text-lg leading-8 text-muted-foreground">
				Vale is free and open source, sustained by the generous organizations and individuals
				who back it on Open Collective.
			</p>
		</div>

		<div class="mx-auto mt-14 flex max-w-3xl flex-col items-center gap-10">
			{#each embeds as embed}
				<a
					href="https://opencollective.com/vale"
					target="_blank"
					rel="noreferrer"
					class="block w-full"
					aria-label="Vale {embed.label} on Open Collective"
				>
					<img src={embed.src} alt="Vale {embed.label.toLowerCase()}" class="mx-auto w-full" loading="lazy" />
				</a>
			{/each}
		</div>

		<div class="mt-14 flex justify-center">
			<a
				href="https://opencollective.com/vale"
				target="_blank"
				rel="noreferrer"
				class="group inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:border-lime-500/40 hover:bg-muted/60"
			>
				<Heart class="h-4 w-4 text-lime-500" />
				Become a sponsor
			</a>
		</div>
	</div>
</section>
