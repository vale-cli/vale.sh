<script lang="ts">
	import stats from '$lib/data/adopter-stats.json';
	import adopters from '$lib/data/adopters.json';
	import { usageGroups, type Usage } from '$lib/data/usage';

	/*
		What the teams actually run, as ranked bars: one list per facet group,
		counted with the same tests the directory filters by, so a bar and its
		chip can never disagree. Each bar is a button that opens the directory
		on that facet.

		One measure, one hue: the bars differ in length only. Each list names
		its own denominator, because they are different sets -- repositories
		that could be read, and configs that could be opened.
	*/
	let { onpick, sector }: { onpick: (facet: string) => void; sector?: string } = $props();

	// With a sector, only its teams' records are counted. Read once: a sector
	// page keys this component on its sector.
	// svelte-ignore state_referenced_locally
	const members = sector
		? new Set(adopters.filter((a) => a.category === sector).map((a) => a.name))
		: null;
	const records = Object.entries(stats.perAdopter)
		.filter(([name]) => !members || members.has(name))
		.map(([, r]) => r) as unknown as Usage[];

	// What each group is counted over, and how to say so.
	const BASIS: Record<string, { of: (u: Usage) => boolean; noun: string }> = {
		Integrations: { of: (u) => u.integrations != null, noun: 'repositories read' },
		Rules: { of: (u) => u.styles != null, noun: 'configs opened' },
		Formats: { of: (u) => u.formats != null, noun: 'configs opened' }
	};
	const TITLE: Record<string, string> = {
		Integrations: 'Where it runs',
		Rules: 'Which rules',
		Formats: 'Which formats'
	};

	const lists = usageGroups.map((group) => {
		const basis = BASIS[group.name];
		const pool = basis ? records.filter(basis.of) : records;
		const rows = group.facets
			.map((f) => ({ id: f.id, label: f.label, n: pool.filter(f.test).length }))
			.filter((r) => r.n > 0)
			.sort((a, b) => b.n - a.n)
			.slice(0, 7);
		return {
			name: group.name,
			title: TITLE[group.name] ?? group.name,
			total: pool.length,
			noun: basis?.noun ?? 'teams',
			max: Math.max(1, ...rows.map((r) => r.n)),
			rows
		};
	});

	const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);
</script>

<div class="grid gap-x-10 gap-y-10 md:grid-cols-3">
	{#each lists as list (list.name)}
		<section aria-labelledby="usage-{list.name}">
			<h3 id="usage-{list.name}" class="text-sm font-semibold tracking-tight">{list.title}</h3>
			<p class="mt-1 text-xs text-muted-foreground">
				of {list.total}
				{list.noun}
			</p>
			<ul class="mt-4 space-y-1.5">
				{#each list.rows as row (row.id)}
					<li>
						<button
							type="button"
							onclick={() => onpick(row.id)}
							title="{row.n} of {list.total} {list.noun} ({pct(
								row.n,
								list.total
							)}%). Show these teams."
							class="group grid w-full grid-cols-[1fr_auto] items-baseline gap-x-3 rounded-md px-1 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
						>
							<span class="truncate text-sm text-foreground/85 group-hover:text-foreground"
								>{row.label}</span
							>
							<span class="font-mono text-xs tabular-nums text-foreground">{row.n}</span>
							<!-- The track is the full list's width; the bar's length is the count. -->
							<span class="col-span-2 mt-1 block h-1.5 rounded-full bg-muted">
								<span
									class="block h-full rounded-full bg-lime-600 transition-colors group-hover:bg-lime-500 dark:bg-lime-500 dark:group-hover:bg-lime-400"
									style="width: {(row.n / list.max) * 100}%"
								></span>
							</span>
						</button>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>
