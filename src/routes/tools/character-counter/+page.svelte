<script lang="ts">
	import ToolPage from '$lib/components/tools/ToolPage.svelte';
	import Editor from '$lib/components/tools/Editor.svelte';
	import Stat from '$lib/components/tools/Stat.svelte';
	import Formats from '$lib/components/tools/Formats.svelte';
	import { tool } from '$lib/tools';
	import { settled } from '$lib/tools/settle.svelte';
	import { count, graphemes } from '$lib/tools/text';
	import { breakdown, sms } from '$lib/tools/characters';

	const page = tool('character-counter');
	const fmt = new Intl.NumberFormat('en-US');

	const SAMPLE = `Free writing tools that run in your browser: count characters, check readability, and convert case. No sign-up, and nothing you paste is uploaded.`;

	let text = $state('');
	const input = settled(() => text);

	const counts = $derived(count(input.value));
	const kinds = $derived(breakdown(input.value));
	const message = $derived(sms(input.value));
	// A title or a post is one line; a limit on it doesn't count a trailing newline.
	const length = $derived(graphemes(input.value.replace(/\n+$/, '')));

	const limits = [
		{ label: 'Title tag', max: 60, note: 'Search results cut a longer title off' },
		{ label: 'YouTube title', max: 100 },
		{ label: 'Meta description', max: 155, note: 'About what a search result shows' },
		{ label: 'Text message', max: 160, note: 'One SMS, in plain characters' },
		{ label: 'X post', max: 280 },
		{ label: 'Bluesky post', max: 300 },
		{ label: 'Threads post', max: 500 },
		{ label: 'Instagram caption', max: 2200 },
		{ label: 'LinkedIn post', max: 3000 }
	];

	const share = (n: number) => (counts.characters ? (n / counts.characters) * 100 : 0);
	const mix = $derived([
		{ label: 'Letters', value: kinds.letters, color: 'bg-lime-500' },
		{ label: 'Digits', value: kinds.digits, color: 'bg-sky-500' },
		{ label: 'Spaces and line breaks', value: kinds.spaces, color: 'bg-muted-foreground/40' },
		{ label: 'Punctuation', value: kinds.punctuation, color: 'bg-amber-500' },
		{ label: 'Symbols and emoji', value: kinds.other, color: 'bg-violet-500' }
	]);

	const faq = [
		{
			q: 'Does the character count include spaces?',
			a: 'The main count does: spaces, line breaks, and punctuation are all characters, and that is what a form field or a social network counts. The count without spaces is shown beside it, for the publishers and translation agencies that bill by it.'
		},
		{
			q: 'How are emoji and accented letters counted?',
			a: 'As one character each, the way a reader sees them. An emoji such as a family or a flag is several code points joined together, and many counters report it as four or more. The UTF-8 size is shown separately for when a database or an API limit is in bytes.'
		},
		{
			q: 'How many characters is a text message?',
			a: 'An SMS holds 160 characters from the standard GSM alphabet. A longer message is split into parts of 153. One character outside that alphabet, such as an emoji or a curly quote, switches the whole message to Unicode, where a single message holds 70 and each part of a longer one holds 67.'
		},
		{
			q: 'How long should a meta description be?',
			a: 'About 155 characters. Search engines measure by width and not by count, so there is no exact limit, but a description much longer than that is usually cut off. A title tag has room for about 60.'
		},
		{
			q: 'Why does a post count differently on X?',
			a: 'X counts every link as 23 characters whatever its length, and counts most emoji as two. This page counts what you typed, so a post with a long link has more room on X than the bar here shows.'
		},
		{
			q: 'Can I count the characters in a Word document or PDF?',
			a: 'Yes. Drag the file onto the editor or choose Open. The file is read in your browser and is never uploaded.'
		}
	];
</script>

<ToolPage
	tool={page}
	lede="Type or paste your text to count its characters, with and without spaces, and see what is left before the limit of a title tag, a text message, or a post."
	{faq}
>
	<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
		<div>
			<Editor
				bind:value={text}
				sample={SAMPLE}
				minHeight="18rem"
				placeholder="Type or paste a title, a post, a description…"
			/>
		</div>

		<div class="grid grid-cols-2 content-start gap-3" aria-live="polite">
			<div class="col-span-2">
				<Stat value={fmt.format(counts.characters)} label="Characters" />
			</div>
			<div class="col-span-2">
				<Stat value={fmt.format(counts.charactersNoSpaces)} label="Without spaces" />
			</div>
			<Stat value={fmt.format(counts.words)} label="Words" />
			<Stat value={fmt.format(counts.lines)} label="Lines" />
			<Stat value={fmt.format(counts.sentences)} label="Sentences" />
			<Stat value={fmt.format(kinds.bytes)} label="Bytes" note="As UTF-8" />
		</div>
	</div>

	<div class="mt-8 grid gap-6 md:grid-cols-2">
		<section class="rounded-xl border border-border bg-card p-5" aria-live="polite">
			<h2 class="font-medium">Character limits</h2>
			<ul class="mt-4 space-y-3">
				{#each limits as limit (limit.label)}
					{@const over = length > limit.max}
					<li class="text-sm">
						<div class="flex items-baseline justify-between gap-3">
							<span>{limit.label}</span>
							<span
								class="whitespace-nowrap tabular-nums {over
									? 'font-medium text-amber-600 dark:text-amber-400'
									: 'text-muted-foreground'}"
							>
								{#if over}
									{fmt.format(length - limit.max)} over {fmt.format(limit.max)}
								{:else}
									{fmt.format(limit.max - length)} left of {fmt.format(limit.max)}
								{/if}
							</span>
						</div>
						<div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
							<div
								class="h-full rounded-full {over ? 'bg-amber-500' : 'bg-lime-500'}"
								style="width: {Math.min(100, (length / limit.max) * 100)}%"
							></div>
						</div>
					</li>
				{/each}
			</ul>
		</section>

		<div class="space-y-6">
			<section class="rounded-xl border border-border bg-card p-5" aria-live="polite">
				<h2 class="font-medium">What it is made of</h2>
				<div class="mt-4 flex h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
					{#each mix as m (m.label)}
						<span class="h-full {m.color}" style="width: {share(m.value)}%"></span>
					{/each}
				</div>
				<ul class="mt-4 space-y-2 text-sm">
					{#each mix as m (m.label)}
						<li class="flex items-center gap-2.5">
							<span class="h-2.5 w-2.5 shrink-0 rounded-sm {m.color}" aria-hidden="true"></span>
							<span class="min-w-0 flex-1">{m.label}</span>
							<span class="tabular-nums text-muted-foreground">{fmt.format(m.value)}</span>
						</li>
					{/each}
				</ul>
			</section>

			<section class="rounded-xl border border-border bg-card p-5" aria-live="polite">
				<h2 class="font-medium">As a text message</h2>
				<p class="mt-3 text-sm leading-6 text-foreground/85">
					{#if !input.value}
						One message holds 160 plain characters, or 70 with an emoji in it.
					{:else}
						<strong class="font-medium text-foreground"
							>{message.segments === 1 ? 'One message' : `${message.segments} messages`}</strong
						>, with {fmt.format(message.remaining)} left in {message.segments === 1
							? 'it'
							: 'the last'}.
						{#if message.encoding === 'unicode'}
							“{message.culprit}” is outside the standard alphabet, so each message holds
							{message.segments === 1 ? 70 : 67} and not {message.segments === 1 ? 160 : 153}.
						{/if}
					{/if}
				</p>
			</section>
		</div>
	</div>

	{#snippet about()}
		<h2>What counts as a character</h2>
		<p>
			Every letter, digit, space, line break, and punctuation mark is one character. So is an
			accented letter or an emoji, however it is stored: a flag or a family emoji is several code
			points joined together, and this counter reports it as the one character a reader sees.
		</p>
		<p>
			Two other sizes sit beside the count. <strong>Without spaces</strong> leaves out spaces, tabs,
			and line breaks. <strong>Bytes</strong> is the size as UTF-8, which is what a database column or
			an API limit usually measures: a plain letter is one byte, an accented one two, and most emoji
			four.
		</p>

		<h2>Common character limits</h2>
		<ul>
			{#each limits as limit (limit.label)}
				<li>
					<strong>{limit.label}:</strong>
					{fmt.format(limit.max)} characters{limit.note ? `. ${limit.note}` : ''}.
				</li>
			{/each}
		</ul>
		<p>
			Each platform counts a little differently. X counts any link as 23 characters and most emoji
			as two. Search engines cut titles and descriptions by width, so the figures for those are
			guides and not hard limits.
		</p>

		<Formats verb="Count the characters in" />

		<h2>From counting to checking</h2>
		<p>
			For reading time and keyword density, open the
			<a href="/tools/word-counter">word counter</a>: your text carries over. To see how hard the
			text is to read, try the <a href="/tools/readability-checker">readability checker</a>.
		</p>
	{/snippet}
</ToolPage>
