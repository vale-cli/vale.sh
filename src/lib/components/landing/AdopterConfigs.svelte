<script lang="ts">
	import adopters from '$lib/data/adopters.json';
	import BrandIcon from './BrandIcon.svelte';
	import Section from './Section.svelte';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';

	type Adopter = {
		name: string;
		category: string;
		context: string;
		url: string;
		github?: string;
		avatar?: string;
		logo?: string;
		icon?: string;
	};

	/*
		A logo wall asserts that a company uses the tool; this band shows where to
		go and check. Two kinds of evidence sit side by side:

		  - a .vale.ini in a public repo  -> the path and the repository
		  - a page the team wrote about   -> the host

		Both are somewhere a reader can open, which is the point.
	*/
	const CONFIG =
		/^https:\/\/github\.com\/([^/]+\/[^/]+)\/blob\/[^/]+\/(.*(?:\.vale\.ini|_vale\.ini|vale\.ini))$/;

	const REPO = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/?$/;

	/*
		The card shows where the evidence lives; the href goes to the exact page.
		Printing the full path is useless once it truncates -- Datadog's is a
		sixty-character slug -- so a page shows only its host.
	*/
	function receipt(url: string) {
		const config = CONFIG.exec(url);
		if (config) return { primary: config[2], secondary: config[1] };

		// A bare repository link: the repo is the identity, the host is context.
		const repo = REPO.exec(url);
		if (repo) return { primary: repo[1], secondary: 'github.com' };

		return { primary: new URL(url).hostname.replace(/^www\./, ''), secondary: '' };
	}

	/*
		Picked for recognition and for how much each team has published: AWS,
		GitLab, Grafana, NVIDIA and Red Hat all maintain a page about running Vale,
		while Microsoft, Discord and Docker ship a config you can read.
	*/
	const FEATURED = [
		'Amazon Web Services',
		'Microsoft',
		'Discord',
		'GitLab',
		'Grafana Labs',
		'NVIDIA',
		'Docker',
		'Red Hat',
		'Datadog'
	];

	/*
		Each card is tinted with its own brand colour, the way Thanks.svelte tints
		its providers.

		Values are read out of the wordmark in static/users/ wherever one carries a
		hex. NVIDIA's and Discord's do not, so those two come from `simple-icons`.
		Microsoft's mark is four squares with no single colour; the red is the one
		its own SVG leads with.
	*/
	const BRAND: Record<string, string> = {
		'Amazon Web Services': '#FF9900', // logo
		Microsoft: '#F1511B', // logo
		Discord: '#5865F2', // simple-icons
		GitLab: '#FC6D26', // logo
		'Grafana Labs': '#FF671D', // logo
		NVIDIA: '#76B900', // simple-icons
		Docker: '#1D63ED', // logo
		'Red Hat': '#EE0000', // logo
		Datadog: '#632CA6' // logo
	};

	const byName = new Map((adopters as Adopter[]).map((a) => [a.name, a]));

	const cards = FEATURED.flatMap((name) => {
		const adopter = byName.get(name);
		if (!adopter) return [];
		return [
			{
				...adopter,
				...receipt(adopter.url),
				// Every card carries two lines, so a host-only one does not leave a
				// hole where the second would be. The category is authored data.
				secondary: receipt(adopter.url).secondary || adopter.category,
				brand: BRAND[name] ?? 'hsl(var(--foreground))',
				// BrandIcon resolves a Simple Icons glyph, then the avatar, then a
				// monogram. Most entries name their glyph; fall back to the key the
				// name implies for the ones that don't.
				slug: adopter.icon ?? name.toLowerCase().replace(/[^a-z0-9]/g, '')
			}
		];
	});

	// Duplicated so the track can loop seamlessly at -50%.
	const track = [...cards, ...cards];
	const total = adopters.length;
</script>

<Section
	title="Read their configs"
	lede="Every team here publishes something you can open — the .vale.ini they run, or the page they wrote about running it."
>
	<!-- overflow-hidden is load-bearing: the track is `w-max`, so without it the
	     whole document gains a horizontal scrollbar. -->
	<div class="marquee group relative -mx-6 overflow-hidden lg:-mx-8">
		<!-- Fade the edges so cards slide in and out instead of getting clipped. -->
		<div
			class="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent sm:w-24"
		></div>
		<div
			class="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent sm:w-24"
		></div>

		<ul class="track flex w-max items-stretch gap-3 px-6 lg:px-8">
			{#each track as card, i (card.name + i)}
				{@const duplicate = i >= cards.length}
				<li aria-hidden={duplicate ? 'true' : undefined}>
					<a
						href={card.url}
						target="_blank"
						rel="noreferrer"
						tabindex={duplicate ? -1 : 0}
						style="--brand: {card.brand};"
						class="group/card relative flex h-full w-64 flex-col gap-2.5 overflow-hidden rounded-xl border border-border bg-muted/50 p-4 transition-colors hover:border-[--brand] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--brand] dark:bg-muted/40 sm:w-72"
					>
						<!--
							The brand, washed down the whole card. `bg-card` is the same value
							as `bg-background` in dark, so a card painted with it has no
							surface of its own and a faint tint on top of it reads as black.
						-->
						<span
							aria-hidden="true"
							class="pointer-events-none absolute inset-0 bg-gradient-to-b from-[--brand] via-[--brand] to-transparent opacity-[0.16] transition-opacity duration-200 group-hover/card:opacity-[0.3]"
						></span>

						<!--
							The plate stays light in both themes: the wordmarks are
							dark-on-transparent and would vanish on a dark card.
						-->
						<span
							class="relative flex h-10 w-full items-center justify-center rounded-lg bg-white px-3 ring-1 ring-black/[0.06] dark:ring-white/10"
						>
							{#if card.logo}
								<img
									src={card.logo}
									alt={card.name}
									class="max-h-5 w-auto max-w-full object-contain"
									loading="lazy"
								/>
							{:else}
								<span class="flex items-center gap-1.5 text-zinc-900">
									<BrandIcon
										name={card.name}
										slug={card.slug}
										avatar={card.avatar}
										size="h-4 w-4"
										class="text-[--brand]"
									/>
									<span class="text-sm font-semibold">{card.name}</span>
								</span>
							{/if}
						</span>

						<!-- The adopter's own one-liner, clamped so cards stay level. -->
						<p class="relative line-clamp-2 text-xs leading-5 text-muted-foreground">
							{card.context}
						</p>

						<span
							class="relative mt-auto block truncate font-mono text-xs text-foreground"
							title={card.primary}
						>
							{card.primary}
						</span>
						<span
							class="relative block truncate font-mono text-[11px] text-muted-foreground"
							title={card.secondary}
						>
							{card.secondary}
						</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>

	<div class="mt-8 flex justify-center">
		<a
			href="#adopters"
			class="group inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
		>
			Browse all {total}
			<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
		</a>
	</div>
</Section>

<style>
	.track {
		animation: scroll 60s linear infinite;
	}

	/* Pause on hover or when a card inside receives keyboard focus. */
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
			width: 100%;
			flex-wrap: wrap;
			justify-content: center;
		}

		/* Without the scroll there's nothing to loop, so drop the duplicate half. */
		.track :global(li[aria-hidden='true']) {
			display: none;
		}
	}
</style>
