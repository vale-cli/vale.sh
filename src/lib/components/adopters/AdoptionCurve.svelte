<script lang="ts">
	import stats from '$lib/data/adopter-stats.json';
	import adopters from '$lib/data/adopters.json';
	import { sectors } from '$lib/data/sectors';

	/*
		Adoption over time, counted from commits: the stats script records the
		date each team's config first landed in the repo it checked, and the
		curve is the running count of teams by that date. A team without a
		public repo has no date and is left out, and the caption says how many.
	*/
	type Dated = { name: string; category: string; since: string };
	const perAdopter = stats.perAdopter as Record<string, { since?: string | null }>;
	const dated: Dated[] = adopters
		.flatMap((a) => {
			const since = perAdopter[a.name]?.since;
			return since ? [{ name: a.name, category: a.category, since }] : [];
		})
		.sort((a, b) => a.since.localeCompare(b.since));
	const undated = adopters.length - dated.length;

	// The earliest team in each sector, in the order the page lists sectors.
	const firsts = sectors.flatMap((s) => {
		const first = dated.find((d) => d.category === s.name);
		return first ? [{ sector: s.name, ...first }] : [];
	});

	// A step curve: each count holds until the next team's date, then rises.
	const W = 720;
	const H = 220;
	const PAD = { l: 34, r: 8, t: 8, b: 24 };
	const end = stats.generated;
	const t0 = dated.length ? Date.parse(dated[0].since) : 0;
	const t1 = Date.parse(end);
	const x = (iso: string) => PAD.l + ((Date.parse(iso) - t0) / (t1 - t0)) * (W - PAD.l - PAD.r);
	const yMax = Math.max(50, Math.ceil(dated.length / 50) * 50);
	const y = (n: number) => H - PAD.b - (n / yMax) * (H - PAD.t - PAD.b);

	let line = dated.length ? `M${x(dated[0].since).toFixed(1)},${y(0).toFixed(1)}` : '';
	dated.forEach((d, i) => {
		line += ` H${x(d.since).toFixed(1)} V${y(i + 1).toFixed(1)}`;
	});
	if (dated.length) line += ` H${x(end).toFixed(1)}`;
	const area = `${line} V${y(0).toFixed(1)} Z`;

	// Ticks: each year that starts inside the range, and every 50 teams.
	const years: number[] = [];
	if (dated.length) {
		for (let yr = new Date(t0).getUTCFullYear() + 1; yr <= new Date(t1).getUTCFullYear(); yr++) {
			years.push(yr);
		}
	}
	const counts = Array.from({ length: yMax / 50 + 1 }, (_, i) => i * 50);
	const yearOf = (iso: string) => iso.slice(0, 4);
</script>

{#if dated.length}
	<figure class="rounded-xl border border-border bg-card p-5">
		<figcaption class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
			<span class="text-sm font-medium text-foreground">
				{dated.length} teams, by the date their config first landed
			</span>
			<span class="text-xs text-muted-foreground">
				{yearOf(dated[0].since)} to {yearOf(end)}
			</span>
		</figcaption>

		<svg
			viewBox="0 0 {W} {H}"
			class="mt-4 h-auto w-full"
			role="img"
			aria-label="Teams running Vale, cumulative by the date each one's config first landed, from {yearOf(
				dated[0].since
			)} to {yearOf(end)}"
		>
			{#each counts as n (n)}
				<line
					x1={PAD.l}
					x2={W - PAD.r}
					y1={y(n)}
					y2={y(n)}
					class="stroke-border"
					stroke-width="1"
					stroke-dasharray={n ? '2 4' : undefined}
				/>
				<text
					x={PAD.l - 6}
					y={y(n) + 3.5}
					text-anchor="end"
					class="fill-muted-foreground text-[10px]"
				>
					{n}
				</text>
			{/each}
			{#each years as yr (yr)}
				<text
					x={x(`${yr}-01-01`)}
					y={H - 8}
					text-anchor="middle"
					class="fill-muted-foreground text-[10px]"
				>
					{yr}
				</text>
			{/each}
			<path d={area} class="fill-lime-600/15" />
			<path d={line} class="stroke-lime-600" stroke-width="2" fill="none" stroke-linejoin="round" />
		</svg>

		<p class="mt-3 text-xs leading-5 text-muted-foreground">
			The first commit of each team's <code>.vale.ini</code>, or of the first CI file that names
			Vale, in the repo checked; a style package counts from the day its repo was created.
			{#if undated}
				{undated} teams without a public repo are not dated.
			{/if}
		</p>

		<!-- The earliest team per sector: the same data, read as firsts. -->
		<dl class="mt-4 grid gap-x-6 gap-y-2 text-xs sm:grid-cols-3">
			{#each firsts as f (f.sector)}
				<div class="flex items-baseline justify-between gap-3 border-t border-border pt-2">
					<dt class="truncate text-muted-foreground">{f.sector}</dt>
					<dd class="shrink-0 font-medium text-foreground">
						{f.name}
						<span class="font-normal text-muted-foreground">{yearOf(f.since)}</span>
					</dd>
				</div>
			{/each}
		</dl>
	</figure>
{/if}
