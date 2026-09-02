<script lang="ts">
	// Cumulative token cost over a session, from the measured per-request
	// numbers. Resident context -- a skill, or briefs pasted into CLAUDE.md --
	// is paid on every request, so those are straight lines. Rules cost
	// tokens only on the requests where a draft breaks one, so their honest
	// shape is a band: the top edge is the worst case (every draft dirty at
	// the full 735-token report), the bottom is a clean session at zero.
	//
	// The SVG holds only the marks, so it can scale to any column width; the
	// labels are HTML underneath, where they stay legible on a phone.
	import Figure from './Figure.svelte';

	let { caption }: { caption?: string } = $props();

	const REQUESTS = 50;
	const SKILL = 3777;
	const BRIEF = 1535;
	const ALERTS = 735;

	const W = 700;
	const H = 280;
	const M = { top: 12, right: 12, bottom: 12, left: 12 };

	const yMax = SKILL * REQUESTS;
	const x = (r: number) => M.left + (r / REQUESTS) * (W - M.left - M.right);
	const y = (t: number) => H - M.bottom - (t / yMax) * (H - M.top - M.bottom);

	const fmt = (n: number) => n.toLocaleString('en-US');

	const series = [
		{ label: 'skill', total: SKILL * REQUESTS, stroke: 'stroke-rose-400', swatch: 'bg-rose-400' },
		{ label: 'briefs', total: BRIEF * REQUESTS, stroke: 'stroke-amber-400', swatch: 'bg-amber-400' },
		{
			label: 'rules, worst',
			total: ALERTS * REQUESTS,
			stroke: 'stroke-lime-500',
			swatch: 'bg-lime-500'
		},
		{ label: 'rules, clean', total: 0, stroke: 'stroke-lime-500', swatch: 'bg-lime-500' }
	];
</script>

<Figure {caption}>
	<svg
		viewBox="0 0 {W} {H}"
		class="w-full"
		role="img"
		aria-label="Cumulative token cost over fifty requests: a resident skill and briefs rise as straight lines; rules stay in a band between zero and the worst case."
	>
		<line x1={x(0)} y1={y(0)} x2={x(REQUESTS)} y2={y(0)} class="stroke-border" />
		<!-- The rules band: from a clean session on the baseline up to the worst case. -->
		<polygon
			points="{x(0)},{y(0)} {x(REQUESTS)},{y(ALERTS * REQUESTS)} {x(REQUESTS)},{y(0)}"
			class="fill-lime-500/15"
		/>
		{#each series as s (s.label)}
			<line
				x1={x(0)}
				y1={y(0)}
				x2={x(REQUESTS)}
				y2={y(s.total)}
				class={s.stroke}
				stroke-width={s.total === 0 ? 3 : 2}
				stroke-linecap="round"
			/>
		{/each}
	</svg>

	<div class="mt-2 flex items-baseline justify-between text-xs text-muted-foreground">
		<span class="font-mono">1 request</span>
		<span class="font-mono">{REQUESTS} requests</span>
	</div>

	<ul class="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:flex sm:flex-wrap sm:gap-x-8">
		{#each series as s (s.label)}
			<li class="flex items-center gap-2">
				<span class="h-2.5 w-2.5 shrink-0 rounded-full {s.swatch}" aria-hidden="true"></span>
				<span>{s.label}</span>
				<span class="font-mono tabular-nums text-muted-foreground">{fmt(s.total)}</span>
			</li>
		{/each}
	</ul>
</Figure>
