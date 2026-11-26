<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import { siteConfig } from '$lib/config/site.js';
	import { contact } from '$lib/data/sponsor-tiers';
	import adopters from '$lib/data/adopters.json';
	import {
		asOf,
		issues,
		commits,
		funding,
		received,
		perYear,
		downloadsPerDay,
		docsPages,
		peers,
		modelReview,
		aiPhrasing,
		type Channel
	} from '$lib/data/sponsor-why';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import type { PageData } from './$types';

	/**
	 * The case for sponsoring Vale: the page the outreach emails link to, for
	 * whoever a docs lead forwards it to. It follows the email's order: who
	 * maintains Vale; who uses it; the scope of the work and what it has been
	 * paid; why it matters now; then the ways to support it, which live on
	 * /sponsor. The tone is the email's too: an invitation, not a bill.
	 */
	let { data }: { data: PageData } = $props();

	const description =
		'Who maintains Vale, who uses it, what the work involves, and the ways a team can support it.';

	const n = (v: number) => v.toLocaleString('en-US');
	const millions = (v: number) => `${(v / 1e6).toFixed(1)}M`;
	const usd = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`;
	const day = (iso: string) =>
		new Date(iso).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			timeZone: 'UTC'
		});

	// ── Who uses it ────────────────────────────────────────────────────────────
	const teams = adopters.length;
	const sectors = new Set(adopters.map((a) => a.category)).size;

	// Vale's own downloads, live, by the same rule as the peers: the channels
	// that ship their own build. PyPI and npm fetch the GitHub release.
	const live = (name: string) => data.stats.channels.find((c) => c.name === name)?.value ?? 0;
	const vale = {
		id: 'vale',
		name: 'Vale',
		kind: 'Docs linter',
		channels: {
			github: live('GitHub Releases'),
			docker: live('Docker Hub'),
			conda: live('conda-forge')
		} as Partial<Record<Channel, number>>
	};
	const tools = [...peers, vale]
		.map((t) => ({ ...t, total: Object.values(t.channels).reduce((s, v) => s + (v ?? 0), 0) }))
		.sort((a, b) => b.total - a.total);
	const valeTotal = tools.find((t) => t.id === 'vale')!.total;
	const valeIndex = tools.findIndex((t) => t.id === 'vale');
	const peak = tools[0].total;

	const channelNames: Record<Channel, string> = {
		github: 'GitHub',
		docker: 'Docker',
		conda: 'conda-forge'
	};
	// Tailwind classes, spelled out so the scan finds them.
	const channelColors: Record<Channel, string> = {
		github: 'bg-sky-500',
		docker: 'bg-emerald-500',
		conda: 'bg-violet-500'
	};
	const channels: Channel[] = ['github', 'docker', 'conda'];

	const brew = $derived(data.stats.ranking.brew);
	// One decimal, never rounded in Vale's favor.
	const topPct = $derived(Math.ceil((brew.rank / brew.of) * 1000) / 10);

	// ── The work, by year ──────────────────────────────────────────────────────
	const years = Object.keys(perYear).sort();
	const firstYear = years[0];
	const yearsMaintained = new Date(asOf).getFullYear() - Number(firstYear);
	const releasesTotal = years.reduce((s, y) => s + perYear[y].releases, 0);
	const releasesFloor = Math.floor(releasesTotal / 50) * 50;
	const releasesThisYearFloor = Math.floor(perYear[years[years.length - 1]].releases / 10) * 10;
	const incomingGrowth = Math.round(
		perYear[years[years.length - 1]].incoming / perYear[firstYear].incoming
	);
	const rows = (
		[
			['releases', 'Releases'],
			['commits', 'My commits'],
			['incoming', 'Issues and PRs from users'],
			['money', 'Money received']
		] as const
	).map(([key, label]) => ({
		key,
		label,
		peak: Math.max(...years.map((y) => perYear[y][key])),
		fmt: (v: number) =>
			key !== 'money'
				? String(v)
				: v === 0
					? '$0'
					: v >= 1000
						? `$${(v / 1000).toFixed(1)}k`
						: usd(v)
	}));

	// ── What it has been paid ──────────────────────────────────────────────────
	const yearlyNow = $derived(data.stats.funding.yearlyIncome + funding.githubMonthly * 12);
	const perHour = received / funding.days / funding.hoursPerDay;

	// ── Why it matters now ─────────────────────────────────────────────────────
	// Downloads a day, live by the same rule /stats.json publishes: releases
	// from the past year, over 365. The snapshot stands in if the walk failed.
	const yearAgo = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10);
	const perDay = $derived(
		data.stats.releases.length
			? Math.round(
					data.stats.releases
						.filter((r) => r.date >= yearAgo)
						.reduce((s, r) => s + r.downloads, 0) / 365
				)
			: downloadsPerDay
	);
	const reviewCost = (p: number) => (modelReview.tokens * p) / 1e6;
	const valueLow = $derived(
		Math.round((perDay * 365 * reviewCost(modelReview.price.low)) / 1e4) * 1e4
	);

	// ── What Vale checks ───────────────────────────────────────────────────────
	const uses = [
		{
			name: 'House style',
			line: "your style guide as tested rules, or Microsoft's, Google's, or Red Hat's",
			href: '/blog/case-study-epic-lore'
		},
		{
			name: 'Plain language',
			line: 'words to avoid, readability, and inclusive terms',
			href: '/blog/case-study-gov-uk'
		},
		{
			name: 'Spelling and terms',
			line: 'spell checking that understands markup, and vocabularies for product names',
			href: '/blog/case-study-rubin-observatory'
		},
		{
			name: 'Agent instructions',
			line: 'the rules in AGENTS.md and CLAUDE.md, enforced in hooks and CI',
			href: '/blog/onboard'
		},
		{
			name: 'Model voices',
			line: 'AI writing styles as rules instead of prompts',
			href: '/blog/voices'
		},
		{ name: 'AI tells', line: 'the phrasing typical of AI-written text', href: aiPhrasing.href },
		{ name: 'API specs', line: 'the prose in OpenAPI files', href: '/blog/openapi' },
		{
			name: 'Code comments',
			line: 'comments and docstrings, in the same style as the docs',
			href: '/features/code'
		},
		{
			name: 'Commit messages',
			line: 'commitlint and gitlint conventions, from a 12 ms hook',
			href: '/blog/commits'
		},
		{
			name: 'Manuscripts',
			line: 'journal author guidelines and reporting checklists',
			href: '/blog/journals'
		},
		{
			name: 'Docs structure',
			line: 'each page checked against its Diátaxis type',
			href: '/blog/diataxis'
		}
	];

	const strip = [
		{ k: 'Years maintained', v: String(yearsMaintained) },
		{ k: 'Teams using it', v: n(teams) },
		{ k: 'Downloads', v: millions(valeTotal) },
		{ k: 'Issues from users, closed', v: `${issues.closedPct}%`, hl: true }
	];

	const link =
		'font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-lime-500';
</script>

<MetaTags
	title="Why sponsor Vale"
	{description}
	canonical="https://vale.sh/sponsor/why"
	openGraph={{
		url: 'https://vale.sh/sponsor/why',
		title: 'Why sponsor Vale',
		description
	}}
/>

<!-- Header, matching /sponsor's frame. -->
<section class="relative overflow-hidden border-b border-border/60">
	<div
		class="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(hsl(var(--foreground)/0.05)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_60%,transparent_100%)]"
	></div>
	<div class="mx-auto max-w-3xl px-6 py-16 lg:px-8">
		<p class="text-base font-semibold text-lime-600 dark:text-lime-400">
			<a href="/sponsor" class="hover:underline">Support</a> · Why sponsor
		</p>
		<h1 class="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
			Supporting Vale
		</h1>
		<p class="mt-6 text-pretty text-lg leading-8 text-muted-foreground">
			I'm Joseph Kato. I created Vale, the open-source prose linter, in {firstYear}, and I've
			maintained it almost entirely on my own ever since. Teams at {n(teams)} organizations use it, and
			most of my time on it goes to them: answering issues, reviewing pull requests, helping with configurations,
			and shipping fixes. This page explains that work and the ways a team that relies on Vale can support
			it.
		</p>

		<!-- The page in four numbers, for anyone who reads nothing else. -->
		<dl class="mt-10 grid grid-cols-2 border-y border-border/60 sm:grid-cols-4">
			{#each strip as s (s.k)}
				<div class="flex flex-col-reverse py-4 pr-3">
					<dt class="text-xs text-muted-foreground">{s.k}</dt>
					<dd
						class="text-3xl font-semibold tabular-nums tracking-tight {s.hl
							? 'text-lime-600 dark:text-lime-400'
							: ''}"
					>
						{s.v}
					</dd>
				</div>
			{/each}
		</dl>
	</div>
</section>

<div class="mx-auto max-w-3xl px-6 pb-24 lg:px-8">
	<!-- 1. Who maintains it. -->
	<section class="mt-16">
		<p class="kicker">1 · Who maintains it</p>
		<h2 class="text-2xl font-semibold tracking-tight">
			One maintainer, since {firstYear}, and still shipping
		</h2>
		<p class="mt-5 leading-7">
			I wrote {n(commits.mine)} of Vale's {n(commits.total)} commits and have shipped more than {releasesFloor}
			releases, more than {releasesThisYearFloor} of them this year. No company employs anyone to work
			on it. Thoughtworks' Technology Radar
			<a class={link} href="https://www.thoughtworks.com/radar/tools/vale"
				>listed Vale in November 2026</a
			>, and noted that it "depends largely on one maintainer."
		</p>
		<h3 class="mt-8 font-semibold">What Vale checks</h3>
		<ul class="mt-3 grid gap-x-6 gap-y-1.5 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
			{#each uses as u (u.name)}
				<li><a class={link} href={u.href}>{u.name}</a>: {u.line}</li>
			{/each}
		</ul>
		<p class="mt-3 text-sm text-muted-foreground">
			In Markdown, MDX, AsciiDoc, reStructuredText, DITA, HTML, XML, Typst, LaTeX, Jupyter, and
			source code.
		</p>
	</section>

	<!-- 2. Who uses it. -->
	<section class="mt-16">
		<p class="kicker">2 · Who uses it</p>
		<h2 class="text-2xl font-semibold tracking-tight">
			{n(teams)} organizations, and {millions(valeTotal)} downloads
		</h2>
		<p class="mt-5 leading-7">
			Teams in {sectors} sectors run Vale on {n(docsPages)} docs pages. They include teams at GitLab,
			Microsoft, Red Hat, Datadog, and NVIDIA; at GOV.UK, NASA, and the U.S. Air Force's Platform One;
			and research projects such as OpenSAFELY. See them all in the
			<a class={link} href="/adopters">adopters directory</a>. Vale is also the subject of a
			Pragmatic Bookshelf book.
		</p>
		<p class="mt-5 text-sm text-muted-foreground">
			All-time downloads beside well-known developer tools that ship the same way: #{valeIndex + 1}
			of these {tools.length}, and #{brew.rank} of {n(brew.of)} Homebrew formulae, the top {topPct}%.
		</p>
		<div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
			{#each channels as ch (ch)}
				<span class="inline-flex items-center gap-1.5"
					><i class="inline-block h-2.5 w-2.5 rounded-sm {channelColors[ch]}"></i>{channelNames[
						ch
					]}</span
				>
			{/each}
		</div>
		<ol class="mt-3 space-y-1" aria-label="All-time downloads by channel">
			{#each tools as t (t.id)}
				<li
					class="grid grid-cols-[6.5rem_1fr] items-center gap-3 rounded text-[13px] sm:grid-cols-[7rem_9rem_1fr] {t.id ===
					'vale'
						? '-mx-2 bg-lime-500/10 px-2 font-semibold'
						: ''}"
				>
					<span>{t.name}</span>
					<span class="hidden text-xs font-normal text-muted-foreground sm:inline">{t.kind}</span>
					<span class="flex min-w-0 items-center gap-2">
						<span
							class="flex h-3.5 overflow-hidden rounded-sm"
							style:width="{(t.total / peak) * 100}%"
						>
							{#each channels as ch (ch)}
								{#if t.channels[ch]}
									<span
										class="h-full {channelColors[ch]}"
										style:width="{((t.channels[ch] ?? 0) / t.total) * 100}%"
										title="{channelNames[ch]}: {n(t.channels[ch] ?? 0)}"
									></span>
								{/if}
							{/each}
						</span>
						<span class="flex-none text-xs tabular-nums">{millions(t.total)}</span>
					</span>
				</li>
			{/each}
		</ol>
		<p class="mt-6 text-sm text-muted-foreground">
			Who already funds it, from companies to foundations and infrastructure donors, is on
			<a class={link} href="/sponsor">the support page</a>.
		</p>
	</section>

	<!-- 3. The scope of the work, and what it has been paid. -->
	<section class="mt-16">
		<p class="kicker">3 · The work</p>
		<h2 class="text-2xl font-semibold tracking-tight">Most of it is support, and it's growing</h2>
		<p class="mt-5 leading-7">
			Vale is downloaded about {n(Math.round(perDay / 1000) * 1000)} times a day, mostly by CI pipelines.
			Behind that are the people who use it, and their questions, bug reports, and pull requests are
			where the time goes.
		</p>
		<dl
			class="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60 sm:grid-cols-4"
		>
			{#each [[n(issues.fromOthers), `Issues and pull requests from users since ${firstYear}`], [`${issues.closedPct}%`, 'Closed'], [`${issues.medianCloseDays} days`, 'Median time to close'], [String(issues.openNow), 'Open today']] as [v, k], i (k)}
				<div class="flex flex-col gap-1 bg-background p-4">
					<dd
						class="text-2xl font-semibold tabular-nums tracking-tight {i === 1
							? 'text-lime-600 dark:text-lime-400'
							: ''}"
					>
						{v}
					</dd>
					<dt class="text-xs leading-snug text-muted-foreground">{k}</dt>
				</div>
			{/each}
		</dl>

		<h3 class="mt-10 font-semibold">Incoming work has grown {incomingGrowth}× since {firstYear}</h3>
		<div
			class="trend mt-4"
			role="img"
			aria-label="Releases, commits, incoming issues and pull requests, and money received, per year since {firstYear}"
		>
			{#each rows as r (r.key)}
				<div class="row" class:money={r.key === 'money'}>
					<div class="rlabel">{r.label}</div>
					<div class="cols">
						{#each years as y (y)}
							{@const v = perYear[y][r.key]}
							<div class="cell" title="{y}: {r.fmt(v)}">
								<span class="v">{r.fmt(v)}</span>
								<span class="col" style:height={v > 0 ? `max(2px, ${(v / r.peak) * 100}%)` : '0'}
								></span>
							</div>
						{/each}
					</div>
				</div>
			{/each}
			<div class="row axis">
				<div class="rlabel"></div>
				<div class="cols">
					{#each years as y (y)}<div class="cell"><span class="yr">{y}</span></div>{/each}
				</div>
			</div>
		</div>
		<p class="mt-2 text-xs text-muted-foreground">
			Each row is scaled to its own peak. 2025's money is mostly FLOSS/fund's one-time grant.
		</p>

		<p class="mt-6 leading-7">
			{issues.thisYear.count} issues and pull requests came in this year, against {issues.lastYear
				.count} in {issues.lastYear.year}. Closing has kept pace, but replies are slower: my median
			first reply this year is {issues.thisYear.medianReplyHours} hours, against {issues.medianReplyHours}
			across all years. Nearly all of this work is unpaid. Sponsors currently give {usd(yearlyNow)} a
			year, and in {yearsMaintained} years Vale has received {usd(received)} in all, which is about {usd(
				perHour
			)} an hour if each of the {n(funding.days)} days with a commit took {funding.hoursPerDay} hours.
		</p>
	</section>

	<!-- 4. Why a rules engine still earns its place beside models. -->
	<section class="mt-16">
		<p class="kicker">4 · Why it matters now</p>
		<h2 class="text-2xl font-semibold tracking-tight">
			Fast, repeatable checks, as more writing is drafted by models
		</h2>
		<p class="mt-5 leading-7">
			In one test, I gave the same draft to Vale and to a model, five times each, with a 57-rule
			style:
		</p>
		<div class="mt-5 overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead>
					<tr class="border-b border-border/60 text-xs text-muted-foreground">
						<th class="py-2 pr-3 font-normal"></th>
						<th class="py-2 pr-3 font-normal">Vale</th>
						<th class="py-2 font-normal">A model review</th>
					</tr>
				</thead>
				<tbody>
					{#each [['Holds a 57-rule style', 'Exactly', 'Kept the names, got the definitions wrong'], ['Same answer every run', 'Yes, and tested', 'Mostly: 2 of 20 findings came up once in five runs'], ['Time per check', '0.09 seconds', '15 to 19 seconds'], ['Cost per check', '$0', `$${reviewCost(modelReview.price.low).toFixed(2)} to $${reviewCost(modelReview.price.high).toFixed(2)}`]] as [k, a, b] (k)}
						<tr class="border-b border-border/60 align-top">
							<td class="py-2 pr-3 text-muted-foreground">{k}</td>
							<td class="py-2 pr-3 font-semibold">{a}</td>
							<td class="py-2">{b}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="mt-5 leading-7">
			Priced that way, a review for each daily download would come to {usd(valueLow)} a year or more.
			That's a rough estimate, since not every download is one review. Research also finds that models
			follow standing instructions less well as
			<a class={link} href="https://arxiv.org/abs/2507.11538">instructions are added</a>
			and as
			<a class={link} href="https://arxiv.org/abs/2410.15553">a conversation goes on</a>. And
			there's more to check:
			<a class={link} href={aiPhrasing.href}
				>AI phrasing in GitHub issues is up {aiPhrasing.ratio}×</a
			> since ChatGPT.
		</p>
	</section>

	<!-- 5. The ask: the options themselves live on /sponsor. -->
	<section class="mt-16">
		<p class="kicker">5 · Ways to support it</p>
		<h2 class="text-2xl font-semibold tracking-tight">
			If your team relies on Vale, would you consider supporting it?
		</h2>
		<p class="mt-5 leading-7">
			A one-time contribution of any size helps, and a one-time payment of a tier's price gets that
			tier for a year, with no renewal commitment. Sponsors and Partners also get a review of their
			Vale setup, their logo on this site and in the README, and, for Partners, a private channel
			and a say in the roadmap. Every option funds faster answers, releases that keep up, and the
			packages and integrations around Vale. Vale stays MIT-licensed, no feature is sponsor-only,
			and support is best effort, with no SLA.
		</p>
		<div class="mt-6 flex flex-col gap-3 sm:flex-row">
			<a
				href="/sponsor#tiers"
				class="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-lime-600 px-6 text-sm font-medium text-white transition-colors hover:bg-lime-700"
			>
				See the tiers <ArrowRight class="h-4 w-4" />
			</a>
			<a
				href="/sponsor#invoice"
				class="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-medium transition-colors hover:bg-muted/60"
			>
				Paying by invoice
			</a>
		</div>
		<p class="mt-6 leading-7">
			You can pay through <a class={link} href={siteConfig.links.sponsors}>GitHub Sponsors</a>,
			which can bill your company's existing GitHub account, or through
			<a class={link} href={siteConfig.links.openCollective}>Open Collective</a>, which sends
			invoices and receipts. Often neither needs a new vendor set up. For a Partner or custom
			arrangement, or with questions, <a class={link} href={contact.href}>get in touch</a>.
		</p>
		<p class="mt-4 leading-7">
			There's no pressure either way. If someone else is the better person for this, I'd be grateful
			if you passed it along. Thank you for using Vale.
		</p>
		<p class="mt-6 font-medium">Joseph Kato, creator and maintainer of Vale</p>
	</section>

	<!-- Every figure's source, in one place, so the sections can stay short. -->
	<section class="mt-16 border-t border-border/60 pt-6 text-xs leading-5 text-muted-foreground">
		<h2 class="mb-2 text-sm font-semibold text-foreground">Sources</h2>
		<ul class="space-y-1.5">
			<li>
				<strong class="font-medium text-foreground">Downloads:</strong> GitHub release downloads,
				Docker Hub pulls, and conda-forge for Vale, live as of {day(data.stats.updated)}; the other
				tools as of Nov 26, 2026, on the same three channels. Only tools that ship through them are
				compared, since a tool distributed mostly elsewhere (PyPI, npm, browser stores, or app
				stores) can't be measured the same way. Homebrew publishes no all-time counts, so it's left
				out of every total; its rank is by installs over the past year. The daily figure is GitHub
				release downloads over the past year, divided by 365.
			</li>
			<li>
				<strong class="font-medium text-foreground">Teams and docs pages:</strong> the
				<a class="underline" href="/adopters">adopters directory</a>, which lists every public
				repository that runs Vale. A named organization means at least one of its teams or projects
				does.
			</li>
			<li>
				<strong class="font-medium text-foreground">Model comparison and cost:</strong> one draft,
				five model reviews, input tokens at list price ({modelReview.price.lowModel} to {modelReview
					.price.highModel}), measured November 12, 2026, from
				<a class="underline" href="/blog/quality-gate"
					>The model writes the rules. The rules check the docs.</a
				> The yearly estimate prices each daily download as one review.
			</li>
			<li>
				<strong class="font-medium text-foreground">Issues:</strong> issues and pull requests opened
				in vale-cli/vale by anyone but me, bots excluded. A first reply is my first comment, review,
				or close, so fixes that only reference an issue from a commit read slow.
			</li>
			<li>
				<strong class="font-medium text-foreground">Money:</strong> Open Collective {usd(
					funding.opencollective
				)}, GitHub Sponsors {usd(funding.github)}, and FLOSS/fund {usd(funding.direct)}. Hosting,
				credits, and model access aren't counted. GitHub's yearly split is rebuilt from each
				sponsorship's dates and tier. Current giving is Open Collective's yearly income, live, plus
				GitHub Sponsors' monthly total times twelve.
			</li>
			<li>
				<strong class="font-medium text-foreground">Commits:</strong> mine across Vale, libvale, its
				packages and style library, its markup parsers, and this site, deduplicated.
			</li>
			<li>
				<strong class="font-medium text-foreground">AI phrasing:</strong> GitHub issues sampled from
				GH Archive and scored with the vale-ai-tells lexicon, from
				<a class="underline" href={aiPhrasing.href}>AI Tells: the burden of LLMs</a>.
			</li>
		</ul>
		<p class="mt-3">Hand-counted figures as of {day(asOf)}.</p>
	</section>
</div>

<style>
	.kicker {
		margin-bottom: 0.4rem;
		color: rgb(101 163 13);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	:global(.dark) .kicker {
		color: rgb(163 230 53);
	}

	/* The work and the money by year: small multiples on one year axis, each
	   row scaled to its own peak, the money row in the accent. */
	.trend .row {
		display: grid;
		grid-template-columns: 10rem 1fr;
		align-items: end;
		gap: 0.75rem;
		padding: 0.35rem 0;
		border-bottom: 1px solid hsl(var(--border) / 0.6);
	}
	.trend .row.axis {
		padding-top: 0.2rem;
		border-bottom: 0;
	}
	.trend .rlabel {
		align-self: center;
		font-size: 12.5px;
		line-height: 1.3;
	}
	.trend .row.money .rlabel {
		color: rgb(101 163 13);
		font-weight: 600;
	}
	.trend .cols {
		display: grid;
		grid-template-columns: repeat(10, 1fr);
		gap: 0.3rem;
	}
	.trend .row:not(.axis) .cols {
		height: 3.4rem;
	}
	.trend .cell {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		gap: 0.15rem;
		min-width: 0;
	}
	.trend .col {
		display: block;
		width: 72%;
		max-width: 2.25rem;
		border-radius: 2px 2px 0 0;
		background: hsl(var(--muted-foreground) / 0.45);
	}
	.trend .row.money .col {
		background: rgb(132 204 22);
	}
	.trend .v,
	.trend .yr {
		color: hsl(var(--muted-foreground));
		font-size: 10px;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	@media (max-width: 640px) {
		.trend .row {
			grid-template-columns: 1fr;
			gap: 0.3rem;
		}
		.trend .row.axis .rlabel {
			display: none;
		}
		.trend .cols {
			gap: 0.15rem;
		}
		.trend .v,
		.trend .yr {
			font-size: 8.5px;
		}
	}
</style>
