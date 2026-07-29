<script lang="ts">
	import Check from 'lucide-svelte/icons/check';

	// Every figure here is confirmed against the live Polar catalogue (Vale Labs
	// org), not against the docs: Pro $19/mo or $180/yr, Team $25/seat/mo or
	// $240/seat/yr, and a one-month trial on both. Polar's trial is configured as
	// `trial_interval: month`, so the copy says "1 month" rather than "30 days".
	let annual = $state(false);

	const tiers = [
		{
			name: 'Free',
			monthly: '$0',
			annual: '$0',
			unit: '',
			note: 'free forever',
			who: 'A real linting tool, in the browser, with no account.',
			// Do not add the BYOK AI assistant to this list. It is gated off in the
			// product and the CMS terms say it is switched off.
			//
			// Lead with opening your own files. An earlier order led with "browse the
			// sample, read-only", which reads as a demo — but this tier lints your
			// actual project against the real engine for free, and that is the top of
			// the funnel.
			features: [
				'Open your own folders and zips',
				'Live linting against the real engine',
				'Browse the full sample project, read-only'
			],
			cta: 'Open it, no signup',
			featured: false,
			trial: ''
		},
		{
			name: 'Pro',
			monthly: '$19',
			annual: '$15',
			unit: '/ month',
			note: '$180 billed yearly · 21% off',
			who: 'The full editor and your own repositories, for one person.',
			features: [
				'Full editor — rules, vocab, dictionaries, filters, views, templates',
				'Edit and ship GitHub or GitLab repos — commit, open pull requests',
				'Hosted MCP server for every client',
				'Discord support'
			],
			cta: 'Start free trial',
			featured: true,
			trial: '1 month free · cancel anytime'
		},
		{
			name: 'Team',
			monthly: '$25',
			annual: '$20',
			unit: '/ seat / month',
			note: '$240 per seat, billed yearly · 20% off',
			// Honest by design: Pro and Team unlock exactly the same product. Team
			// sells billing and support, not capability — do not imply otherwise.
			who: 'Everything in Pro, per seat, on one invoice.',
			features: [
				'Everything in Pro, for each seat',
				'One subscription, admin-assigned seats',
				'Priority support — private Discord channel'
			],
			cta: 'Start free trial',
			featured: false,
			trial: '1 month free · cancel anytime'
		}
	];
</script>

<section id="pricing" class="scroll-mt-20 border-b border-border/60 bg-muted/30 py-16 sm:py-20">
	<div class="mx-auto max-w-6xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-base font-semibold text-lime-500">Pricing</h2>
			<p class="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
				Explore free. Author on Pro.
			</p>
			<p class="mt-5 text-pretty text-lg leading-8 text-muted-foreground">
				Vale stays free and open source. Vale CMS is the hosted authoring layer on top of it.
			</p>
		</div>

		<div class="mt-10 flex flex-wrap items-center justify-center gap-3">
			<div
				class="inline-flex rounded-xl border border-border/60 bg-background p-1"
				role="group"
				aria-label="Billing period"
			>
				<button
					type="button"
					onclick={() => (annual = false)}
					aria-pressed={!annual}
					class="rounded-lg px-4 py-1.5 text-sm transition-colors {!annual
						? 'bg-lime-500/15 font-semibold text-lime-700 dark:text-lime-400'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					Pay monthly
				</button>
				<button
					type="button"
					onclick={() => (annual = true)}
					aria-pressed={annual}
					class="rounded-lg px-4 py-1.5 text-sm transition-colors {annual
						? 'bg-lime-500/15 font-semibold text-lime-700 dark:text-lime-400'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					Pay yearly
				</button>
			</div>
			<span
				class="rounded-md bg-lime-500/10 px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-lime-600 dark:text-lime-400"
			>
				2 months free
			</span>
		</div>

		<div class="mt-8 grid items-start gap-5 sm:grid-cols-3">
			{#each tiers as tier (tier.name)}
				<div
					class="flex flex-col rounded-2xl border bg-card p-6 {tier.featured
						? 'border-lime-500 ring-1 ring-lime-500'
						: 'border-border/60'}"
				>
					{#if tier.featured}
						<span
							class="mb-2 self-start rounded-md bg-lime-500/10 px-2 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-wider text-lime-600 dark:text-lime-400"
						>
							Most popular
						</span>
					{/if}

					<div class="text-xl font-semibold">{tier.name}</div>

					<div class="mt-3 flex items-baseline gap-1.5">
						<span class="text-4xl font-semibold tabular-nums tracking-tight">
							{annual ? tier.annual : tier.monthly}
						</span>
						{#if tier.unit}
							<span class="text-sm text-muted-foreground">{tier.unit}</span>
						{/if}
					</div>
					<div
						class="mt-1 min-h-[1.25rem] text-xs {annual && tier.featured
							? 'text-lime-600 dark:text-lime-400'
							: 'text-muted-foreground'}"
					>
						{tier.name === 'Free' ? tier.note : annual ? tier.note : 'billed monthly'}
					</div>

					<p class="mt-3 min-h-[2.5rem] text-sm text-muted-foreground">{tier.who}</p>

					<ul class="mb-6 mt-5 flex flex-col gap-3">
						{#each tier.features as feature (feature)}
							<li class="flex items-start gap-2.5 text-sm leading-6">
								<Check class="mt-1 size-4 shrink-0 text-lime-500" />
								<span>{feature}</span>
							</li>
						{/each}
					</ul>

					<a
						href="https://cms.vale.sh"
						class="mt-auto inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors {tier.featured
							? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
							: 'border border-border bg-background text-foreground hover:bg-muted/60'}"
					>
						{tier.cta}
					</a>
					{#if tier.trial}
						<div class="mt-2.5 text-center text-xs text-muted-foreground">{tier.trial}</div>
					{/if}
				</div>
			{/each}
		</div>

		<p class="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground">
			Pro and Team unlock the same product. Team buys one invoice instead of many, seats an admin
			can assign and revoke, and a priority support channel.
		</p>
	</div>
</section>
