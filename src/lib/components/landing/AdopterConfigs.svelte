<script lang="ts">
	import adopters from '$lib/data/adopters.json';
	import stats from '$lib/data/adopter-stats.json';
	import { sectors } from '$lib/data/sectors';
	import BrandIcon from './BrandIcon.svelte';
	import Section from './Section.svelte';
	import InlineCode from '$lib/components/features/InlineCode.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import { fade } from 'svelte/transition';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Pause from 'lucide-svelte/icons/pause';
	import Play from 'lucide-svelte/icons/play';

	// The carousel's round buttons: a 36px target, outlined like the chips.
	const control =
		'inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500';

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
		The biggest names, gated by proof: each has to land on a real config
		or a CI job, since a visitor who clicks and finds a thin page stops
		believing the rest. Within its sector, a name here leads the rotation.
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

	type Record = { stars?: number | null; pushed?: string | null };
	const records = stats.perAdopter as unknown as { [name: string]: Record };
	const generated = Date.parse(stats.generated);

	/*
		Up to twelve marks per sector: the hand-picked names first, then the
		rest by stars. A repo with no push in a year sits out, so the band
		shows teams that are running Vale now; no date is shown.
	*/
	const PER_SECTOR = 12;
	const active = (name: string) => {
		const pushed = records[name]?.pushed;
		return !pushed || generated - Date.parse(pushed) < 365 * 86_400_000;
	};
	const rank = (a: Adopter) => {
		const i = FEATURED.indexOf(a.name);
		return i === -1 ? FEATURED.length : i;
	};
	const toMark = (adopter: Adopter) => ({
		...adopter,
		receipt: receipt(adopter.url),
		// BrandIcon resolves a Simple Icons glyph, then the avatar, then a
		// monogram. Most entries name their glyph; fall back to the key the
		// name implies for the ones that don't.
		slug: adopter.icon ?? adopter.name.toLowerCase().replace(/[^a-z0-9]/g, '')
	});

	const rotation = sectors.map((s) => {
		const members = all.filter((a) => a.category === s.name);
		return {
			name: s.name,
			count: members.length,
			href: `/adopters#sector-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
			marks: members
				.filter((a) => active(a.name))
				.sort(
					(a, b) =>
						rank(a) - rank(b) ||
						(records[b.name]?.stars ?? 0) - (records[a.name]?.stars ?? 0) ||
						a.name.localeCompare(b.name)
				)
				.slice(0, PER_SECTOR)
				.map(toMark)
		};
	});

	/*
		The sectors take turns, as a carousel with its own controls: previous,
		next, and pause. A moving set of links is a moving target, so the turn
		waits while a pointer or keyboard focus is on the band, and stops once
		a reader steps through or picks a sector themselves; play resumes it.
		A reader who asked the system for reduced motion starts paused.
	*/
	const TURN_MS = 10000;
	let current = $state(0);
	let hovering = $state(false);
	let focused = $state(false);
	let paused = $state(false);
	let still = $state(false);
	const shown = $derived(rotation[current]);
	const running = $derived(!paused && !hovering && !focused);

	$effect(() => {
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		still = query.matches;
		if (still) paused = true;
		const onChange = () => {
			still = query.matches;
			if (still) paused = true;
		};
		query.addEventListener('change', onChange);
		return () => query.removeEventListener('change', onChange);
	});

	// One turn per sector shown, so stepping by hand restarts the clock.
	$effect(() => {
		void current;
		if (!running) return;
		const timer = setTimeout(() => (current = (current + 1) % rotation.length), TURN_MS);
		return () => clearTimeout(timer);
	});

	const go = (i: number) => {
		current = (i + rotation.length) % rotation.length;
		paused = true;
	};

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
		One sector at a time. The chips are the controls and double as the
		progress: the lit one is on screen. The marks crossfade in place, in a
		box held at two rows so the section below doesn't jump between turns.
	-->
	<div
		role="region"
		aria-roledescription="carousel"
		aria-label="Teams by sector"
		onpointerenter={() => (hovering = true)}
		onpointerleave={() => (hovering = false)}
		onfocusin={() => (focused = true)}
		onfocusout={() => (focused = false)}
	>
		<div class="flex flex-wrap gap-2" role="group" aria-label="Choose a sector">
			{#each rotation as sector, i (sector.name)}
				<button
					type="button"
					onclick={() => go(i)}
					aria-pressed={i === current}
					class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 {i ===
					current
						? 'border-lime-500/50 bg-lime-500/10 font-medium text-foreground'
						: 'border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground'}"
				>
					{sector.name}
					<span class="font-mono text-xs text-muted-foreground">{sector.count}</span>
				</button>
			{/each}
		</div>

		<p class="sr-only" aria-live="polite">{shown.name}</p>

		<Tooltip.Provider delayDuration={150}>
			<div class="relative mt-8 grid min-h-[16rem] sm:min-h-[15rem] lg:min-h-[14rem]">
				{#key shown.name}
					<ul
						class="col-start-1 row-start-1 grid grid-cols-3 content-start gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-6"
						in:fade={{ duration: still ? 0 : 280, delay: still ? 0 : 120 }}
						out:fade={{ duration: still ? 0 : 160 }}
						aria-label="{shown.name} teams"
					>
						{#each shown.marks as mark (mark.name)}
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
												<span class="text-sm font-medium tracking-tight text-foreground"
													>{mark.name}</span
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
				{/key}
			</div>
		</Tooltip.Provider>

		<!--
			The controls: previous, pause or play, next, and where the reader is.
			The hairline under them fills over one turn while the carousel runs,
			and empties whenever it stops, restarting with the turn's clock.
		-->
		<div class="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
			<div class="flex items-center gap-2">
				<button
					type="button"
					onclick={() => go(current - 1)}
					aria-label="Previous sector"
					class={control}
				>
					<ChevronLeft class="h-4 w-4" />
				</button>
				<button
					type="button"
					onclick={() => (paused = !paused)}
					aria-label={paused ? 'Play the carousel' : 'Pause the carousel'}
					class={control}
				>
					{#if paused}<Play class="h-4 w-4" />{:else}<Pause class="h-4 w-4" />{/if}
				</button>
				<button
					type="button"
					onclick={() => go(current + 1)}
					aria-label="Next sector"
					class={control}
				>
					<ChevronRight class="h-4 w-4" />
				</button>
				<span class="ml-2 font-mono text-xs tabular-nums text-muted-foreground">
					{current + 1} / {rotation.length}
				</span>
			</div>
			<a
				href={shown.href}
				class="group inline-flex items-center gap-1 text-sm font-medium text-lime-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 dark:text-lime-400"
			>
				All {shown.count} in {shown.name}
				<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
			</a>
		</div>
		<div class="mt-3 h-px overflow-hidden bg-border" aria-hidden="true">
			{#key `${current}:${running}`}
				{#if running}
					<div class="turn h-full bg-lime-600" style="animation-duration: {TURN_MS}ms"></div>
				{/if}
			{/key}
		</div>
	</div>

	<dl class="mt-12 grid gap-3 sm:grid-cols-3">
		{#each figures as f (f.label)}
			<div class="rounded-xl border border-border bg-card px-5 py-4">
				<dd class="text-2xl font-semibold tracking-tight text-foreground">{f.value}</dd>
				<dt class="mt-0.5 text-sm font-medium text-foreground">{f.label}</dt>
				<p class="mt-0.5 text-xs text-muted-foreground">{f.gloss}</p>
			</div>
		{/each}
	</dl>

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

<style>
	/* One turn of the carousel, as a hairline filling left to right. */
	.turn {
		width: 100%;
		transform-origin: left;
		animation-name: turn;
		animation-timing-function: linear;
		animation-fill-mode: both;
	}
	@keyframes turn {
		from {
			transform: scaleX(0);
		}
		to {
			transform: scaleX(1);
		}
	}
</style>
