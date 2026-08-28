<script lang="ts">
	import adopters from '$lib/data/adopters.json';
	import BrandIcon from './BrandIcon.svelte';
	import Section from './Section.svelte';
	import InlineCode from '$lib/components/features/InlineCode.svelte';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import BookOpen from 'lucide-svelte/icons/book-open';
	import FileText from 'lucide-svelte/icons/file-text';
	import GitBranch from 'lucide-svelte/icons/git-branch';

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
	// Named, so that `kind` stays one of the three the icon map answers to
	// rather than widening to `string` -- which is what it does when the
	// literals are only inferred, leaving the lookup below unindexable.
	type Kind = 'Public config' | 'Repository' | 'Writeup';

	function receipt(url: string): { primary: string; secondary: string; kind: Kind } {
		const config = CONFIG.exec(url);
		if (config) return { primary: config[2], secondary: config[1], kind: 'Public config' };

		// A bare repository link: the repo is the identity, the host is context.
		const repo = REPO.exec(url);
		if (repo) return { primary: repo[1], secondary: 'github.com', kind: 'Repository' };

		return {
			primary: new URL(url).hostname.replace(/^www\./, ''),
			secondary: '',
			kind: 'Writeup'
		};
	}

	const kindIcon: Record<Kind, typeof FileText> = {
		'Public config': FileText,
		Repository: GitBranch,
		Writeup: BookOpen
	};

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
		Each card is tinted with its own brand color, the way Thanks.svelte tints
		its providers.

		Values are read out of the wordmark in static/users/ wherever one carries a
		hex. NVIDIA's and Discord's do not, so those two come from `simple-icons`.
		Microsoft's mark is four squares with no single color; the red is the one
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

	// Laid out rather than looped, so every card is real and reachable by tab.
	const track = cards;
	const total = adopters.length;
</script>

{#snippet configsLede()}
	Every team here publishes something you can open — the <InlineCode>.vale.ini</InlineCode> they run,
	or the page they wrote about running it.
{/snippet}

<Section id="configs" title="Read their configs" lede={configsLede}>
	<!--
		Three static rows rather than one scrolling one.

		These are links: the section asks you to go and read someone's config,
		and a moving row makes that a moving target -- which is why the marquee
		had to pause on hover. Nine cards at three columns is the same evidence
		with nothing to chase, and nothing is dropped from the card to get it.
	-->
	<ul class="grid items-stretch gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each track as card (card.name)}
			<li>
				<a
					href={card.url}
					target="_blank"
					rel="noreferrer"
					style="--brand: {card.brand};"
					class="group/card relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-muted/50 p-3.5 shadow-sm transition-colors hover:border-[--brand] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--brand] dark:bg-muted/40"
				>
					<!--
							The soft brand wash gives each config a little identity while the
							top rule keeps the evidence-card structure crisp.
						-->
					<span
						aria-hidden="true"
						class="pointer-events-none absolute inset-0 bg-[--brand] opacity-0 transition-opacity duration-200 group-hover/card:opacity-[0.14]"
					></span>
					<span
						aria-hidden="true"
						class="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[--brand]"
					></span>

					<!--
							The plate stays light in both themes: the wordmarks are
							dark-on-transparent and would vanish on a dark card.
						-->
					<span
						class="relative flex h-9 w-full items-center justify-center rounded-lg bg-white px-3 ring-1 ring-black/[0.06] dark:ring-white/10"
					>
						{#if card.logo}
							<img
								src={card.logo}
								alt={card.name}
								class="max-h-[18px] w-auto max-w-full object-contain"
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

					<div class="relative mt-3 flex items-center justify-between gap-3">
						<span
							class="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground shadow-sm backdrop-blur"
						>
							<svelte:component this={kindIcon[card.kind]} class="h-3.5 w-3.5 text-[--brand]" />
							{card.kind}
						</span>
						<ArrowRight
							class="h-4 w-4 text-muted-foreground/50 transition-transform group-hover/card:translate-x-0.5 group-hover/card:text-foreground"
						/>
					</div>

					<!-- The adopter's own one-liner, clamped so cards stay level. -->
					<p class="relative mt-2.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
						{card.context}
					</p>

					<span
						class="relative mt-3 rounded-lg border border-border bg-background/60 p-2.5 shadow-sm backdrop-blur"
					>
						<span class="block truncate font-mono text-xs text-foreground" title={card.primary}>
							{card.primary}
						</span>
						<span
							class="mt-1 block truncate font-mono text-[11px] text-muted-foreground"
							title={card.secondary}
						>
							{card.secondary}
						</span>
					</span>
				</a>
			</li>
		{/each}
	</ul>

	<div class="mt-8 flex justify-center">
		<a
			href="/adopters"
			class="group inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
		>
			Browse all {total}
			<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
		</a>
	</div>
</Section>
