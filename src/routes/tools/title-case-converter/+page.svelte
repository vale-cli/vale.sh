<script lang="ts">
	import ToolPage from '$lib/components/tools/ToolPage.svelte';
	import ProseInput from '$lib/components/tools/ProseInput.svelte';
	import Check from 'lucide-svelte/icons/check';
	import Copy from 'lucide-svelte/icons/copy';
	import { tool } from '$lib/tools';
	import { convertAll, otherCases, styles } from '$lib/tools/titlecase';

	const page = tool('title-case-converter');

	const SAMPLE = `a step-by-step guide to writing for the web
what we talk about when we talk about style
the iPhone is not a computer: an argument from design
how to write with clarity in under a minute`;

	let text = $state('');

	const results = $derived(
		styles.map((style) => ({ style, output: text.trim() ? convertAll(text, style.id) : '' }))
	);
	const extras = $derived(
		otherCases.map((c) => ({ ...c, output: text.trim() ? c.apply(text) : '' }))
	);

	/*
		Where the styles disagree on this input. Compared word by word against
		AP, so the note under the results can name the words in question instead
		of leaving the reader to spot a lowercase "with".
	*/
	const disputed = $derived.by(() => {
		if (!text.trim()) return [] as string[];
		const cased = results
			.filter((r) => r.style.id !== 'sentence')
			.map((r) => r.output.split(/\s+/));
		const out = new Set<string>();
		for (let i = 0; i < (cased[0]?.length ?? 0); i++) {
			const forms = new Set(cased.map((w) => w[i]));
			if (forms.size > 1) out.add((cased[0][i] ?? '').toLowerCase().replace(/[^\p{L}-]/gu, ''));
		}
		return [...out].filter(Boolean);
	});

	let copied = $state('');
	async function copy(id: string, output: string) {
		try {
			await navigator.clipboard.writeText(output);
			copied = id;
			setTimeout(() => copied === id && (copied = ''), 1500);
		} catch {
			// Clipboard blocked: the text is selectable, so nothing is lost.
		}
	}

	const faq = [
		{
			q: 'What is title case?',
			a: 'Title case capitalizes the first word, the last word, and every important word in between: nouns, verbs, adjectives, adverbs, and pronouns. Short function words such as “a,” “the,” “and,” “of,” and “to” stay lowercase. The style guides differ only on which short words count.'
		},
		{
			q: 'Which words are not capitalized in a title?',
			a: 'Articles (a, an, the), coordinating conjunctions (and, but, or, nor, for), and short prepositions (at, by, in, of, on, to, up) are lowercase in every major style, unless one is the first or last word. Longer prepositions such as “with,” “from,” and “between” depend on the guide: AP and APA capitalize any word of four letters or more, while MLA lowercases every preposition.'
		},
		{
			q: 'Is “is” capitalized in a title?',
			a: 'Yes. “Is” is a verb, and verbs are always capitalized in title case, however short. The same goes for “are,” “was,” “be,” and “do.” Leaving “is” lowercase is the most common title-case mistake.'
		},
		{
			q: 'What is the difference between AP and Chicago title case?',
			a: 'Length versus part of speech. AP capitalizes every word of four or more letters, so “With,” “From,” and “Over” are capitalized. Chicago lowercases prepositions of four letters or fewer, so those same words stay lowercase, but its 18th edition capitalizes longer ones such as “Between” and “Through.”'
		},
		{
			q: 'Should I use title case or sentence case for headings?',
			a: 'Sentence case is now the standard for software documentation and interfaces: Google, Microsoft, and Red Hat all use it, because it is easier to read and to apply consistently. Title case remains standard for book and article titles, academic papers, and many news sites.'
		},
		{
			q: 'Does the converter keep capitals in names like iPhone and NASA?',
			a: 'Yes. A word with a capital letter after its first letter, such as iPhone, GitHub, or macOS, is left exactly as you typed it, and so is an acronym in capitals such as NASA or API. If the whole title is in capitals, the converter treats it as shouting and re-cases every word.'
		}
	];
</script>

<ToolPage
	tool={page}
	lede="Type a headline to see it in AP, APA, Chicago, and MLA title case and in sentence case, all at once. Paste several lines to convert a whole list."
	{faq}
>
	<ProseInput
		bind:value={text}
		sample={SAMPLE}
		rows={4}
		carry={false}
		label="Your title"
		placeholder="Type or paste a title, or several, one per line…"
	/>

	<div class="mt-6 grid gap-3" aria-live="polite">
		{#each results as r (r.style.id)}
			<div class="rounded-xl border border-border bg-card p-4">
				<div class="flex items-start justify-between gap-3">
					<div>
						<h2 class="font-medium">{r.style.name}</h2>
						<p class="text-xs text-muted-foreground">{r.style.used}</p>
					</div>
					<button
						type="button"
						onclick={() => copy(r.style.id, r.output)}
						disabled={!r.output}
						class="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-lime-500/40 hover:bg-muted/40 disabled:opacity-40"
					>
						{#if copied === r.style.id}
							<Check class="h-3.5 w-3.5 text-lime-600" aria-hidden="true" /> Copied
						{:else}
							<Copy class="h-3.5 w-3.5" aria-hidden="true" /> Copy
						{/if}
					</button>
				</div>
				<p
					class="mt-3 min-h-7 whitespace-pre-wrap break-words text-lg leading-7 {r.output
						? 'text-foreground'
						: 'text-muted-foreground/60'}"
				>
					{r.output || 'Your title in ' + r.style.name + ' style'}
				</p>
			</div>
		{/each}
	</div>

	{#if disputed.length}
		<p class="mt-4 text-sm text-foreground/85">
			The styles disagree on
			{#each disputed as word, i (word)}<strong class="font-medium">“{word}”</strong>{i <
				disputed.length - 2
					? ', '
					: i === disputed.length - 2
						? ' and '
						: ''}{/each}. See the rules below for why.
		</p>
	{/if}

	<div class="mt-6 flex flex-wrap gap-2">
		{#each extras as c (c.id)}
			<button
				type="button"
				onclick={() => copy(c.id, c.output)}
				disabled={!c.output}
				class="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm transition-colors hover:border-lime-500/40 disabled:opacity-40"
			>
				{#if copied === c.id}
					<Check class="h-3.5 w-3.5 text-lime-600" aria-hidden="true" /> Copied
				{:else}
					<Copy class="h-3.5 w-3.5" aria-hidden="true" /> Copy as {c.name}
				{/if}
			</button>
		{/each}
	</div>

	{#snippet about()}
		<h2>Title case rules by style guide</h2>
		<p>
			Every style capitalizes the first word and all nouns, verbs, adjectives, adverbs, and
			pronouns. They differ on the small words in the middle.
		</p>
		{#each styles as style (style.id)}
			<h3>{style.name}</h3>
			<p>{style.rule} Used for: {style.used.toLowerCase()}.</p>
		{/each}

		<h2>What the converter can’t know</h2>
		<p>
			Two rules depend on grammar that a converter can only guess at. Some guides capitalize “to” in
			an infinitive (“How To Train”) but not as a preposition, and capitalize a word like “up” or
			“on” when it is part of a verb (“Set Up Your Account”) but not otherwise. This converter
			treats those words as prepositions. Check them by hand if your guide is strict about it.
		</p>
		<p>
			Sentence case has the same limit with proper nouns: the converter keeps capitals such as
			“iPhone” and “NASA,” but can’t tell that “python” should be “Python.” Type names with their
			capitals and they are kept.
		</p>

		<h2>Keep headings consistent across a whole site</h2>
		<p>
			Converting one title is easy. Keeping a thousand headings in one style is not. Vale checks
			every heading in your docs against the style you pick, with rules such as
			<a href="/explorer/Google">Google’s</a> and <a href="/explorer/Microsoft">Microsoft’s</a>
			sentence-case checks, and flags the ones that drift. To see what each guide asks for, on headings
			and much else, browse the <a href="/guides">style guide explorer</a>.
		</p>
	{/snippet}
</ToolPage>
