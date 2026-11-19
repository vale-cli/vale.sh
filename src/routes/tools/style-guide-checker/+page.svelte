<script lang="ts">
	import ToolPage from '$lib/components/tools/ToolPage.svelte';
	import Editor, { type Category, type Highlight } from '$lib/components/tools/Editor.svelte';
	import Legend from '$lib/components/tools/Legend.svelte';
	import Formats from '$lib/components/tools/Formats.svelte';
	import { tool } from '$lib/tools';
	import { settled } from '$lib/tools/settle.svelte';
	import { createDetector, type Detector, type RuleData } from '$lib/tools/aitells';

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

	/*
		The legend is the guide's own three severities. An error is something
		the guide states as a rule; a suggestion is a judgment call.
	*/
	const categories: Category[] = [
		{ id: 'error', label: 'Errors', tone: 'rose', mark: 'line', hint: 'The guide says don’t' },
		{ id: 'warning', label: 'Warnings', tone: 'amber', mark: 'line', hint: 'Usually worth fixing' },
		{ id: 'suggestion', label: 'Suggestions', tone: 'sky', mark: 'line', hint: 'Use your judgment' }
	];

	let text = $state('');
	let picked = $state<GuideId>('Google');
	let hidden = $state<string[]>([]);
	let editor = $state<ReturnType<typeof Editor>>();
	const input = settled(() => text);

	const guide = $derived(guides.find((g) => g.id === picked)!);
	const info = $derived(data.guides[picked]);

	/*
		Each guide's rules are a separate download, fetched when it is first
		picked and kept after that, so switching back is instant.
	*/
	const loaded = new Map<GuideId, { detector: Detector; rules: Map<string, RuleData> }>();
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
				const rules = m.default.rules as unknown as RuleData[];
				loaded.set(id, {
					detector: createDetector({ rules }),
					rules: new Map(rules.map((r) => [r.name, r]))
				});
				if (picked === id) ready = id;
			})
			.catch(() => (failed = true));
	});

	const quote = (message: string) => message.replace(/'([^']+)'/g, '“$1”');
	const likeCase = (model: string, word: string) =>
		/^\p{Lu}/u.test(model) && /^\p{Ll}/u.test(word) ? word[0].toUpperCase() + word.slice(1) : word;

	const findings = $derived.by(() => {
		const engine = ready === picked ? loaded.get(picked) : undefined;
		if (!engine) return [];
		return engine.detector
			.scan(input.value)
			.map((f) => ({ ...f, data: engine.rules.get(f.rule)! }));
	});

	const highlights = $derived<Highlight[]>(
		findings.map((f) => {
			const to = f.replacement ? likeCase(f.match, f.replacement) : '';
			return {
				from: f.from,
				to: f.to,
				category: f.data.level,
				message: quote(f.message),
				source: f.rule,
				href: f.data.link || undefined,
				mark: f.block ? 'fill' : 'line',
				fix: to ? { label: `Use “${to}”`, replacement: to } : undefined
			};
		})
	);

	const tally = $derived.by(() => {
		const out: Record<string, number> = {};
		for (const h of highlights) out[h.category] = (out[h.category] ?? 0) + 1;
		return out;
	});

	/** Which rules fired, most often first: what to learn, not only what to fix. */
	const byRule = $derived.by(() => {
		const map = new Map<string, { rule: string; link: string; level: string; count: number }>();
		for (const f of findings) {
			const hit = map.get(f.rule);
			if (hit) hit.count++;
			else
				map.set(f.rule, { rule: f.rule, link: f.data.link ?? '', level: f.data.level, count: 1 });
		}
		return [...map.values()].sort((a, b) => b.count - a.count);
	});

	const empty = $derived(!input.value.trim());
	const toneOf = (level: string) => categories.find((c) => c.id === level)?.tone ?? 'sky';

	const faq = [
		{
			q: 'What does the style guide checker check?',
			a: 'It checks your text against the published rules of the guide you pick: word choice and banned terms, contractions, Latin abbreviations, punctuation such as dashes, ellipses, and exclamation points, date and time formats, sentence length, first person, and heading capitalization. Each issue is highlighted with the rule’s name and a link to the section of the guide it comes from.'
		},
		{
			q: 'Which style guides can I check against?',
			a: 'The Google developer documentation style guide, the Microsoft Writing Style Guide, and the Red Hat supplementary style guide. These are the three with complete, openly maintained rule sets. To see how they differ from each other and from AP and Chicago, use the style guide comparison.'
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
	lede="Paste your text and pick a style guide. Every place the draft goes against the guide is highlighted, with the rule, a link to the guide, and a fix where there is one."
	{faq}
>
	<div class="mb-4 flex flex-wrap items-center gap-2">
		<span class="mr-1 text-sm font-medium">Check against</span>
		<div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Style guide">
			{#each guides as g (g.id)}
				<button
					type="button"
					role="radio"
					aria-checked={picked === g.id}
					onclick={() => (picked = g.id)}
					title={g.full}
					class="rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring {picked ===
					g.id
						? 'border-lime-500/60 bg-lime-500/15 font-medium text-foreground'
						: 'border-border bg-card text-muted-foreground hover:text-foreground'}"
				>
					{g.name}
				</button>
			{/each}
		</div>
		<span class="text-xs text-muted-foreground">{info.rules} rules</span>
	</div>

	<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
		<div class="min-w-0">
			<Editor
				bind:this={editor}
				bind:value={text}
				{highlights}
				{categories}
				{hidden}
				sample={SAMPLE}
				minHeight="30rem"
				placeholder="Paste your documentation, README, or article here…"
			/>
		</div>

		<aside class="space-y-5 lg:sticky lg:top-24 lg:self-start" aria-live="polite">
			<div class="rounded-2xl border border-border bg-card p-5 shadow-sm">
				<div class="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
					{guide.name} style
				</div>
				<div class="mt-2 flex items-baseline gap-2">
					<span
						class="text-5xl font-medium tabular-nums tracking-tight transition-colors {empty ||
						ready !== picked
							? 'text-muted-foreground/40'
							: findings.length === 0
								? 'text-lime-600 dark:text-lime-400'
								: (tally.error ?? 0) > 0
									? 'text-rose-600 dark:text-rose-400'
									: 'text-amber-600 dark:text-amber-400'}"
						>{empty || ready !== picked ? '–' : findings.length}</span
					>
					<span class="text-sm text-muted-foreground">
						issue{findings.length === 1 ? '' : 's'}
					</span>
				</div>
				<p class="mt-3 text-sm font-medium text-foreground">
					{#if failed}
						The rules didn’t load
					{:else if empty}
						Paste some text to check it
					{:else if ready !== picked}
						Loading {info.rules} rules…
					{:else if findings.length === 0}
						Nothing against the guide
					{:else}
						{byRule.length} rule{byRule.length === 1 ? '' : 's'} to look at
					{/if}
				</p>
				<p class="mt-0.5 text-xs leading-5 text-muted-foreground">
					{#if failed}
						Reload the page to try again.
					{:else}
						Checked against the
						<a
							href={guide.href}
							target="_blank"
							rel="noreferrer"
							class="underline underline-offset-2">{guide.full}</a
						>.
					{/if}
				</p>
			</div>

			<Legend
				{categories}
				counts={tally}
				bind:hidden
				onjump={(id) => editor?.jump(id)}
				title="By severity"
			/>

			{#if byRule.length}
				<section aria-label="Rules">
					<h2 class="px-1 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
						By rule
					</h2>
					<ul
						class="mt-2 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card"
					>
						{#each byRule as r (r.rule)}
							<li class="vt-{toneOf(r.level)} flex items-center gap-2.5 px-3 py-2 text-sm">
								<span class="h-2 w-2 shrink-0 rounded-full" style="background: hsl(var(--vt))"
								></span>
								{#if r.link}
									<a
										href={r.link}
										target="_blank"
										rel="noreferrer"
										class="min-w-0 flex-1 truncate font-mono text-xs hover:underline"
										title="Read this rule in the guide">{r.rule}</a
									>
								{:else}
									<span class="min-w-0 flex-1 truncate font-mono text-xs">{r.rule}</span>
								{/if}
								<span class="tabular-nums text-muted-foreground">{r.count}</span>
							</li>
						{/each}
					</ul>
				</section>
			{/if}
		</aside>
	</div>

	{#snippet about()}
		<h2>How the style guide checker works</h2>
		<p>
			A style guide is a long list of decisions: write “for example,” not “e.g.”; put no spaces
			around a dash; keep headings in sentence case. Nobody holds all of them in their head, which
			is why even careful teams drift. This checker reads your draft against the guide’s rules and
			shows each place it differs.
		</p>
		<p>
			Underlined words are word-level issues. A tinted sentence or heading is one that breaks a rule
			as a whole, such as a sentence over the guide’s length limit. Click a highlight to see the
			rule, follow the link to read the guide’s own explanation, and use the button to apply the fix
			when the rule has one.
		</p>

		<h2>The guides</h2>
		{#each guides as g (g.id)}
			{@const d = data.guides[g.id]}
			<h3>{g.full}</h3>
			<p>
				{d.rules} rules checked.
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
			Not sure which guide to follow? The
			<a href="/tools/style-guide-comparison">style guide comparison</a> shows where these three, AP,
			and Chicago agree and disagree.
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
