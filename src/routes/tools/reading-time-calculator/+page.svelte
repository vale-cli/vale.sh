<script lang="ts">
	import ToolPage from '$lib/components/tools/ToolPage.svelte';
	import TimeCalculator from '$lib/components/tools/TimeCalculator.svelte';
	import Formats from '$lib/components/tools/Formats.svelte';
	import { tool } from '$lib/tools';

	const page = tool('reading-time-calculator');

	const SAMPLE = `Most readers decide whether to start an article before they read a word of it. They look at the title, the length, and how much time it will cost them. A reading time under the headline answers the last question for them.

The estimate is simple: count the words and divide by how fast people read. The second number is the one that takes care. An adult reading English non-fiction silently averages about 238 words a minute. Fiction goes a little faster, and anything read aloud goes a good deal slower.

Round up when you publish it. A reader who finishes early is pleased, and one who runs over feels misled.`;

	// Brysbaert (2019), a review of 190 studies; "careful" is a rule of thumb.
	const paces = [
		{ label: 'Non-fiction', wpm: 238, note: 'Average adult, reading silently' },
		{ label: 'Fiction', wpm: 260, note: 'Average adult, reading silently' },
		{ label: 'Aloud', wpm: 183, note: 'Average adult, reading out loud' },
		{ label: 'Careful', wpm: 150, note: 'Technical or unfamiliar material' }
	];

	const faq = [
		{
			q: 'How is reading time calculated?',
			a: 'Divide the number of words by a reading speed in words per minute. This calculator starts at 238 words per minute, the average for adults reading English non-fiction silently, so a 1,000-word article takes about 4 minutes 12 seconds.'
		},
		{
			q: 'What is the average reading speed?',
			a: 'About 238 words per minute for non-fiction and 260 for fiction, for adults reading English silently, according to a 2019 review of 190 studies. Reading aloud averages about 183 words per minute. Earlier estimates of 300 came from smaller samples.'
		},
		{
			q: 'How long does it take to read 1,000 words?',
			a: 'About 4 minutes 12 seconds at the average non-fiction speed of 238 words per minute, a little under 4 minutes for fiction, and about 5 and a half minutes read aloud.'
		},
		{
			q: 'How many words is a 5-minute read?',
			a: 'About 1,190 words at 238 words per minute. A 10-minute read is about 2,380 words.'
		},
		{
			q: 'What should the “min read” label on a blog post say?',
			a: 'The reading time rounded up to the next whole minute, with a minimum of one. The calculator shows that label under the exact time, ready to copy.'
		},
		{
			q: 'Can I get the reading time of a PDF or Word document?',
			a: 'Yes. Drag the file onto the editor or choose Open. The file is read in your browser and is never uploaded.'
		}
	];
</script>

<ToolPage
	tool={page}
	lede="Paste a text or enter a word count to see how long it takes to read, at the average speed or your own."
	{faq}
>
	<TimeCalculator
		kind="reading"
		sample={SAMPLE}
		placeholder="Paste an article, a chapter, a report…"
		{paces}
		initial={238}
	/>

	{#snippet about()}
		<h2>How the reading time is worked out</h2>
		<p>
			The calculator counts the words in your text and divides by a reading speed. A word is a run
			of letters or digits, so “don’t” and “well-known” are one word each. The result is shown to
			the second, and rounded up to the minute for the “min read” label a blog post carries.
		</p>

		<h2>Which speed to use</h2>
		<p>
			The speeds come from a 2019 review of 190 studies of adults reading English. Silent reading
			averages 238 words a minute for non-fiction and 260 for fiction, and reading aloud averages
			183. Most adults fall between 175 and 300 for non-fiction.
		</p>
		<p>
			Real reading time also depends on the text. Dense or technical writing, unfamiliar terms, code
			samples, and tables all slow a reader down, which is what the careful pace is for. If you know
			your own speed, type it in.
		</p>

		<Formats verb="Get the reading time of" />

		<h2>Shorter is not the only fix</h2>
		<p>
			Two texts of the same length can take very different effort. To see how hard yours is to read,
			open the <a href="/tools/readability-checker">readability checker</a>: your text carries over.
			For a talk, the <a href="/tools/speech-time-calculator">speech time calculator</a> works from a
			speaking pace.
		</p>
	{/snippet}
</ToolPage>
