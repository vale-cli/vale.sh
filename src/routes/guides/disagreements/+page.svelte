<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';

	let { data } = $props();

	const pairs = $derived(data.opposed.reduce((n, s) => n + s.pairs.length, 0));
	const title = 'Where Style Guides Disagree';
	const description = $derived(
		`${pairs} word pairs that open style guides prefer in opposite directions, and ${data.differ.length} terms they replace with different words. Read out of the rules each guide publishes.`
	);
	const url = 'https://vale.sh/guides/disagreements';
	const names = (ids: string[]) => ids.map((g) => data.names[g]).join(', ');
</script>

<MetaTags
	{title}
	{description}
	canonical={url}
	openGraph={{ url, title, description, type: 'article' }}
	twitter={{ cardType: 'summary_large_image' }}
/>

<article class="mx-auto max-w-6xl px-6 pb-20 pt-8 lg:px-8">
	<nav aria-label="Breadcrumb" class="flex items-center gap-1.5 text-sm text-muted-foreground">
		<a href="/guides" class="transition-colors hover:text-foreground">Style guides</a>
		<ChevronRight class="h-3.5 w-3.5" aria-hidden="true" />
		<span class="text-foreground">Disagreements</span>
	</nav>

	<header class="mt-6 max-w-3xl">
		<h1 class="text-balance text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
			Where the style guides disagree
		</h1>
		<p class="mt-5 text-pretty text-lg leading-8 text-foreground/85">
			A style guide is a set of choices, and {data.total} guides do not all make the same ones. These
			are the places their published rules pull apart: {pairs} word pairs preferred in opposite directions,
			and {data.differ.length} terms that different guides replace with different words.
		</p>
		<p class="mt-4 leading-7 text-foreground/85">
			None of this makes a guide wrong. It is the case for picking one and holding to it.
		</p>
	</header>

	<section class="mt-14" aria-labelledby="opposed">
		<h2 id="opposed" class="text-2xl font-medium tracking-tight">Opposite advice</h2>
		<p class="mt-3 max-w-3xl leading-7 text-foreground/85">
			One guide’s fix is another guide’s error: the same two wordings, each flagged by one side and
			asked for by the other. Grouped by which guides are on each side.
		</p>
		<ul class="mt-6 grid gap-4 lg:grid-cols-2">
			{#each data.opposed as split, i (i)}
				<li class="rounded-2xl border border-border bg-card p-5 text-sm">
					<dl class="grid gap-3 sm:grid-cols-2">
						<div>
							<dt class="text-xs text-muted-foreground">Write “{split.pairs[0].b}”</dt>
							<dd class="mt-0.5 font-medium">{names(split.prefer)}</dd>
						</div>
						<div>
							<dt class="text-xs text-muted-foreground">Write “{split.pairs[0].a}”</dt>
							<dd class="mt-0.5 font-medium">{names(split.avoid)}</dd>
						</div>
					</dl>
					<ul class="mt-4 flex flex-wrap gap-1.5 border-t border-border/70 pt-4">
						{#each split.pairs as p (p.a + p.b)}
							<li>
								{#if p.slug}
									<a
										href="/guides/term/{p.slug}"
										class="inline-block rounded-md bg-muted px-2 py-0.5 transition-colors hover:bg-lime-500/15"
									>
										{p.a} <span class="text-muted-foreground">or</span>
										{p.b}
									</a>
								{:else}
									<span class="inline-block rounded-md bg-muted px-2 py-0.5">
										{p.a} <span class="text-muted-foreground">or</span>
										{p.b}
									</span>
								{/if}
							</li>
						{/each}
					</ul>
				</li>
			{/each}
		</ul>
	</section>

	<section class="mt-16" aria-labelledby="differ">
		<h2 id="differ" class="text-2xl font-medium tracking-tight">Same term, different fix</h2>
		<p class="mt-3 max-w-3xl leading-7 text-foreground/85">
			The guides agree the term is a problem and part ways on what to write instead. Select a term
			for each guide’s rule.
		</p>
		<div class="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
			<table class="w-full text-left text-sm">
				<thead class="border-b border-border text-xs text-muted-foreground">
					<tr>
						<th scope="col" class="px-4 py-2.5 font-medium">Term</th>
						<th scope="col" class="px-4 py-2.5 font-medium">What each side writes instead</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each data.differ as t (t.slug)}
						<tr class="align-baseline">
							<th scope="row" class="whitespace-nowrap px-4 py-3 font-medium">
								<a href="/guides/term/{t.slug}" class="hover:underline">{t.term}</a>
							</th>
							<td class="px-4 py-3">
								<ul class="space-y-1">
									{#each t.answers as a (a.use)}
										<li>
											<span class="font-medium">{a.use}</span>
											<span class="text-muted-foreground">· {a.guides.join(', ')}</span>
										</li>
									{/each}
								</ul>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section class="mt-16 max-w-3xl">
		<h2 class="text-2xl font-medium tracking-tight">How this is read</h2>
		<p class="mt-4 leading-7 text-foreground/85">
			Each organization here publishes its guide as rules for
			<a
				href="/"
				class="font-medium text-foreground underline decoration-lime-500 decoration-2 underline-offset-4"
				>Vale</a
			>, an open-source linter for prose. A disagreement on this page is two of those rules that
			can’t both be followed. Advice a guide gives in prose, with no rule behind it, isn’t counted.
			Browse <a href="/guides/terms" class="underline">every term</a> or go back to the
			<a href="/guides" class="underline">explorer</a>.
		</p>
	</section>
</article>
