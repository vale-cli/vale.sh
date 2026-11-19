<script lang="ts">
	import ToolPage from '$lib/components/tools/ToolPage.svelte';
	import { tool } from '$lib/tools';
	import {
		agreement,
		categories,
		guides,
		topics,
		type GuideId,
		type Position,
		type Stance
	} from '$lib/tools/guides';

	let { data } = $props();

	const page = tool('style-guide-comparison');

	let picked = $state<GuideId[]>(guides.map((g) => g.id));
	let category = $state<string>('All');
	let onlyDiffer = $state(false);
	let query = $state('');

	const shown = $derived(guides.filter((g) => picked.includes(g.id)));

	function toggle(id: GuideId) {
		if (picked.includes(id)) {
			if (picked.length > 2) picked = picked.filter((p) => p !== id);
		} else {
			picked = guides.map((g) => g.id).filter((g) => g === id || picked.includes(g));
		}
	}

	/** Whether the guides on screen give more than one answer to a topic. */
	const differs = (positions: Partial<Record<GuideId, Position>>) =>
		new Set(shown.map((g) => positions[g.id]?.stance).filter(Boolean)).size > 1;

	const rows = $derived(
		topics.filter((t) => {
			if (category !== 'All' && t.category !== category) return false;
			if (onlyDiffer && !differs(t.positions)) return false;
			const q = query.trim().toLowerCase();
			if (!q) return true;
			return (
				t.question.toLowerCase().includes(q) ||
				t.example.yes.toLowerCase().includes(q) ||
				t.example.no.toLowerCase().includes(q) ||
				Object.values(t.positions).some((p) => p?.says.toLowerCase().includes(q))
			);
		})
	);

	const split = $derived(topics.filter((t) => differs(t.positions)).length);

	// With exactly two guides picked, say how often they agree.
	const pair = $derived(
		shown.length === 2 ? { ...agreement(shown[0].id, shown[1].id), a: shown[0], b: shown[1] } : null
	);

	const label: Record<Stance, string> = { yes: 'Yes', no: 'No', varies: 'Depends' };
	const tone: Record<Stance, string> = {
		yes: 'bg-lime-500/15 text-lime-800 dark:text-lime-300',
		no: 'bg-red-500/10 text-red-800 dark:text-red-300',
		varies: 'bg-amber-400/20 text-amber-800 dark:text-amber-300'
	};

	const href = (p: Position) => (p.rule && data.links[p.rule]) || p.href;

	const faq = [
		{
			q: 'Which style guide should I use?',
			a: 'Match the guide to what you publish. For software documentation, use the Google developer documentation style guide or the Microsoft Writing Style Guide: both are free, online, and written for technical content. For news and marketing copy, use AP. For books and long-form writing, use Chicago. Then keep a short house style for the places where your team differs.'
		},
		{
			q: 'What is the difference between the Google and Microsoft style guides?',
			a: `They agree on most things: sentence-case headings, the Oxford comma, contractions, second person, and active voice. Of the ${agreement('google', 'microsoft').shared} rules compared here that both guides cover, they give the same answer on ${agreement('google', 'microsoft').same}. The best-known difference is in interface instructions: Microsoft says “select” for every input device, while Google says “click” for a mouse and “tap” for a touchscreen.`
		},
		{
			q: 'What is the difference between AP style and Chicago style?',
			a: 'AP is written for news: it is compact, skips the Oxford comma, puts spaces around em dashes, abbreviates months in dates, and spells out only one through nine. Chicago is written for books: it uses the Oxford comma, closes up em dashes, spells out months, and spells out numbers through one hundred.'
		},
		{
			q: 'Which style guides use the Oxford comma?',
			a: 'Google, Microsoft, Red Hat, and Chicago all require or strongly recommend the Oxford comma. AP is the exception: it leaves the comma out of a simple series and adds it only when a sentence would be unclear without it.'
		},
		{
			q: 'Do style guides use title case or sentence case for headings?',
			a: 'Google, Microsoft, and Red Hat use sentence case for every heading. AP uses sentence case for news headlines. Chicago uses title case, which it calls headline style.'
		},
		{
			q: 'How do I enforce a style guide across a team?',
			a: 'Write the rules down as checks a tool can run. Vale is an open-source linter with ready-made packages for the Google, Microsoft, and Red Hat guides; it flags violations in your editor and on every pull request, so the guide is applied the same way to every page without a person having to remember it.'
		}
	];
</script>

<ToolPage
	tool={page}
	wide
	lede="See where the Google, Microsoft, Red Hat, AP, and Chicago style guides agree and where they split, on {topics.length} of the questions writers argue about most."
	{faq}
>
	<div class="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
		<div class="flex flex-wrap items-center gap-2">
			<span class="mr-1 text-sm font-medium">Compare</span>
			{#each guides as g (g.id)}
				{@const on = picked.includes(g.id)}
				<button
					type="button"
					onclick={() => toggle(g.id)}
					aria-pressed={on}
					title={g.full}
					class="rounded-full border px-3 py-1 text-sm transition-colors {on
						? 'border-lime-500/50 bg-lime-500/15 font-medium text-foreground'
						: 'border-border text-muted-foreground hover:text-foreground'}"
				>
					{g.name}
				</button>
			{/each}
		</div>

		<div class="flex flex-wrap items-center gap-x-4 gap-y-3">
			<div class="flex flex-wrap gap-1.5" role="group" aria-label="Category">
				{#each ['All', ...categories] as c (c)}
					<button
						type="button"
						onclick={() => (category = c)}
						aria-pressed={category === c}
						class="rounded-md px-2.5 py-1 text-sm transition-colors {category === c
							? 'bg-muted font-medium text-foreground'
							: 'text-muted-foreground hover:text-foreground'}"
					>
						{c}
					</button>
				{/each}
			</div>
			<label class="flex items-center gap-2 text-sm text-foreground/85">
				<input
					type="checkbox"
					bind:checked={onlyDiffer}
					class="rounded border-border text-lime-600 focus:ring-lime-500"
				/>
				Only where they disagree
			</label>
			<input
				type="search"
				bind:value={query}
				placeholder="Search rules…"
				aria-label="Search rules"
				class="ml-auto w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground/70 focus:border-lime-500/60 focus:outline-none focus:ring-2 focus:ring-lime-500/30 sm:w-56"
			/>
		</div>
	</div>

	<p class="mt-4 text-sm text-foreground/85" aria-live="polite">
		{#if pair}
			{pair.a.name} and {pair.b.name} both rule on {pair.shared} of these questions and give the same
			answer on <strong class="font-medium">{pair.same}</strong>.
		{:else}
			The guides you picked split on <strong class="font-medium">{split}</strong> of {topics.length}
			questions.
		{/if}
		Showing {rows.length}.
	</p>

	<div class="mt-4 overflow-x-auto rounded-xl border border-border bg-card">
		<table class="w-full min-w-[52rem] table-fixed border-collapse text-left text-sm">
			<thead class="border-b border-border bg-muted/40 text-xs">
				<tr>
					<th scope="col" class="w-[24%] px-4 py-3 font-medium">Question</th>
					{#each shown as g (g.id)}
						<th scope="col" class="px-3 py-3 align-bottom font-medium">
							<a href={g.href} target="_blank" rel="noreferrer" class="hover:underline">{g.name}</a>
							<div class="font-normal text-muted-foreground">{g.audience}</div>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody class="divide-y divide-border">
				{#each rows as t (t.id)}
					<tr id={t.id} class="scroll-mt-24 align-top">
						<th scope="row" class="px-4 py-4 font-normal">
							<div class="font-medium text-foreground">{t.question}</div>
							<div class="mt-2 space-y-0.5 text-xs text-muted-foreground">
								<div>
									<span class="font-medium text-lime-700 dark:text-lime-400">Yes:</span>
									{t.example.yes}
								</div>
								<div>
									<span class="font-medium text-red-700 dark:text-red-400">No:</span>
									{t.example.no}
								</div>
							</div>
						</th>
						{#each shown as g (g.id)}
							{@const p = t.positions[g.id]}
							<td class="px-3 py-4">
								{#if p}
									<span
										class="inline-block rounded px-1.5 py-0.5 text-xs font-medium {tone[p.stance]}"
									>
										{label[p.stance]}
									</span>
									<p class="mt-1.5 leading-5 text-foreground/85">{p.says}</p>
									<div class="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs">
										{#if href(p)}
											<a
												href={href(p)}
												target="_blank"
												rel="noreferrer"
												class="text-muted-foreground underline underline-offset-2 hover:text-foreground"
												>Source</a
											>
										{/if}
										{#if p.rule}
											<a
												href="/explorer/{p.rule.split('.')[0]}"
												class="break-all font-mono text-muted-foreground underline underline-offset-2 hover:text-foreground"
												title="The Vale rule that checks this">{p.rule}</a
											>
										{/if}
									</div>
								{:else}
									<span class="text-xs text-muted-foreground/70">No stated rule</span>
								{/if}
							</td>
						{/each}
					</tr>
				{:else}
					<tr>
						<td colspan={shown.length + 1} class="px-4 py-10 text-center text-muted-foreground">
							No questions match. Clear the search or the filters.
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#snippet about()}
		<h2>The five style guides compared</h2>
		{#each guides as g (g.id)}
			<h3>{g.full}</h3>
			<p>
				{#if g.id === 'google'}
					Google’s guide for its developer documentation, free to read online. It is direct and
					conversational: second person, present tense, contractions, sentence-case headings. Widely
					adopted outside Google by open-source projects and API documentation teams.
				{:else if g.id === 'microsoft'}
					The successor to the Microsoft Manual of Style, free online. It covers interface text and
					marketing as well as documentation, pushes for a warm, brief voice, and has the most
					thorough word list of any free guide.
				{:else if g.id === 'redhat'}
					Red Hat’s additions to the IBM Style guide, which its product documentation follows. More
					formal than Google or Microsoft: it avoids contractions and em dashes, with translation in
					mind.
				{:else if g.id === 'ap'}
					The standard for American journalism, and by extension for press releases and much
					marketing copy. Built for speed and tight columns, which is why it drops the Oxford comma
					and abbreviates months. Sold by subscription.
				{:else}
					The standard for American book publishing and much academic writing, now in its 18th
					edition. It is the most detailed guide here and the usual choice for long-form work. Sold
					by subscription.
				{/if}
				<a href={g.href} target="_blank" rel="noreferrer">Read the guide</a>.
			</p>
		{/each}

		<h2>How to read the comparison</h2>
		<p>
			Each row is a yes-or-no question with the same sentence written both ways. A guide’s answer is
			<strong>Yes</strong>, <strong>No</strong>, or <strong>Depends</strong>, with its position in a
			few words. “No stated rule” means the guide doesn’t address the question directly; that is
			common for AP and Chicago on interface wording, which they weren’t written for.
		</p>
		<p>
			Where a Google, Microsoft, or Red Hat cell names a rule such as
			<code class="font-mono text-sm">Google.OxfordComma</code>, that is the
			<a href="/explorer">Vale rule</a> that checks it, and “Source” goes to the section of the guide
			the rule enforces. AP and Chicago entries summarize the published rule. Style guides are revised
			often, so check the guide itself before settling an argument.
		</p>

		<h2>Check your own text against a guide</h2>
		<p>
			Once you know which guide you follow, paste a draft into the
			<a href="/tools/style-guide-checker">style guide checker</a> to see every place it goes against
			the Google, Microsoft, or Red Hat guide.
		</p>

		<h2>Pick one, then enforce it</h2>
		<p>
			Which guide you choose matters less than applying it everywhere. That is the part people are
			bad at and software is good at. <a href="/">Vale</a> has packages for the
			<a href="/explorer/Google">Google</a>, <a href="/explorer/Microsoft">Microsoft</a>, and
			<a href="/explorer/RedHat">Red Hat</a> guides, and the
			<a href="/generator">config generator</a> sets one up in a minute.
		</p>
	{/snippet}
</ToolPage>
