<script lang="ts">
	type Row = {
		label: string;
		value: number;
		/** Printed instead of `value + unit` when the raw number reads badly. */
		display?: string;
		/** Sits under the label — what the reader should take from this bar. */
		note?: string;
		/** Draws the bar in the muted track color instead of the accent. */
		muted?: boolean;
		/** Links the label to the corpus, so a figure can be checked at source. */
		href?: string;
	};

	let { rows, unit = 'ms', caption }: { rows: Row[]; unit?: string; caption?: string } = $props();

	// Bars are scaled against the largest value rather than a fixed axis, so a
	// chart stays readable whether its range is 20 ms or 20 seconds.
	const max = $derived(Math.max(...rows.map((r) => r.value)));

	function width(v: number): number {
		// A floor, so a bar that is tiny next to the maximum is still visible.
		return Math.max((v / max) * 100, 1.5);
	}

	function format(r: Row): string {
		return r.display ?? `${r.value.toLocaleString()} ${unit}`;
	}
</script>

<figure class="flex flex-col gap-3">
	<div class="flex flex-col gap-3">
		{#each rows as row}
			<div class="flex flex-col gap-1.5">
				<div class="flex items-baseline justify-between gap-4">
					{#if row.href}
						<a
							href={row.href}
							target="_blank"
							rel="noreferrer"
							class="text-sm font-medium text-foreground underline decoration-border decoration-1 underline-offset-4 transition-colors hover:decoration-lime-500"
							>{row.label}<span aria-hidden="true" class="text-muted-foreground/60">↗</span></a
						>
					{:else}
						<span class="text-sm font-medium text-foreground">{row.label}</span>
					{/if}
					<span
						class="shrink-0 font-mono text-sm tabular-nums {row.muted
							? 'text-muted-foreground'
							: 'text-lime-600 dark:text-lime-400'}"
					>
						{format(row)}
					</span>
				</div>
				<div class="h-2.5 w-full overflow-hidden rounded-full bg-muted">
					<div
						class="h-full rounded-full {row.muted ? 'bg-muted-foreground/40' : 'bg-lime-500'}"
						style="width: {width(row.value)}%"
					></div>
				</div>
				{#if row.note}
					<span class="text-xs leading-relaxed text-muted-foreground">{row.note}</span>
				{/if}
			</div>
		{/each}
	</div>

	{#if caption}
		<figcaption class="text-xs leading-relaxed text-muted-foreground/70">{caption}</figcaption>
	{/if}
</figure>
