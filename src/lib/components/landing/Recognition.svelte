<script lang="ts">
	import type { Stats } from '$lib/types/stats';
	import { siteConfig } from '$lib/config/site.js';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import Award from 'lucide-svelte/icons/award';
	import HeartHandshake from 'lucide-svelte/icons/heart-handshake';
	import Landmark from 'lucide-svelte/icons/landmark';
	import Heart from 'lucide-svelte/icons/heart';
	import Users from 'lucide-svelte/icons/users';
	import Section from './Section.svelte';

	let { stats }: { stats: Stats } = $props();

	const highlights = $derived([
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
		},
		{
			icon: Users,
			eyebrow: 'Open Collective',
			title: `${stats.funding.backers} backers`,
			context: `$${stats.funding.yearlyIncome.toLocaleString('en-US')} a year. Every expense is public.`,
			url: siteConfig.links.openCollective
		},
		{
			icon: Heart,
			eyebrow: 'GitHub Sponsors',
			title: 'Sponsor the maintainer',
			context: 'Recurring sponsorship, billed by GitHub.',
			url: siteConfig.links.sponsors
		}
	]);

	// Open Collective's SVG embeds are transparent, so they work in both themes.
	const embeds = [
		{
			label: 'Organizations',
			src: 'https://opencollective.com/vale/organizations.svg?width=880&button=false'
		},
		{
			label: 'Individuals',
			src: 'https://opencollective.com/vale/individuals.svg?width=880&button=false'
		}
	];
</script>

<Section id="support" eyebrow="Supporters" title="Grants, awards, and sponsors">
	<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
		{#each highlights as item}
			{@const Icon = item.icon}
			<a
				href={item.url}
				target="_blank"
				rel="noreferrer"
				class="group flex flex-col rounded-2xl border border-border bg-card p-7 transition-all duration-200 hover:-translate-y-0.5 hover:border-lime-500/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
			>
				<span
					class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-lime-500/10 text-lime-500"
				>
					<Icon class="h-5 w-5" />
				</span>
				<p class="mt-5 text-sm font-medium text-muted-foreground">{item.eyebrow}</p>
				<div class="mt-1 flex items-start justify-between gap-3">
					<h3 class="text-lg font-semibold tracking-tight">{item.title}</h3>
					<ArrowUpRight
						class="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-lime-500"
					/>
				</div>
				<p class="mt-3 text-sm leading-6 text-muted-foreground">{item.context}</p>
			</a>
		{/each}
	</div>

	<!-- Live backer walls from Open Collective -->
	<div class="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-8">
		{#each embeds as embed}
			<a
				href={siteConfig.links.openCollective}
				target="_blank"
				rel="noreferrer"
				class="block w-full"
				aria-label="Vale {embed.label} on Open Collective"
			>
				<img
					src={embed.src}
					alt="Vale {embed.label.toLowerCase()} on Open Collective"
					class="mx-auto w-full"
					loading="lazy"
				/>
			</a>
		{/each}
	</div>
</Section>
