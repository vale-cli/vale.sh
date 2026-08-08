<script lang="ts">
	import BrandIcon from './BrandIcon.svelte';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import Section from './Section.svelte';

	// Hosting providers, kept separate from the grants and sponsors above.
	//
	// Each card carries the provider's own brand colour. `fg` is set per brand
	// rather than computed — GitBook's pale blue needs a dark glyph, DigitalOcean's
	// blue a white one.
	const providers = [
		{
			name: 'GitBook',
			icon: 'gitbook',
			brand: '#BBDDE5',
			fg: '#12303A',
			powers: 'docs.vale.sh',
			home: 'https://www.gitbook.com',
			program: 'Community plan',
			programUrl: 'https://gitbook.com/docs/account-management/plans/community'
		},
		{
			name: 'DigitalOcean',
			icon: 'digitalocean',
			brand: '#0080FF',
			fg: '#FFFFFF',
			powers: 'Vale Studio',
			home: 'https://www.digitalocean.com',
			program: 'Open-source credits',
			programUrl: 'https://www.digitalocean.com/open-source'
		}
	];
</script>

<Section id="thanks" eyebrow="Infrastructure" title="Special thanks to">
	<div class="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
		{#each providers as provider}
			<!-- A div, not an anchor: the card holds two separate links. -->
			<div
				style="--brand: {provider.brand}; --brand-fg: {provider.fg};"
				class="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-colors duration-200 hover:border-[--brand]"
			>
				<span
					aria-hidden="true"
					class="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[--brand] to-transparent opacity-[0.07] transition-opacity duration-200 group-hover:opacity-[0.14]"
				></span>

				<div class="relative flex items-center gap-3">
					<span
						class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
						style="background-color: var(--brand); color: var(--brand-fg);"
					>
						<BrandIcon name={provider.name} slug={provider.icon} />
					</span>
					<div>
						<a
							href={provider.home}
							target="_blank"
							rel="noreferrer"
							class="group/name -my-1.5 inline-flex items-center gap-1 py-1.5 text-lg font-semibold tracking-tight hover:text-[--brand] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--brand]"
						>
							{provider.name}
							<ArrowUpRight
								class="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover/name:translate-x-0.5"
							/>
						</a>
						<p class="text-sm text-muted-foreground">hosts {provider.powers}</p>
					</div>
				</div>

				<a
					href={provider.programUrl}
					target="_blank"
					rel="noreferrer"
					class="relative mt-2 inline-flex w-fit items-center gap-1 py-2.5 text-sm font-medium text-muted-foreground hover:text-[--brand] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--brand]"
				>
					{provider.program}
					<ArrowUpRight class="h-3.5 w-3.5" />
				</a>
			</div>
		{/each}
	</div>
</Section>
