<script lang="ts">
	import type { Stats } from '$lib/types/stats';
	import Counter from './Counter.svelte';
	import BrandIcon from './BrandIcon.svelte';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import Section from './Section.svelte';

	let { stats }: { stats: Stats } = $props();

	const n = (v: number) => v.toLocaleString('en-US');
</script>

<Section id="stats" eyebrow="Distribution" title="Where Vale is downloaded">
	<!--
		The running total covers only the channels reporting an all-time figure;
		the rest count a trailing window, and adding those in would sum spans
		that aren't comparable. Said plainly under the number, since it makes
		this a floor rather than a headline.
	-->
	<div class="mb-10 text-center">
		<span
			class="block text-6xl font-semibold tabular-nums tracking-tight text-foreground sm:text-7xl"
		>
			<Counter value={stats.lifetime.value} />
		</span>
		<span class="mt-3 block text-sm text-muted-foreground">
			downloads to date, across {stats.lifetime.sources.length} channels reporting a lifetime total
		</span>
		<span class="mt-1 block text-xs text-muted-foreground/80">
			{stats.lifetime.sources.join(' · ')} — the channels below that count only a recent window aren't
			included
		</span>
	</div>

	<!-- Channels that publish download counts -->
	<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each stats.channels as channel}
			<li>
				<a
					href={channel.source}
					target="_blank"
					rel="noreferrer"
					title="{n(channel.value)} — {channel.name}, {channel.window}"
					class="group flex h-full flex-col rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-lime-500/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
				>
					<div class="flex items-start justify-between gap-3">
						<span class="flex items-center gap-2.5">
							<BrandIcon
								name={channel.name}
								slug={channel.icon}
								class="text-foreground/70 transition-colors group-hover:text-lime-600 dark:group-hover:text-lime-400"
							/>
							<span class="text-sm font-medium text-muted-foreground">{channel.name}</span>
						</span>
						<ArrowUpRight
							class="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-lime-600 dark:group-hover:text-lime-400"
						/>
					</div>
					<span
						class="mt-3 text-4xl font-semibold tabular-nums tracking-tight text-foreground sm:text-5xl"
					>
						<Counter value={channel.value} />
					</span>
					<span class="mt-2 text-xs text-muted-foreground">
						downloads · {channel.window}{channel.note ? ` · ${channel.note}` : ''}
					</span>
				</a>
			</li>
		{/each}
	</ul>

	<!-- Channels that publish no download numbers, so they're listed by version -->
	<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
		<span class="text-sm text-muted-foreground">Also ships on</span>
		{#each stats.availability as channel}
			<a
				href={channel.source}
				target="_blank"
				rel="noreferrer"
				class="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm transition-colors hover:border-lime-500/40 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
			>
				<BrandIcon
					name={channel.name}
					slug={channel.icon}
					class="h-4 w-4 text-foreground/70 transition-colors group-hover:text-lime-600 dark:group-hover:text-lime-400"
				/>
				<span class="font-medium text-foreground">{channel.name}</span>
				<span class="text-xs text-muted-foreground">{channel.detail}</span>
			</a>
		{/each}
	</div>

	<p class="mt-8 text-center text-xs text-muted-foreground">
		Sources: GitHub, Docker Hub, PyPI, conda-forge, Homebrew, Chocolatey, winstall, Snapcraft, and
		Repology · {stats.contributors} contributors · updated {stats.updated}
	</p>
</Section>
