<script lang="ts">
	import ToolPage from '$lib/components/tools/ToolPage.svelte';
	import Editor, { type Category, type Highlight } from '$lib/components/tools/Editor.svelte';
	import Legend from '$lib/components/tools/Legend.svelte';
	import Formats from '$lib/components/tools/Formats.svelte';
	import { tool } from '$lib/tools';
	import { settled } from '$lib/tools/settle.svelte';
	import { useVale } from '$lib/tools/engine.svelte';
	import { config, fixFor, type ValeSpec } from '$lib/tools/vale';

	const page = tool('voice-checker');

	// The draft the Voices package tests itself on.
	const SAMPLE = `# Understanding Why Your Component Keeps Re-Rendering

Here's the thing: it's worth noting that the reason your React component is re-rendering is likely because you're creating a new object reference on each render cycle, which breaks React's referential equality check — so you may want to consider memoization.

This is not just a performance problem, it's a correctness problem. Furthermore, experts agree that a robust approach to this paradigm shift will empower your team to streamline a number of things in the render path, underscoring its significance.

In conclusion, the team made a decision to leverage several caching solutions.`;

	/*
		Each voice is a Vale style in the Voices package. `Voices` is the core
		every one of them shares, so it is always on beside the one picked.
	*/
	const voices = [
		{
			id: 'Direct',
			name: 'Direct',
			says: 'No hedging, no preamble, sentences under 25 words, and paragraphs that read easily.'
		},
		{
			id: 'Human',
			name: 'Human',
			says: 'None of the words, openers, and sign-offs that mark a page as generated.'
		},
		{
			id: 'Simple',
			name: 'Simple',
			says: 'Only the 850 words of Basic English, in very easy paragraphs.'
		},
		{
			id: 'Coach',
			name: 'Coach',
			says: 'One note of 100 words, one image, and one next action.'
		},
		{
			id: 'Claude',
			name: 'Claude',
			says: 'Brief and focused, with no decoration and no sign-off.'
		},
		{
			id: 'GenZ',
			name: 'Gen Z',
			says: 'One slang term a sentence, two a paragraph, and at least one.'
		}
	] as const;

	type VoiceId = (typeof voices)[number]['id'];
	let voice = $state<VoiceId>('Direct');
	const current = $derived(voices.find((v) => v.id === voice)!);

	const categories = $derived<Category[]>([
		{
			id: 'voice',
			label: current.name,
			tone: 'violet',
			mark: 'line',
			hint: 'What this voice asks'
		},
		{
			id: 'core',
			label: 'Every voice',
			tone: 'amber',
			mark: 'line',
			hint: 'The shared core'
		}
	]);

	let text = $state('');
	let hidden = $state<string[]>([]);
	let editor = $state<ReturnType<typeof Editor>>();
	const input = settled(() => text, 220);

	/*
		The archive nests its styles a level down, and the length rules extend
		Std, which has to sit on the same StylesPath.
	*/
	const packages = [
		{ url: '/wasm/packages/Voices.zip', prefix: '/pkg' },
		{ url: '/wasm/packages/Std.zip', prefix: '/pkg/Voices/styles' }
	];
	const spec = $derived<ValeSpec>({
		packages,
		config: config(['Voices', voice], '/pkg/Voices/styles')
	});
	const vale = useVale(
		() => input.value,
		() => spec
	);

	// A result for another voice is not this one's, even on the same text.
	const placed = $derived(vale.result?.config === spec.config ? vale.result.placed : []);
	const pending = $derived(
		input.value.trim() !== '' && vale.state !== 'failed' && vale.result?.config !== spec.config
	);

	const highlights = $derived<Highlight[]>(
		placed.map((p) => ({
			from: p.from,
			to: p.to,
			category: p.alert.Check.startsWith('Voices.') ? 'core' : 'voice',
			message: p.alert.Message,
			source: p.alert.Check,
			fix: fixFor(p.alert)
		}))
	);

	const tally = $derived.by(() => {
		const out: Record<string, number> = {};
		for (const h of highlights) out[h.category] = (out[h.category] ?? 0) + 1;
		return out;
	});
	const empty = $derived(input.value.trim() === '');
	// No count to show: there is no text, no answer yet, or no engine.
	const blank = $derived(empty || pending || vale.state === 'failed');

	const faq = [
		{
			q: 'What is a writing voice?',
			a: 'A voice is a set of rules for how prose should sound: how long a sentence may run, which words are off the table, how a piece opens and closes. A style guide tells you what is correct; a voice tells you what this writer, or this product, sounds like.'
		},
		{
			q: 'How does the voice checker work?',
			a: 'Each voice is a set of rules for Vale, an open-source linter for prose. The checker runs Vale in your browser against the voice you pick and highlights every place the draft breaks a rule, with the reason and, where the rule defines one, a fix.'
		},
		{
			q: 'Where do the voices come from?',
			a: 'From Voices, an open-source package that turns popular writing-voice prompts into rules. A prompt asks a model to remember a voice. A rule checks whether the draft kept to it.'
		},
		{
			q: 'Can I check text written by an AI assistant?',
			a: 'Yes, and that is what the voices were written for. Paste the draft, pick the voice you asked for, and the highlights show where it drifted. The Human voice looks for the words and habits that mark text as generated.'
		},
		{
			q: 'Is my text uploaded?',
			a: 'No. The check runs in your browser. Your text is not sent to a server, stored, or read by any model.'
		}
	];
</script>

<ToolPage
	tool={page}
	wide
	lede="Pick a voice and paste a draft. Every place the draft breaks that voice is highlighted where it sits, with the reason and, where there is one, a fix."
	{faq}
>
	<div class="mb-4 flex flex-wrap gap-2" role="group" aria-label="Voice">
		{#each voices as v (v.id)}
			<button
				type="button"
				onclick={() => (voice = v.id)}
				aria-pressed={voice === v.id}
				class="rounded-lg border px-3 py-1.5 text-sm transition-colors {voice === v.id
					? 'border-lime-500/60 bg-lime-500/15 font-medium text-foreground'
					: 'border-border bg-card text-foreground/80 hover:border-lime-500/40'}"
			>
				{v.name}
			</button>
		{/each}
	</div>
	<p class="mb-4 text-sm text-foreground/85">{current.says}</p>

	<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
		<div class="min-w-0">
			<Editor
				bind:this={editor}
				bind:value={text}
				{highlights}
				{categories}
				{hidden}
				sample={SAMPLE}
				minHeight="28rem"
				placeholder="Paste a draft, a reply, a README…"
			/>
		</div>

		<aside class="space-y-5 lg:sticky lg:top-24 lg:self-start" aria-live="polite">
			<div class="rounded-2xl border border-border bg-card p-5 shadow-sm">
				<div class="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
					{current.name} voice
				</div>
				<div class="mt-2 flex items-baseline gap-2">
					<span
						class="text-5xl font-medium tabular-nums tracking-tight {blank
							? 'text-muted-foreground/40'
							: highlights.length
								? 'text-amber-600 dark:text-amber-400'
								: 'text-lime-600 dark:text-lime-400'}">{blank ? '–' : highlights.length}</span
					>
					<span class="text-sm text-muted-foreground">breaks</span>
				</div>
				<p class="mt-3 text-sm font-medium text-foreground">
					{#if vale.state === 'failed'}
						The checker didn’t load
					{:else if empty}
						Paste a draft to check it
					{:else if pending}
						Checking with Vale…
					{:else if highlights.length === 0}
						The draft keeps to this voice
					{:else}
						{highlights.length === 1 ? 'One place to fix' : `${highlights.length} places to fix`}
					{/if}
				</p>
				<p class="mt-0.5 text-xs leading-5 text-muted-foreground">
					{#if vale.state === 'failed'}
						Reload the page to try again.
						{#if vale.error}<span class="block break-words opacity-80">({vale.error})</span>{/if}
					{:else}
						Checked by Vale, running in this tab.
					{/if}
				</p>
			</div>

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
		<h2>What each voice asks for</h2>
		{#each voices as v (v.id)}
			<h3>{v.name}</h3>
			<p>{v.says}</p>
		{/each}
		<p>
			Every voice also carries a shared core: no inflated words, no “it’s not X, it’s Y,” no
			throat-clearing, no claims credited to unnamed experts, and no recap at the end.
		</p>

		<h2>How to read the result</h2>
		<p>
			Each highlight is one rule the draft broke. Point at it, or put the cursor in it, to see the
			rule’s reason and its name. Where the rule defines a replacement, the card offers it as a
			one-click fix. The list beside the editor separates what the picked voice asks from what every
			voice asks, and clicking a row jumps to the next highlight of that kind.
		</p>

		<Formats verb="Check" />

		<h2>Hold every draft to a voice</h2>
		<p>
			The voices are a package for Vale, so the same check runs in your editor, in CI, and on what a
			coding agent writes before you read it. Browse the rules in the
			<a href="/explorer/Voices">style explorer</a>.
		</p>
	{/snippet}
</ToolPage>
