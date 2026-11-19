<script lang="ts">
	import ToolPage from '$lib/components/tools/ToolPage.svelte';
	import Editor, { type Category, type Highlight } from '$lib/components/tools/Editor.svelte';
	import Formats from '$lib/components/tools/Formats.svelte';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import X from 'lucide-svelte/icons/x';
	import { tool } from '$lib/tools';
	import { settled } from '$lib/tools/settle.svelte';
	import { createDetector, type Detector, type RuleData } from '$lib/tools/aitells';
	import { topics, type RuleSummary } from '$lib/tools/topics';

	let { data } = $props();

	const page = tool('style-guide-checker');

	const SAMPLE = `# Getting Started With The Command Line Tool

Please note that we will now walk you through the setup, e.g. installing the CLI. You can install the tool from the dashboard in a few clicks!

The file was opened by the user at 9am on the 3rd of July. It's a very easy process — simply click the button, and don't worry about the config...

In order to utilize the blacklist feature, the admin must login first. This sentence is deliberately written to be long, so that it runs past the limit that some guides set for one sentence in documentation that people have to read while they are doing something else.`;

	const guides = [
		{
			id: 'Google',
			name: 'Google',
			full: 'Google developer documentation style guide',
			href: 'https://developers.google.com/style',
			load: () => import('$lib/data/tools/guide-Google.json')
		},
		{
			id: 'Microsoft',
			name: 'Microsoft',
			full: 'Microsoft Writing Style Guide',
			href: 'https://learn.microsoft.com/en-us/style-guide/welcome/',
			load: () => import('$lib/data/tools/guide-Microsoft.json')
		},
		{
			id: 'RedHat',
			name: 'Red Hat',
			full: 'Red Hat supplementary style guide',
			href: 'https://redhat-documentation.github.io/supplementary-style-guide/',
			load: () => import('$lib/data/tools/guide-RedHat.json')
		}
	] as const;

	type GuideId = (typeof guides)[number]['id'];

	/* The guide's own three severities, each with a color used everywhere. */
	const categories: Category[] = [
		{ id: 'error', label: 'Errors', tone: 'rose', mark: 'line' },
		{ id: 'warning', label: 'Warnings', tone: 'amber', mark: 'line' },
		{ id: 'suggestion', label: 'Suggestions', tone: 'sky', mark: 'line' }
	];
	const toneOf = (level: string) => categories.find((c) => c.id === level)?.tone ?? 'sky';

	let text = $state('');
	let picked = $state<GuideId>('Google');
	/** The rule open in the detail panel: "Google.Latin". */
	let selected = $state<string | null>(null);
	/** Show only the selected rule's highlights in the text. */
	let solo = $state(false);
	let editor = $state<ReturnType<typeof Editor>>();
	const input = settled(() => text);

	const guide = $derived(guides.find((g) => g.id === picked)!);
	const map = $derived(data.guides[picked]);
	const rule = $derived(map.rules.find((r) => r.id === selected) ?? null);

	/** The guide's rules by topic, leaving out topics it says nothing on. */
	const groups = $derived(
		topics
			.map((t) => ({ ...t, rules: map.rules.filter((r) => r.topic === t.id) }))
			.filter((t) => t.rules.length)
	);

	function pick(id: GuideId) {
		picked = id;
		selected = null;
		solo = false;
	}

	/*
		Each guide's patterns are a separate download, fetched when it is first
		picked and kept after that. The map doesn't wait for them: it is drawn
		from the summaries already in the page.
	*/
	const loaded = new Map<GuideId, Detector>();
	let ready = $state<GuideId | null>(null);
	let failed = $state(false);

	$effect(() => {
		const id = picked;
		failed = false;
		if (loaded.has(id)) {
			ready = id;
			return;
		}
		guides
			.find((g) => g.id === id)!
			.load()
			.then((m) => {
				loaded.set(id, createDetector({ rules: m.default.rules as unknown as RuleData[] }));
				if (picked === id) ready = id;
			})
			.catch(() => (failed = true));
	});

	const quote = (message: string) => message.replace(/'([^']+)'/g, '“$1”');
	const likeCase = (model: string, word: string) =>
		/^\p{Lu}/u.test(model) && /^\p{Ll}/u.test(word) ? word[0].toUpperCase() + word.slice(1) : word;

	const findings = $derived.by(() => {
		const detector = ready === picked ? loaded.get(picked) : undefined;
		return detector ? detector.scan(input.value) : [];
	});

	const summaryOf = $derived(new Map(map.rules.map((r) => [r.id, r])));

	const highlights = $derived<Highlight[]>(
		findings
			.filter((f) => !solo || !selected || f.rule === selected)
			.map((f) => {
				const info = summaryOf.get(f.rule);
				const to = f.replacement ? likeCase(f.match, f.replacement) : '';
				return {
					from: f.from,
					to: f.to,
					category: info?.level ?? 'suggestion',
					message: quote(f.message),
					source: f.rule,
					href: info?.link || undefined,
					mark: f.block ? 'fill' : 'line',
					fix: to ? { label: `Use “${to}”`, replacement: to } : undefined
				};
			})
	);

	/** How many times each rule fired, which is what lights the map. */
	const hits = $derived.by(() => {
		const out: Record<string, number> = {};
		for (const f of findings) out[f.rule] = (out[f.rule] ?? 0) + 1;
		return out;
	});
	const fired = $derived(Object.keys(hits).length);
	const empty = $derived(!input.value.trim());
	const checking = $derived(!empty && ready === picked);

	function open(r: RuleSummary) {
		if (selected === r.id) {
			selected = null;
			solo = false;
			return;
		}
		selected = r.id;
		solo = false;
	}

	/** Jumps to the selected rule's next finding, showing only that rule's. */
	async function next() {
		if (!selected) return;
		solo = true;
		// Let the editor redraw with only this rule's marks before moving.
		await Promise.resolve();
		requestAnimationFrame(() => editor?.jump(rule?.level ?? 'suggestion'));
	}

	/*
		The three guides, topic by topic: how many rules each has there. Drawn
		under the tool as a small chart of where each guide puts its attention.
	*/
	const coverage = $derived(
		topics.map((t) => ({
			...t,
			counts: guides.map((g) => data.guides[g.id].rules.filter((r) => r.topic === t.id).length)
		}))
	);
	const most = $derived(Math.max(...coverage.flatMap((c) => c.counts)));

	const faq = [
		{
			q: 'What does the style guide checker check?',
			a: 'It checks your text against the published rules of the guide you pick: word choice and banned terms, contractions, Latin abbreviations, punctuation such as dashes, ellipses, and exclamation points, date and time formats, sentence length, first person, and heading capitalization. Each issue is highlighted in your text and lit up on a map of the guide, with the rule’s name and a link to the section it comes from.'
		},
		{
			q: 'Can I browse a style guide without pasting anything?',
			a: 'Yes. The map beside the editor shows every rule in the guide, grouped by topic: word choice, punctuation, headings, numbers and dates, and so on. Select a rule to see what it flags, the replacement it suggests, and a link to the guide’s own explanation. Switch guides to see how each one covers the same topic.'
		},
		{
			q: 'Which style guides can I check against?',
			a: 'The Google developer documentation style guide, the Microsoft Writing Style Guide, and the Red Hat supplementary style guide. These are the three with complete, openly maintained rule sets. To browse them alongside thirteen other open guides, use the style guide explorer.'
		},
		{
			q: 'Is this an AP style checker or a Chicago style checker?',
			a: 'Not yet. AP and Chicago are sold by subscription and have no open rule sets, so they can’t be checked here. Many of their rules overlap with the guides that are covered, though: the Oxford comma, spacing around dashes, date formats, and plain word choice are checked by all three.'
		},
		{
			q: 'How is this different from a grammar checker?',
			a: 'A grammar checker looks for mistakes: misspellings, agreement errors, missing words. A style guide checker looks for choices that are correct English but go against a particular guide, such as “e.g.” where Google wants “for example,” or “click” where Microsoft wants “select.” It doesn’t check spelling or grammar.'
		},
		{
			q: 'How are headings checked?',
			a: 'All three guides ask for sentence-case headings. If your text is Markdown, lines that start with # are treated as headings and checked for capitalization and end punctuation. Plain pasted text has no heading markers, so those rules don’t run on it.'
		},
		{
			q: 'Is my text uploaded?',
			a: 'No. The rules are downloaded to your browser and run there. Your text is never sent to a server, which matters if the draft is unpublished documentation.'
		},
		{
			q: 'Can I run these checks automatically on all my docs?',
			a: 'Yes. The rules come from Vale, an open-source command-line tool that runs the same style guides in your editor and on every pull request. Vale also runs the handful of rules a browser can’t, and lets you add your own house rules on top.'
		}
	];
</script>

<ToolPage
	tool={page}
	wide
	lede="Paste your text to see it against the Google, Microsoft, or Red Hat style guide. Each guide is drawn as a map of its rules, which light up where your draft goes against them."
	{faq}
>
	<div class="mb-4 flex flex-wrap items-center gap-2">
		<div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Style guide">
			{#each guides as g (g.id)}
				<button
					type="button"
					role="radio"
					aria-checked={picked === g.id}
					onclick={() => pick(g.id)}
					title={g.full}
					class="rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring {picked ===
					g.id
						? 'border-lime-500/60 bg-lime-500/15 font-medium text-foreground'
						: 'border-border bg-card text-muted-foreground hover:text-foreground'}"
				>
					{g.name}
					<span class="ml-1 text-xs tabular-nums text-muted-foreground"
						>{data.guides[g.id].rules.length}</span
					>
				</button>
			{/each}
		</div>
		<p class="ml-auto text-sm text-muted-foreground" aria-live="polite">
			{#if failed}
				The rules didn’t load. Reload the page to try again.
			{:else if empty}
				{map.rules.length} rules in {groups.length} topics
			{:else if !checking}
				Loading rules…
			{:else if findings.length === 0}
				<span class="font-medium text-lime-700 dark:text-lime-400">Nothing against the guide</span>
			{:else}
				<span class="font-medium text-foreground"
					>{findings.length} issue{findings.length === 1 ? '' : 's'}</span
				>
				from {fired} of {map.rules.length} rules
			{/if}
		</p>
	</div>

	<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)]">
		<div class="min-w-0">
			<Editor
				bind:this={editor}
				bind:value={text}
				{highlights}
				{categories}
				sample={SAMPLE}
				minHeight="34rem"
				placeholder="Paste your documentation, README, or article here…"
				onpick={(h) => {
					if (h?.source) selected = h.source;
				}}
			/>
			{#if solo && rule}
				<p class="mt-3 flex items-center gap-2 px-1 text-sm text-muted-foreground">
					Showing only <span class="font-medium text-foreground">{rule.title}</span>.
					<button
						type="button"
						class="underline underline-offset-2 hover:text-foreground"
						onclick={() => (solo = false)}>Show all rules</button
					>
				</p>
			{/if}
		</div>

		<!-- The guide, as a map. -->
		<aside
			class="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto lg:pr-1"
		>
			{#if rule}
				<section
					class="vt-{toneOf(rule.level)} mb-4 rounded-2xl border bg-card p-4 shadow-sm"
					style="border-color: hsl(var(--vt) / 0.45)"
					aria-label="Rule"
				>
					<div class="flex items-start justify-between gap-3">
						<div class="min-w-0">
							<div
								class="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em]"
								style="color: hsl(var(--vt))"
							>
								<span class="h-2 w-2 rounded-full" style="background: hsl(var(--vt))"></span>
								{rule.level}
							</div>
							<h2 class="mt-1 text-lg font-medium leading-tight">{rule.title}</h2>
							<p class="font-mono text-xs text-muted-foreground">{rule.id}</p>
						</div>
						<button
							type="button"
							class="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
							aria-label="Close"
							onclick={() => {
								selected = null;
								solo = false;
							}}
						>
							<X class="h-4 w-4" aria-hidden="true" />
						</button>
					</div>

					<p class="mt-3 text-sm leading-6 text-foreground/90">{quote(rule.message)}</p>
					<p class="mt-1 text-xs text-muted-foreground">{rule.kind}.</p>

					{#if rule.examples.length}
						<ul class="mt-3 flex flex-wrap gap-1.5">
							{#each rule.examples as ex (ex.find)}
								<li
									class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm"
									style="background: hsl(var(--vt) / 0.12)"
								>
									<span class={ex.use ? 'text-foreground/70 line-through decoration-1' : ''}
										>{ex.find}</span
									>
									{#if ex.use}
										<ArrowRight class="h-3 w-3 text-muted-foreground" aria-hidden="true" />
										<span class="font-medium">{ex.use}</span>
									{/if}
								</li>
							{/each}
							{#if rule.size > rule.examples.length}
								<li class="px-1 py-1 text-xs text-muted-foreground">
									+{rule.size - rule.examples.length} more
								</li>
							{/if}
						</ul>
					{/if}

					<div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
						{#if hits[rule.id]}
							<button
								type="button"
								onclick={next}
								class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:brightness-105"
							>
								{hits[rule.id]} in your text
								<ArrowRight class="h-3.5 w-3.5" aria-hidden="true" />
							</button>
						{:else if checking}
							<span class="text-xs text-lime-700 dark:text-lime-400">Not in your text</span>
						{/if}
						{#if rule.link}
							<a
								href={rule.link}
								target="_blank"
								rel="noreferrer"
								class="inline-flex items-center gap-1 text-xs font-medium underline underline-offset-2 hover:text-foreground"
							>
								Read it in the guide
								<ArrowUpRight class="h-3 w-3" aria-hidden="true" />
							</a>
						{/if}
					</div>
				</section>
			{/if}

			<div class="space-y-4">
				{#each groups as t (t.id)}
					{@const n = t.rules.reduce((sum, r) => sum + (hits[r.id] ?? 0), 0)}
					<section>
						<div class="flex items-baseline justify-between gap-3 px-1">
							<h2 class="text-sm font-medium">{t.label}</h2>
							<span class="truncate text-xs text-muted-foreground">
								{#if checking && n}
									<span class="font-medium tabular-nums text-foreground">{n}</span> found
								{:else}
									{t.blurb}
								{/if}
							</span>
						</div>
						<ul class="mt-2 flex flex-wrap gap-1.5">
							{#each t.rules as r (r.id)}
								{@const count = hits[r.id] ?? 0}
								{@const on = selected === r.id}
								<li>
									<button
										type="button"
										onclick={() => open(r)}
										aria-pressed={on}
										title={quote(r.message)}
										class="vt-{toneOf(
											r.level
										)} inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring {checking &&
										!count
											? 'opacity-55 hover:opacity-100'
											: ''}"
										style="border-color: hsl(var(--vt) / {on
											? 0.9
											: count
												? 0.5
												: 0.22}); background: hsl(var(--vt) / {on
											? 0.24
											: count
												? 0.14
												: 0.04}); {on ? 'box-shadow: 0 0 0 2px hsl(var(--vt) / 0.25)' : ''}"
									>
										<span
											class="h-1.5 w-1.5 shrink-0 rounded-full"
											style="background: hsl(var(--vt))"
										></span>
										{r.title}
										{#if count}
											<span
												class="rounded-full px-1.5 text-[11px] font-semibold tabular-nums leading-4 text-white"
												style="background: hsl(var(--vt))">{count}</span
											>
										{/if}
									</button>
								</li>
							{/each}
						</ul>
					</section>
				{/each}
			</div>

			<ul
				class="mt-5 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground"
			>
				{#each categories as c (c.id)}
					<li class="vt-{c.tone} inline-flex items-center gap-1.5">
						<span class="h-2 w-2 rounded-full" style="background: hsl(var(--vt))"></span>
						{c.label}
					</li>
				{/each}
			</ul>
		</aside>
	</div>

	{#snippet about()}
		<h2>How to explore a style guide</h2>
		<p>
			A style guide is hundreds of small decisions, and reading one front to back is the slow way to
			learn it. The map beside the editor shows the whole guide at once: every rule, grouped by
			topic and colored by how firmly the guide states it.
		</p>
		<ul>
			<li>
				<strong>Select a rule</strong> to see what it flags, what it suggests, and a link to the guide’s
				own explanation.
			</li>
			<li>
				<strong>Paste your text</strong> and the rules it breaks light up with a count. The rest fade,
				so you can see at a glance which parts of the guide your draft is missing.
			</li>
			<li>
				<strong>Switch guides</strong> to see the same draft against another one. A sentence that is
				fine for Google may break three Red Hat rules.
			</li>
			<li>
				<strong>Click a highlight</strong> in your text to open its rule, and use the button on the card
				to apply the fix when the rule has one.
			</li>
		</ul>

		<h2>Where each guide puts its attention</h2>
		<p>
			The number of rules each guide has on a topic. More rules doesn’t mean stricter, since one
			rule can carry hundreds of terms, but it shows what a guide cares enough about to spell out.
		</p>
		<div class="mt-6 overflow-x-auto rounded-xl border border-border bg-card p-4">
			<table class="w-full min-w-[30rem] border-separate border-spacing-y-1.5 text-sm">
				<thead class="text-left text-xs text-muted-foreground">
					<tr>
						<th scope="col" class="w-[30%] font-medium">Topic</th>
						{#each guides as g (g.id)}
							<th scope="col" class="font-medium">{g.name}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each coverage as c (c.id)}
						<tr>
							<th scope="row" class="pr-3 text-left font-normal">{c.label}</th>
							{#each c.counts as n, i (i)}
								<td class="pr-4">
									<div class="flex items-center gap-2">
										<div class="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
											<div
												class="h-full rounded-full bg-lime-500"
												style="width: {(n / most) * 100}%"
											></div>
										</div>
										<span class="w-5 text-right text-xs tabular-nums text-muted-foreground"
											>{n || '–'}</span
										>
									</div>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<h2>The guides</h2>
		{#each guides as g (g.id)}
			{@const d = data.guides[g.id]}
			<h3>{g.full}</h3>
			<p>
				{d.rules.length} rules checked.
				{#if d.skipped.length}
					{d.skipped.length} more need a spelling dictionary or a grammar tagger that a browser doesn’t
					have, and run only in Vale:
					<span class="font-mono text-sm">{d.skipped.join(', ')}</span>.
				{/if}
				<a href="/explorer/{g.id}">See every rule</a> or
				<a href={g.href} target="_blank" rel="noreferrer">read the guide</a>.
			</p>
		{/each}
		<p>
			To browse these and thirteen other open style guides without pasting anything, see the
			<a href="/guides">style guide explorer</a>.
		</p>

		<h2>What it can’t tell you</h2>
		<p>
			The rules match patterns in the text. They don’t understand it. A rule that flags “will” can’t
			know that your sentence really is about the future, and the passive-voice rules in these
			guides say “looks like” for a reason. Warnings and suggestions are prompts to look, and the
			guides themselves allow exceptions.
		</p>

		<Formats verb="Check" />

		<h2>Check every page, on every change</h2>
		<p>
			This page checks one draft at a time. <a href="/">Vale</a> runs the same rules across a whole
			documentation set, in your editor as you write and in CI before a change merges, so a style
			guide is something the tooling enforces and not something reviewers have to remember. The
			<a href="/generator">config generator</a> sets up any of these guides in a minute.
		</p>
	{/snippet}
</ToolPage>
