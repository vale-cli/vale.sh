<script lang="ts">
	import ToolPage from '$lib/components/tools/ToolPage.svelte';
	import ProseInput from '$lib/components/tools/ProseInput.svelte';
	import Stat from '$lib/components/tools/Stat.svelte';
	import { tool } from '$lib/tools';
	import { settled } from '$lib/tools/settle.svelte';
	import {
		count,
		duration,
		keywords,
		maskMarkdown,
		sentences,
		stripMarkdownSyntax
	} from '$lib/tools/text';

	const page = tool('word-counter');
	const fmt = new Intl.NumberFormat('en-US');

	const SAMPLE = `The first draft of anything is too long. Not because writers are careless, but because the fastest way to find out what you think is to write all of it down, including the parts that turn out not to matter.

Editing is where the count comes in. A conference abstract has 250 words. A meta description has about 155 characters. A five-minute talk is roughly 650 words, and no amount of speaking quickly changes that.

So count early. It is easier to write to a length than to cut down to one.`;

	let text = $state('');
	let markdown = $state(false);
	let gram = $state<1 | 2 | 3>(1);

	const input = settled(() => text);

	// With the Markdown option on, code blocks, URLs, and the markup itself
	// stop counting: the number is the prose a reader sees.
	const prose = $derived(markdown ? stripMarkdownSyntax(maskMarkdown(input.value)) : input.value);
	const split = $derived(sentences(prose));
	const counts = $derived(count(prose, split));
	const top = $derived(keywords(prose, gram, 10));

	const longest = $derived(split.reduce((a, s) => (s.words > (a?.words ?? 0) ? s : a), split[0]));
	const perSentence = $derived(counts.sentences ? counts.words / counts.sentences : 0);

	/*
		The limits people are usually counting toward. Characters use the raw
		text, since a platform counts what you paste, markup and all.
	*/
	const raw = $derived(count(input.value, split));
	const limits = $derived([
		{ label: 'Title tag', unit: 'characters', max: 60, value: raw.characters },
		{ label: 'Meta description', unit: 'characters', max: 155, value: raw.characters },
		{ label: 'X post', unit: 'characters', max: 280, value: raw.characters },
		{ label: 'LinkedIn post', unit: 'characters', max: 3000, value: raw.characters },
		{ label: 'Abstract', unit: 'words', max: 250, value: counts.words },
		{ label: 'College essay', unit: 'words', max: 650, value: counts.words }
	]);

	const faq = [
		{
			q: 'How does the word counter count words?',
			a: 'A word is any run of letters or digits. Contractions such as “don’t” and hyphenated compounds such as “well-known” each count as one word, which matches Microsoft Word and Google Docs. Punctuation and symbols on their own are not counted.'
		},
		{
			q: 'Does the character count include spaces?',
			a: 'Both counts are shown. “Characters” includes spaces and line breaks, which is what X, LinkedIn, and most form fields count. “Without spaces” is the count some publishers and translation agencies bill by.'
		},
		{
			q: 'How is reading time calculated?',
			a: 'Reading time divides the word count by 238 words per minute, the average silent reading speed for adults reading English non-fiction found in a 2019 review of 190 studies. Speaking time uses 130 words per minute, a comfortable presentation pace.'
		},
		{
			q: 'How many words is a page?',
			a: 'About 500 words single-spaced or 250 words double-spaced, in a 12-point font with one-inch margins. A 1,000-word essay is roughly two pages single-spaced or four double-spaced.'
		},
		{
			q: 'What is keyword density?',
			a: 'The share of your text taken up by one word or phrase. If a 500-word article uses “style guide” ten times, that phrase accounts for 20 of the 500 words, a density of 4%. Common words like “the” and “and” are left out so the list shows what the text is about.'
		},
		{
			q: 'Is my text saved or uploaded?',
			a: 'No. Counting happens in your browser and your text is never sent to a server. It is kept only in this tab so the other tools on the site can use it, and is erased when you close the tab.'
		}
	];
</script>

<ToolPage
	tool={page}
	lede="Type or paste your text to count words, characters, sentences, and paragraphs as you go, with reading time and keyword density."
	{faq}
>
	<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
		<div>
			<ProseInput bind:value={text} sample={SAMPLE} rows={14} />
			<label class="mt-3 flex items-center gap-2 text-sm text-foreground/85">
				<input
					type="checkbox"
					bind:checked={markdown}
					class="rounded border-border text-lime-600 focus:ring-lime-500"
				/>
				My text is Markdown: leave out code blocks, URLs, and markup
			</label>
		</div>

		<div class="grid grid-cols-2 content-start gap-3" aria-live="polite">
			<div class="col-span-2">
				<Stat value={fmt.format(counts.words)} label="Words" />
			</div>
			<div class="col-span-2">
				<Stat
					value={fmt.format(counts.characters)}
					label="Characters"
					note="{fmt.format(counts.charactersNoSpaces)} without spaces"
				/>
			</div>
			<Stat value={fmt.format(counts.sentences)} label="Sentences" />
			<Stat value={fmt.format(counts.paragraphs)} label="Paragraphs" />
			<Stat value={duration(counts.words, 238)} label="Reading time" />
			<Stat value={duration(counts.words, 130)} label="Speaking time" />
		</div>
	</div>

	<div class="mt-8 grid gap-6 md:grid-cols-2">
		<section class="rounded-xl border border-border bg-card p-5">
			<div class="flex items-center justify-between gap-3">
				<h2 class="font-medium">Keyword density</h2>
				<div
					class="flex rounded-md border border-border text-xs"
					role="group"
					aria-label="Phrase length"
				>
					{#each [1, 2, 3] as const as n (n)}
						<button
							type="button"
							onclick={() => (gram = n)}
							aria-pressed={gram === n}
							class="px-2.5 py-1 transition-colors first:rounded-l-md last:rounded-r-md {gram === n
								? 'bg-lime-500/15 font-medium text-foreground'
								: 'text-muted-foreground hover:text-foreground'}"
						>
							{n} word{n > 1 ? 's' : ''}
						</button>
					{/each}
				</div>
			</div>
			{#if top.length}
				<ol class="mt-4 space-y-2">
					{#each top as k (k.term)}
						<li class="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-sm">
							<span class="relative truncate">
								<span
									class="absolute inset-y-0 left-0 rounded bg-lime-500/15"
									style="width: {(k.count / top[0].count) * 100}%"
								></span>
								<span class="relative px-1.5">{k.term}</span>
							</span>
							<span class="tabular-nums text-muted-foreground">{k.count}</span>
							<span class="w-12 text-right tabular-nums text-muted-foreground"
								>{(k.share * 100).toFixed(1)}%</span
							>
						</li>
					{/each}
				</ol>
			{:else}
				<p class="mt-4 text-sm text-muted-foreground">
					{gram === 1
						? 'The words you use most will appear here.'
						: 'Phrases you repeat will appear here.'}
				</p>
			{/if}
		</section>

		<section class="rounded-xl border border-border bg-card p-5">
			<h2 class="font-medium">Length limits</h2>
			<ul class="mt-4 space-y-3">
				{#each limits as limit (limit.label)}
					{@const over = limit.value > limit.max}
					<li class="text-sm">
						<div class="flex items-baseline justify-between gap-3">
							<span>{limit.label}</span>
							<span
								class="tabular-nums {over
									? 'font-medium text-amber-600 dark:text-amber-400'
									: 'text-muted-foreground'}"
							>
								{fmt.format(limit.value)} / {fmt.format(limit.max)}
								{limit.unit}
							</span>
						</div>
						<div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
							<div
								class="h-full rounded-full {over ? 'bg-amber-500' : 'bg-lime-500'}"
								style="width: {Math.min(100, (limit.value / limit.max) * 100)}%"
							></div>
						</div>
					</li>
				{/each}
			</ul>
		</section>
	</div>

	{#if counts.words > 0}
		<dl class="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
			<div>
				<dt class="text-muted-foreground">Words per sentence</dt>
				<dd class="mt-0.5 font-medium tabular-nums">{perSentence.toFixed(1)}</dd>
			</div>
			<div>
				<dt class="text-muted-foreground">Longest sentence</dt>
				<dd class="mt-0.5 font-medium tabular-nums">{longest?.words ?? 0} words</dd>
			</div>
			<div>
				<dt class="text-muted-foreground">Syllables</dt>
				<dd class="mt-0.5 font-medium tabular-nums">{fmt.format(counts.syllables)}</dd>
			</div>
			<div>
				<dt class="text-muted-foreground">Pages</dt>
				<dd class="mt-0.5 font-medium tabular-nums">
					{(counts.words / 500).toFixed(1)} single-spaced
				</dd>
			</div>
		</dl>
	{/if}

	{#snippet about()}
		<h2>What the word counter counts</h2>
		<p>
			Every number updates as you type. <strong>Words</strong> are runs of letters and digits, so
			“don’t” and “well-known” are one word each, the same as in Microsoft Word and Google Docs.
			<strong>Sentences</strong> end at a period, question mark, or exclamation point, but not at
			the period in “Dr.” or “e.g.”, which trips up counters that only look for punctuation.
			<strong>Paragraphs</strong> are blocks of text separated by a blank line.
		</p>
		<p>
			If you write in Markdown, turn on the Markdown option. Code blocks, URLs, and heading and list
			markers stop counting, so the total is the prose a reader sees and not the markup around it.
		</p>

		<h2>Common word counts</h2>
		<ul>
			<li><strong>Meta description:</strong> about 155 characters before Google cuts it off.</li>
			<li><strong>Title tag:</strong> about 60 characters.</li>
			<li><strong>X post:</strong> 280 characters.</li>
			<li><strong>Abstract:</strong> 150 to 250 words for most journals and conferences.</li>
			<li><strong>Common App essay:</strong> 650 words.</li>
			<li><strong>Blog post:</strong> 1,000 to 2,000 words is typical.</li>
			<li><strong>Five-minute speech:</strong> about 650 words at a presentation pace.</li>
			<li><strong>Novel:</strong> 70,000 to 100,000 words.</li>
		</ul>

		<h2>From counting to checking</h2>
		<p>
			A word count tells you how long a draft is. To find out how hard it is to read, open the
			<a href="/tools/readability-checker">readability checker</a>: your text carries over. To see
			whether it sounds machine-written, try the <a href="/tools/ai-detector">AI detector</a>.
		</p>
	{/snippet}
</ToolPage>
