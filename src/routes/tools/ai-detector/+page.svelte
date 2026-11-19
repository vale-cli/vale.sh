<script lang="ts">
	import ToolPage from '$lib/components/tools/ToolPage.svelte';
	import ProseInput from '$lib/components/tools/ProseInput.svelte';
	import Stat from '$lib/components/tools/Stat.svelte';
	import Marked from '$lib/components/tools/Marked.svelte';
	import { tool } from '$lib/tools';
	import { settled } from '$lib/tools/settle.svelte';
	import { maskMarkdown, words } from '$lib/tools/text';
	import {
		createDetector,
		density,
		ruleLabel,
		type Detector,
		type Finding,
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

	let text = $state('');
	const input = settled(() => text, 220);

	/*
		The patterns are a separate download, fetched once the page is idle, so
		the page itself paints without them. `detector` stays null until then
		and the results area says so.
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

	const findings = $derived<Finding[]>(detector ? detector.scan(input.value) : []);
	const total = $derived(words(maskMarkdown(input.value)).length);
	const per1k = $derived(total ? (findings.length / total) * 1000 : 0);
	const band = $derived(density(per1k));

	/** Findings grouped by pattern, most frequent first. */
	const groups = $derived.by(() => {
		const map = new Map<string, Finding[]>();
		for (const f of findings) {
			const list = map.get(f.rule);
			if (list) list.push(f);
			else map.set(f.rule, [f]);
		}
		return [...map.entries()]
			.map(([rule, list]) => ({ rule, list }))
			.sort((a, b) => b.list.length - a.list.length);
	});

	const marks = $derived(
		findings.map((f) => ({ from: f.from, to: f.to, title: f.message, tone: 'warn' as const }))
	);

	/** A rule's advice with the quoted match taken out: "AI hedge: 'x'. Do y." → "Do y." */
	const advice = (message: string) => message.replace(/^[^:]*:\s*'.*?'\.\s*/, '');

	const faq = $derived([
		{
			q: 'How does this AI detector work?',
			a: `It searches your text for ${data.rules} patterns that language models overuse: stock phrases such as “delve into” and “rich tapestry,” formulas such as “it’s not just X, it’s Y,” filler openings and closings, and marketing-style headings. Each match is highlighted and comes with a suggested fix. It does not use a neural network and it does not guess who wrote the text.`
		},
		{
			q: 'Can it tell me for certain whether text was written by AI?',
			a: 'No, and no detector can. People wrote these phrases long before language models existed, and models learned them from people. A high count means the text reads as machine-written to many readers. It is not proof of how it was produced, and it should never be used on its own to accuse someone.'
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
	lede="Paste any text to see the phrases that make it read as AI-written. Each one is highlighted with the reason and a fix, and nothing leaves your browser."
	{faq}
>
	<ProseInput
		bind:value={text}
		sample={SAMPLE}
		rows={9}
		placeholder="Paste an essay, an email, a blog post, a pull request description…"
	/>

	<div class="mt-6" aria-live="polite">
		{#if failed}
			<p class="rounded-xl border border-border p-6 text-center text-sm text-muted-foreground">
				The detector’s patterns didn’t load. Reload the page to try again.
			</p>
		{:else if total === 0}
			<p
				class="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground"
			>
				Results will appear here as soon as you paste some text.
			</p>
		{:else if !detector}
			<p
				class="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground"
			>
				Loading {data.rules} patterns…
			</p>
		{:else}
			<div class="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr]">
				<div class="rounded-xl border border-border bg-card p-4">
					<div class="flex items-baseline gap-2">
						<span
							class="text-4xl font-medium tabular-nums tracking-tight {band.level >= 2
								? 'text-amber-600 dark:text-amber-400'
								: band.level === 0
									? 'text-lime-600 dark:text-lime-400'
									: 'text-foreground'}">{findings.length}</span
						>
						<span class="text-sm text-foreground/85">
							AI tell{findings.length === 1 ? '' : 's'} found
						</span>
					</div>
					<div class="mt-3 flex gap-1" aria-hidden="true">
						{#each [1, 2, 3] as step (step)}
							<span
								class="h-1.5 flex-1 rounded-full {band.level >= step
									? band.level >= 2
										? 'bg-amber-500'
										: 'bg-lime-500'
									: 'bg-muted'}"
							></span>
						{/each}
					</div>
					<div class="mt-2 text-sm font-medium">{band.label}</div>
				</div>
				<Stat
					value={per1k.toFixed(1)}
					label="Per 1,000 words"
					tone={band.level >= 2 ? 'warn' : 'plain'}
				/>
				<Stat value={total.toLocaleString('en-US')} label="Words checked" />
			</div>

			{#if total < 100}
				<p class="mt-3 text-sm text-amber-700 dark:text-amber-400">
					This is a short sample. One phrase swings the rate a lot under 100 words.
				</p>
			{/if}

			<h2 class="mt-8 font-medium">Your text, marked up</h2>
			<p class="mt-1 text-sm text-muted-foreground">
				Hover over a highlight to see why it was flagged.
			</p>
			<div class="mt-3">
				<Marked
					text={input.value}
					{marks}
					empty="None of the {data.rules} patterns matched. That doesn’t prove a person wrote it, only that it avoids the usual tells."
				/>
			</div>

			{#if groups.length}
				<h2 class="mt-8 font-medium">What to fix</h2>
				<ul class="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
					{#each groups as group (group.rule)}
						<li class="p-4">
							<div class="flex items-baseline justify-between gap-3">
								<h3 class="font-medium">{ruleLabel(group.rule)}</h3>
								<span class="shrink-0 text-sm tabular-nums text-muted-foreground">
									{group.list.length}×
								</span>
							</div>
							<p class="mt-1 text-sm text-foreground/85">{advice(group.list[0].message)}</p>
							<div class="mt-2 flex flex-wrap gap-1.5">
								{#each [...new Set(group.list.map( (f) => f.match.trim() ))].slice(0, 8) as match (match)}
									<span class="rounded bg-amber-400/25 px-1.5 py-0.5 text-sm">{match}</span>
								{/each}
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		{/if}
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
			collection maintained in public, so you can read exactly what is being checked.
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

		<h2>Why not a percentage?</h2>
		<p>
			Detectors that return “87% AI” are guessing from statistics you can’t see, and they are wrong
			often enough that students have been falsely accused of cheating. A list of specific phrases
			is something you can verify and act on. If the goal is better writing, the fix is the same
			either way: replace the stock phrase with what you actually mean.
		</p>

		<h2>Check every draft automatically</h2>
		<p>
			The same patterns are available as a
			<a href="/explorer/ai-tells">package for Vale</a>, which runs them in your editor and on every
			pull request. If a coding agent writes your docs or commit messages, Vale can check its output
			before you read it.
		</p>
	{/snippet}
</ToolPage>
