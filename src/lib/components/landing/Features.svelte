<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import { features } from '$lib/features';
	import Section from './Section.svelte';

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
</script>

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
				<div class="whitespace-pre">
					<span class="text-muted-foreground">{'# '}</span><span class="text-foreground/90"
						>Installation</span
					>
				</div>
				<div class="mt-2 text-foreground/90">
					You can <span class="text-muted-foreground">**</span><span
						class="decoration-amber-500 underline-offset-4 [text-decoration:underline_wavy]"
						>utilize</span
					><span class="text-muted-foreground">**</span> Vale to lint
					<span class="text-muted-foreground">[</span>prose<span class="text-muted-foreground"
						>](/docs)</span
					>—it ignores syntax like <span class="text-muted-foreground">`code`</span> and URLs.
				</div>
				<div class="mt-2 text-foreground/90">
					Vale is <span
						class="decoration-red-500 underline-offset-4 [text-decoration:underline_wavy]"
						>availible</span
					> for macOS, Windows, and Linux.
				</div>

				<div class="mt-4 space-y-1.5 border-t border-border/60 pt-4">
					<div class="flex flex-wrap gap-x-4 gap-y-1">
						<span class="w-20 shrink-0 text-muted-foreground">suggestion</span>
						<span class="text-foreground/80">Consider using 'use' instead of 'utilize'.</span>
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
				<a href="/features/{code.slug}" class={link}>
					Inside the grammar
					<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
				</a>
			</div>

			<!--
				`utilizes` is not in Wordiness's token list, so an earlier version of
				this showed an alert that would never fire. The comment says
				`utilize`, which does.
			-->
			<div class="{panel} lg:order-1">
				<div class="whitespace-pre text-muted-foreground">
					func Get(id string) (*Record, error) {'{'}
				</div>
				<div class="-mx-1 mt-1 whitespace-pre rounded bg-lime-500/10 px-1">
					<span class="text-muted-foreground">{'\t// '}</span><span class="text-foreground/90"
						>{'It can '}</span
					><span class="decoration-amber-500 underline-offset-4 [text-decoration:underline_wavy]"
						>utilize</span
					><span class="text-foreground/90">{' the cache when possible.'}</span>
				</div>
				<div class="whitespace-pre text-muted-foreground">
					{'\tkey := "// not a comment"'}
				</div>
				<div class="whitespace-pre text-muted-foreground">{'}'}</div>

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

			<div class={panel}>
				<div class="whitespace-pre text-muted-foreground"># styles/Brand/Terms.yml</div>
				<div class="mt-2 whitespace-pre">
					<span class="text-muted-foreground">extends:</span>
					<span class="text-foreground/90">existence</span>
				</div>
				<div class="whitespace-pre">
					<span class="text-muted-foreground">message:</span>
					<span class="text-foreground/90">"Avoid '%s'."</span>
				</div>
				<div class="whitespace-pre">
					<span class="text-muted-foreground">level:</span>
					<span class="text-foreground/90">warning</span>
				</div>
				<div class="whitespace-pre text-muted-foreground">tokens:</div>
				<div class="whitespace-pre">
					<span class="text-muted-foreground">{'  - '}</span><span
						class="text-lime-600 dark:text-lime-400">utilize</span
					>
				</div>
				<div class="whitespace-pre">
					<span class="text-muted-foreground">{'  - '}</span><span
						class="text-lime-600 dark:text-lime-400">leverage</span
					>
				</div>
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
