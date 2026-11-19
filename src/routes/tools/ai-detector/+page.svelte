<script lang="ts">
	import ToolPage from '$lib/components/tools/ToolPage.svelte';
	import Editor, { type Category, type Highlight } from '$lib/components/tools/Editor.svelte';
	import Legend from '$lib/components/tools/Legend.svelte';
	import Formats from '$lib/components/tools/Formats.svelte';
	import { tool } from '$lib/tools';
	import { settled } from '$lib/tools/settle.svelte';
	import { maskMarkdown, words } from '$lib/tools/text';
	import { useVale } from '$lib/tools/engine.svelte';
	import { config, fixFor } from '$lib/tools/vale';
	import { band as read, describe, score as modelese, type ScoreData } from '$lib/tools/modelese';
	import {
		createDetector,
		density,
		family,
		ruleLabel,
		type Detector,
		type PackageData
	} from '$lib/tools/aitells';
	import { onMount } from 'svelte';

	// Passed from +page.server.ts: the counts, without the 200 KB of patterns.
	let { data } = $props();

	const page = tool('ai-detector');

	const SAMPLE = `# Unlocking the Power of Documentation

In today's fast-paced digital landscape, it's important to note that documentation plays a crucial role in the success of any project. Let's delve into the rich tapestry of tools that can elevate your writing.

This isn't just a linter — it's a paradigm shift. By leveraging a robust and comprehensive approach, teams can seamlessly streamline their workflows and unlock new possibilities.

In conclusion, great documentation is a journey, not a destination. I hope this helps!`;

	/* The 128 patterns, sorted into five kinds a writer can act on. */
	const categories: Category[] = [
		{
			id: 'vocabulary',
			label: 'Stock vocabulary',
			tone: 'violet',
			mark: 'line',
			hint: 'Use a plainer word'
		},
		{
			id: 'structure',
			label: 'Formula sentences',
			tone: 'amber',
			mark: 'line',
			hint: 'Say it directly'
		},
		{ id: 'filler', label: 'Filler and hedging', tone: 'orange', mark: 'line', hint: 'Cut it' },
		{
			id: 'figurative',
			label: 'Empty metaphor',
			tone: 'sky',
			mark: 'line',
			hint: 'Say the literal thing'
		},
		{
			id: 'heading',
			label: 'Marketing headings',
			tone: 'teal',
			mark: 'line',
			hint: 'Name the topic'
		}
	];

	let text = $state('');
	let hidden = $state<string[]>([]);
	let editor = $state<ReturnType<typeof Editor>>();
	const input = settled(() => text, 220);

	/*
		The patterns are a separate download, fetched once the page has painted.
		`detector` stays null until then and the score card says so.
	*/
	let detector = $state<Detector | null>(null);
	let failed = $state(false);

	onMount(() => {
		import('$lib/data/tools/ai-tells.json')
			.then((m) => {
				detector = createDetector(m.default as unknown as PackageData);
			})
			.catch(() => (failed = true));
	});

	/*
		Vale itself, in a worker, with every rule in both packages. It takes a
		moment to arrive, so the patterns above answer first and its findings
		take their place. The archive nests its styles a level down.
	*/
	const vale = useVale(() => input.value, {
		packages: [
			{ url: '/wasm/packages/ai-tells.zip', prefix: '/pkg' },
			{ url: '/wasm/packages/Modelese.zip', prefix: '/pkg/ai-tells/styles' }
		],
		config: config(['ai-tells', 'Modelese'], '/pkg/ai-tells/styles')
	});

	// Modelese's rules about the text as a whole. They have no phrase to mark.
	const RHYTHM = /^Modelese\.(Monotone|SameStart|Transitions)$/;
	const rhythm = $derived(
		(vale.result?.placed ?? [])
			.filter((p) => RHYTHM.test(p.alert.Check))
			.map((p) => p.alert.Message)
	);

	type Found = {
		from: number;
		to: number;
		rule: string;
		match: string;
		message: string;
		fix?: Highlight['fix'];
	};

	const quick = $derived<Found[]>(detector ? detector.scan(input.value) : []);
	const findings = $derived.by<Found[]>(() => {
		if (!vale.result) return quick;

		// One phrase, one finding: "plays a crucial role" and the "crucial"
		// inside it are two rules on the same words. The longer one is kept,
		// as the patterns above do.
		const out: Found[] = [];
		let end = -1;
		for (const p of vale.result.placed) {
			if (RHYTHM.test(p.alert.Check) || p.from < end) continue;
			end = Math.max(end, p.to);
			out.push({
				from: p.from,
				to: p.to,
				rule: p.alert.Check.replace(/^ai-tells\./, ''),
				match: p.alert.Match,
				message: p.alert.Message,
				fix: fixFor(p.alert)
			});
		}
		return out;
	});
	const checking = $derived(!detector && vale.state !== 'ready');

	/*
		The overall read: a weighted sum of measured style, placed against where
		human writing lands. Its data is a download of its own, and it needs
		fifty words before the measures mean anything.
	*/
	let scoreData = $state.raw<ScoreData | null>(null);
	onMount(() => {
		import('$lib/data/tools/modelese.json')
			.then((m) => (scoreData = m.default as unknown as ScoreData))
			.catch(() => {
				// The page works without the overall read.
			});
	});
	const scored = $derived(
		scoreData && (input.value.match(/\S+/g) ?? []).length >= 50
			? modelese(input.value, scoreData)
			: null
	);
	const verdict = $derived(scored && scoreData ? read(scored.score, scoreData) : null);
	// What pushed the score the way it went, for the three largest.
	const drivers = $derived(
		scored && scoreData && verdict
			? scored.parts
					.filter((p) => (verdict.level > 0 ? p.contribution > 0 : p.contribution < 0))
					.slice(0, 3)
					.map((p) => describe(p, scoreData!))
			: []
	);
	const total = $derived(words(maskMarkdown(input.value)).length);
	const per1k = $derived(total ? (findings.length / total) * 1000 : 0);
	const band = $derived(density(per1k));
	const empty = $derived(total === 0);

	/** A rule's advice with the quoted match taken out: "AI hedge: 'x'. Do y." → "Do y." */
	const advice = (message: string) => message.replace(/^[^:]*:\s*'.*?'\.\s*/, '');

	const highlights = $derived<Highlight[]>(
		findings.map((f) => ({
			from: f.from,
			to: f.to,
			category: family(f.rule),
			message: f.rule.startsWith('Modelese.')
				? f.message.replace(/'(.*?)'/, '“$1”')
				: `${ruleLabel(f.rule)}. ${advice(f.message)}`,
			fix: f.fix
		}))
	);

	const tally = $derived.by(() => {
		const out: Record<string, number> = {};
		for (const h of highlights) out[h.category] = (out[h.category] ?? 0) + 1;
		return out;
	});

	/** The phrases found most often, for the list under the editor. */
	const phrases = $derived.by(() => {
		const map = new Map<string, { text: string; category: string; count: number }>();
		for (const f of findings) {
			const text = f.match.trim();
			const hit = map.get(text.toLowerCase());
			if (hit) hit.count++;
			else map.set(text.toLowerCase(), { text, category: family(f.rule), count: 1 });
		}
		return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 24);
	});

	const toneOf = (id: string) => categories.find((c) => c.id === id)?.tone ?? 'amber';

	const faq = $derived([
		{
			q: 'How does this AI detector work?',
			a: `It searches your text for ${data.rules} patterns that language models overuse: stock phrases such as “delve into” and “rich tapestry,” formulas such as “it’s not just X, it’s Y,” filler openings and closings, and marketing-style headings. Each match is highlighted and comes with a suggested fix. It also measures the text as a whole, such as how much sentence lengths vary and how often words repeat, and places that against human writing. It does not use a neural network and it cannot tell you who wrote the text.`
		},
		{
			q: 'Can it tell me for certain whether text was written by AI?',
			a: 'No, and no detector can. People wrote these phrases long before language models existed, and models learned them from people. A high count means the text reads as machine-written to many readers. It is not proof of how it was produced, and it should never be used on its own to accuse someone.'
		},
		{
			q: 'Can I check a Word document or PDF for AI writing?',
			a: 'Yes. Drag the file onto the editor or choose Open. Word (.docx), PDF, Markdown, HTML, and several other formats are read in your browser, so an essay or report never leaves your device.'
		},
		{
			q: 'Is this AI detector free?',
			a: 'Yes. There is no sign-up, no word limit, and no daily cap. The patterns come from an open-source project, and the check runs on your own device.'
		},
		{
			q: 'Is my text stored or used to train AI?',
			a: 'No. The check runs entirely in your browser. Your text is not uploaded, logged, or shared, and no AI model reads it.'
		},
		{
			q: 'How is this different from GPTZero, Turnitin, or Copyleaks?',
			a: 'Those tools return a probability that text is AI-generated, produced by a model you cannot inspect. This one shows you the exact phrases it found and why each was flagged, so you can check every result yourself and fix the ones that matter. It is built for editing your own drafts, not for grading someone else’s.'
		},
		{
			q: 'How do I make AI-assisted writing sound less like AI?',
			a: 'Replace each highlighted phrase with something specific. Cut the opening that restates the question and the closing that summarizes what you just said. State claims directly instead of hedging them, and delete words like “robust,” “seamless,” and “comprehensive” unless you can say what they mean here.'
		}
	]);
</script>

<ToolPage
	tool={page}
	wide
	lede="Paste any text to see the phrases that make it read as AI-written. Each one is highlighted where it sits, with the reason and how to fix it. Nothing leaves your browser."
	{faq}
>
	<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
		<div class="min-w-0">
			<Editor
				bind:this={editor}
				bind:value={text}
				{highlights}
				{categories}
				{hidden}
				sample={SAMPLE}
				minHeight="30rem"
				placeholder="Paste an essay, an email, a blog post…"
			/>

			{#if phrases.length}
				<div class="mt-4 flex flex-wrap items-center gap-1.5" aria-label="Phrases found">
					<span class="mr-1 text-xs font-medium text-muted-foreground">Found</span>
					{#each phrases as p (p.text.toLowerCase())}
						<span
							class="vt-{toneOf(p.category)} rounded-md px-2 py-0.5 text-sm"
							style="background: hsl(var(--vt) / 0.14); box-shadow: inset 0 -1.5px 0 hsl(var(--vt))"
						>
							{p.text}{#if p.count > 1}<span class="ml-1 text-xs text-muted-foreground"
									>×{p.count}</span
								>{/if}
						</span>
					{/each}
				</div>
			{/if}
		</div>

		<aside class="space-y-5 lg:sticky lg:top-24 lg:self-start" aria-live="polite">
			<div class="rounded-2xl border border-border bg-card p-5 shadow-sm">
				<div class="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
					AI tells
				</div>
				<div class="mt-2 flex items-baseline gap-2">
					<span
						class="text-5xl font-medium tabular-nums tracking-tight transition-colors {empty ||
						checking
							? 'text-muted-foreground/40'
							: band.level === 3
								? 'text-rose-600 dark:text-rose-400'
								: band.level === 2
									? 'text-amber-600 dark:text-amber-400'
									: 'text-lime-600 dark:text-lime-400'}"
						>{empty || checking ? '–' : findings.length}</span
					>
					<span class="text-sm text-muted-foreground">found</span>
				</div>

				<div class="mt-4 flex gap-1" aria-hidden="true">
					{#each [1, 2, 3] as step (step)}
						<span
							class="h-2 flex-1 rounded-full transition-colors duration-300 {!empty &&
							!checking &&
							band.level >= step
								? band.level === 3
									? 'bg-rose-400'
									: band.level === 2
										? 'bg-amber-400'
										: 'bg-lime-500'
								: 'bg-muted'}"
						></span>
					{/each}
				</div>

				<p class="mt-3 text-sm font-medium text-foreground">
					{#if failed && checking}
						The patterns didn’t load
					{:else if empty}
						Paste some text to check it
					{:else if checking}
						Loading {data.rules} patterns…
					{:else}
						{band.label}
					{/if}
				</p>
				<p class="mt-0.5 text-xs leading-5 text-muted-foreground">
					{#if failed && checking}
						Reload the page to try again.
					{:else if empty || checking}
						Checks {data.rules} patterns that language models overuse.
					{:else if total < 100}
						A short sample: one phrase swings the rate a lot under 100 words.
					{:else if findings.length === 0}
						No usual tells. That isn’t proof a person wrote it.
					{:else}
						{per1k.toFixed(1)} per 1,000 words, across {total.toLocaleString('en-US')} words.
					{/if}
				</p>
				{#if vale.state === 'ready' && !empty}
					<p class="mt-3 border-t border-border/70 pt-3 text-xs leading-5 text-muted-foreground">
						Checked by Vale, running in this tab, with every rule in both packages.
					</p>
				{/if}
			</div>

			{#if verdict}
				<div class="rounded-2xl border border-border bg-card p-5 shadow-sm">
					<div class="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
						Overall read
					</div>
					<p
						class="mt-2 text-sm font-medium {verdict.level === 2
							? 'text-rose-600 dark:text-rose-400'
							: verdict.level === 1
								? 'text-amber-600 dark:text-amber-400'
								: 'text-lime-600 dark:text-lime-400'}"
					>
						{verdict.label}
					</p>
					<div class="mt-3 flex gap-1" aria-hidden="true">
						{#each [0, 1, 2] as step (step)}
							<span
								class="h-2 flex-1 rounded-full {verdict.level === step
									? step === 2
										? 'bg-rose-400'
										: step === 1
											? 'bg-amber-400'
											: 'bg-lime-500'
									: 'bg-muted'}"
							></span>
						{/each}
					</div>
					{#if drivers.length}
						<ul class="mt-3 space-y-1 text-xs leading-5 text-muted-foreground">
							{#each drivers as d (d)}
								<li>{d}</li>
							{/each}
						</ul>
					{/if}
					<p class="mt-3 border-t border-border/70 pt-3 text-xs leading-5 text-muted-foreground">
						Measured against human writing: 1 text in 20 lands in the middle band or above, and 1 in
						100 in the top one.
					</p>
				</div>
			{/if}

			{#if rhythm.length}
				<div class="rounded-2xl border border-border bg-card p-5 shadow-sm">
					<div class="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
						Rhythm
					</div>
					<ul class="mt-2 space-y-1.5 text-sm leading-6 text-foreground/85">
						{#each rhythm as note (note)}
							<li>{note}</li>
						{/each}
					</ul>
				</div>
			{/if}

			<Legend
				{categories}
				counts={tally}
				bind:hidden
				onjump={(id) => editor?.jump(id)}
				title="What it found"
			/>
		</aside>
	</div>

	{#snippet about()}
		<h2>What this AI detector looks for</h2>
		<p>
			Language models have habits. They reach for the same vocabulary (“delve,” “tapestry,”
			“robust”), the same sentence shapes (“it’s not just X, it’s Y”), and the same ways of opening
			and closing (“In today’s fast-paced world,” “I hope this helps!”). Readers have learned to
			spot these, and text that uses them gets trusted less, whoever wrote it.
		</p>
		<p>
			This detector checks your text against {data.rules} of those patterns and shows you each match.
			The patterns come from
			<a href={data.homepage} target="_blank" rel="noreferrer">ai-tells</a>, an open-source
			collection maintained in public, so you can read exactly what is being checked. Beside them
			run the nine rules of
			<a href="https://github.com/jdkato/Modelese" target="_blank" rel="noreferrer">Modelese</a>,
			each found by comparing what people and models wrote in answer to the same questions.
		</p>

		<h2>What the result means</h2>
		<p>
			The headline number is how many tells were found, and the rate is tells per 1,000 words so
			that long and short texts compare. As a rule of thumb:
		</p>
		<ul>
			<li><strong>None found:</strong> the text avoids the usual patterns.</li>
			<li>
				<strong>Light</strong> (under 5 per 1,000 words): a few stock phrases, normal for anyone.
			</li>
			<li><strong>Noticeable</strong> (5 to 15): enough that a reader may wonder.</li>
			<li><strong>Heavy</strong> (over 15): reads as unedited model output.</li>
		</ul>
		<p>
			These bands are a reading aid, not a calibrated verdict. The detector reports what is on the
			page. It can’t know who put it there, and people who write formally, or in a second language,
			use many of these phrases naturally.
		</p>

		<h2>The overall read</h2>
		<p>
			Beside the phrases, the detector measures the text as a whole: how much sentence lengths vary,
			how often words and word pairs repeat, how expected each word is, and how often common words
			and punctuation marks appear. Each measure has a weight, and the weighted sum is placed
			against where human writing lands. It needs at least fifty words.
		</p>
		<ul>
			<li>
				<strong>Within the range of human writing:</strong> 19 human texts in 20 score here.
			</li>
			<li>
				<strong>Leans model-written:</strong> 1 human text in 20 scores this high. On model-written
				text held out of training, {data.caught5}% scores this high or higher.
			</li>
			<li>
				<strong>Reads as model-written:</strong> 1 human text in 100 scores this high, and
				{data.caught1}% of the held-out model text does.
			</li>
		</ul>
		<p>
			The weights were fitted to public collections of paired human and model writing, and to
			issues, pull requests, and commit messages written before 2022. Text from a model or a kind of
			writing unlike those is scored less reliably. The three lines under the result name what moved
			the score most, so you can see why it landed where it did.
		</p>

		<h2>Why not a percentage?</h2>
		<p>
			Detectors that return “87% AI” are guessing from statistics you can’t see, and they are wrong
			often enough that students have been falsely accused of cheating. A list of specific phrases
			is something you can verify and act on. If the goal is better writing, the fix is the same
			either way: replace the stock phrase with what you actually mean.
		</p>

		<Formats verb="Check" />

		<h2>Check every draft automatically</h2>
		<p>
			The same patterns are available as a
			<a href="/explorer/ai-tells">package for Vale</a>, which runs them in your editor and on every
			pull request. If a coding agent writes your docs or commit messages, Vale can check its output
			before you read it.
		</p>
	{/snippet}
</ToolPage>
