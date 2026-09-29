<script lang="ts">
	import Section from '$lib/components/landing/Section.svelte';
	import { siteConfig } from '$lib/config/site.js';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';

	// The two routes a company can pay through, in the order most take.
	const routes = [
		{
			name: 'Open Collective',
			detail:
				'Sends invoices and receipts, and takes cards and bank transfers. The easiest route for procurement.',
			href: siteConfig.links.openCollective,
			cta: 'opencollective.com/vale'
		},
		{
			name: 'GitHub Sponsors',
			detail: "Bills through your organization's GitHub account, as a one-time payment.",
			href: siteConfig.links.sponsors,
			cta: 'github.com/sponsors/jdkato'
		}
	];
</script>

<Section
	id="invoice"
	eyebrow="Paying as a company"
	title="One payment, with an invoice"
	lede="Every level is a one-time payment, with a receipt or an invoice for your records."
>
	<div class="grid gap-4 sm:grid-cols-2">
		{#each routes as route (route.name)}
			<div class="flex flex-col rounded-xl border border-border/60 bg-card p-5">
				<p class="text-sm font-medium text-foreground">{route.name}</p>
				<p class="mt-2 grow text-sm leading-6 text-muted-foreground">{route.detail}</p>
				<a
					href={route.href}
					target="_blank"
					rel="noreferrer"
					class="mt-4 inline-flex items-center gap-1 self-start text-sm font-medium text-lime-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 dark:text-lime-400"
				>
					{route.cta}
					<ArrowUpRight class="h-3.5 w-3.5" />
				</a>
			</div>
		{/each}
	</div>
</Section>
