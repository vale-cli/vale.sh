<script lang="ts">
	import ToolPage from '$lib/components/tools/ToolPage.svelte';
	import TimeCalculator from '$lib/components/tools/TimeCalculator.svelte';
	import Formats from '$lib/components/tools/Formats.svelte';
	import { tool } from '$lib/tools';

	const page = tool('speech-time-calculator');

	const SAMPLE = `Thank you all for coming. I have five minutes, so I will make one point and then sit down.

Every team I have worked on wrote things down. Very few of them agreed on how. One person wrote "log in" and another wrote "login," and a reader was left to wonder whether those were two different things.

A style guide settles that once. Nobody has to remember it, because the check runs on every change, the same way the tests do.

So here is what I am asking for. Pick a guide, turn the check on, and fix what it finds this week. The next person to read your docs will not notice a thing, and that is the point.`;

	// Conventional rules of thumb for spoken English.
	const paces = [
		{ label: 'Slow', wpm: 110, note: 'Formal, or for a large room' },
		{ label: 'Presentation', wpm: 130, note: 'A comfortable pace with pauses' },
		{ label: 'Conversation', wpm: 150, note: 'How most people talk' },
		{ label: 'Fast', wpm: 170, note: 'Energetic; hard to keep up' }
	];

	const faq = [
		{
			q: 'How many words is a 5-minute speech?',
			a: 'About 650 words at a comfortable presentation pace of 130 words per minute. At a conversational 150 words per minute it is about 750, and at a slow, formal 110 it is about 550.'
		},
		{
			q: 'How long does it take to say 1,000 words?',
			a: 'About 7 minutes 40 seconds at a presentation pace of 130 words per minute, and about 6 minutes 40 seconds at a conversational 150.'
		},
		{
			q: 'How many words per minute do people speak?',
			a: 'Conversation in English runs at roughly 150 words per minute. Prepared speeches are slower, usually 110 to 140, because a speaker pauses for emphasis and for the audience to keep up.'
		},
		{
			q: 'How do I find my own speaking pace?',
			a: 'Read a passage of known length aloud, at the pace you would use on the day, and time it. Divide the words by the minutes and enter the result as your words per minute. Most people speak faster when nervous, so leave some margin.'
		},
		{
			q: 'How long should my speech be for a time limit?',
			a: 'Enter the limit in minutes. The calculator shows how many words fit at your pace and, if you have pasted a draft, how many words to cut or how many you have room to add.'
		},
		{
			q: 'Is my speech uploaded?',
			a: 'No. The count and the timing are worked out in your browser, and your text is never sent to a server.'
		}
	];
</script>

<ToolPage
	tool={page}
	lede="Paste a speech or enter a word count to see how long it takes to say. Set a time limit to see how many words fit and how much to cut."
	{faq}
>
	<TimeCalculator
		kind="speaking"
		sample={SAMPLE}
		placeholder="Paste a speech, a script, a presentation…"
		{paces}
		initial={130}
	/>

	{#snippet about()}
		<h2>How the speaking time is worked out</h2>
		<p>
			The calculator counts the words in your script and divides by a speaking pace in words per
			minute. The paces are rules of thumb: about 150 words a minute for conversation, and 110 to
			140 for a prepared speech, where pauses take up part of every minute.
		</p>

		<h2>Writing to a time limit</h2>
		<p>
			Start from the limit. A five-minute slot at a presentation pace holds about 650 words, and a
			twenty-minute talk about 2,600. Aim a little under: applause, a slide that will not advance,
			and a slower pace on the day all cost time, and nobody minds a talk that ends early.
		</p>
		<p>
			A script is not all spoken at one pace. Numbers, names, and anything read from a slide go
			slower than the words around them. If the timing matters, read the draft aloud once and enter
			the pace you measured.
		</p>

		<Formats verb="Time" />

		<h2>Make it easier to say</h2>
		<p>
			Long sentences are hard to read aloud and harder to follow by ear. The
			<a href="/tools/readability-checker">readability checker</a> highlights the ones to split:
			your text carries over. For an article, the
			<a href="/tools/reading-time-calculator">reading time calculator</a> works from a reading speed.
		</p>
	{/snippet}
</ToolPage>
