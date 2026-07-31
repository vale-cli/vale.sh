<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import ShieldCheck from 'lucide-svelte/icons/shield-check';
	import BookOpen from 'lucide-svelte/icons/book-open';
	import MonitorSmartphone from 'lucide-svelte/icons/monitor-smartphone';
	import { features } from '$lib/features';

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

	// Shared by every tile that links out, so hover and focus read the same.
	const linked =
		'group relative flex flex-col rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-lime-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 sm:p-8';
	const plain = 'flex flex-col rounded-2xl border border-border/60 bg-card p-6 sm:p-8';
	const badge =
		'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-lime-500/20 bg-lime-500/10 text-lime-500';
	const mock =
		'overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-4 font-mono text-[13px] leading-relaxed';
	const more =
		'mt-auto inline-flex items-center gap-1 pt-5 text-sm font-medium text-lime-600 dark:text-lime-400';
</script>

<section id="features" class="border-b border-border/60 py-14 sm:py-16">
	<div class="mx-auto max-w-6xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-base font-semibold text-lime-500">Why Vale</h2>
			<p class="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
				Linting built for the way you write
			</p>
			<p class="mt-6 text-pretty text-lg leading-8 text-muted-foreground">
				The precision of a code linter, applied to prose—so quality and consistency stop being a
				manual review step.
			</p>
		</div>

		<!--
			Bento grid: wide "mock" tiles (col-span-4) paired with compact text
			tiles (col-span-2), zig-zagging left/right. Stacks to a single column
			below md.
		-->
		<div class="mt-14 grid grid-cols-1 gap-4 md:grid-cols-6">
			<!-- Markup-aware -->
			<a href="/features/{markup.slug}" class="{linked} gap-5 md:col-span-4">
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
							class="decoration-amber-500 underline-offset-4 [text-decoration:underline_wavy]"
							>utilize</span
						><span class="text-muted-foreground/50">**</span> Vale to lint
						<span class="text-muted-foreground/50">[</span>prose<span
							class="text-muted-foreground/50">](/docs)</span
						>—it ignores syntax like <span class="text-muted-foreground/50">`code`</span> and URLs.
					</div>
					<div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border/60 pt-3">
						<span class="text-amber-500">warning</span>
						<span class="text-foreground/80">Use 'use' instead of 'utilize'.</span>
						<span class="text-muted-foreground/60">Microsoft.Vocab</span>
					</div>
				</div>

				<span class={more}>
					How scopes work
					<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
				</span>
			</a>

			<!-- Private by design -->
			<div class="{plain} gap-4 md:col-span-2">
				<div class={badge}><ShieldCheck class="h-5 w-5" /></div>
				<h3 class="text-lg font-semibold text-foreground">Private by design</h3>
				<p class="text-sm leading-relaxed text-muted-foreground">
					Runs entirely offline. Your content is never sent to a remote server for processing or
					training.
				</p>
			</div>

			<!-- Fast -->
			<a href="/features/{speed.slug}" class="{linked} gap-4 md:col-span-2">
				<div class={badge}><SpeedIcon class="h-5 w-5" /></div>
				<h3 class="text-lg font-semibold text-foreground">Fast, single binary</h3>
				<p class="text-sm leading-relaxed text-muted-foreground">
					Built in Go with no runtime dependencies. Thousands of pages of documentation, linted in
					about a minute.
				</p>

				<div class="{mock} mt-4">
					<div class="whitespace-pre">
						<span class="text-lime-600 dark:text-lime-400">$</span> vale docs/
					</div>
					<div class="mt-1 whitespace-pre text-muted-foreground/60">
						# One binary. Nothing else to install.
					</div>
				</div>

				<span class={more}>
					What makes it fast
					<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
				</span>
			</a>

			<!-- Code-aware -->
			<a href="/features/{code.slug}" class="{linked} gap-5 md:col-span-4">
				<div class="flex items-center gap-3">
					<div class={badge}><CodeIcon class="h-5 w-5" /></div>
					<div>
						<h3 class="text-lg font-semibold text-foreground">{code.title}</h3>
						<p class="text-sm text-muted-foreground">
							Reads comments and docstrings with tree-sitter grammars, in more than twenty
							languages.
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
							>{'It '}</span
						><span class="decoration-amber-500 underline-offset-4 [text-decoration:underline_wavy]"
							>utilizes</span
						><span class="text-foreground/90">{' the cache when possible.'}</span>
					</div>
					<div class="whitespace-pre text-muted-foreground/40">
						{'\tkey := "// not a comment"'}
					</div>
					<div class="whitespace-pre text-muted-foreground/40">{'}'}</div>
					<div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border/60 pt-3">
						<span class="text-amber-500">warning</span>
						<span class="text-foreground/80">Use 'uses' instead of 'utilizes'.</span>
						<span class="text-muted-foreground/60">Microsoft.Vocab</span>
					</div>
				</div>

				<span class={more}>
					Inside the grammar
					<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
				</span>
			</a>

			<!-- Extensible -->
			<a href="/features/{extensible.slug}" class="{linked} gap-5 md:col-span-4">
				<div class="flex items-center gap-3">
					<div class={badge}><ExtensibleIcon class="h-5 w-5" /></div>
					<div>
						<h3 class="text-lg font-semibold text-foreground">Extensible</h3>
						<p class="text-sm text-muted-foreground">
							Write your own rules in YAML—no plugins to compile. Match your brand voice, share
							across a team.
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
			<div class="{plain} gap-4 md:col-span-2">
				<div class={badge}><MonitorSmartphone class="h-5 w-5" /></div>
				<h3 class="text-lg font-semibold text-foreground">Runs everywhere</h3>
				<p class="text-sm leading-relaxed text-muted-foreground">
					One tool for macOS, Windows, and Linux—MIT-licensed, open source, and actively maintained.
				</p>
			</div>

			<!-- Style guides included -->
			<div class="{plain} gap-5 md:col-span-6">
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
					<!-- Mock: a .vale.ini enabling several packages at once. -->
					<div class={mock}>
						<div class="whitespace-pre">
							<span class="text-muted-foreground">StylesPath</span> = styles
						</div>
						<div class="whitespace-pre">
							<span class="text-muted-foreground">MinAlertLevel</span> = suggestion
						</div>
						<div class="mt-2 whitespace-pre text-lime-600 dark:text-lime-400">[*.md]</div>
						<div class="whitespace-pre">
							<span class="text-muted-foreground">BasedOnStyles</span> = Vale, Microsoft, Google
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
			</div>
		</div>
	</div>
</section>
