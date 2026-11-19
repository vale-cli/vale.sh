<script lang="ts">
	import type { Stats } from '$lib/types/stats';
	import BrandIcon from './BrandIcon.svelte';
	import { brandColors } from '$lib/data/brand-icons';
	import Section from './Section.svelte';

	let { stats }: { stats: Stats } = $props();

	const n = (v: number) => v.toLocaleString('en-US');

	/*
		One chip per registry. The registries count different windows --
		GitHub and Docker report lifetime totals, Homebrew a trailing year,
		PyPI six months -- so each chip names its own window and nothing here
		sums them; the lifetime total is the hero's figure. The channels that
		publish no count at all follow, listed by version instead.
	*/
	const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
	const chip =
		'group inline-flex items-baseline gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm transition-colors hover:border-lime-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500';
	// A mark takes its brand color where it has one; the rest stay neutral.
	const brand = (slug?: string) => (slug ? brandColors[slug] : undefined);
	const glyph = (slug?: string) => (brand(slug) ? 'text-[--brand]' : 'text-foreground/80');
</script>

<Section
	editorial
	id="stats"
	eyebrow="Distribution"
	accent
	title="Where Vale is downloaded"
	lede="Each registry counts a different window, so they sit side by side here rather than in one total."
>
	<ul class="flex flex-wrap gap-2">
		{#each stats.channels as channel (channel.name)}
			<li>
				<a
					href={channel.source}
					target="_blank"
					rel="noreferrer"
					title="{n(channel.value)} {channel.unit ??
						'downloads'} — {channel.name}, {channel.window}{channel.note
						? `, ${channel.note}`
						: ''}"
					style={brand(channel.icon) ? `--brand: ${brand(channel.icon)}` : undefined}
					class={chip}
				>
					<BrandIcon
						name={channel.name}
						slug={channel.icon}
						size="h-4 w-4"
						class="self-center {glyph(channel.icon)}"
					/>
					<span class="font-medium text-foreground">{channel.name}</span>
					<span class="font-mono font-medium tabular-nums text-foreground"
						>{compact.format(channel.value)}</span
					>
					<!-- The section counts downloads; a chip counting something else says so. -->
					<span class="text-xs text-muted-foreground"
						>{channel.unit ? `${channel.unit} · ` : ''}{channel.window}</span
					>
				</a>
			</li>
		{/each}
		<!-- The channels that publish no count, listed by what they do publish. -->
		{#each stats.availability as channel (channel.name)}
			<li>
				<a
					href={channel.source}
					target="_blank"
					rel="noreferrer"
					style={brand(channel.icon) ? `--brand: ${brand(channel.icon)}` : undefined}
					class="{chip} border-dashed bg-transparent"
				>
					<BrandIcon
						name={channel.name}
						slug={channel.icon}
						size="h-4 w-4"
						class="self-center {glyph(channel.icon)}"
					/>
					<span class="font-medium text-foreground">{channel.name}</span>
					<span class="font-mono text-xs text-muted-foreground">{channel.detail}</span>
				</a>
			</li>
		{/each}
	</ul>

	<p class="mt-6 text-xs leading-6 text-muted-foreground">
		Sources: GitHub, Docker Hub, PyPI, npm, conda-forge, Homebrew, Chocolatey, WinGet, Snapcraft,
		and Repology · updated {stats.updated}
	</p>
</Section>
