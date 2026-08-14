<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import { features } from '$lib/features';
	import Section from './Section.svelte';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import type { CarouselAPI } from '$lib/components/ui/carousel/context.js';
	import { extensionPoints } from '$lib/data/extension-points';
	import { markupFormats } from '$lib/data/markup-formats';
	import { codeLanguages } from '$lib/data/code-languages';
	import { highlightYaml, tokenClass } from '$lib/highlight-yaml';
	import BrandIcon from './BrandIcon.svelte';
	import FileText from 'lucide-svelte/icons/file-text';

	/*
		Four rows, alternating, one artifact each.

		This was a seven-tile bento grid where every tile carried its own hue and
		its own miniature mock. Three things were wrong with it. The tiles were
		of wildly unequal importance -- "Runs everywhere" is table stakes,
		"Markup-aware" is the argument -- and the grid gave them the same visual
		budget. The mocks were shrunk to fit a layout rather than sized to be
		read. And seven accent colours pulled against a page whose other sections
		hold to one.

		The rows below follow the two sections above them instead: large type,
		one honest artifact, generous space, lime and nothing else. Each row is
		the summary; /features/<slug> is the argument.

		Every code sample here is real Vale output or real Vale configuration.
		The rule names, levels and messages come from actual runs -- see the note
		on each one.
	*/
	const [markup, code, extensible, speed] = features;

	const MarkupIcon = markup.icon;
	const CodeIcon = code.icon;
	const ExtensibleIcon = extensible.icon;
	const SpeedIcon = speed.icon;

	const panel =
		'overflow-x-auto rounded-xl border border-border bg-card p-5 font-mono text-[13px] leading-relaxed shadow-sm sm:p-6';
	const eyebrow =
		'inline-flex items-center gap-2 text-sm font-medium text-lime-600 dark:text-lime-400';
	const heading = 'mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl';
	const lede = 'mt-3 text-pretty text-base leading-7 text-muted-foreground';
	const link =
		'group mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-lime-500/40 underline-offset-4 transition-colors hover:text-lime-600 dark:hover:text-lime-400';
	/* Row: copy and artifact side by side, the artifact swapping sides each
	   time. `lg:[&>*:first-child]:order-2` is avoided in favour of an explicit
	   order class so the DOM order stays copy-then-artifact for a screen
	   reader regardless of which side it renders on. */
	const row = 'grid items-center gap-8 lg:grid-cols-2 lg:gap-14';

	/*
		The Markdown sample below is a source view, so its syntax characters and
		its alerts each want one definition rather than a copy per line.

		`marker` carries the leading `# `, `> ` and `- ` as padding instead of a
		trailing space, which HTML collapses -- that collapse is why one line of
		the sample used to need `whitespace-pre` and the rest did not.
	*/
	const syntax = 'text-muted-foreground';
	const marker = 'pr-1 text-muted-foreground';
	const flagged = 'underline-offset-4 [text-decoration:underline_wavy]';
	const flagWarn = `${flagged} decoration-amber-500`;
	const flagError = `${flagged} decoration-red-500`;

	/*
		The extensible row's artifact is a carousel rather than one panel.

		A single example can only ever show one shape of rule, and whichever one
		it shows becomes what a visitor believes Vale is. The five slides are
		ordered as an escalation -- grammar, then a cross-file relationship, then
		memory, then arithmetic, then a program -- so the further you page, the
		less a pattern match could have done it.

		The severity levels come from the runs the data file describes, so a slide
		that says `warning` is the level Vale actually reported.
	*/
	let api = $state<CarouselAPI>();
	let selected = $state(0);

	/*
		Embla lays the slides out in a flex row, so the track is as tall as the
		tallest slide and every shorter one is padded out to match. The `script`
		rule is thirteen lines of Tengo and the `sequence` rule is seven, which
		left the first slide with a panel most of it empty.

		Measuring the active slide and setting the track's height fixes it: each
		panel is its own height, and the transition keeps the page from jumping
		as you page through. `slideNodes()` is embla's own handle on the DOM, so
		there is nothing to bind here.
	*/
	let trackHeight = $state<number | undefined>();
	type MarkupScope = 'heading' | 'paragraph' | 'blockquote' | 'list' | 'link' | 'code' | 'url';
	type CodeScope = 'line-comment' | 'doc-comment' | 'markdown' | 'string' | 'code';

	let activeMarkupScope = $state<MarkupScope | undefined>();
	let activeCodeScope = $state<CodeScope | undefined>();

	$effect(() => {
		if (!api) return;

		const current = api;

		const sync = () => {
			selected = current.selectedScrollSnap();
			trackHeight = current.slideNodes()[selected]?.scrollHeight;
		};

		sync();
		current.on('select', sync);
		current.on('reInit', sync);
		// Fires on viewport resize, when a panel reflows to a new line count.
		current.on('resize', sync);

		return () => {
			current.off('select', sync);
			current.off('reInit', sync);
			current.off('resize', sync);
		};
	});

	const sevColor: Record<string, string> = {
		error: 'text-red-600 dark:text-red-400',
		warning: 'text-amber-600 dark:text-amber-400',
		suggestion: 'text-sky-600 dark:text-sky-400'
	};

	/* The mark is a literal substring of the sample, so the split is exact. An
	   absent or unmatched mark leaves the line unmarked rather than throwing. */
	function splitOnMark(text: string, mark?: string): [string, string, string] {
		if (!mark) return [text, '', ''];

		const at = text.indexOf(mark);
		if (at === -1) return [text, '', ''];

		return [text.slice(0, at), mark, text.slice(at + mark.length)];
	}

	function scopeButton(scope: typeof activeMarkupScope, checked = true) {
		const active = activeMarkupScope === scope;
		const base =
			'rounded-md px-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2';

		if (active)
			return `${base} bg-lime-500 text-white shadow-sm dark:bg-lime-400 dark:text-zinc-950`;
		if (checked)
			return `${base} bg-lime-500/10 text-lime-700 hover:bg-lime-500/20 dark:text-lime-300`;
		return `${base} bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground`;
	}

	function scopeHighlight(scope: typeof activeMarkupScope, checked = true) {
		if (activeMarkupScope !== scope) return '';

		const color = checked
			? 'bg-lime-500/15 ring-lime-500/30'
			: 'bg-muted-foreground/10 ring-border';

		return `${color} rounded px-1 ring-1`;
	}

	function codeScopeButton(scope: CodeScope, checked = true) {
		const active = activeCodeScope === scope;
		const base =
			'rounded-md px-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2';

		if (active)
			return `${base} bg-lime-500 text-white shadow-sm dark:bg-lime-400 dark:text-zinc-950`;
		if (checked)
			return `${base} bg-lime-500/10 text-lime-700 hover:bg-lime-500/20 dark:text-lime-300`;
		return `${base} bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground`;
	}

	function codeScopeHighlight(scope: CodeScope, checked = true) {
		if (activeCodeScope !== scope) return '';

		const color = checked
			? 'bg-lime-500/15 ring-lime-500/30'
			: 'bg-muted-foreground/10 ring-border';

		return `${color} rounded px-1 ring-1`;
	}
</script>

<!--
	The format and language lists were comma runs inside their paragraphs -- a
	twelve-item one and a "more than twenty languages" claim -- which is the
	kind of sentence a reader's eye slides off. As marks they are countable at
	a glance, and the count is the argument.

	The name stays next to each mark on purpose. Half of these are not
	recognisable on sight -- Typst, Org, Quarto, Julia -- and four carry no mark
	at all, so a logo-only row would be a guessing game with holes in it. The
	extension is the tooltip, since that is what someone actually checks.
-->
{#snippet chips(items: { name: string; slug?: string; ext: string }[])}
	<ul class="mt-6 flex flex-wrap gap-1.5">
		{#each items as item (item.name)}
			<li
				title="{item.name} ({item.ext})"
				class="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card px-2 py-1 text-xs text-muted-foreground"
			>
				{#if item.slug}
					<BrandIcon name={item.name} slug={item.slug} size="h-3.5 w-3.5" class="opacity-70" />
				{:else}
					<FileText class="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden="true" />
				{/if}
				{item.name}
			</li>
		{/each}
	</ul>
{/snippet}

<Section
	id="features"
	eyebrow="Why Vale"
	title="Most tools see text. Vale sees a document."
	lede="A heading, a code block, a comment, and a link URL are not the same thing—and a rule that can't tell them apart is a rule you end up switching off."
	accent
>
	<div class="mx-auto max-w-5xl space-y-16 sm:space-y-20">
		<!-- Markup-aware -->
		<div class={row}>
			<div>
				<span class={eyebrow}><MarkupIcon class="h-4 w-4" /> {markup.title}</span>
				<h3 class={heading}>{markup.tagline}</h3>
				<p class={lede}>{markup.description}</p>

				{@render chips(markupFormats)}

				<a href="/features/{markup.slug}" class={link}>
					How scopes work
					<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
				</a>
			</div>

			<!--
				Verbatim from `vale Installation.md` with Vale + Microsoft. Note what
				is absent: the link and the code span raise nothing.
			-->
			<div class={panel}>
				<div
					class="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4"
				>
					<div>
						<div class="font-sans text-xs font-medium text-foreground">Installation.md</div>
						<div class="mt-1 font-mono text-[11px] text-muted-foreground">
							Markdown parsed before prose rules run
						</div>
					</div>

					<div class="flex flex-wrap gap-1.5 font-sans text-[11px]">
						<button
							type="button"
							class={scopeButton('heading')}
							aria-pressed={activeMarkupScope === 'heading'}
							onclick={() =>
								(activeMarkupScope = activeMarkupScope === 'heading' ? undefined : 'heading')}
							>heading</button
						>
						<button
							type="button"
							class={scopeButton('paragraph')}
							aria-pressed={activeMarkupScope === 'paragraph'}
							onclick={() =>
								(activeMarkupScope = activeMarkupScope === 'paragraph' ? undefined : 'paragraph')}
							>paragraph</button
						>
						<button
							type="button"
							class={scopeButton('blockquote')}
							aria-pressed={activeMarkupScope === 'blockquote'}
							onclick={() =>
								(activeMarkupScope = activeMarkupScope === 'blockquote' ? undefined : 'blockquote')}
							>blockquote</button
						>
						<button
							type="button"
							class={scopeButton('list')}
							aria-pressed={activeMarkupScope === 'list'}
							onclick={() =>
								(activeMarkupScope = activeMarkupScope === 'list' ? undefined : 'list')}
							>list</button
						>
						<button
							type="button"
							class={scopeButton('link', false)}
							aria-pressed={activeMarkupScope === 'link'}
							onclick={() =>
								(activeMarkupScope = activeMarkupScope === 'link' ? undefined : 'link')}
							>link ignored</button
						>
						<button
							type="button"
							class={scopeButton('code', false)}
							aria-pressed={activeMarkupScope === 'code'}
							onclick={() =>
								(activeMarkupScope = activeMarkupScope === 'code' ? undefined : 'code')}
							>code ignored</button
						>
						<button
							type="button"
							class={scopeButton('url', false)}
							aria-pressed={activeMarkupScope === 'url'}
							onclick={() => (activeMarkupScope = activeMarkupScope === 'url' ? undefined : 'url')}
							>footnote ignored</button
						>
					</div>
				</div>

				<div class="mt-4 space-y-3">
					<div class="rounded-lg bg-muted/40 p-3">
						<div class={scopeHighlight('heading')}>
							<span class={marker}>#</span><span class="text-foreground/90">Installation</span>
						</div>

						<div class="mt-2 text-foreground/90 {scopeHighlight('paragraph')}">
							You can <span class={syntax}>**</span><span class={flagWarn}>utilize</span><span
								class={syntax}>**</span
							>
							Vale to lint
							<span class="{syntax} {scopeHighlight('link', false)}">[</span><span
								class={scopeHighlight('link', false)}>prose</span
							><span class="{syntax} {scopeHighlight('link', false)}">](/docs)</span>—it ignores
							syntax like
							<span class="{syntax} {scopeHighlight('code', false)}">`code`</span> and URLs.
						</div>

						<div class="mt-2 text-foreground/90 {scopeHighlight('blockquote')}">
							<span class={marker}>&gt;</span>A blockquote can still contain
							<span class={flagWarn}>very unique</span> product guidance.
						</div>

						<div class="mt-2 text-foreground/90 {scopeHighlight('list')}">
							<span class={marker}>-</span>Install the extension before the
							<span class={flagWarn}>end result</span> ships.
						</div>

						<div class="mt-2 text-foreground/90 {scopeHighlight('paragraph')}">
							Vale is <span class={flagError}>availible</span> for macOS, Windows, and Linux.
						</div>

						<div
							class="mt-3 rounded-md bg-background/70 p-2 {syntax} {scopeHighlight('code', false)}"
						>
							<div>{'```js'}</div>
							<div>{'const message = "This code utilizes a URL";'}</div>
							<div>{'```'}</div>
						</div>

						<div class="mt-2 {syntax} {scopeHighlight('url', false)}">
							[^install]: https://example.com/docs/utilize
						</div>
					</div>

					<div class="grid grid-cols-2 gap-2 font-sans text-xs">
						<div class="rounded-lg border border-border bg-background/60 p-3">
							<div class="font-medium text-foreground">Checked</div>
							<div class="mt-1 text-muted-foreground">headings, prose, quotes, lists</div>
						</div>
						<div class="rounded-lg border border-border bg-background/60 p-3">
							<div class="font-medium text-foreground">Skipped</div>
							<div class="mt-1 text-muted-foreground">syntax, links, code, footnotes</div>
						</div>
					</div>
				</div>

				<div class="mt-4 space-y-1.5 border-t border-border/60 pt-4">
					<div class="flex flex-wrap gap-x-4 gap-y-1">
						<span class="w-20 shrink-0 text-muted-foreground">suggestion</span>
						<span class="text-foreground/80"
							>Consider replacing 'utilize', 'very unique', and 'end result'.</span
						>
					</div>
					<div class="flex flex-wrap gap-x-4 gap-y-1">
						<span class="w-20 shrink-0 text-red-600 dark:text-red-400">error</span>
						<span class="text-foreground/80">Did you really mean 'availible'?</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Code-aware -->
		<div class={row}>
			<div class="lg:order-2">
				<span class={eyebrow}><CodeIcon class="h-4 w-4" /> {code.title}</span>
				<h3 class={heading}>{code.tagline}</h3>
				<p class={lede}>{code.description}</p>

				{@render chips(codeLanguages)}

				<a href="/features/{code.slug}" class={link}>
					Inside the grammar
					<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
				</a>
			</div>

			<!--
				Adapted from the Rust book's `Person` example, which is also a
				fixture in Vale's own test suite.

				Rust earns the slot Go had: a `///` doc comment whose body is real
				Markdown, with a fenced block inside it. That block is Rust inside
				Markdown inside a comment inside Rust, and Vale skips it -- which is
				the whole claim, and a `//` comment could not make it.

				`utilizes` is not in Wordiness's token list, so an earlier version of
				this showed an alert that would never fire. The comment says
				`utilize`, which does.
			-->
			<div class="{panel} lg:order-1">
				<div
					class="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4"
				>
					<div>
						<div class="font-sans text-xs font-medium text-foreground">person.rs</div>
						<div class="mt-1 font-mono text-[11px] text-muted-foreground">
							comments extracted with tree-sitter
						</div>
					</div>

					<div class="flex flex-wrap gap-1.5 font-sans text-[11px]">
						<button
							type="button"
							class={codeScopeButton('line-comment')}
							aria-pressed={activeCodeScope === 'line-comment'}
							onclick={() =>
								(activeCodeScope = activeCodeScope === 'line-comment' ? undefined : 'line-comment')}
							>line comment</button
						>
						<button
							type="button"
							class={codeScopeButton('doc-comment')}
							aria-pressed={activeCodeScope === 'doc-comment'}
							onclick={() =>
								(activeCodeScope = activeCodeScope === 'doc-comment' ? undefined : 'doc-comment')}
							>doc comment</button
						>
						<button
							type="button"
							class={codeScopeButton('markdown')}
							aria-pressed={activeCodeScope === 'markdown'}
							onclick={() =>
								(activeCodeScope = activeCodeScope === 'markdown' ? undefined : 'markdown')}
							>markdown</button
						>
						<button
							type="button"
							class={codeScopeButton('string', false)}
							aria-pressed={activeCodeScope === 'string'}
							onclick={() =>
								(activeCodeScope = activeCodeScope === 'string' ? undefined : 'string')}
							>string ignored</button
						>
						<button
							type="button"
							class={codeScopeButton('code', false)}
							aria-pressed={activeCodeScope === 'code'}
							onclick={() => (activeCodeScope = activeCodeScope === 'code' ? undefined : 'code')}
							>code ignored</button
						>
					</div>
				</div>

				<div class="mt-4 space-y-3">
					<div class="overflow-x-auto rounded-lg bg-muted/40 p-3">
						<div class="whitespace-pre text-foreground/90 {codeScopeHighlight('doc-comment')}">
							<span class={syntax}>{'/// '}</span>Creates a person with the given name.
						</div>
						<div class="whitespace-pre {syntax} {codeScopeHighlight('doc-comment')}">{'///'}</div>
						<div class="whitespace-pre text-foreground/90 {codeScopeHighlight('doc-comment')}">
							<span class={syntax}>{'/// '}</span><span class={codeScopeHighlight('markdown')}
								>{'# Examples'}</span
							>
						</div>
						<div class="whitespace-pre {syntax} {codeScopeHighlight('doc-comment')}">{'///'}</div>

						<!-- Rust, inside Markdown, inside a doc comment, inside Rust. -->
						<div class="whitespace-pre {syntax} {codeScopeHighlight('markdown')}">
							{'/// '}{'```'}
						</div>
						<div class="whitespace-pre {syntax} {codeScopeHighlight('code', false)}">
							{'/// use doc::Person;'}
						</div>
						<div class="whitespace-pre {syntax} {codeScopeHighlight('code', false)}">
							{'/// let person = Person::new("name");'}
						</div>
						<div class="whitespace-pre {syntax} {codeScopeHighlight('markdown')}">
							{'/// '}{'```'}
						</div>

						<div class="whitespace-pre {syntax} {codeScopeHighlight('code', false)}">
							{'pub fn new(name: &str) -> Person {'}
						</div>
						<div class="whitespace-pre text-foreground/90 {codeScopeHighlight('line-comment')}">
							<span class={syntax}>{'    // '}</span><span>{'Names can '}</span><span
								class={flagWarn}>utilize</span
							><span>{' any script.'}</span>
						</div>
						<div class="whitespace-pre {syntax} {codeScopeHighlight('code', false)}">
							{'    let raw = '}<span class={codeScopeHighlight('string', false)}
								>{'"// not a comment and not prose"'}</span
							>{';'}
						</div>
						<div class="whitespace-pre {syntax} {codeScopeHighlight('code', false)}">{'}'}</div>
					</div>

					<div class="grid grid-cols-2 gap-2 font-sans text-xs">
						<div class="rounded-lg border border-border bg-background/60 p-3">
							<div class="font-medium text-foreground">Checked</div>
							<div class="mt-1 text-muted-foreground">
								line comments, doc comments, Markdown prose
							</div>
						</div>
						<div class="rounded-lg border border-border bg-background/60 p-3">
							<div class="font-medium text-foreground">Skipped</div>
							<div class="mt-1 text-muted-foreground">
								syntax, identifiers, strings, fenced code
							</div>
						</div>
					</div>
				</div>

				<div class="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-border/60 pt-4">
					<span class="w-20 shrink-0 text-muted-foreground">suggestion</span>
					<span class="text-foreground/80">Consider using 'use' instead of 'utilize'.</span>
				</div>
			</div>
		</div>

		<!-- Extensible -->
		<div class={row}>
			<div>
				<span class={eyebrow}><ExtensibleIcon class="h-4 w-4" /> {extensible.title}</span>
				<h3 class={heading}>{extensible.tagline}</h3>
				<p class={lede}>{extensible.description}</p>
				<a href="/features/{extensible.slug}" class={link}>
					All twelve extension points
					<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
				</a>
			</div>

			<!--
				This slot used to hold one `existence` rule with a two-word token
				list, which is the single shape of Vale rule a `grep -f` could stand
				in for -- the page's own strongest evidence for the "it's just regex"
				reading. Every slide here is something a pattern match cannot do.
			-->
			<div class="min-w-0">
				<Carousel.Root setApi={(e) => (api = e)} opts={{ align: 'start' }}>
					<Carousel.Content
						class="items-start transition-[height] duration-300 ease-out motion-reduce:transition-none"
						style={trackHeight ? `height: ${trackHeight}px` : undefined}
					>
						{#each extensionPoints as point (point.id)}
							<Carousel.Item>
								<div class="{panel} flex flex-col">
									<div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
										<span class="font-medium text-lime-600 dark:text-lime-400">{point.id}</span>
										<span class="font-sans text-xs text-muted-foreground">{point.claim}</span>
									</div>

									<pre class="mt-4 overflow-x-auto text-[13px] leading-relaxed"><code
											>{#each highlightYaml(point.yaml) as tokens, i (i)}{#if i > 0}{'\n'}{/if}{#each tokens as token, j (j)}<span
														class={tokenClass[token.t]}>{token.v}</span
													>{/each}{/each}</code
										></pre>

									<div class="mt-4 space-y-1.5 border-t border-border/60 pt-4 text-foreground/90">
										{#each point.sample as line, i (i)}
											{@const [before, mark, after] = splitOnMark(line.text, line.mark)}
											<div class="text-pretty">
												{before}{#if mark}<span
														class="decoration-red-500 underline-offset-4 [text-decoration:underline_wavy]"
														>{mark}</span
													>{/if}{after}
											</div>
										{/each}
									</div>

									<div class="mt-4 space-y-1.5 border-t border-border/60 pt-4">
										<div class="flex flex-wrap gap-x-4 gap-y-1">
											<span class="w-20 shrink-0 {sevColor[point.alert.level]}"
												>{point.alert.level}</span
											>
											<span class="text-foreground/80">{point.alert.message}</span>
										</div>
										<div class="text-pretty text-muted-foreground/70"># {point.note}</div>
									</div>
								</div>
							</Carousel.Item>
						{/each}
					</Carousel.Content>

					<!--
						The controls sit under the panel rather than at the component's
						default `-left-12`/`-right-12`, which would hang outside a
						half-width column. `static` wins over the built-in `absolute`
						through tailwind-merge, and the inset utilities it leaves behind
						are inert once the button is no longer positioned.
					-->
					<div class="mt-5 flex items-center justify-center gap-4">
						<Carousel.Previous class="static translate-x-0 translate-y-0" />

						<div class="flex items-center gap-2">
							{#each extensionPoints as point, i (point.id)}
								<button
									type="button"
									aria-label="Show the {point.id} rule"
									aria-current={selected === i}
									onclick={() => api?.scrollTo(i)}
									class="h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2 {selected ===
									i
										? 'w-5 bg-lime-500'
										: 'w-1.5 bg-border hover:bg-muted-foreground/50'}"
								></button>
							{/each}
						</div>

						<Carousel.Next class="static translate-x-0 translate-y-0" />
					</div>
				</Carousel.Root>
			</div>
		</div>

		<!-- Fast -->
		<div class={row}>
			<div class="lg:order-2">
				<span class={eyebrow}><SpeedIcon class="h-4 w-4" /> {speed.title}</span>
				<h3 class={heading}>{speed.tagline}</h3>
				<p class={lede}>{speed.description}</p>
				<a href="/features/{speed.slug}" class={link}>
					What makes it fast
					<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
				</a>
			</div>

			<!--
				Figures, not an illustration: the claim is a measurement, and the
				measurement is the most convincing thing we can put here. These are
				GitLab's docs, which the /features/speed page walks through.
			-->
			<div class="lg:order-1">
				<dl class="grid grid-cols-3 gap-4 sm:gap-6">
					{#each [{ n: '2,827', l: 'pages of Markdown' }, { n: '82', l: 'rules applied' }, { n: '<20s', l: 'start to finish' }] as stat}
						<div class="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
							<dt class="font-mono text-2xl font-medium tabular-nums text-foreground sm:text-3xl">
								{stat.n}
							</dt>
							<dd class="mt-1 text-xs leading-snug text-muted-foreground">{stat.l}</dd>
						</div>
					{/each}
				</dl>
			</div>
		</div>
	</div>

	<!--
		The three claims nobody chooses Vale for. They were full tiles, each with
		its own art, sitting at the same weight as the arguments above; a line
		apiece is what they are worth.
	-->
	<div
		class="mx-auto mt-16 max-w-5xl border-t border-border/60 pt-8 sm:mt-20 lg:grid lg:grid-cols-3 lg:gap-10"
	>
		{#each [{ t: 'Private by design', d: 'Nothing leaves your machine. No account, no upload, and no training on your writing.' }, { t: 'Runs everywhere', d: 'macOS, Windows, and Linux. MIT-licensed and maintained in the open.' }, { t: 'Style guides included', d: 'Microsoft, Google, Red Hat and thirteen more, each installed with one command.' }] as item}
			<div class="py-3 lg:py-0">
				<h4 class="text-sm font-semibold text-foreground">{item.t}</h4>
				<p class="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.d}</p>
			</div>
		{/each}
	</div>

	<div class="mx-auto mt-8 max-w-5xl">
		<a
			href="/explorer"
			class="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-lime-500/40 underline-offset-4 transition-colors hover:text-lime-600 dark:hover:text-lime-400"
		>
			Browse every style
			<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
		</a>
	</div>
</Section>
