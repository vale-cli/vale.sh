<script lang="ts">
	/*
		Artwork for the three tiles that assert something rather than demonstrate
		it. The other four keep a code block, because showing the real syntax is
		the whole argument there.

		Everything is drawn from theme tokens plus `--tile`, which each tile sets
		on itself and custom properties inherit down -- so a drawing takes its
		accent from whichever tile it sits in, and follows light and dark without
		a second copy.
	*/
	let { kind }: { kind: 'private' | 'speed' | 'platforms' } = $props();

	const line = 'hsl(var(--foreground) / 0.22)';
	const fill = 'hsl(var(--foreground) / 0.05)';
	const faint = 'hsl(var(--foreground) / 0.12)';
</script>

<svg
	viewBox="0 0 240 116"
	fill="none"
	role="img"
	aria-hidden="true"
	class="w-full"
	stroke-linecap="round"
	stroke-linejoin="round"
>
	{#if kind === 'private'}
		<!-- Everything stays inside the machine; the hop outward is struck through. -->
		<rect x="8" y="18" width="112" height="80" rx="10" {fill} stroke={line} stroke-width="1.5" />
		<rect x="24" y="36" width="80" height="6" rx="3" fill={faint} />
		<rect x="24" y="50" width="62" height="6" rx="3" fill={faint} />
		<rect x="24" y="64" width="72" height="6" rx="3" fill="var(--tile)" opacity="0.55" />
		<rect x="24" y="78" width="44" height="6" rx="3" fill={faint} />

		<!-- The remote it never reaches. -->
		<path
			d="M182 44a16 16 0 0 1 31.2-4.8A13 13 0 1 1 214 66h-30a11 11 0 0 1 -2-21.8Z"
			{fill}
			stroke={line}
			stroke-width="1.5"
		/>

		<path d="M128 58h34" stroke={line} stroke-width="1.5" stroke-dasharray="5 5" />
		<circle
			cx="150"
			cy="58"
			r="13"
			fill="hsl(var(--background))"
			stroke="var(--tile)"
			stroke-width="1.5"
		/>
		<path d="M145 53l10 10M155 53l-10 10" stroke="var(--tile)" stroke-width="1.5" />
	{:else if kind === 'speed'}
		<!-- One binary on the left; the corpus it clears on the right. -->
		<rect
			x="10"
			y="34"
			width="46"
			height="46"
			rx="10"
			fill="var(--tile)"
			opacity="0.16"
			stroke="var(--tile)"
			stroke-width="1.5"
		/>
		<path d="M35 44l-9 14h8l-2 10 9-14h-8z" fill="var(--tile)" />

		<!-- Motion lines, shortening as they trail off. -->
		<path d="M68 44h26M68 57h44M68 70h32" stroke="var(--tile)" stroke-width="1.5" opacity="0.35" />

		<!-- Pages, all cleared. -->
		{#each [0, 1, 2, 3] as i}
			<rect
				x={126 + i * 28}
				y={34 + i * 4}
				width="22"
				height={46 - i * 8}
				rx="4"
				{fill}
				stroke={line}
				stroke-width="1.25"
			/>
		{/each}
		<path d="M124 92h96" stroke={faint} stroke-width="4" />
		<path d="M124 92h74" stroke="var(--tile)" stroke-width="4" />
	{:else}
		<!-- Three platforms, one tool. -->
		<rect x="6" y="30" width="66" height="46" rx="8" {fill} stroke={line} stroke-width="1.5" />
		<path d="M2 84h74" stroke={line} stroke-width="1.5" />
		<rect x="20" y="44" width="38" height="5" rx="2.5" fill={faint} />
		<rect x="20" y="56" width="26" height="5" rx="2.5" fill={faint} />

		<rect
			x="88"
			y="22"
			width="64"
			height="62"
			rx="8"
			fill="var(--tile)"
			opacity="0.14"
			stroke="var(--tile)"
			stroke-width="1.5"
		/>
		<rect x="102" y="38" width="36" height="5" rx="2.5" fill="var(--tile)" opacity="0.7" />
		<rect x="102" y="50" width="24" height="5" rx="2.5" fill="var(--tile)" opacity="0.45" />
		<rect x="102" y="62" width="30" height="5" rx="2.5" fill="var(--tile)" opacity="0.45" />

		<rect x="168" y="30" width="66" height="46" rx="8" {fill} stroke={line} stroke-width="1.5" />
		<path d="M164 84h74" stroke={line} stroke-width="1.5" />
		<rect x="182" y="44" width="38" height="5" rx="2.5" fill={faint} />
		<rect x="182" y="56" width="26" height="5" rx="2.5" fill={faint} />
	{/if}
</svg>
