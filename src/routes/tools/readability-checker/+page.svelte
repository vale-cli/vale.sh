<script lang="ts">
	import ToolPage from '$lib/components/tools/ToolPage.svelte';
	import Editor, { type Category } from '$lib/components/tools/Editor.svelte';
	import Legend from '$lib/components/tools/Legend.svelte';
	import Formats from '$lib/components/tools/Formats.svelte';
	import { tool } from '$lib/tools';
	import { settled } from '$lib/tools/settle.svelte';
	import { count, duration, maskMarkdown, sentences, stripMarkdownSyntax } from '$lib/tools/text';
	import { audience, consensus, formulas, score } from '$lib/tools/readability';
	import { hardSentences, wordFindings } from '$lib/tools/style';
	import {
		createDetector,
		type Detector,
		type PackageData,
		type RuleData
	} from '$lib/tools/aitells';
	import { onMount } from 'svelte';

	const page = tool('readability-checker');

	const SAMPLE = `The utilization of excessively complicated terminology in documentation has a detrimental effect on the comprehension of readers, particularly those individuals for whom English is not a primary language, and it frequently necessitates multiple readings of the same passage before the intended meaning becomes apparent.

Short sentences help. So do common words. When you really need a long word, use it, but make the sentence around it short.

Most style guides ask for a grade level of eight or below. That is not because readers are slow. It is because people skim, and plain text survives skimming. In order to get there, it is worth noting that you will probably need to make a decision about which long words actually matter and which ones you can simply cut.`;

	/*
		Sentences are filled and words are underlined, so an adverb inside
		a hard sentence shows as both.
	*/
	const categories: Category[] = [
		{
			id: 'very-hard',
			label: 'Very hard to read',
			tone: 'rose',
			mark: 'fill',
			hint: 'Split or cut'
		},
		{ id: 'hard', label: 'Hard to read', tone: 'amber', mark: 'fill', hint: 'Shorten' },
		{ id: 'simpler', label: 'Simpler word', tone: 'teal', mark: 'line', hint: 'Swap in one click' },
		{
			id: 'adverb',
			label: 'Adverbs',
			tone: 'violet',
			mark: 'line',
			hint: 'Cut if it adds nothing'
		},
		{
			id: 'filler',
			label: 'Hedging and filler',
			tone: 'orange',
			mark: 'line',
			hint: 'State the point'
		}
	];

	/*
		The word-level rules are a separate download, fetched once the page has
		painted. Scores and sentence highlights don't wait for them.
	*/
	let rules = $state<RuleData[]>([]);
	let detector = $state<Detector | null>(null);

	onMount(() => {
		import('$lib/data/tools/style.json')
			.then((m) => {
				const data = m.default as unknown as { rules: RuleData[] };
				rules = data.rules;
				detector = createDetector({ rules: data.rules } as PackageData);
			})
			.catch(() => {
				// The page still scores and marks sentences without them.
			});
	});

	let text = $state('');
	let hidden = $state<string[]>([]);
	let editor = $state<ReturnType<typeof Editor>>();
	const input = settled(() => text);

	// Scores are computed on prose only. The mask keeps every offset where it
	// was, so a finding's position is its position in the editor.
	const prose = $derived(stripMarkdownSyntax(maskMarkdown(input.value)));
	const split = $derived(sentences(prose));
	const counts = $derived(count(prose, split));
	const scores = $derived(score(counts));
	const grade = $derived(Math.max(0, consensus(scores)));
	const reader = $derived(audience(grade));
	const highlights = $derived([
		...hardSentences(split),
		...(detector ? wordFindings(input.value, detector, rules) : [])
	]);

	const tally = $derived.by(() => {
		const out: Record<string, number> = {};
		for (const h of highlights) out[h.category] = (out[h.category] ?? 0) + 1;
		return out;
	});

	// Formulas are unstable on a sentence or two: SMOG was defined on 30.
	const enough = $derived(counts.words >= 30 && counts.sentences >= 2);
	const empty = $derived(counts.words === 0);

	// Where the grade sits on a scale that runs from 0 to 18.
	const SCALE = 18;
	const marker = $derived(Math.min(100, (grade / SCALE) * 100));

	const show = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : '–');

	const faq = [
		{
			q: 'What is a good readability score?',
			a: 'For a general audience, aim for a Flesch–Kincaid grade of 8 or below and a Flesch reading ease of 60 or above. That is the level of most newspapers and of plain-language guidance from governments. Technical documentation usually lands between grades 8 and 10; above 12, most readers start skimming.'
		},
		{
			q: 'What is the Flesch–Kincaid grade level?',
			a: 'It is the US school grade a reader needs to understand a text, calculated from two things: the average number of words per sentence and the average number of syllables per word. A score of 8 means an eighth grader, about 13 years old, can read it.'
		},
		{
			q: 'Why do the formulas give different scores?',
			a: 'Each one measures difficulty differently. Flesch–Kincaid and Gunning fog count syllables; Coleman–Liau and the Automated Readability Index count letters; SMOG looks only at long words. They usually agree within two or three grades. The average of the five grade-level formulas is the most stable single number, which is why it is shown first.'
		},
		{
			q: 'How do I improve my readability score?',
			a: 'Shorten your sentences first, since every formula rewards that. Split any sentence over 25 words, and swap long words for short ones where the meaning survives: “use” for “utilize,” “help” for “facilitate.” The checker highlights the sentences that hurt your score most.'
		},
		{
			q: 'How much text do I need for an accurate score?',
			a: 'At least 100 words, and more is better. Readability formulas are averages, so one unusually long sentence can swing a short passage by several grades. SMOG was designed for samples of 30 sentences.'
		},
		{
			q: 'Can I check the readability of a Word document or PDF?',
			a: 'Yes. Drag the file onto the editor or choose Open. Word (.docx), PDF, Markdown, HTML, LaTeX, and several other formats are read in your browser and never uploaded. Code, math, and markup are left out before the text is scored, so they don’t distort the result.'
		},
		{
			q: 'Does a good score mean my writing is clear?',
			a: 'No. The formulas count sentence length and word length, nothing else. Short, simple nonsense scores well. Treat the score as a warning light: a high grade level reliably means hard text, but a low one does not guarantee clear text.'
		}
	];
</script>

<ToolPage
	tool={page}
	wide
	lede="Write or paste your text. Hard sentences, needlessly long words, adverbs, and filler are highlighted as you type, with seven readability scores alongside."
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
			/>

			<dl
				class="mt-3 flex flex-wrap gap-x-6 gap-y-1 px-1 text-sm text-muted-foreground"
				aria-live="polite"
			>
				<div class="flex gap-1.5">
					<dt>Words</dt>
					<dd class="font-medium tabular-nums text-foreground">
						{counts.words.toLocaleString('en-US')}
					</dd>
				</div>
				<div class="flex gap-1.5">
					<dt>Sentences</dt>
					<dd class="font-medium tabular-nums text-foreground">{counts.sentences}</dd>
				</div>
				<div class="flex gap-1.5">
					<dt>Words per sentence</dt>
					<dd class="font-medium tabular-nums text-foreground">
						{empty ? '–' : show(counts.words / (counts.sentences || 1))}
					</dd>
				</div>
				<div class="flex gap-1.5">
					<dt>Reading time</dt>
					<dd class="font-medium tabular-nums text-foreground">{duration(counts.words, 238)}</dd>
				</div>
			</dl>
		</div>

		<aside class="space-y-5 lg:sticky lg:top-24 lg:self-start" aria-live="polite">
			<div class="rounded-2xl border border-border bg-card p-5 shadow-sm">
				<div class="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
					Readability
				</div>
				<div class="mt-2 flex items-baseline gap-2">
					<span
						class="text-5xl font-medium tabular-nums tracking-tight transition-colors {empty
							? 'text-muted-foreground/40'
							: grade > 12
								? 'text-rose-600 dark:text-rose-400'
								: grade > 9
									? 'text-amber-600 dark:text-amber-400'
									: 'text-lime-600 dark:text-lime-400'}">{empty ? '–' : show(grade)}</span
					>
					<span class="text-sm text-muted-foreground">grade level</span>
				</div>

				<!-- The scale: green through grade 9, amber to 12, red past it. -->
				<div class="relative mt-4 h-2 rounded-full" aria-hidden="true">
					<div class="absolute inset-0 flex overflow-hidden rounded-full">
						<span class="h-full bg-lime-500/70" style="width: {(9 / SCALE) * 100}%"></span>
						<span class="h-full bg-amber-400/80" style="width: {(3 / SCALE) * 100}%"></span>
						<span class="h-full flex-1 bg-rose-400/80"></span>
					</div>
					{#if !empty}
						<span
							class="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-card bg-foreground shadow transition-[left] duration-300 ease-out"
							style="left: {marker}%"
						></span>
					{/if}
				</div>
				<div class="relative mt-1.5 h-3 text-[10px] tabular-nums text-muted-foreground">
					<span class="absolute left-0">0</span>
					<span class="absolute -translate-x-1/2" style="left: {(9 / SCALE) * 100}%">9</span>
					<span class="absolute -translate-x-1/2" style="left: {(12 / SCALE) * 100}%">12</span>
					<span class="absolute right-0">18+</span>
				</div>

				<p class="mt-3 text-sm font-medium text-foreground">
					{empty ? 'Start writing to see your score' : reader.label}
				</p>
				<p class="mt-0.5 text-xs leading-5 text-muted-foreground">
					{#if empty}
						Aim for grade 9 or below for a general audience.
					{:else if !enough}
						A short sample. Scores settle at around 100 words.
					{:else}
						{reader.detail}
					{/if}
				</p>
			</div>

			<Legend {categories} counts={tally} bind:hidden onjump={(id) => editor?.jump(id)} />
		</aside>
	</div>

	<h2 class="mt-12 text-lg font-medium">All seven scores</h2>
	<div class="mt-3 overflow-x-auto rounded-2xl border border-border bg-card">
		<table class="w-full text-left text-sm">
			<thead class="border-b border-border text-xs text-muted-foreground">
				<tr>
					<th scope="col" class="px-4 py-2.5 font-medium">Formula</th>
					<th scope="col" class="px-4 py-2.5 text-right font-medium">Score</th>
					<th scope="col" class="px-4 py-2.5 font-medium">Target</th>
					<th scope="col" class="hidden px-4 py-2.5 font-medium sm:table-cell">Result</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-border">
				{#each scores as s (s.formula.id)}
					<tr>
						<th scope="row" class="px-4 py-2.5 font-normal">
							<a href="#{s.formula.id}" class="hover:underline">{s.formula.name}</a>
						</th>
						<td class="px-4 py-2.5 text-right font-medium tabular-nums">
							{empty ? '–' : show(s.value)}
						</td>
						<td class="px-4 py-2.5 text-muted-foreground">{s.formula.target}</td>
						<td class="hidden px-4 py-2.5 sm:table-cell">
							{#if !empty}
								<span
									class="inline-flex items-center gap-1.5 {s.over
										? 'text-amber-700 dark:text-amber-400'
										: 'text-lime-700 dark:text-lime-400'}"
								>
									<span class="h-1.5 w-1.5 rounded-full {s.over ? 'bg-amber-500' : 'bg-lime-500'}"
									></span>
									{s.over ? 'Harder than target' : 'On target'}
								</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#snippet about()}
		<h2>How the readability checker works</h2>
		<p>
			Readability formulas estimate how hard a text is to read from things that can be counted:
			words per sentence, syllables per word, letters per word. None of them understands what you
			wrote. They work because long sentences and long words are, on average, harder to read.
		</p>
		<p>
			This checker runs seven formulas on the same text. The grade level beside the editor is the
			average of the five that report a US school grade. Code blocks, URLs, and Markdown markup are
			left out before anything is counted.
		</p>

		<h2>What the highlights mean</h2>
		<ul>
			<li>
				<strong>Hard to read</strong> and <strong>very hard to read</strong> sentences are long, or dense
				with long words. Splitting one of these moves your score more than any other edit.
			</li>
			<li>
				<strong>Simpler word</strong> marks a long word or phrase with a short equivalent: “use” for
				“utilize,” “to” for “in order to.” Click it to swap. The pairs come from the Microsoft Writing
				Style Guide, the Red Hat style guide, and Vale’s Voices package.
			</li>
			<li>
				<strong>Adverbs</strong> marks the ones the Microsoft guide lists as usually removable: “really,”
				“basically,” “quickly.” Keep one if the sentence means something different without it.
			</li>
			<li>
				<strong>Hedging and filler</strong> marks throat-clearing (“it is worth noting”), hedges (“you
				may want to consider”), and claims with no source (“experts agree”).
			</li>
		</ul>
		<p>
			Click a row in the list to jump to the next highlight of that kind, or the eye to hide a kind
			while you work on another. The card on each highlight names the guide its advice comes from.
			Treat a highlight as a place to look, not a mistake.
		</p>

		<h2>The seven formulas</h2>
		{#each formulas as f (f.id)}
			<h3 id={f.id} class="scroll-mt-24">{f.name}</h3>
			<p>{f.about} Target: {f.target}.</p>
			<p class="font-mono text-sm">{f.formula}</p>
		{/each}

		<h2>Flesch reading ease scale</h2>
		<ul>
			<li><strong>90–100:</strong> very easy. A fifth grader understands it.</li>
			<li><strong>70–90:</strong> easy. Conversational English.</li>
			<li><strong>60–70:</strong> plain English. Most adults read it comfortably.</li>
			<li><strong>50–60:</strong> fairly difficult. High-school level.</li>
			<li><strong>30–50:</strong> difficult. College level.</li>
			<li><strong>0–30:</strong> very difficult. Academic and legal writing.</li>
		</ul>

		<Formats verb="Check the readability of" />

		<h2>Check readability on every draft</h2>
		<p>
			The formulas and targets here are the ones in Vale’s
			<a href="/explorer/Readability">Readability package</a>, so a score on this page matches what
			Vale reports for the same text. With Vale, the check runs in your editor and on every pull
			request, and a page that drifts above your target is flagged before it ships.
		</p>
	{/snippet}
</ToolPage>
