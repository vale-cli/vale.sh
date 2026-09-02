<script lang="ts">
	// Cumulative token cost over a session, from the measured per-request
	// numbers. Resident context -- a skill, or briefs pasted into CLAUDE.md --
	// is paid on every request, so those are straight lines. Rules cost
	// tokens only on the requests where a draft breaks one, so their honest
	// shape is a band: the top edge is the worst case (every draft dirty at
	// the full 735-token report), the bottom is a clean session at zero.
	const REQUESTS = 50;
	const SKILL = 3777;
	const BRIEF = 1535;
	const ALERTS = 735;

	const W = 700;
	const H = 300;
	const M = { top: 24, right: 215, bottom: 36, left: 16 };

	const yMax = SKILL * REQUESTS;
	const x = (r: number) => M.left + (r / REQUESTS) * (W - M.left - M.right);
	const y = (t: number) => H - M.bottom - (t / yMax) * (H - M.top - M.bottom);

	const fmt = (n: number) => n.toLocaleString('en-US');

	const lines = [
		{ label: `skill · ${fmt(SKILL * REQUESTS)}`, per: SKILL, cls: 'stroke-rose-400 fill-rose-400' },
		{
			label: `briefs · ${fmt(BRIEF * REQUESTS)}`,
			per: BRIEF,
			cls: 'stroke-amber-400 fill-amber-400'
		}
	];
</script>

<div class="not-prose my-8 overflow-x-auto">
	<svg
		viewBox="0 0 {W} {H}"
		class="min-w-[560px]"
		role="img"
		aria-label="Cumulative token cost over fifty requests: a resident skill and briefs rise as straight lines; rules stay in a band between zero and the worst case."
	>
		<!-- Baseline and worst-case edge of the rules band. -->
		<polygon
			points="{x(0)},{y(0)} {x(REQUESTS)},{y(ALERTS * REQUESTS)} {x(REQUESTS)},{y(0)}"
			class="fill-lime-500/15"
		/>
		<line
			x1={x(0)}
			y1={y(0)}
			x2={x(REQUESTS)}
			y2={y(ALERTS * REQUESTS)}
			class="stroke-lime-500"
			stroke-width="2"
		/>
		<line
			x1={x(0)}
			y1={y(0)}
			x2={x(REQUESTS)}
			y2={y(0)}
			class="stroke-lime-500"
			stroke-width="2.5"
		/>
		<text
			x={x(REQUESTS) + 10}
			y={y(ALERTS * REQUESTS) + 4}
			class="fill-lime-600 text-[12px] dark:fill-lime-400"
			font-family="ui-monospace, monospace">rules, worst · {fmt(ALERTS * REQUESTS)}</text
		>
		<text
			x={x(REQUESTS) + 10}
			y={y(0) + 4}
			class="fill-lime-600 text-[12px] font-bold dark:fill-lime-400"
			font-family="ui-monospace, monospace">rules, clean · 0</text
		>

		{#each lines as line (line.label)}
			<line
				x1={x(0)}
				y1={y(0)}
				x2={x(REQUESTS)}
				y2={y(line.per * REQUESTS)}
				class={line.cls}
				stroke-width="2"
			/>
			<text
				x={x(REQUESTS) + 10}
				y={y(line.per * REQUESTS) + 4}
				class="{line.cls} text-[12px]"
				font-family="ui-monospace, monospace">{line.label}</text
			>
		{/each}

		<!-- Axes. -->
		<line x1={x(0)} y1={y(0)} x2={x(REQUESTS)} y2={y(0)} class="stroke-border" />
		<text
			x={x(REQUESTS / 2)}
			y={H - 10}
			text-anchor="middle"
			class="fill-muted-foreground text-[12px]"
			font-family="ui-monospace, monospace">requests → {REQUESTS}</text
		>
	</svg>
</div>
