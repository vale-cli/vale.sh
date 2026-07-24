<script lang="ts">
	import adopters from '$lib/data/adopters.json';

	type Adopter = { name: string; category: string; context: string; url: string; logo?: string };

	// Only the adopters we have wordmarks for; the rest live in the explorer below.
	const logos = (adopters as Adopter[]).filter((a) => a.logo);
	// Duplicated so the track can loop seamlessly at -50%.
	const track = [...logos, ...logos];
</script>

<section class="overflow-hidden border-b border-border/60 py-10">
	<p class="text-center text-sm font-medium text-muted-foreground">
		Shipping in the documentation pipelines of
	</p>

	<div class="marquee group relative mt-6">
		<!-- Fade the edges so logos slide in and out instead of getting clipped. -->
		<div
			class="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-28"
		></div>
		<div
			class="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-28"
		></div>

		<ul class="track flex w-max items-center gap-4">
			{#each track as user, i}
				<li aria-hidden={i >= logos.length ? 'true' : undefined}>
					<a
						href={user.url}
						target="_blank"
						rel="noreferrer"
						tabindex={i >= logos.length ? -1 : 0}
						class="flex h-20 w-44 items-center justify-center rounded-xl bg-white p-5 ring-1 ring-black/[0.06] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
					>
						<img
							src={user.logo}
							alt={user.name}
							class="max-h-8 w-full object-contain"
							loading="lazy"
						/>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.track {
		animation: scroll 40s linear infinite;
	}

	/* Pause on hover or when a logo inside receives keyboard focus. */
	.marquee:hover .track,
	.track:focus-within {
		animation-play-state: paused;
	}

	@keyframes scroll {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.track {
			animation: none;
			flex-wrap: wrap;
			justify-content: center;
			width: 100%;
		}

		/* Without the scroll there's nothing to loop, so drop the duplicate half. */
		.track :global(li[aria-hidden='true']) {
			display: none;
		}
	}
</style>
