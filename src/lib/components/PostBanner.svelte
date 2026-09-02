<script lang="ts">
	// Every post gets a banner by construction, drawn as a small terminal
	// window. Precedence: an `image` from the frontmatter wins outright; a
	// named `motif` draws the post's subject; `poster` numbers render as a
	// token meter (after Claude-Code-Usage-Monitor's gauges) with the real
	// counts beside the bars -- the cover is the finding. Everything else
	// gets a prose sketch generated from the slug: a document with a few
	// flagged spans, which is what a Vale blog post is about. The meter never
	// renders without real numbers, so no banner shows a made-up figure. All
	// deterministic, so server and client render alike; theme tokens keep
	// dark mode free.
	let {
		seed,
		image,
		values,
		motif,
		alt = '',
		class: klass = ''
	}: {
		seed: string;
		image?: string;
		values?: number[];
		// A named subject illustration, drawn in the same terminal window.
		// 'view': a structured file whose prose fields alone light up.
		// 'tree': a library of rules as a directory tree.
		// 'savings': cumulative token cost, resident lines against the rules band.
		motif?: string;
		alt?: string;
		class?: string;
	} = $props();

	// FNV-1a: a stable hash so a seed always yields the same picture.
	const hash = (s: string) => {
		let h = 2166136261;
		for (let i = 0; i < s.length; i++) {
			h ^= s.charCodeAt(i);
			h = Math.imul(h, 16777619);
		}
		return h >>> 0;
	};

	const mulberry32 = (a: number) => () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};

	const SEGS = 20;
	const segs = Array.from({ length: SEGS }, (_, s) => s);

	type Row = { frac: number; count: number; min: boolean };

	// The meter: only for real numbers from the frontmatter.
	const rows = $derived.by((): Row[] => {
		if (!values || values.length < 2) return [];
		const max = Math.max(...values);
		const least = Math.min(...values);
		return values.map((v) => ({ frac: max === 0 ? 0 : v / max, count: v, min: v === least }));
	});

	// The monitor's traffic-light read: a full gauge is the expensive one.
	const tone = (r: Row) => {
		if (r.min) return 'bg-lime-500';
		if (r.frac > 0.66) return 'bg-rose-400';
		if (r.frac > 0.25) return 'bg-amber-400';
		return 'bg-lime-500';
	};

	// The fallback: a page of prose sketched as word-bars, with a couple of
	// spans marked the way alerts are. No numbers, because there are none.
	type Word = { w: number; mark?: 'rose' | 'lime' };
	type ProseLine = Word[];

	const prose = $derived.by((): ProseLine[] => {
		const rand = mulberry32(hash(seed));
		const lines: ProseLine[] = [];
		const LINES = 6;
		for (let l = 0; l < LINES; l++) {
			const words: Word[] = [];
			const count = 4 + Math.floor(rand() * 3);
			for (let w = 0; w < count; w++) {
				words.push({ w: 16 + Math.floor(rand() * 48) });
			}
			// The last line runs short, like a paragraph's end.
			if (l === LINES - 1) words.length = Math.max(2, words.length - 3);
			lines.push(words);
		}
		// Flag two spans rose and one lime, never on the same line.
		const marks: Array<'rose' | 'rose' | 'lime'> = ['rose', 'rose', 'lime'];
		const used = new Set<number>();
		for (const mark of marks) {
			let l = Math.floor(rand() * LINES);
			while (used.has(l)) l = (l + 1) % LINES;
			used.add(l);
			lines[l][Math.floor(rand() * lines[l].length)].mark = mark;
		}
		return lines;
	});

	// The 'view' motif: a YAML document sketched as indented bars. Structure
	// stays gray; the prose fields a View extracts are lit, and one carries an
	// alert at its exact location -- the whole tutorial in one picture.
	// Widths are hand-set to read as the Petstore example, not generated.
	type ViewLine = { indent: number; key: number; value: number; prose?: boolean; alert?: string };

	const viewLines: ViewLine[] = [
		{ indent: 0, key: 44, value: 0 },
		{ indent: 1, key: 24, value: 72, prose: true },
		{ indent: 1, key: 58, value: 148, prose: true, alert: '9:34' },
		{ indent: 0, key: 38, value: 0 },
		{ indent: 1, key: 20, value: 88 },
		{ indent: 2, key: 46, value: 112, prose: true },
		{ indent: 1, key: 34, value: 64 }
	];

	// The 'tree' motif: the Std library as its actual directory tree. Real
	// text, because the tree IS the taxonomy -- abstract bars sell it short.
	type TreeLine = { glyph: string; dir: string; rules: string };

	const treeLines: TreeLine[] = [
		{ glyph: '', dir: 'Std/', rules: '' },
		{ glyph: '├── ', dir: 'Abbreviations/', rules: 'Acronyms, Latin' },
		{ glyph: '├── ', dir: 'DateTime/', rules: 'DateFormat, TimeFormat' },
		{ glyph: '├── ', dir: 'Grammar/', rules: 'Contractions, PassiveVoice' },
		{ glyph: '├── ', dir: 'Punctuation/', rules: 'OxfordComma, Ellipses, Spacing' },
		{ glyph: '├── ', dir: 'Readability/', rules: 'SentenceLength' },
		{ glyph: '└── ', dir: 'Usage/', rules: 'GenderedTerms, FirstPerson…' }
	];

	// The 'savings' motif: line endpoints as percentages of the tallest line,
	// from the measured per-request costs (skill 3,777 / briefs 1,535 / a
	// full alert report 735). Lines scale to the box; labels stay HTML.
	const savings = [
		{ y: 0, label: 'skill 189k', cls: 'text-rose-400', line: 'rgb(251 113 133)' },
		{ y: 59.4, label: 'briefs 77k', cls: 'text-amber-400', line: 'rgb(251 191 36)' },
		{
			y: 80.5,
			label: 'rules ≤37k',
			cls: 'text-lime-600 dark:text-lime-400',
			line: 'rgb(132 204 22)'
		},
		{
			y: 100,
			label: 'clean 0',
			cls: 'font-bold text-lime-600 dark:text-lime-400',
			line: 'rgb(132 204 22)'
		}
	];

	const title = $derived(
		motif === 'view' ? 'vale API.yml' : motif === 'tree' ? 'tree Std' : `vale ${seed}.md`
	);
</script>

<div class={klass}>
	{#if image}
		<img src={image} {alt} class="block h-full w-full object-cover" />
	{:else}
		<div class="flex h-full w-full flex-col bg-card" role="presentation" aria-hidden="true">
			<div class="flex shrink-0 items-center gap-1.5 bg-muted/60 px-3 py-1.5">
				<span class="h-2 w-2 rounded-full bg-rose-400"></span>
				<span class="h-2 w-2 rounded-full bg-amber-400"></span>
				<span class="h-2 w-2 rounded-full bg-lime-500"></span>
				<span class="ml-2 truncate font-mono text-[10px] text-muted-foreground">{title}</span>
			</div>

			{#if motif === 'view'}
				<div class="flex min-h-0 flex-1 flex-col justify-evenly gap-1 px-4 py-3">
					{#each viewLines as line, i (i)}
						<div class="flex items-center gap-2" style="padding-left: {line.indent * 18}px">
							<span class="h-2 shrink-0 rounded-[2px] bg-foreground/25" style="width: {line.key}px"
							></span>
							{#if line.value > 0}
								<span
									class="h-2 rounded-[2px] {line.prose ? 'bg-lime-500' : 'bg-foreground/10'}"
									style="width: {line.value}px"
								></span>
							{/if}
							{#if line.alert}
								<span class="ml-auto flex shrink-0 items-center gap-1.5 font-mono text-[10px]">
									<span class="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
									<span class="text-rose-400">{line.alert}</span>
								</span>
							{/if}
						</div>
					{/each}
				</div>
			{:else if motif === 'tree'}
				<div
					class="flex min-h-0 flex-1 flex-col justify-center overflow-hidden px-4 py-2 font-mono text-[10px] leading-[1.6] sm:text-[11px]"
				>
					{#each treeLines as line (line.dir)}
						<div class="flex whitespace-pre">
							<span class="text-muted-foreground/50">{line.glyph}</span>
							<span class="font-medium text-lime-600 dark:text-lime-400">{line.dir}</span>
							{#if line.rules}
								<span class="ml-3 truncate text-muted-foreground">{line.rules}</span>
							{/if}
						</div>
					{/each}
				</div>
			{:else if motif === 'savings'}
				<div class="flex min-h-0 flex-1 gap-3 px-4 py-3">
					<div class="relative min-w-0 flex-1">
						<svg
							viewBox="0 0 100 100"
							preserveAspectRatio="none"
							class="absolute inset-0 h-full w-full"
							role="presentation"
							aria-hidden="true"
						>
							<polygon points="0,100 100,80.5 100,100" fill="rgb(132 204 22)" opacity="0.15" />
							{#each savings as s (s.label)}
								<line
									x1="0"
									y1="100"
									x2="100"
									y2={s.y}
									stroke={s.line}
									stroke-width="2"
									vector-effect="non-scaling-stroke"
								/>
							{/each}
						</svg>
					</div>
					<div class="relative w-20 shrink-0 font-mono text-[10px]">
						{#each savings as s (s.label)}
							<span
								class="absolute right-0 -translate-y-1/2 whitespace-nowrap {s.cls}"
								style="top: {4 + s.y * 0.92}%">{s.label}</span
							>
						{/each}
					</div>
				</div>
			{:else if rows.length > 0}
				<div class="flex min-h-0 flex-1 flex-col justify-evenly gap-1.5 px-4 py-3">
					{#each rows as row, i (i)}
						{@const filled = Math.round(row.frac * SEGS)}
						<div class="flex items-center gap-3">
							<div class="flex min-w-0 flex-1 gap-[3px]">
								{#each segs as s (s)}
									<span
										class="h-2 min-w-0 flex-1 rounded-[2px] sm:h-2.5 {s < filled
											? tone(row)
											: 'bg-foreground/10'}"
									></span>
								{/each}
							</div>
							<span
								class="w-12 shrink-0 text-right font-mono text-xs tabular-nums {row.min
									? 'font-semibold text-lime-500'
									: 'text-foreground/80'}"
							>
								{row.count}
							</span>
						</div>
					{/each}
				</div>
			{:else}
				<div class="flex min-h-0 flex-1 flex-col justify-evenly gap-1.5 px-4 py-3">
					{#each prose as line, i (i)}
						<div class="flex items-center gap-1.5">
							{#each line as word, w (w)}
								<span
									class="h-2 shrink rounded-[2px] {word.mark === 'rose'
										? 'bg-rose-400/80'
										: word.mark === 'lime'
											? 'bg-lime-500/90'
											: 'bg-foreground/15'}"
									style="width: {word.w}px"
								></span>
							{/each}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
