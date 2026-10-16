<script lang="ts">
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import Award from 'lucide-svelte/icons/award';
	import HeartHandshake from 'lucide-svelte/icons/heart-handshake';
	import Landmark from 'lucide-svelte/icons/landmark';
	import Section from './Section.svelte';

	// Awards and grants only. The two funding channels used to sit in this grid
	// as well, which put "here is who recognized Vale" and "here is how to pay
	// for it" in one row of identical cards; the header and the backer wall each
	// make the ask better than a card could.
	// The largest grant leads; the rest follow in a row beneath it.
	const featured = {
		eyebrow: 'FLOSS/fund · 2025',
		title: '$10,000 grant',
		context:
			'One of 29 projects in the second 2025 tranche, alongside FFmpeg, Zig, Wireshark, and Blender.',
		url: 'https://floss.fund/blog/second-tranche-2025-anniversary/'
	};

	const highlights = [
		{
			icon: Award,
			eyebrow: 'Google Open Source',
			title: 'Open Source Peer Bonus',
			context: 'Peer Bonus award, 2023.',
			url: 'https://opensource.googleblog.com/2023/05/google-open-source-peer-bonus-program-announces-first-group-of-winners-2023.html'
		},
		{
			icon: HeartHandshake,
			eyebrow: 'Appwrite OSS Fund',
			title: 'OSS Fund recipient',
			context: 'Alongside Algolia, MongoDB, and Fastly.',
			url: 'https://dev.to/appwrite/appwrite-oss-fund-sponsors-vale-4oig'
		}
	];
</script>

<Section
	id="support"
	eyebrow="Recognition"
	title="Grants &amp; Awards"
	lede="Programs that have funded the project or named it as work worth funding."
>
	<a
		href={featured.url}
		target="_blank"
		rel="noreferrer"
		class="group relative mb-5 flex flex-col gap-6 overflow-hidden rounded-2xl border border-lime-500/40 bg-card p-7 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-lime-500/70 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 sm:flex-row sm:items-center sm:p-8"
	>
		<span
			aria-hidden="true"
			class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-lime-500/70 to-transparent"
		></span>
		<span
			class="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-lime-500/10 text-lime-600 dark:text-lime-400"
		>
			<Landmark class="h-7 w-7" />
		</span>
		<span class="flex-1">
			<span class="block text-sm font-medium text-muted-foreground">{featured.eyebrow}</span>
			<span class="mt-1 block text-2xl font-semibold tracking-tight sm:text-3xl"
				>{featured.title}</span
			>
			<span class="mt-2 block max-w-2xl text-pretty text-sm leading-6 text-muted-foreground"
				>{featured.context}</span
			>
		</span>
		<ArrowUpRight
			class="h-5 w-5 shrink-0 self-start text-muted-foreground/50 transition-colors group-hover:text-lime-600 dark:group-hover:text-lime-400 sm:self-center"
		/>
	</a>

	<div class="grid gap-5 md:grid-cols-2">
		{#each highlights as item}
			{@const Icon = item.icon}
			<a
				href={item.url}
				target="_blank"
				rel="noreferrer"
				class="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all duration-200 hover:-translate-y-0.5 hover:border-lime-500/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
			>
				<!-- The same top rule the sponsor cards use, so the two grids on this
				     page read as one family. -->
				<span
					aria-hidden="true"
					class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-lime-500/50 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
				></span>

				<div class="flex items-start justify-between gap-3">
					<span
						class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-lime-500/10 text-lime-600 dark:text-lime-400"
					>
						<Icon class="h-5 w-5" />
					</span>
					<ArrowUpRight
						class="mt-1 h-4 w-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-lime-600 dark:group-hover:text-lime-400"
					/>
				</div>

				<p class="mt-5 text-sm font-medium text-muted-foreground">{item.eyebrow}</p>
				<h3 class="mt-1 text-xl font-semibold tracking-tight">{item.title}</h3>
				<p class="mt-3 text-sm leading-6 text-muted-foreground">{item.context}</p>
			</a>
		{/each}
	</div>
</Section>
