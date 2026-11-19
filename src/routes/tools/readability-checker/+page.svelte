<script lang="ts">
	import ToolPage from '$lib/components/tools/ToolPage.svelte';
	import ProseInput from '$lib/components/tools/ProseInput.svelte';
	import Stat from '$lib/components/tools/Stat.svelte';
	import Marked from '$lib/components/tools/Marked.svelte';
	import { tool } from '$lib/tools';
	import { settled } from '$lib/tools/settle.svelte';
	import { count, maskMarkdown, sentences, stripMarkdownSyntax } from '$lib/tools/text';
	import { audience, consensus, formulas, score, sentenceGrade } from '$lib/tools/readability';

	const page = tool('readability-checker');

	const SAMPLE = `The utilization of excessively complicated terminology in documentation has a detrimental effect on the comprehension of readers, particularly those individuals for whom English is not a primary language, and it frequently necessitates multiple readings of the same passage before the intended meaning becomes apparent.

Short sentences help. So do common words. When you need a long word, use it, but make the sentence around it short.

Most style guides ask for a grade level of eight or below. That is not because readers are slow. It is because people skim, and plain text survives skimming.`;

	let text = $state('');
	const input = settled(() => text);

	// Scores are computed on prose only. The marked-up view below needs the
	// original characters, so the mask keeps every offset where it was.
	const prose = $derived(stripMarkdownSyntax(maskMarkdown(input.value)));
	const split = $derived(sentences(prose));
	const counts = $derived(count(prose, split));
	const scores = $derived(score(counts));
	const grade = $derived(consensus(scores));
	const reader = $derived(audience(grade));

	// Formulas are unstable on a sentence or two: SMOG was defined on 30.
	const enough = $derived(counts.words >= 30 && counts.sentences >= 2);

	/*
		A sentence is marked when it is long or scores well above the target on
		its own. These are where an edit moves the numbers most: every formula
		here is driven by words per sentence.
	*/
	const hard = $derived(
		split
			.map((s) => ({ ...s, grade: sentenceGrade(s.words, s.syllables) }))
			.filter((s) => s.words >= 12 && (s.words > 25 || s.grade > 12))
	);
	const marks = $derived(
		hard.map((s) => ({
			from: s.from,
			to: s.to,
			tone: s.words > 35 || s.grade > 16 ? ('bad' as const) : ('warn' as const),
			title: `${s.words} words, grade ${s.grade.toFixed(1)}`
		}))
	);

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
			q: 'Does a good score mean my writing is clear?',
			a: 'No. The formulas count sentence length and word length, nothing else. Short, simple nonsense scores well. Treat the score as a warning light: a high grade level reliably means hard text, but a low one does not guarantee clear text.'
		}
	];
</script>

<ToolPage
	tool={page}
	lede="Paste your text to score it on seven readability formulas at once, from Flesch–Kincaid to SMOG, and see which sentences to shorten."
	{faq}
>
	<ProseInput bind:value={text} sample={SAMPLE} rows={9} />

	<div class="mt-6" aria-live="polite">
		{#if counts.words === 0}
			<p
				class="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground"
			>
				Your scores will appear here as you type.
			</p>
		{:else}
			<div class="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
				<div class="rounded-xl border border-border bg-card p-4">
					<div class="flex items-baseline gap-2">
						<span
							class="text-4xl font-medium tabular-nums tracking-tight {grade > 12
								? 'text-amber-600 dark:text-amber-400'
								: grade <= 9
									? 'text-lime-600 dark:text-lime-400'
									: 'text-foreground'}">{show(Math.max(0, grade))}</span
						>
						<span class="text-sm text-foreground/85">grade level</span>
					</div>
					<div class="mt-1 text-sm font-medium">{reader.label}</div>
					<div class="mt-0.5 text-xs text-muted-foreground">{reader.detail}</div>
				</div>
				<Stat value={counts.words.toLocaleString('en-US')} label="Words" />
				<Stat
					value={show(counts.words / (counts.sentences || 1))}
					label="Words per sentence"
					tone={counts.words / (counts.sentences || 1) > 20 ? 'warn' : 'plain'}
				/>
				<Stat
					value={((counts.polysyllables / counts.words) * 100).toFixed(0) + '%'}
					label="Long words"
					note="3 or more syllables"
				/>
			</div>

			{#if !enough}
				<p class="mt-3 text-sm text-amber-700 dark:text-amber-400">
					This is a short sample. Scores settle down at around 100 words.
				</p>
			{/if}

			<div class="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
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
								<td class="px-4 py-2.5 text-right font-medium tabular-nums">{show(s.value)}</td>
								<td class="px-4 py-2.5 text-muted-foreground">{s.formula.target}</td>
								<td class="hidden px-4 py-2.5 sm:table-cell">
									<span
										class="inline-flex items-center gap-1.5 {s.over
											? 'text-amber-700 dark:text-amber-400'
											: 'text-lime-700 dark:text-lime-400'}"
									>
										<span class="h-1.5 w-1.5 rounded-full {s.over ? 'bg-amber-500' : 'bg-lime-500'}"
										></span>
										{s.over ? 'Harder than target' : 'On target'}
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<h2 class="mt-8 font-medium">
				{hard.length
					? `${hard.length} sentence${hard.length === 1 ? '' : 's'} to shorten`
					: 'Sentences to shorten'}
			</h2>
			<p class="mt-1 text-sm text-muted-foreground">
				Highlighted sentences are long or score above grade 12 on their own. Hover over one for its
				numbers.
			</p>
			<div class="mt-3">
				<Marked
					text={input.value}
					{marks}
					empty="No sentence is over 25 words or above grade 12. Nothing to shorten."
				/>
			</div>
		{/if}
	</div>

	{#snippet about()}
		<h2>How the readability checker works</h2>
		<p>
			Readability formulas estimate how hard a text is to read from things that can be counted:
			words per sentence, syllables per word, letters per word. None of them understands what you
			wrote. They work because long sentences and long words are, on average, harder to read.
		</p>
		<p>
			This checker runs seven formulas on the same text. The grade level at the top is the average
			of the five that report a US school grade. Code blocks, URLs, and Markdown markup are left out
			before anything is counted.
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

		<h2>Check readability on every draft</h2>
		<p>
			The formulas and targets here are the ones in Vale’s
			<a href="/explorer/Readability">Readability package</a>, so a score on this page matches what
			Vale reports for the same text. With Vale, the check runs in your editor and on every pull
			request, and a page that drifts above your target is flagged before it ships.
		</p>
	{/snippet}
</ToolPage>
