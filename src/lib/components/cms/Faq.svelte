<script lang="ts">
	// The objections a Vale user actually raises, answered without hedging. Every
	// answer here is checked against the product, not aspirational:
	//   - free tier and read-only behavior: canEdit() in the CMS repo
	//   - Team withdrawn, Site by email domain: valed's siteTier/checkoutProductID
	//   - one-month trial: Polar trial_interval on both Pro and Site
	//   - no enforcement claim: enforcement stays with the CLI, by design
	// If one of these stops being true, it is a lie on a pricing page. Fix it here
	// the same day.
	const faqs = [
		{
			q: 'Do I need Vale CMS to use Vale?',
			a: 'No, and that is deliberate. Vale is MIT licensed and always will be — the CLI, the engine, the styles. Vale CMS is a hosted place to author the project and an MCP server for your assistant. Everything it writes is ordinary files in your repository that the free CLI reads.'
		},
		{
			q: 'Does it replace Vale in my CI?',
			a: 'No. Enforcement stays with the Vale CLI on your own runners, where it belongs. Vale CMS is where rules get written and proved before they get there, so CI stops being the place you discover a rule never compiled.'
		},
		{
			q: 'What happens to my work if I cancel?',
			a: 'Nothing. Your style guide lives in your Git repository the whole time — there is no second copy on our side to export, and no format only we can read. Cancelling costs you the editor and the MCP server, not your project.'
		},
		{
			q: 'Can my assistant use it without me?',
			a: 'On a Site license, yes. Entitlement resolves by the email domain on the subscription, so an account your CI or an agent signs in as is covered like any colleague. On Pro the MCP token is tied to you personally.'
		},
		{
			q: 'What can I do without paying?',
			a: 'Open your own folders and zips, lint them against the real engine, and read the full sample project. It is read-only until you subscribe — editing, Git, and MCP are the paid parts.'
		},
		{
			q: 'Is there a Team plan?',
			a: 'Not any more. Per-seat pricing meant counting who was allowed to write a rule, which is a strange thing to meter on a docs team — and it left automated accounts with no seat to hold. Site covers everyone at your domain instead, for a flat $1,000 a year.'
		}
	];
</script>

<section id="faq" class="scroll-mt-20 border-b border-border/60 bg-muted/30 py-16 sm:py-20">
	<div class="mx-auto max-w-6xl px-6 lg:px-8">
		<div class="max-w-2xl">
			<h2 class="text-base font-semibold text-lime-600 dark:text-lime-400">Before you ask</h2>
			<p class="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
				The questions we'd ask too
			</p>
		</div>

		<dl class="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2">
			{#each faqs as faq (faq.q)}
				<div>
					<dt class="text-base font-semibold">{faq.q}</dt>
					<dd class="mt-2 text-pretty text-sm leading-6 text-muted-foreground">{faq.a}</dd>
				</div>
			{/each}
		</dl>
	</div>
</section>
