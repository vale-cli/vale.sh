<script lang="ts">
	// The loop, drawn once: the whole post is a detail of one of these four
	// steps. Laid out left to right where there is room and top to bottom on
	// a phone, so the labels never shrink with the column. currentColor
	// throughout, so it follows the theme.
	import Figure from './Figure.svelte';

	let { caption }: { caption?: string } = $props();

	const steps = ['agent writes', 'vale checks', 'agent fixes'];
	const BOX = { w: 136, h: 44 };
	const mono = 'ui-monospace, monospace';
	const label =
		'The agent writes a draft, Vale checks it, the agent applies the fix, and a clean run ends the loop.';
</script>

<Figure {caption}>
	<!-- Wide: a row. -->
	<svg
		viewBox="0 0 620 96"
		class="mx-auto hidden w-full max-w-2xl text-muted-foreground sm:block"
		role="img"
		aria-label={label}
	>
		<defs>
			<marker id="vh" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
				<path d="M0 0 L7 3.5 L0 7 z" fill="currentColor" />
			</marker>
		</defs>
		{#each steps as step, i (step)}
			<rect
				x={i * 160}
				y="26"
				width={BOX.w}
				height={BOX.h}
				rx="8"
				class="fill-card stroke-border"
				stroke-width="1"
			/>
			<text
				x={i * 160 + 68}
				y="53"
				text-anchor="middle"
				class="fill-foreground text-[13px]"
				font-family={mono}>{step}</text
			>
			<line
				x1={i * 160 + 140}
				y1="48"
				x2={i * 160 + 156}
				y2="48"
				stroke="currentColor"
				stroke-width="1.5"
				marker-end="url(#vh)"
			/>
		{/each}
		<rect
			x="480"
			y="26"
			width={BOX.w}
			height={BOX.h}
			rx="8"
			class="fill-lime-500/10 stroke-lime-500/50"
			stroke-width="1"
		/>
		<text x="548" y="53" text-anchor="middle" class="fill-foreground text-[13px]" font-family={mono}
			>exit 0</text
		>
		<!-- The failing branch: back to the top until the run is clean. -->
		<path
			d="M228 74 L228 88 L388 88"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-dasharray="3 3"
		/>
		<text x="300" y="84" text-anchor="middle" class="fill-muted-foreground text-[11px]">exit 1</text>
	</svg>

	<!-- Narrow: a column, capped at its natural size so the text stays 13px. -->
	<svg
		viewBox="0 0 240 280"
		class="mx-auto w-full max-w-[240px] text-muted-foreground sm:hidden"
		role="img"
		aria-label={label}
	>
		<defs>
			<marker id="vv" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
				<path d="M0 0 L7 3.5 L0 7 z" fill="currentColor" />
			</marker>
		</defs>
		{#each steps as step, i (step)}
			<rect
				x="52"
				y={8 + i * 72}
				width={BOX.w}
				height={BOX.h}
				rx="8"
				class="fill-card stroke-border"
				stroke-width="1"
			/>
			<text
				x="120"
				y={35 + i * 72}
				text-anchor="middle"
				class="fill-foreground text-[13px]"
				font-family={mono}>{step}</text
			>
			<line
				x1="120"
				y1={56 + i * 72}
				x2="120"
				y2={72 + i * 72}
				stroke="currentColor"
				stroke-width="1.5"
				marker-end="url(#vv)"
			/>
		{/each}
		<rect
			x="52"
			y="224"
			width={BOX.w}
			height={BOX.h}
			rx="8"
			class="fill-lime-500/10 stroke-lime-500/50"
			stroke-width="1"
		/>
		<text x="120" y="251" text-anchor="middle" class="fill-foreground text-[13px]" font-family={mono}
			>exit 0</text
		>
		<!-- The failing branch, down the left side. -->
		<path
			d="M52 102 L40 102 L40 174 L48 174"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-dasharray="3 3"
		/>
		<text
			x="34"
			y="142"
			text-anchor="middle"
			transform="rotate(-90 34 142)"
			class="fill-muted-foreground text-[11px]">exit 1</text
		>
	</svg>
</Figure>
