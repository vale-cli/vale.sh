<script lang="ts">
	import adopters from '$lib/data/adopters.json';
	import stats from '$lib/data/adopter-stats.json';
	import { sectors, sectorSlug } from '$lib/data/sectors';
	import BrandIcon from '$lib/components/landing/BrandIcon.svelte';
	import SectorMotif from './SectorMotif.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';

	type Adopter = {
		name: string;
		category: string;
		context: string;
		url: string;
		icon?: string;
		avatar?: string;
	};

	type Study = {
		slug: string;
		title: string;
		figure: string | null;
		figureLabel: string;
		draft: boolean;
		brand: string | null;
	};

	/*
		Each band is a summary that links to its sector's own page, where the
		whole roster, its curve, and its directory live. `limit` caps the marks
		a band shows: the teams with a case study first, then the most-starred
		repos, so a long sector leads with names a reader knows. The studies
		arrive from the route's load, and each is shelved in the band of the
		team it is about.
	*/
	let { posts = [], limit = 18 }: { posts?: Study[]; limit?: number } = $props();

	const stars = (name: string) =>
		(stats.perAdopter as Record<string, { stars?: number | null }>)[name]?.stars ?? 0;

	const all = adopters as Adopter[];
	const byName = new Map(all.map((a) => [a.name, a]));

	// One band per sector, with its whole roster in alphabetical order, the
	// sector's own counts from script/adopters-stats.mjs, and its studies.
	const bands = $derived(
		sectors
			.map((s) => ({
				...s,
				id: `sector-${sectorSlug(s.name)}`,
				href: `/adopters/sector/${sectorSlug(s.name)}`,
				members: all.filter((a) => a.category === s.name),
				ci: stats.bySector[s.name as keyof typeof stats.bySector],
				studies: posts
					.filter((p) => p.brand && byName.get(p.brand)?.category === s.name)
					.map((p) => ({ ...p, team: byName.get(p.brand as string) as Adopter }))
			}))
			.map((b) => {
				const studied = new Set(b.studies.map((st) => st.team.name));
				const shown = [...b.members]
					.sort(
						(x, y) =>
							Number(studied.has(y.name)) - Number(studied.has(x.name)) ||
							stars(y.name) - stars(x.name) ||
							x.name.localeCompare(y.name)
					)
					.slice(0, limit)
					.sort((x, y) => x.name.localeCompare(y.name));
				return { ...b, shown, more: b.members.length - shown.length };
			})
	);
</script>

<!--
	One band per sector: what it is on the left, everyone in it on the right.
	Marks stay in color -- a roster is meant to be recognized -- and each is
	the team's own proof. The link and the "+N" mark open the sector's page,
	which has the whole roster and the cards that carry each team's context.

	One tooltip provider for all the bands: every mark opens the same way,
	after the same short delay, and only one is open at a time.
-->
<Tooltip.Provider delayDuration={150}>
	<ol class="space-y-4">
		{#each bands as band (band.name)}
			{@const Icon = band.icon}
			<!--
				Each band carries its sector's hue on the icon box, the hover border,
				and the motif tiled behind it; the roster and copy stay neutral, so the
				marks keep their own colors and the hue reads as the band's, not theirs.
			-->
			<li
				id={band.id}
				class="relative isolate grid scroll-mt-28 gap-6 overflow-hidden rounded-xl border border-border bg-card p-5 transition-colors sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] {band
					.theme.hover}"
			>
				<!--
					The motif as a background: tiled across the card, faint, and masked
					so it is strongest under the roster's far corner and gone under the
					copy. Behind everything (`-z-10` inside the card's own stacking
					context), so it can sit under marks without touching them.
				-->
				<svg
					aria-hidden="true"
					class="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.07] [mask-image:linear-gradient(to_top_left,#000,transparent_70%)] dark:opacity-[0.11] {band
						.theme.motif}"
				>
					<defs>
						<pattern id="motif-{band.id}" width="176" height="176" patternUnits="userSpaceOnUse">
							<SectorMotif kind={band.id} size={160} />
						</pattern>
					</defs>
					<rect width="100%" height="100%" fill="url(#motif-{band.id})" />
				</svg>
				<div class="flex flex-col">
					<div class="flex items-center gap-2.5">
						<span
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md ring-1 ring-border {band
								.theme.box}"
						>
							<Icon class="h-4 w-4" />
						</span>
						<h3 class="text-lg font-semibold tracking-tight text-foreground">{band.name}</h3>
						<span class="font-mono text-xs text-muted-foreground">{band.members.length}</span>
					</div>
					<p class="mt-3 text-sm leading-6 text-muted-foreground">{band.blurb}</p>
					{#if band.ci?.checked}
						<p class="mt-3 font-mono text-xs text-muted-foreground">
							{band.ci.ci} of {band.ci.checked} repos run it in CI
							{#if band.ci.house}· {band.ci.house} with house rules{/if}
						</p>
					{/if}
					{#if band.studies.length}
						<!--
							The sector's shelf: one line per study, the team's mark, the
							title, and the study's one number. It grows with the series and
							sits beside the teams it is about.
						-->
						<ul class="mt-4 space-y-1.5" aria-label="{band.name} case studies">
							{#each band.studies as study (study.slug)}
								<li>
									<a
										href="/blog/{study.slug}"
										class="group/study flex items-start gap-2.5 rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
									>
										<BrandIcon
											name={study.team.name}
											slug={study.team.icon}
											avatar={study.team.avatar}
											size="h-5 w-5"
											class="mt-0.5 shrink-0"
										/>
										<span class="min-w-0">
											<span
												class="font-medium leading-5 text-foreground group-hover/study:text-lime-600 dark:group-hover/study:text-lime-400"
												>{study.title}</span
											>
											{#if study.draft}
												<span
													class="ml-1 rounded-full border border-amber-500/50 px-1.5 py-px align-middle text-[10px] font-medium text-amber-600 dark:text-amber-400"
													>Draft</span
												>
											{/if}
											{#if study.figure}
												<span class="block font-mono text-xs text-muted-foreground"
													>{study.figure} {study.figureLabel}</span
												>
											{/if}
										</span>
									</a>
								</li>
							{/each}
						</ul>
					{/if}
					<a
						href={band.href}
						class="group mt-4 inline-flex items-center gap-1 self-start text-sm font-medium text-lime-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 dark:text-lime-400"
					>
						Explore all {band.members.length} in {band.name}
						<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
					</a>
				</div>

				<!--
					Bare marks, no tiles: the logo is the unit. Each link pads out to a
					44px target around a 36px mark, lifts on hover, and names itself in
					a tooltip. The right gutter is the motif's corner, so a full roster
				wraps before it rather than under it; below the two-column width the
				motif is hidden and the gutter goes with it. The trigger renders as the link itself, so a hover or a
					focus opens it and a click still goes to the proof.
				-->
				<ul class="flex flex-wrap content-start gap-1" aria-label="{band.name} teams">
					{#each band.shown as team (team.name)}
						<li>
							<Tooltip.Root>
								<Tooltip.Trigger>
									{#snippet child({ props })}
										<a
											{...props}
											href={team.url}
											target="_blank"
											rel="noreferrer"
											class="flex h-11 w-11 items-center justify-center rounded-md transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 lg:h-auto lg:w-24 lg:flex-col lg:gap-1.5 lg:px-1 lg:py-2"
										>
											<BrandIcon
												name={team.name}
												slug={team.icon}
												avatar={team.avatar}
												size="h-9 w-9"
											/>
											<!--
												The name rides under the mark where there is room for it, and
												stays for screen readers where there is not. Long names truncate;
												the tooltip carries them whole.
											-->
											<span
												class="hidden w-full truncate text-center text-[11px] leading-4 text-muted-foreground lg:block"
												>{team.name}</span
											>
											<span class="sr-only lg:hidden">{team.name}</span>
										</a>
									{/snippet}
								</Tooltip.Trigger>
								<Tooltip.Content side="top" class="max-w-xs text-pretty">
									<span class="font-semibold">{team.name}</span>
									<span class="opacity-80"> · {team.context}</span>
								</Tooltip.Content>
							</Tooltip.Root>
						</li>
					{/each}
					{#if band.more > 0}
						<li>
							<a
								href={band.href}
								aria-label="{band.more} more teams in {band.name}"
								class="flex h-11 w-11 items-center justify-center rounded-md font-mono text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 lg:h-[4.25rem] lg:w-24"
							>
								+{band.more}
							</a>
						</li>
					{/if}
				</ul>
			</li>
		{/each}
	</ol>
</Tooltip.Provider>
