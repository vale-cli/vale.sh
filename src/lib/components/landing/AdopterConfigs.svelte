<script lang="ts">
	import adopters from '$lib/data/adopters.json';
	import stats from '$lib/data/adopter-stats.json';
	import stories from '$lib/data/stories.json';
	import { sectors } from '$lib/data/sectors';
	import BrandIcon from './BrandIcon.svelte';
	import Section from './Section.svelte';
	import InlineCode from '$lib/components/features/InlineCode.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';

	let { editorial = false }: { editorial?: boolean } = $props();

	type Adopter = {
		name: string;
		category: string;
		context: string;
		url: string;
		github?: string;
		avatar?: string;
		logo?: string;
		icon?: string;
	};

	const all = adopters as Adopter[];

	/*
		A logo wall asserts that a company uses the tool; this band shows where to
		go and check. Each mark's tooltip names the evidence:

		  - a .vale.ini in a public repo  -> the path and the repository
		  - a page the team wrote about   -> the host

		Both are somewhere a reader can open, which is the point.
	*/
	const CONFIG =
		/^https:\/\/github\.com\/([^/]+\/[^/]+)\/blob\/[^/]+\/(.*(?:\.vale\.ini|_vale\.ini|vale\.ini))$/;

	const REPO = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/?$/;

	function receipt(url: string): string {
		const config = CONFIG.exec(url);
		if (config) return `${config[1]} · ${config[2]}`;
		const repo = REPO.exec(url);
		if (repo) return repo[1];
		return new URL(url).hostname.replace(/^www\./, '');
	}

	/*
		The biggest names, gated by proof: each mark has to land on a real
		config or a CI job, since a visitor who clicks and finds a thin page
		stops believing the rest. A team with a story card above is skipped
		here, so no name appears twice; the list runs longer than twelve so
		the row stays full whichever teams the cards take.
	*/
	const FEATURED = [
		'Amazon Web Services',
		'Microsoft',
		'NVIDIA',
		'Epic Games',
		'GitHub',
		'Docker',
		'Red Hat',
		'GitLab',
		'Datadog',
		'MongoDB',
		'MetaMask',
		'GOV.UK',
		'Discord',
		'SAP',
		'Spotify',
		'Grafana Labs',
		'Texas Instruments'
	];

	const byName = new Map(all.map((a) => [a.name, a]));

	/*
		Four teams, one figure each, read from the team's own page: the number
		leads, the way a customer page leads with "350 million daily users"
		rather than a logo. Resolved against the data so the mark and sector
		come from the adopter entry, and validated in script/adopters.mjs.
	*/
	const featuredStories = stories.flatMap((st) => {
		const adopter = byName.get(st.name);
		return adopter ? [{ ...st, adopter }] : [];
	});

	const storied = new Set(stories.map((st) => st.name));
	const marks = FEATURED.filter((name) => !storied.has(name))
		.slice(0, 12)
		.flatMap((name) => {
			const adopter = byName.get(name);
			if (!adopter) return [];
			return [
				{
					...adopter,
					receipt: receipt(adopter.url),
					// BrandIcon resolves a Simple Icons glyph, then the avatar, then a
					// monogram. Most entries name their glyph; fall back to the key the
					// name implies for the ones that don't.
					slug: adopter.icon ?? name.toLowerCase().replace(/[^a-z0-9]/g, '')
				}
			];
		});

	/*
		Three counted figures under the marks, from script/adopters-stats.mjs:
		the list, the repos on it that run Vale in CI, and the one figure that
		reaches past the list -- how many repositories depend on the Action.
	*/
	const compactCount = new Intl.NumberFormat('en-US');
	const figures = [
		{ value: String(all.length), label: 'teams', gloss: `across ${sectors.length} sectors` },
		{
			value: `${stats.ci} / ${stats.checked}`,
			label: 'run Vale in CI',
			gloss: 'of the repos checked'
		},
		{
			value: compactCount.format(stats.actionDependents ?? 0),
			label: 'repos using the Vale Action',
			gloss: "GitHub's dependents count"
		}
	];

	// The nine sectors, each a jump to its band on /adopters.
	const chips = sectors.map((s) => ({
		name: s.name,
		count: all.filter((a) => a.category === s.name).length,
		href: `/adopters#sector-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
	}));

	const total = all.length;
</script>

{#snippet configsLede()}
	Every team here publishes something you can open — the <InlineCode>.vale.ini</InlineCode> they run,
	or the page they wrote about running it. Hover a mark for where.
{/snippet}

<Section
	{editorial}
	eyebrow={editorial ? 'Used in production' : undefined}
	accent={editorial}
	id="configs"
	title="Read their configs"
	lede={configsLede}
>
	<!--
		Four stories with a figure each, then twelve bare marks, large, named
		beneath. The mark's tooltip is the receipt:
		the repository and path, or the host, plus the team's own line. Nothing
		scrolls; these are links and a moving row makes them a moving target.
	-->
	<ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
		{#each featuredStories as story (story.name)}
			<li>
				<a
					href={story.url}
					target="_blank"
					rel="noreferrer"
					class="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-lime-500/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
				>
					<span class="flex items-center gap-2.5">
						<BrandIcon
							name={story.adopter.name}
							slug={story.adopter.icon}
							avatar={story.adopter.avatar}
							size="h-6 w-6"
						/>
						<span class="text-sm font-medium text-foreground">{story.adopter.name}</span>
					</span>
					<span class="mt-5 text-4xl font-semibold tracking-tight text-foreground"
						>{story.figure}</span
					>
					<span class="mt-1 text-sm font-medium text-foreground">{story.label}</span>
					<span class="mt-2 grow text-sm leading-6 text-muted-foreground">{story.detail}</span>
					<span
						class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-lime-600 dark:text-lime-400"
					>
						Read the source
						<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
					</span>
				</a>
			</li>
		{/each}
	</ul>

	<Tooltip.Provider delayDuration={150}>
		<ul class="mt-12 grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">
			{#each marks as mark (mark.name)}
				<li>
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<a
									{...props}
									href={mark.url}
									target="_blank"
									rel="noreferrer"
									class="group flex flex-col items-center gap-3 rounded-lg px-2 py-3 text-center transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
								>
									<BrandIcon
										name={mark.name}
										slug={mark.slug}
										avatar={mark.avatar}
										size="h-12 w-12"
									/>
									<span class="text-sm font-medium tracking-tight text-foreground">{mark.name}</span
									>
								</a>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content side="top" class="max-w-xs text-pretty">
							<span class="block font-mono text-[11px] opacity-80">{mark.receipt}</span>
							<span class="mt-1 block">{mark.context}</span>
						</Tooltip.Content>
					</Tooltip.Root>
				</li>
			{/each}
		</ul>
	</Tooltip.Provider>

	<dl class="mt-12 grid gap-3 sm:grid-cols-3">
		{#each figures as f (f.label)}
			<div class="rounded-xl border border-border bg-card px-5 py-4">
				<dd class="text-2xl font-semibold tracking-tight text-foreground">{f.value}</dd>
				<dt class="mt-0.5 text-sm font-medium text-foreground">{f.label}</dt>
				<p class="mt-0.5 text-xs text-muted-foreground">{f.gloss}</p>
			</div>
		{/each}
	</dl>

	<!-- The split by sector, each chip landing on that sector's roster. -->
	<ul class="mt-6 flex flex-wrap gap-2" aria-label="Adopters by sector">
		{#each chips as chip (chip.name)}
			<li>
				<a
					href={chip.href}
					class="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-lime-500/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
				>
					{chip.name}
					<span class="font-mono text-xs">{chip.count}</span>
				</a>
			</li>
		{/each}
	</ul>

	<div class="mt-8 flex {editorial ? 'justify-start' : 'justify-center'}">
		<a
			href="/adopters"
			class="group inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
		>
			Browse all {total}
			<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
		</a>
	</div>
</Section>
