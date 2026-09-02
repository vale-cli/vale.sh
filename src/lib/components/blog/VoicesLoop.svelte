<script lang="ts">
	// The loop, drawn once: the whole post is a detail of one of these four
	// steps. currentColor throughout, so it follows the theme.
	const steps = [
		{ x: 0, label: 'agent writes' },
		{ x: 160, label: 'vale checks' },
		{ x: 320, label: 'agent fixes' }
	];
</script>

<svg
	viewBox="0 0 620 96"
	class="mx-auto my-8 w-full max-w-2xl text-muted-foreground"
	role="img"
	aria-label="The agent writes a draft, Vale checks it, the agent applies the fix, and a clean run ends the loop."
>
	<defs>
		<marker id="vh" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
			<path d="M0 0 L7 3.5 L0 7 z" fill="currentColor" />
		</marker>
	</defs>
	{#each steps as step (step.x)}
		<rect
			x={step.x}
			y="26"
			width="136"
			height="44"
			rx="8"
			class="fill-card stroke-border"
			stroke-width="1"
		/>
		<text
			x={step.x + 68}
			y="53"
			text-anchor="middle"
			class="fill-foreground text-[13px]"
			font-family="ui-monospace, monospace">{step.label}</text
		>
		<line
			x1={step.x + 140}
			y1="48"
			x2={step.x + 156}
			y2="48"
			stroke="currentColor"
			stroke-width="1.5"
			marker-end="url(#vh)"
		/>
	{/each}
	<rect
		x="480"
		y="26"
		width="136"
		height="44"
		rx="8"
		class="fill-lime-500/10 stroke-lime-500/50"
		stroke-width="1"
	/>
	<text
		x="548"
		y="53"
		text-anchor="middle"
		class="fill-foreground text-[13px]"
		font-family="ui-monospace, monospace">exit 0</text
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
