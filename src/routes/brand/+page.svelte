<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import Check from 'lucide-svelte/icons/check';
	import Copy from 'lucide-svelte/icons/copy';
	import Download from 'lucide-svelte/icons/download';
	import { siteConfig } from '$lib/config/site';
	import { Icons } from '$lib/components/icons';

	const description =
		'Vale’s mark, wordmark, and colors, with the files to use them: SVG and PNG logos, avatar icons, a social card, and the rules for putting them on a page.';

	// Every file is built by one script from one path, so the mark on this
	// page, in the header, and in the favicon is the same drawing.
	type Ground = 'paper' | 'graphite';
	type Asset = {
		name: string;
		note: string;
		ground: Ground;
		svg: string;
		png?: string;
		/** A lockup is shown smaller than a mark, so the two read at one weight. */
		wide?: boolean;
	};

	const logos: Asset[] = [
		{
			name: 'Logo',
			note: 'Light backgrounds',
			ground: 'paper',
			svg: '/brand/vale-logo.svg',
			png: '/brand/vale-logo.png',
			wide: true
		},
		{
			name: 'Logo, dark',
			note: 'Dark backgrounds',
			ground: 'graphite',
			svg: '/brand/vale-logo-dark.svg',
			png: '/brand/vale-logo-dark.png',
			wide: true
		},
		{
			name: 'Logo, black',
			note: 'One color, light',
			ground: 'paper',
			svg: '/brand/vale-logo-black.svg',
			wide: true
		},
		{
			name: 'Logo, white',
			note: 'One color, dark',
			ground: 'graphite',
			svg: '/brand/vale-logo-white.svg',
			wide: true
		}
	];

	const marks: Asset[] = [
		{
			name: 'Mark',
			note: 'Grass, light backgrounds',
			ground: 'paper',
			svg: '/brand/vale-mark.svg',
			png: '/brand/vale-mark-1024.png'
		},
		{
			name: 'Mark, dark',
			note: 'Dark backgrounds',
			ground: 'graphite',
			svg: '/brand/vale-mark-dark.svg'
		},
		{ name: 'Mark, black', note: 'One color', ground: 'paper', svg: '/brand/vale-mark-black.svg' },
		{
			name: 'Mark, white',
			note: 'One color',
			ground: 'graphite',
			svg: '/brand/vale-mark-white.svg'
		},
		{
			name: 'Icon, dark',
			note: 'Avatar · 1024 px',
			ground: 'graphite',
			svg: '/brand/vale-icon-dark.svg',
			png: '/brand/vale-icon-dark.png'
		},
		{
			name: 'Icon, light',
			note: 'Avatar · 1024 px',
			ground: 'paper',
			svg: '/brand/vale-icon-light.svg',
			png: '/brand/vale-icon-light.png'
		}
	];

	const colors = [
		{
			name: 'Grass',
			hex: '#62A527',
			hsl: 'hsl(92 62% 40%)',
			use: 'The mark and buttons. Links on light use its darker step, #497E1B.'
		},
		{ name: 'Grass, light', hex: '#90D454', hsl: 'hsl(92 60% 58%)', use: 'The same, on dark.' },
		{ name: 'Ink', hex: '#12150E', hsl: 'hsl(90 20% 7%)', use: 'Type and the mono mark on light.' },
		{ name: 'Paper', hex: '#F7F9F3', hsl: 'hsl(80 34% 96.5%)', use: 'Light background.' },
		{ name: 'Graphite', hex: '#0E100C', hsl: 'hsl(90 16% 5.5%)', use: 'Dark background.' }
	];

	// The path from static/brand/vale-mark.svg, so the don'ts below are drawn
	// from the real mark rather than approximated.
	const markPath = 'M0 40 32 40 72 120 40 120ZM96 0 128 0 86 84 70 52Z';
	// The mark's color, following the theme: lime-500 on light, lime-400 on dark.
	const accent = 'text-lime-500 dark:text-lime-400';

	type Mark = {
		transform?: string;
		fill?: string;
		outline?: boolean;
		gradient?: boolean;
		/** A narrower viewBox clips the drawing, which is what cropping does. */
		viewBox?: string;
	};
	type Lockup = 'text' | 'reversed' | 'spaced' | 'small';
	const donts: { label: string; mark?: Mark; lockup?: Lockup }[] = [
		{ label: 'Don’t flip it', mark: { transform: 'translate(128 0) scale(-1 1)' } },
		{ label: 'Don’t tilt it', mark: { transform: 'rotate(-20 64 60)' } },
		{ label: 'Don’t stretch it', mark: { transform: 'translate(-32 0) scale(1.5 1)' } },
		{ label: 'Don’t squeeze it', mark: { transform: 'translate(24 0) scale(0.62 1)' } },
		{ label: 'Don’t recolor it', mark: { fill: '#E0457B' } },
		{ label: 'Don’t outline it', mark: { outline: true } },
		{ label: 'Don’t crop it', mark: { viewBox: '0 0 92 120' } },
		{ label: 'Don’t add effects', mark: { gradient: true } },
		{ label: 'Don’t use the wordmark alone', lockup: 'text' },
		{ label: 'Don’t put the mark after the name', lockup: 'reversed' },
		{ label: 'Don’t change the spacing', lockup: 'spaced' },
		{ label: 'Don’t resize the mark', lockup: 'small' }
	];

	const markSizes = [16, 24, 32, 48];
	const lockupWidths = [80, 120, 180];

	const ground: Record<Ground, string> = {
		paper: 'bg-[#F7F9F3]',
		graphite: 'bg-[#0E100C]'
	};

	// One "copied" slot rather than one per tile: only the last click matters.
	let copied = $state<string | null>(null);
	let timer = 0;

	async function copy(key: string, text: string | Promise<string>) {
		try {
			await navigator.clipboard.writeText(await text);
		} catch {
			return;
		}
		copied = key;
		clearTimeout(timer);
		timer = window.setTimeout(() => (copied = null), 1600);
	}

	function copySvg(href: string) {
		copy(
			href,
			fetch(href).then((r) => r.text())
		);
	}

	const button =
		'inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500';
</script>

<MetaTags
	title="Brand assets — Vale"
	{description}
	canonical="https://vale.sh/brand"
	openGraph={{
		url: 'https://vale.sh/brand',
		title: 'Vale brand assets',
		description,
		images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: 'The Vale logo' }]
	}}
/>

{#snippet tile(asset: Asset)}
	<li class="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card">
		<div class="flex h-44 items-center justify-center {ground[asset.ground]} px-10">
			<img
				src={asset.svg}
				alt={asset.name}
				class="{asset.wide ? 'h-14' : 'h-20'} w-auto max-w-full"
			/>
		</div>
		<!-- The buttons wrap under the label rather than squeezing it. -->
		<div
			class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-border/60 p-4"
		>
			<div class="min-w-[10rem]">
				<p class="text-sm font-medium text-foreground">{asset.name}</p>
				<p class="text-xs text-muted-foreground">{asset.note}</p>
			</div>
			<div class="flex shrink-0 items-center gap-1.5">
				<a href={asset.svg} download class={button}>
					<Download class="h-3.5 w-3.5" />
					SVG
				</a>
				{#if asset.png}
					<a href={asset.png} download class={button}>
						<Download class="h-3.5 w-3.5" />
						PNG
					</a>
				{/if}
				<button type="button" class={button} onclick={() => copySvg(asset.svg)}>
					{#if copied === asset.svg}
						<Check class="h-3.5 w-3.5 text-lime-600 dark:text-lime-400" />
						Copied
					{:else}
						<Copy class="h-3.5 w-3.5" />
						Copy
					{/if}
				</button>
			</div>
		</div>
	</li>
{/snippet}

<article>
	<header class="border-b border-border/60 py-14 sm:py-20">
		<div class="mx-auto max-w-5xl px-6 lg:px-8">
			<h1 class="text-base/7 font-semibold text-lime-600 dark:text-lime-400">Brand assets</h1>
			<p class="mt-2 max-w-2xl text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">
				Vale’s mark, wordmark, and colors.
			</p>
			<p class="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
				For a talk, a post, a docs page, or an integration listing. Use the files as they are: every
				one is drawn from a single vector, so they match each other and the site. Writing about
				Vale? The
				<a
					href="/press"
					class="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
					>press page</a
				>
				has the boilerplate, the facts, and the terms to use.
			</p>

			<div class="mt-8 flex flex-wrap items-center gap-3">
				<a
					href="/brand/vale-brand.zip"
					download
					class="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
				>
					<Download class="h-4 w-4" />
					Download everything
				</a>
				<a
					href="https://github.com/errata-ai/vale.sh/tree/svelte/static/brand"
					target="_blank"
					rel="noreferrer"
					class="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
				>
					Browse on GitHub
					<ArrowUpRight class="h-4 w-4" />
				</a>
			</div>

			<!-- The lockup at size, on both grounds, before the file list. -->
			<div class="mt-12 grid gap-4 sm:grid-cols-2">
				<div
					class="flex h-56 items-center justify-center rounded-2xl border border-border/60 bg-[#F7F9F3] px-10 sm:h-64"
				>
					<img
						src="/brand/vale-logo.svg"
						alt="The Vale logo on a light background"
						class="h-16 w-auto sm:h-20"
					/>
				</div>
				<div
					class="flex h-56 items-center justify-center rounded-2xl border border-border/60 bg-[#0E100C] px-10 sm:h-64"
				>
					<img
						src="/brand/vale-logo-dark.svg"
						alt="The Vale logo on a dark background"
						class="h-16 w-auto sm:h-20"
					/>
				</div>
			</div>
		</div>
	</header>

	<section class="border-b border-border/60 py-14 sm:py-16">
		<div class="mx-auto max-w-5xl px-6 lg:px-8">
			<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Logo</h2>
			<p class="mt-4 max-w-2xl text-pretty leading-7 text-muted-foreground">
				The mark and the wordmark together. Pick the file for the background it will sit on: Grass
				has a step for each. The mono versions are for print and single-color contexts.
			</p>
			<ul class="mt-8 grid gap-4 sm:grid-cols-2">
				{#each logos as asset (asset.svg)}
					{@render tile(asset)}
				{/each}
			</ul>
		</div>
	</section>

	<section class="border-b border-border/60 py-14 sm:py-16">
		<div class="mx-auto max-w-5xl px-6 lg:px-8">
			<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Mark</h2>
			<p class="mt-4 max-w-2xl text-pretty leading-7 text-muted-foreground">
				The mark on its own, for favicons, avatars, and anywhere the name is already in view. The
				icons are opaque squares: let the platform round the corners.
			</p>
			<ul class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each marks as asset (asset.svg)}
					{@render tile(asset)}
				{/each}
			</ul>
		</div>
	</section>

	<section class="border-b border-border/60 py-14 sm:py-16">
		<div class="mx-auto max-w-5xl px-6 lg:px-8">
			<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Color</h2>
			<p class="mt-4 max-w-2xl text-pretty leading-7 text-muted-foreground">
				One accent and three neutrals. Grass is the mark and the buttons, with a lighter step for
				dark backgrounds and a darker one where it has to read as text. Click a swatch to copy its
				hex.
			</p>
			<ul class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
				{#each colors as color (color.hex)}
					<li>
						<button
							type="button"
							onclick={() => copy(color.hex, color.hex)}
							class="group w-full overflow-hidden rounded-2xl border border-border/60 bg-card text-left transition-colors hover:border-lime-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
						>
							<div class="h-28 border-b border-border/60" style="background: {color.hex}"></div>
							<div class="p-4">
								<div class="flex items-center justify-between gap-2">
									<p class="text-sm font-medium text-foreground">{color.name}</p>
									{#if copied === color.hex}
										<span
											class="inline-flex items-center gap-1 text-xs text-lime-600 dark:text-lime-400"
										>
											<Check class="h-3.5 w-3.5" />
											Copied
										</span>
									{:else}
										<Copy
											class="h-3.5 w-3.5 text-muted-foreground/60 transition-colors group-hover:text-foreground"
										/>
									{/if}
								</div>
								<p class="mt-1 font-mono text-xs text-foreground">{color.hex}</p>
								<p class="font-mono text-xs text-muted-foreground">{color.hsl}</p>
								<p class="mt-2 text-xs text-muted-foreground">{color.use}</p>
							</div>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<section class="border-b border-border/60 py-14 sm:py-16">
		<div class="mx-auto max-w-5xl px-6 lg:px-8">
			<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Typography</h2>
			<p class="mt-4 max-w-2xl text-pretty leading-7 text-muted-foreground">
				The wordmark is a serif; everything else is Inter. Anything that is a command, a file name,
				or a rule goes in a monospace face; the platform default is fine.
			</p>
			<div class="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
				<div class="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
					<p class="text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
						Your style, our editor.
					</p>
					<p class="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
						Vale brings code-like linting to prose: one rule set, every document, entirely offline.
					</p>
					<p class="mt-5 font-mono text-sm text-muted-foreground">
						$ vale --minAlertLevel=error docs/
					</p>
				</div>
				<dl class="divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
					<div class="flex items-baseline justify-between gap-4 p-5">
						<dt class="text-sm text-muted-foreground">Display</dt>
						<dd class="text-xl font-medium tracking-tight">Inter Medium</dd>
					</div>
					<div class="flex items-baseline justify-between gap-4 p-5">
						<dt class="text-sm text-muted-foreground">Wordmark</dt>
						<dd><Icons.wordmark class="h-5 w-auto text-foreground" /></dd>
					</div>
					<div class="flex items-baseline justify-between gap-4 p-5">
						<dt class="text-sm text-muted-foreground">Headings</dt>
						<dd class="text-xl font-semibold tracking-tight">Inter Semibold</dd>
					</div>
					<div class="flex items-baseline justify-between gap-4 p-5">
						<dt class="text-sm text-muted-foreground">Body</dt>
						<dd class="text-xl">Inter Regular</dd>
					</div>
					<div class="flex items-baseline justify-between gap-4 p-5">
						<dt class="text-sm text-muted-foreground">Code</dt>
						<dd class="font-mono text-lg">Monospace</dd>
					</div>
					<div class="p-5 text-sm leading-6 text-muted-foreground">
						The wordmark is
						<a
							href="https://github.com/productiontype/Newsreader"
							target="_blank"
							rel="noreferrer"
							class="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
							>Newsreader</a
						>
						Semibold, shipped as paths. Both faces are free under the SIL Open Font License; Inter is
						from
						<a
							href="https://rsms.me/inter/"
							target="_blank"
							rel="noreferrer"
							class="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
							>rsms.me/inter</a
						>.
					</div>
				</dl>
			</div>
		</div>
	</section>

	<section class="border-b border-border/60 py-14 sm:py-16">
		<div class="mx-auto max-w-5xl px-6 lg:px-8">
			<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Using it</h2>

			<div class="mt-8 grid gap-4 lg:grid-cols-2">
				<!--
					Clear space is one stroke width of the mark on every side. The
					stroke is a quarter of the mark's width, which is 0.267 of the
					lockup's height, so the padding here is that fraction of `--h`.
				-->
				<figure class="rounded-2xl border border-border/60 bg-card p-6">
					<div class="flex justify-center py-8">
						<div
							class="relative rounded-sm outline-dashed outline-1 outline-lime-500/70"
							style="--h: 64px; padding: calc(var(--h) * 0.267)"
						>
							<img
								src="/brand/vale-logo.svg"
								alt=""
								class="block w-auto"
								style="height: var(--h)"
							/>
							<span
								aria-hidden="true"
								class="absolute left-0 top-0 border-b border-r border-lime-500/70 bg-lime-500/10"
								style="width: calc(var(--h) * 0.267); height: calc(var(--h) * 0.267)"
							></span>
						</div>
					</div>
					<figcaption class="mt-2 text-sm leading-6 text-muted-foreground">
						<span class="font-medium text-foreground">Clear space.</span> Keep one stroke-width of the
						mark clear on every side. Nothing else goes inside the dashed line.
					</figcaption>
				</figure>

				<!-- Actual pixel sizes, so the minimum can be seen rather than read. -->
				<figure class="rounded-2xl border border-border/60 bg-card p-6">
					<div class="flex flex-wrap items-end justify-center gap-x-8 gap-y-4 py-4">
						{#each markSizes as px (px)}
							<div class="flex flex-col items-center gap-2">
								<img src="/brand/vale-mark.svg" alt="" class="w-auto" style="height: {px}px" />
								<span class="font-mono text-[11px] text-muted-foreground">{px}px</span>
							</div>
						{/each}
					</div>
					<div
						class="flex flex-wrap items-end justify-center gap-x-8 gap-y-4 border-t border-border/60 py-4"
					>
						{#each lockupWidths as px (px)}
							<div class="flex flex-col items-center gap-2">
								<img src="/brand/vale-logo.svg" alt="" class="h-auto" style="width: {px}px" />
								<span class="font-mono text-[11px] text-muted-foreground">{px}px</span>
							</div>
						{/each}
					</div>
					<figcaption class="mt-2 text-sm leading-6 text-muted-foreground">
						<span class="font-medium text-foreground">Scale.</span> The mark holds down to 16 px, where
						it is the favicon. Keep the lockup at least 80 px wide; below that, drop the wordmark.
					</figcaption>
				</figure>
			</div>

			<dl class="mt-4 grid gap-4 text-sm leading-6 sm:grid-cols-2 lg:grid-cols-4">
				<div class="rounded-2xl border border-border/60 bg-card p-5">
					<dt class="font-medium text-foreground">Which one</dt>
					<dd class="mt-1 text-muted-foreground">
						The lockup where Vale is being introduced. The mark alone where the name is already in
						view, or where there is no room for it.
					</dd>
				</div>
				<div class="rounded-2xl border border-border/60 bg-card p-5">
					<dt class="font-medium text-foreground">The name</dt>
					<dd class="mt-1 text-muted-foreground">
						<em>Vale</em> in prose, capital V, and
						<code class="font-mono text-[13px]">vale</code>
						when you mean the command. Not VALE, and not Vale.sh.
					</dd>
				</div>
				<div class="rounded-2xl border border-border/60 bg-card p-5">
					<dt class="font-medium text-foreground">The wordmark</dt>
					<dd class="mt-1 text-muted-foreground">
						Newsreader Semibold, as shipped in the lockup files. Don’t set it yourself: use the SVG
						so the spacing matches.
					</dd>
				</div>
				<div class="rounded-2xl border border-border/60 bg-card p-5">
					<dt class="font-medium text-foreground">Background</dt>
					<dd class="mt-1 text-muted-foreground">
						A flat color, light or dark. Over a photograph or a gradient, put it on a Paper or
						Graphite panel first.
					</dd>
				</div>
			</dl>

			<h3 class="mt-12 text-lg font-semibold tracking-tight">Logo don’ts</h3>
			<ul class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
				{#each donts as item (item.label)}
					<li class="rounded-2xl border border-border/60 bg-card p-5">
						<div class="relative flex h-24 items-center justify-center">
							{#if item.mark}
								<svg
									viewBox={item.mark.viewBox ?? '0 0 128 120'}
									class="h-16 w-16 {accent}"
									aria-hidden="true"
								>
									{#if item.mark.gradient}
										<defs>
											<linearGradient id="dont-gradient" x1="0" y1="0" x2="1" y2="1">
												<stop offset="0" stop-color="#62A527" />
												<stop offset="1" stop-color="#0EA5E9" />
											</linearGradient>
										</defs>
									{/if}
									<path
										d={markPath}
										transform={item.mark.transform}
										fill={item.mark.outline
											? 'none'
											: item.mark.gradient
												? 'url(#dont-gradient)'
												: (item.mark.fill ?? 'currentColor')}
										stroke={item.mark.outline ? 'currentColor' : 'none'}
										stroke-width={item.mark.outline ? 6 : 0}
									/>
								</svg>
							{:else if item.lockup}
								<!--
									Set in HTML rather than from the SVG, since every one of these
									is a departure from it. Inter is the site font, so it matches.
								-->
								<span
									class="inline-flex items-center {item.lockup === 'spaced'
										? 'gap-7'
										: 'gap-2'} {item.lockup === 'reversed' ? 'flex-row-reverse' : ''}"
								>
									{#if item.lockup !== 'text'}
										<svg
											viewBox="0 0 128 120"
											class="{item.lockup === 'small' ? 'h-4' : 'h-8'} w-auto {accent}"
											aria-hidden="true"
										>
											<path d={markPath} fill="currentColor" />
										</svg>
									{/if}
									<Icons.wordmark class="h-7 w-auto text-foreground" />
								</span>
							{/if}
							<span
								aria-hidden="true"
								class="absolute inset-x-4 top-1/2 h-px -rotate-12 bg-destructive/70"
							></span>
						</div>
						<p class="mt-2 text-center text-sm text-muted-foreground">{item.label}</p>
					</li>
				{/each}
			</ul>

			<p class="mt-8 max-w-2xl text-sm leading-6 text-muted-foreground">
				The mark is not a checkbox. It reads as one at a glance, which is the point, but don’t use
				it in an interface to mean “done” or “passing”. Need a screenshot or a quote instead? The
				<a
					href="/library"
					class="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
					>library</a
				>
				has both.
			</p>
		</div>
	</section>

	<section class="bg-muted/35 py-14 sm:py-16">
		<div class="mx-auto max-w-5xl px-6 lg:px-8">
			<div class="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
				<div>
					<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Guidelines</h2>
					<p class="mt-4 text-pretty leading-7 text-muted-foreground">
						Vale is an ordinary word, and the project makes no claim on it. The mark and the
						wordmark were drawn for the project, and you are welcome to use them to refer to it: in
						a talk, a post, a comparison, or the listing for an integration you built.
					</p>
					<p class="mt-4 text-pretty leading-7 text-muted-foreground">
						The only asks are the obvious ones. Use the files as drawn, and don’t present something
						else as Vale, or as endorsed by it.
					</p>
				</div>
				<div class="rounded-2xl border border-border/60 bg-background p-6">
					<h3 class="text-sm font-semibold text-foreground">Questions</h3>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">
						Not sure a use is fine, or need a file that isn’t here? Ask on Discord or open an issue.
					</p>
					<div class="mt-4 flex flex-wrap gap-2">
						<a href={siteConfig.links.discord} target="_blank" rel="noreferrer" class={button}>
							Discord
							<ArrowUpRight class="h-3.5 w-3.5" />
						</a>
						<a
							href="https://github.com/errata-ai/vale.sh/issues"
							target="_blank"
							rel="noreferrer"
							class={button}
						>
							Open an issue
							<ArrowUpRight class="h-3.5 w-3.5" />
						</a>
					</div>
				</div>
			</div>
		</div>
	</section>
</article>
