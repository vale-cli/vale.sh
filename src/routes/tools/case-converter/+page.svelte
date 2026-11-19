<script lang="ts">
	import ToolPage from '$lib/components/tools/ToolPage.svelte';
	import ProseInput from '$lib/components/tools/ProseInput.svelte';
	import CopyButton from '$lib/components/tools/CopyButton.svelte';
	import { tool } from '$lib/tools';
	import { code, writing, type Case } from '$lib/tools/cases';

	const page = tool('case-converter');

	const SAMPLE = `THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG. i left caps lock on again.
user account id`;

	let text = $state('');
	const has = $derived(text.trim() !== '');

	const groups: { title: string; note: string; cases: Case[] }[] = [
		{ title: 'For writing', note: 'Punctuation and line breaks are kept.', cases: writing },
		{
			title: 'For code',
			note: 'Each line becomes one name. Punctuation is dropped.',
			cases: code
		}
	];

	const faq = [
		{
			q: 'How do I change uppercase to lowercase without retyping?',
			a: 'Paste the text and copy the lowercase or sentence case result. Sentence case is usually what you want after leaving caps lock on: it lowercases everything, then capitalizes the first word of each sentence and the word “I.”'
		},
		{
			q: 'What is the difference between sentence case and title case?',
			a: 'Sentence case capitalizes only the first word and proper nouns, as in an ordinary sentence. Title case capitalizes every important word and leaves short function words such as “a,” “of,” and “to” lowercase. Capitalized case is simpler still: every word gets a capital, with no exceptions.'
		},
		{
			q: 'What are camelCase, PascalCase, snake_case, and kebab-case?',
			a: 'Ways of writing a name of several words where spaces are not allowed. camelCase joins the words and capitalizes each one after the first. PascalCase capitalizes the first as well. snake_case joins lowercase words with underscores, and kebab-case joins them with hyphens. CONSTANT_CASE is snake case in capitals.'
		},
		{
			q: 'Can I convert camelCase to snake_case?',
			a: 'Yes. The converter splits a name where a lowercase letter meets a capital, so “userAccountId” becomes “user_account_id,” and it keeps a run of capitals together, so “parseHTTPResponse” becomes “parse_http_response.” Paste several names, one per line, to convert a list.'
		},
		{
			q: 'Does it keep names like iPhone and NASA?',
			a: 'In sentence case and capitalized case, a word with a capital after its first letter, such as iPhone or GitHub, is left as typed, and so is an acronym standing alone in capitals. Two or more words in capitals side by side are treated as caps lock and re-cased.'
		},
		{
			q: 'Is my text uploaded?',
			a: 'No. The conversion happens in your browser as you type, and nothing is sent to a server.'
		}
	];
</script>

<ToolPage
	tool={page}
	lede="Type or paste text to see it in sentence case, title case, uppercase, and lowercase, and as camelCase, snake_case, and kebab-case. Copy the one you need."
	{faq}
>
	<ProseInput
		bind:value={text}
		sample={SAMPLE}
		rows={4}
		carry={false}
		label="Your text"
		placeholder="Type or paste text, or a list of names, one per line…"
	/>

	<div aria-live="polite">
		{#each groups as group (group.title)}
			<h2 class="mt-8 font-medium">{group.title}</h2>
			<p class="text-sm text-muted-foreground">{group.note}</p>
			<div class="mt-3 grid gap-3 md:grid-cols-2">
				{#each group.cases as c (c.id)}
					{@const output = has ? c.apply(text) : ''}
					<div class="min-w-0 rounded-xl border border-border bg-card p-4">
						<div class="flex items-start justify-between gap-3">
							<div class="min-w-0">
								<h3 class="font-medium">{c.name}</h3>
								<p class="text-xs text-muted-foreground">{c.used}</p>
							</div>
							<CopyButton text={output} />
						</div>
						<p
							class="mt-3 max-h-40 min-h-6 overflow-y-auto whitespace-pre-wrap break-words leading-6 {group.cases ===
							code
								? 'font-mono text-sm'
								: ''} {output ? 'text-foreground' : 'text-muted-foreground/60'}"
						>
							{output || c.apply(c.name === 'aLtErNaTiNg' ? 'your text' : 'Your text here')}
						</p>
					</div>
				{/each}
			</div>
		{/each}
	</div>

	{#snippet about()}
		<h2>Which case to use</h2>
		<p>
			<strong>Sentence case</strong> is ordinary writing: a capital at the start of each sentence
			and on proper nouns. It is also the heading style of most software documentation.
			<strong>Title case</strong> is for headlines and the titles of books and articles.
			<strong>Uppercase</strong> reads as shouting in running text and is harder to read at length, so
			keep it for short labels and acronyms.
		</p>
		<p>
			Title case has more than one definition. This page uses AP’s. To compare AP, APA, Chicago, and
			MLA on the same headline, use the
			<a href="/tools/title-case-converter">title case converter</a>.
		</p>

		<h2>Naming conventions in code</h2>
		<ul>
			<li><strong>camelCase:</strong> variables and functions in JavaScript, Java, and Go.</li>
			<li><strong>PascalCase:</strong> classes, types, and components.</li>
			<li><strong>snake_case:</strong> Python and Ruby names, and database columns.</li>
			<li><strong>CONSTANT_CASE:</strong> constants and environment variables.</li>
			<li><strong>kebab-case:</strong> URLs, file names, and CSS classes.</li>
			<li><strong>dot.case:</strong> configuration keys.</li>
		</ul>
		<p>
			The converter reads any of these as input. It splits a name at spaces, hyphens, underscores,
			and dots, and where a lowercase letter meets a capital, so one list can be moved from any
			convention to any other.
		</p>

		<h2>What the converter can’t know</h2>
		<p>
			Sentence case can’t tell that “python” should be “Python” or that “paris” is a city. It keeps
			the capitals you typed on names such as “iPhone,” but where the text arrives in capitals,
			proper nouns come out lowercase and need a pass by hand.
		</p>

		<h2>Keep capitalization consistent everywhere</h2>
		<p>
			Converting one line is easy. Keeping every heading in a set of docs in the same case is not.
			Vale checks each heading against the style you pick and flags the ones that drift. To see what
			each guide asks for, browse the <a href="/guides">style guide explorer</a>.
		</p>
	{/snippet}
</ToolPage>
