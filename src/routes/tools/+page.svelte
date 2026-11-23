<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import { onMount } from 'svelte';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import Library from 'lucide-svelte/icons/library';
	import Cpu from 'lucide-svelte/icons/cpu';
	import ShieldCheck from 'lucide-svelte/icons/shield-check';
	import BookOpen from 'lucide-svelte/icons/book-open';
	import ProseInput from '$lib/components/tools/ProseInput.svelte';
	import { listed, type ToolSlug } from '$lib/tools';
	import { settled } from '$lib/tools/settle.svelte';
	import { count, duration, maskMarkdown, sentences, stripMarkdownSyntax } from '$lib/tools/text';
	import { audience, consensus, score } from '$lib/tools/readability';
	import { convert } from '$lib/tools/titlecase';
	import { code, writing } from '$lib/tools/cases';
	import { createDetector, type Detector, type PackageData } from '$lib/tools/aitells';

	let { data } = $props();
	const tools = $derived(listed(data.engine));

	const title = 'Free Writing Tools: AI Detector, Word Counter, Readability Checker';
	const description =
		'Free writing tools that run in your browser: an AI writing detector, word and character counters, a readability checker, case converters, and reading and speech time calculators. No sign-up.';
	const url = 'https://vale.sh/tools';

	const jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'ItemList',
			name: 'Writing tools',
			itemListElement: tools.map((t, i) => ({
				'@type': 'ListItem',
				position: i + 1,
				name: t.title,
				url: `${url}/${t.slug}`
			}))
		}).replace(/</g, '\\u003c')
	);

	const SAMPLE = `# Unlocking the power of better onboarding

In today's fast-paced world, it's important to note that onboarding plays a crucial role in the success of any product. This isn't just a checklist — it's a journey that empowers every new user to seamlessly discover value.

We rewrote ours last quarter. Sign-ups that finished setup went from 41% to 63%, mostly because we cut the tour from nine steps to three and asked for the credit card later.`;

	/*
		One draft, read by every tool. The box saves what is typed where each
		tool looks for it (see ProseInput), so opening a card continues with the
		same text, and each card shows what its tool makes of the draft so far.
	*/
	let text = $state('');
	const input = settled(() => text);

	const prose = $derived(stripMarkdownSyntax(maskMarkdown(input.value)));
	const split = $derived(sentences(prose));
	const counts = $derived(count(prose, split));
	const has = $derived(counts.words > 0);

	// The detector's patterns are a download of their own, fetched once there
	// is something to check.
	let detector = $state<Detector | null>(null);
	let wanted = false;
	$effect(() => {
		if (!has || wanted) return;
		wanted = true;
		import('$lib/data/tools/ai-tells.json')
			.then((m) => (detector = createDetector(m.default as unknown as PackageData)))
			.catch(() => {
				// The card keeps its description.
			});
	});
	const found = $derived(detector && has ? detector.scan(input.value) : null);
	const tells = $derived(found ? found.length : null);
	// A few of what it found, for the card: each phrase once, short ones first.
	const phrases = $derived(
		found
			? [...new Set(found.map((f) => f.match.trim()))].filter((m) => m.length <= 28).slice(0, 3)
			: []
	);

	// A headline is one short line; anything longer is a draft, not a title.
	const headline = $derived.by(() => {
		const line = input.value
			.split('\n')
			.map((l) => l.replace(/^#+\s*/, '').trim())
			.find(Boolean);
		return line && line.split(/\s+/).length <= 14 ? convert(line, 'ap') : '';
	});

	const plural = (n: number, one: string) =>
		`${n.toLocaleString('en-US')} ${one}${n === 1 ? '' : 's'}`;

	/** What a tool makes of the draft, in a line; empty until it has something to say. */
	const preview = $derived.by<Partial<Record<ToolSlug, string>>>(() => {
		if (!has) return {};
		const grade = Math.max(0, consensus(score(counts)));
		return {
			'word-counter': `${plural(counts.words, 'word')} · ${duration(counts.words, 238)} to read`,
			'readability-checker':
				counts.words >= 30 && counts.sentences >= 2
					? `Grade ${grade.toFixed(1)} · ${audience(grade).label}`
					: 'Needs a few more sentences',
			'ai-detector':
				tells === null ? 'Checking…' : tells ? plural(tells, 'tell') + ' found' : 'No usual tells',
			'title-case-converter': headline,
			'character-counter': `${plural(counts.characters, 'character')} · ${counts.charactersNoSpaces.toLocaleString('en-US')} without spaces`,
			'reading-time-calculator': `${Math.max(1, Math.ceil(counts.words / 238))} min read`,
			'speech-time-calculator': `${duration(counts.words, 130)} to say`,
			'case-converter': headline ? cases[3].apply(headline) : ''
		};
	});

	let mounted = $state(false);
	onMount(() => (mounted = true));

	// Where the draft's grade sits on the readability checker's own scale.
	const grade = $derived(has && counts.sentences >= 2 ? Math.max(0, consensus(score(counts))) : 8);
	const marker = $derived(Math.min(100, (grade / 18) * 100));

	const cases = [...writing.slice(0, 2), ...code.slice(0, 3)];
	const voices = ['Direct', 'Human', 'Simple', 'Coach', 'Claude', 'Gen Z'];
	// Guides down, topics across: which guides have a rule on which topic.
	const matrix = [
		[3, 2, 3, 1, 0, 2, 3, 1, 2, 3, 0, 1],
		[2, 3, 1, 3, 2, 0, 1, 3, 3, 1, 2, 0],
		[1, 0, 3, 2, 3, 3, 0, 2, 1, 3, 3, 2],
		[3, 1, 0, 3, 1, 2, 3, 0, 2, 1, 1, 3]
	];
	const shade = ['bg-muted', 'bg-lime-500/25', 'bg-lime-500/50', 'bg-lime-500/80'];

	const facts = [
		{
			icon: Cpu,
			title: 'They run Vale',
			text: 'The checks are rules for Vale, an open-source linter for prose, running in your browser. A result here is what Vale reports in your editor or in CI.'
		},
		{
			icon: ShieldCheck,
			title: 'Nothing is uploaded',
			text: 'Your text is read in the page and never sent to a server. A Word document or a PDF is opened on your device.'
		},
		{
			icon: BookOpen,
			title: 'Every rule is open',
			text: 'Each highlight names the rule behind it, and each rule is a file you can read, change, or switch off.'
		}
	];
</script>

<MetaTags
	{title}
	{description}
	canonical={url}
	openGraph={{
		url,
		title,
		description,
		type: 'website',
		images: [
			{
				url: 'https://vale.sh/media/og/tools.png',
				width: 1200,
				height: 630,
				alt: 'Tools for people who write'
			}
		]
	}}
	twitter={{ cardType: 'summary_large_image' }}
/>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<script type="application/ld+json">${jsonLd}</` + `script>`}
</svelte:head>

<div class="mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8">
	<header class="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-end">
		<div>
			<p
				class="font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-lime-600 dark:text-lime-400"
			>
				Free writing tools
			</p>
			<h1 class="mt-4 text-balance text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
				Tools for people who write
			</h1>
			<p class="mt-5 text-pretty text-lg leading-8 text-foreground/85">
				Free, with no account. Paste a draft once and every tool reads it, in your browser.
			</p>
		</div>

		<div>
			<ProseInput
				bind:value={text}
				sample={SAMPLE}
				rows={5}
				label="Your draft"
				placeholder="Paste a draft, or a headline…"
			/>
		</div>
	</header>

	<ul class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
		{#each tools as t (t.slug)}
			{@const Icon = t.icon}
			{@const line = mounted ? preview[t.slug] : undefined}
			<li class="flex">
				<a
					href="/tools/{t.slug}"
					class="group flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-lime-500/40"
				>
					<!--
						Each card opens on a small picture of what its tool does, drawn
						from the draft once there is one.
					-->
					<div
						class="flex h-32 flex-col justify-center border-b border-border/70 bg-muted/40 px-6"
						aria-hidden="true"
					>
						{#if t.slug === 'ai-detector'}
							{#if mounted && phrases.length}
								<div class="flex flex-wrap gap-1.5">
									{#each phrases as phrase, i (phrase)}
										<span
											class="rounded-md px-2 py-0.5 text-sm {i % 2
												? 'bg-orange-500/15 shadow-[inset_0_-2px_0_theme(colors.orange.500)]'
												: 'bg-violet-500/15 shadow-[inset_0_-2px_0_theme(colors.violet.500)]'}"
											>{phrase}</span
										>
									{/each}
								</div>
							{:else}
								<p class="text-[15px] leading-8 text-foreground/80">
									Let’s <span
										class="rounded bg-violet-500/15 px-0.5 shadow-[inset_0_-2px_0_theme(colors.violet.500)]"
										>delve into</span
									>
									the
									<span
										class="rounded bg-violet-500/15 px-0.5 shadow-[inset_0_-2px_0_theme(colors.violet.500)]"
										>rich tapestry</span
									>
									of tools.
									<span
										class="rounded bg-orange-500/15 px-0.5 shadow-[inset_0_-2px_0_theme(colors.orange.500)]"
										>I hope this helps!</span
									>
								</p>
							{/if}
						{:else if t.slug === 'word-counter'}
							<div class="flex items-end gap-5">
								<div>
									<div class="text-4xl font-medium tabular-nums tracking-tight">
										{mounted ? counts.words.toLocaleString('en-US') : 0}
									</div>
									<div class="text-xs text-muted-foreground">words</div>
								</div>
								<div class="pb-0.5">
									<div class="text-lg font-medium tabular-nums text-foreground/80">
										{mounted ? counts.characters.toLocaleString('en-US') : 0}
									</div>
									<div class="text-xs text-muted-foreground">characters</div>
								</div>
								<div class="pb-0.5">
									<div class="text-lg font-medium tabular-nums text-foreground/80">
										{mounted ? counts.sentences : 0}
									</div>
									<div class="text-xs text-muted-foreground">sentences</div>
								</div>
							</div>
						{:else if t.slug === 'readability-checker'}
							<div class="relative h-2 rounded-full">
								<div class="absolute inset-0 flex overflow-hidden rounded-full">
									<span class="h-full w-1/2 bg-lime-500/70"></span>
									<span class="h-full w-1/6 bg-amber-400/80"></span>
									<span class="h-full flex-1 bg-rose-400/80"></span>
								</div>
								<span
									class="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-card bg-foreground shadow transition-[left] duration-300 ease-out {mounted &&
									has
										? ''
										: 'opacity-40'}"
									style="left: {mounted ? marker : 44}%"
								></span>
							</div>
							<div class="mt-2 flex justify-between text-[10px] tabular-nums text-muted-foreground">
								<span>Grade 0</span><span>9</span><span>12</span><span>18+</span>
							</div>
						{:else if t.slug === 'title-case-converter'}
							<p class="truncate text-sm text-muted-foreground">
								{mounted && headline
									? headline.toLowerCase()
									: 'a short guide to writing for the web'}
							</p>
							<p class="mt-1.5 truncate text-lg font-medium">
								{mounted && headline ? headline : 'A Short Guide to Writing for the Web'}
							</p>
						{:else if t.slug === 'character-counter'}
							<div class="flex items-end gap-5">
								<div>
									<div class="text-4xl font-medium tabular-nums tracking-tight">
										{mounted ? counts.characters.toLocaleString('en-US') : 0}
									</div>
									<div class="text-xs text-muted-foreground">characters</div>
								</div>
								<div class="min-w-0 flex-1 pb-1.5">
									<div class="h-1.5 overflow-hidden rounded-full bg-muted">
										<div
											class="h-full rounded-full {mounted && counts.characters > 280
												? 'bg-amber-500'
												: 'bg-lime-500'}"
											style="width: {mounted ? Math.min(100, (counts.characters / 280) * 100) : 0}%"
										></div>
									</div>
									<div class="mt-1.5 text-xs text-muted-foreground">of 280 in a post</div>
								</div>
							</div>
						{:else if t.slug === 'reading-time-calculator' || t.slug === 'speech-time-calculator'}
							{@const wpm = t.slug === 'reading-time-calculator' ? 238 : 130}
							<div class="text-3xl font-medium tabular-nums tracking-tight">
								{mounted && has ? duration(counts.words, wpm) : duration(650, wpm)}
							</div>
							<div class="mt-1 text-xs text-muted-foreground">
								{mounted && has ? counts.words.toLocaleString('en-US') : 650} words at {wpm} a minute
							</div>
						{:else if t.slug === 'case-converter'}
							<div class="flex flex-wrap gap-1.5">
								{#each cases as c (c.id)}
									<span
										class="rounded-md border border-border bg-card px-2 py-0.5 text-xs text-foreground/80 {c.id ===
											'title' || c.id === 'sentence'
											? ''
											: 'font-mono'}">{c.name}</span
									>
								{/each}
							</div>
						{:else if t.slug === 'voice-checker'}
							<div class="flex flex-wrap gap-1.5">
								{#each voices as v, i (v)}
									<span
										class="rounded-lg border px-2.5 py-1 text-xs {i === 0
											? 'border-lime-500/60 bg-lime-500/15 font-medium text-foreground'
											: 'border-border bg-card text-foreground/70'}">{v}</span
									>
								{/each}
							</div>
						{/if}
					</div>

					<div class="flex flex-1 flex-col gap-2 p-6">
						<h2 class="flex items-center gap-2 text-lg font-medium text-foreground">
							<Icon class="h-4 w-4 shrink-0 text-lime-600 dark:text-lime-400" aria-hidden="true" />
							{t.title}
						</h2>
						<p class="text-sm leading-relaxed text-foreground/85">{t.blurb}</p>
						<span
							class="mt-auto flex items-center justify-between gap-3 pt-3 text-sm font-medium text-lime-600 dark:text-lime-400"
						>
							<span class="min-w-0 truncate {line ? 'text-foreground' : ''}">
								{line || (has ? 'Open with your draft' : 'Open')}
							</span>
							<ArrowRight
								class="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
								aria-hidden="true"
							/>
						</span>
					</div>
				</a>
			</li>
		{/each}

		<li class="flex">
			<a
				href="/guides"
				class="group flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-lime-500/40"
			>
				<div
					class="flex h-32 flex-col justify-center gap-1.5 border-b border-border/70 bg-muted/40 px-6"
					aria-hidden="true"
				>
					{#each matrix as row, r (r)}
						<div class="flex gap-1.5">
							{#each row as cell, c (c)}
								<span class="h-3.5 flex-1 rounded-sm {shade[cell]}"></span>
							{/each}
						</div>
					{/each}
				</div>
				<div class="flex flex-1 flex-col gap-2 p-6">
					<h2 class="flex items-center gap-2 text-lg font-medium text-foreground">
						<Library class="h-4 w-4 shrink-0 text-lime-600 dark:text-lime-400" aria-hidden="true" />
						Style Guide Explorer
					</h2>
					<p class="text-sm leading-relaxed text-foreground/85">
						Twenty open style guides, from Google and Microsoft to GitLab and GOV.UK. Browse by
						topic, or look up what every guide says about a word.
					</p>
					<span
						class="mt-auto flex items-center justify-between gap-3 pt-3 text-sm font-medium text-lime-600 dark:text-lime-400"
					>
						Explore the guides
						<ArrowRight
							class="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
							aria-hidden="true"
						/>
					</span>
				</div>
			</a>
		</li>
	</ul>

	<section class="mt-16 grid gap-8 border-t border-border pt-12 md:grid-cols-3">
		{#each facts as fact (fact.title)}
			{@const Icon = fact.icon}
			<div>
				<Icon class="h-5 w-5 text-lime-600 dark:text-lime-400" aria-hidden="true" />
				<h2 class="mt-3 font-medium text-foreground">{fact.title}</h2>
				<p class="mt-2 text-sm leading-6 text-foreground/85">{fact.text}</p>
			</div>
		{/each}
	</section>

	<section class="mt-14 max-w-2xl">
		<h2 class="text-2xl font-medium tracking-tight">From one draft to every draft</h2>
		<p class="mt-4 leading-7 text-foreground/85">
			These pages check whatever you paste. <a
				href="/"
				class="font-medium text-foreground underline decoration-lime-500 decoration-2 underline-offset-4"
				>Vale</a
			> runs the same rules on every file, in your editor and on every commit, against the style guide
			you pick.
		</p>
		<a
			href="https://docs.vale.sh/topics/quickstart"
			class="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-lime-500 decoration-2 underline-offset-4 transition-colors hover:text-lime-600 dark:hover:text-lime-400"
		>
			Get started with Vale
			<ArrowRight class="h-4 w-4" aria-hidden="true" />
		</a>
	</section>
</div>
