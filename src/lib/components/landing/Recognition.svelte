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
	const highlights = [
		{
			icon: Award,
			eyebrow: 'Google Open Source',
			title: 'Open Source Peer Bonus',
			context: 'Peer Bonus award, 2023.',
			url: 'https://opensource.googleblog.com/2023/05/google-open-source-peer-bonus-program-announces-first-group-of-winners-2023.html'
		},
		{
			icon: Landmark,
			eyebrow: 'FLOSS.fund',
			title: '$10,000 grant',
			context: 'Second tranche, alongside FFmpeg, Zig, Wireshark, and Blender.',
			url: 'https://floss.fund/blog/second-tranche-2025-anniversary/'
		},
		{
			icon: HeartHandshake,
			eyebrow: 'Appwrite OSS Fund',
			title: 'OSS Fund recipient',
			context: 'Alongside Algolia, MongoDB, Fastly, and DigitalOcean.',
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
	<!-- Three items, so three columns from `md` up rather than a 2 + 1 orphan. -->
	<div class="grid gap-5 md:grid-cols-3">
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
