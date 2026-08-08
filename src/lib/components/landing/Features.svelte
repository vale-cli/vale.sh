<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import ShieldCheck from 'lucide-svelte/icons/shield-check';
	import BookOpen from 'lucide-svelte/icons/book-open';
	import MonitorSmartphone from 'lucide-svelte/icons/monitor-smartphone';
	import { features } from '$lib/features';
	import Section from './Section.svelte';
	import TileArt from './TileArt.svelte';

	// The four tiles that carry a mock are also the four deep-dive pages under
	// /features — the card is the summary, the page is the argument. The
	// remaining tiles are text-only and stay here.
	const [markup, code, extensible, speed] = features;

	// Bound out of the list because `{@const}` is only legal as the immediate
	// child of a block, and these sit inside plain markup.
	const MarkupIcon = markup.icon;
	const CodeIcon = code.icon;
	const ExtensibleIcon = extensible.icon;
	const SpeedIcon = speed.icon;

	const styles = ['Vale', 'Microsoft', 'Google', 'write-good', 'proselint', 'Red Hat'];

	/*
		Three things make a tile read as a tile rather than a hole cut in the page.

		A surface: `bg-card` is the same value as `bg-background` in dark, so tiles
		painted with it have none. `bg-muted` does, and the mock inset on
		`bg-background` then inverts correctly -- a pale panel on a grey card in
		light, a near-black one on a dark card in dark.

		A hue: every tile sets its own `--tile`. Seven grey boxes with seven
		identical badges read as one box repeated; an accent per tile gives the
		grid something to scan.

		The tint is a background-image over the surface colour rather than an
		overlay element -- background-image paints on top of background-color, so
		the two compose with no extra node and no stacking order to get wrong.
	*/
	const surface =
		'rounded-2xl border border-border/60 bg-muted/50 bg-gradient-to-b from-[--tile]/[0.09] to-transparent transition-colors duration-200 group-hover:from-[--tile]/[0.18] dark:bg-muted/40';

	// Shared by every tile that links out, so hover and focus read the same.
	const linked = `group flex flex-col ${surface} p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[--tile] hover:shadow-lg hover:shadow-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--tile] sm:p-8`;
	const plain = `group flex flex-col ${surface} p-6 sm:p-8`;

	const badge =
		'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[--tile]/25 bg-[--tile]/10 text-[--tile]';
	const mock =
		'overflow-x-auto rounded-lg border border-border/60 bg-background p-4 font-mono text-[13px] leading-relaxed';
	const more =
		'mt-auto inline-flex items-center gap-1 pt-5 text-sm font-medium text-lime-600 dark:text-lime-400';
</script>

<Section
	id="features"
	eyebrow="Why Vale"
	title="Linting built for the way you write"
	lede="The precision of a code linter, applied to prose—so quality and consistency stop being a manual review step."
	accent
>
	<!--
			Bento grid: wide "mock" tiles (col-span-4) paired with compact text
			tiles (col-span-2), zig-zagging left/right. Stacks to a single column
			below md.
		-->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-6">
		<!-- Markup-aware -->
		<a href="/features/{markup.slug}" style="--tile: #0ea5e9;" class="{linked} gap-5 md:col-span-4">
			<div class="flex items-center gap-3">
				<div class={badge}><MarkupIcon class="h-5 w-5" /></div>
				<div>
					<h3 class="text-lg font-semibold text-foreground">{markup.title}</h3>
					<p class="text-sm text-muted-foreground">
						Lints prose in Markdown, AsciiDoc, reStructuredText, and HTML—ignoring the syntax.
					</p>
				</div>
			</div>

			<!-- Mock: Markdown source where markup is dimmed and only prose is flagged. -->
			<div class={mock}>
				<div class="whitespace-pre">
					<span class="text-muted-foreground/50">{'# '}</span><span class="text-foreground/90"
						>Installation</span
					>
				</div>
				<div class="mt-2 text-foreground/90">
					You can <span class="text-muted-foreground/50">**</span><span
						class="decoration-sky-500 underline-offset-4 [text-decoration:underline_wavy]"
						>utilize</span
					><span class="text-muted-foreground/50">**</span> Vale to lint
					<span class="text-muted-foreground/50">[</span>prose<span class="text-muted-foreground/50"
						>](/docs)</span
					>—it ignores syntax like <span class="text-muted-foreground/50">`code`</span> and URLs.
				</div>
				<div class="mt-2 text-foreground/90">
					Vale is <span
						class="decoration-red-500 underline-offset-4 [text-decoration:underline_wavy]"
						>availible</span
					> for macOS, Windows, and Linux.
				</div>

				<!--
					Verbatim from `vale Installation.md` with Vale + Microsoft. Note what
					is absent: the link and the code span raise nothing.
				-->
				<div class="mt-3 space-y-1 border-t border-border/60 pt-3">
					<div class="flex flex-wrap gap-x-4 gap-y-1">
						<span class="w-20 shrink-0 text-sky-500">suggestion</span>
						<span class="text-foreground/80">Consider using 'use' instead of 'utilize'.</span>
						<span class="text-muted-foreground/60">Microsoft.Wordiness</span>
					</div>
					<div class="flex flex-wrap gap-x-4 gap-y-1">
						<span class="w-20 shrink-0 text-red-500">error</span>
						<span class="text-foreground/80">Did you really mean 'availible'?</span>
						<span class="text-muted-foreground/60">Vale.Spelling</span>
					</div>
				</div>
			</div>

			<span class={more}>
				How scopes work
				<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
			</span>
		</a>

		<!-- Private by design -->
		<div style="--tile: #10b981;" class="{plain} gap-4 md:col-span-2">
			<div class={badge}><ShieldCheck class="h-5 w-5" /></div>
			<h3 class="text-lg font-semibold text-foreground">Private by design</h3>
			<p class="text-sm leading-relaxed text-muted-foreground">
				Runs entirely offline. Your content is never sent to a remote server for processing or
				training.
			</p>

			<div class="mt-auto pt-2"><TileArt kind="private" /></div>
		</div>

		<!-- Fast -->
		<a href="/features/{speed.slug}" style="--tile: #84cc16;" class="{linked} gap-4 md:col-span-2">
			<div class={badge}><SpeedIcon class="h-5 w-5" /></div>
			<h3 class="text-lg font-semibold text-foreground">Fast, single binary</h3>
			<p class="text-sm leading-relaxed text-muted-foreground">
				Built in Go with no runtime dependencies. A 2,800-page Markdown corpus, 82 rules, in under
				20 seconds.
			</p>

			<div class="mt-4"><TileArt kind="speed" /></div>

			<span class={more}>
				What makes it fast
				<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
			</span>
		</a>

		<!-- Code-aware -->
		<a href="/features/{code.slug}" style="--tile: #8b5cf6;" class="{linked} gap-5 md:col-span-4">
			<div class="flex items-center gap-3">
				<div class={badge}><CodeIcon class="h-5 w-5" /></div>
				<div>
					<h3 class="text-lg font-semibold text-foreground">{code.title}</h3>
					<p class="text-sm text-muted-foreground">
						Reads comments and docstrings with tree-sitter grammars, in more than twenty languages.
					</p>
				</div>
			</div>

			<!-- Mock: a Go file where only the comment is live. -->
			<div class={mock}>
				<div class="whitespace-pre text-muted-foreground/40">
					func Get(id string) (*Record, error) {'{'}
				</div>
				<div class="-mx-1 mt-1 whitespace-pre rounded bg-lime-500/10 px-1">
					<span class="text-muted-foreground/50">{'\t// '}</span><span class="text-foreground/90"
						>{'It can '}</span
					><span class="decoration-sky-500 underline-offset-4 [text-decoration:underline_wavy]"
						>utilize</span
					><span class="text-foreground/90">{' the cache when possible.'}</span>
				</div>
				<div class="whitespace-pre text-muted-foreground/40">
					{'\tkey := "// not a comment"'}
				</div>
				<div class="whitespace-pre text-muted-foreground/40">{'}'}</div>
				<!--
					`utilizes` is not in Wordiness's token list, so the old copy showed an
					alert that would never fire. The comment now says `utilize`, which does.
				-->
				<div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border/60 pt-3">
					<span class="text-sky-500">suggestion</span>
					<span class="text-foreground/80">Consider using 'use' instead of 'utilize'.</span>
					<span class="text-muted-foreground/60">Microsoft.Wordiness</span>
				</div>
			</div>

			<span class={more}>
				Inside the grammar
				<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
			</span>
		</a>

		<!-- Extensible -->
		<a
			href="/features/{extensible.slug}"
			style="--tile: #f59e0b;"
			class="{linked} gap-5 md:col-span-4"
		>
			<div class="flex items-center gap-3">
				<div class={badge}><ExtensibleIcon class="h-5 w-5" /></div>
				<div>
					<h3 class="text-lg font-semibold text-foreground">Extensible</h3>
					<p class="text-sm text-muted-foreground">
						Write your own rules in YAML—no plugins to compile. Match your brand voice, share across
						a team.
					</p>
				</div>
			</div>

			<!-- Mock: a real Vale rule. -->
			<div class={mock}>
				<div class="whitespace-pre text-muted-foreground/60"># styles/Brand/Terms.yml</div>
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
					<span class="text-muted-foreground/60">{'  - '}</span><span class="text-amber-500"
						>utilize</span
					>
				</div>
				<div class="whitespace-pre">
					<span class="text-muted-foreground/60">{'  - '}</span><span class="text-amber-500"
						>leverage</span
					>
				</div>
			</div>

			<span class={more}>
				All twelve extension points
				<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
			</span>
		</a>

		<!-- Runs everywhere -->
		<div style="--tile: #06b6d4;" class="{plain} gap-4 md:col-span-2">
			<div class={badge}><MonitorSmartphone class="h-5 w-5" /></div>
			<h3 class="text-lg font-semibold text-foreground">Runs everywhere</h3>
			<p class="text-sm leading-relaxed text-muted-foreground">
				One tool for macOS, Windows, and Linux—MIT-licensed, open source, and actively maintained.
			</p>

			<div class="mt-auto pt-2"><TileArt kind="platforms" /></div>
		</div>

		<!-- Style guides included -->
		<a href="/explorer" style="--tile: #f43f5e;" class="{linked} gap-5 md:col-span-6">
			<div class="flex items-center gap-3">
				<div class={badge}><BookOpen class="h-5 w-5" /></div>
				<div>
					<h3 class="text-lg font-semibold text-foreground">Style guides included</h3>
					<p class="text-sm text-muted-foreground">
						Ready-made Microsoft, Google, and other popular guides, plus community packages.
					</p>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-5 md:grid-cols-2">
				<!--
					Vale's built-ins plus ONE guide. Microsoft and Google are alternative
					general style guides, so enabling both double-reports the same text:
					`e.g.` raises Google.Latin and Microsoft.Foreign together, and one
					passive clause raises Google.Passive and Microsoft.Passive. The docs'
					own examples pair Vale with a single style for the same reason.
				-->
				<div class={mock}>
					<div class="whitespace-pre">
						<span class="text-muted-foreground">StylesPath</span> = styles
					</div>
					<div class="whitespace-pre">
						<span class="text-muted-foreground">MinAlertLevel</span> = suggestion
					</div>
					<div class="mt-2 whitespace-pre text-lime-600 dark:text-lime-400">[*.md]</div>
					<div class="whitespace-pre">
						<span class="text-muted-foreground">BasedOnStyles</span> = Vale, Microsoft
					</div>
				</div>

				<div class="flex flex-wrap content-center gap-2">
					{#each styles as style}
						<span
							class="inline-flex h-fit rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border"
						>
							{style}
						</span>
					{/each}
				</div>
			</div>

			<span class={more}>
				Browse every style
				<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
			</span>
		</a>
	</div>
</Section>
