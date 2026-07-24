<script lang="ts">
	import Gauge from 'lucide-svelte/icons/gauge';
	import ShieldCheck from 'lucide-svelte/icons/shield-check';
	import Code from 'lucide-svelte/icons/code';
	import BookOpen from 'lucide-svelte/icons/book-open';
	import SlidersHorizontal from 'lucide-svelte/icons/sliders-horizontal';
	import MonitorSmartphone from 'lucide-svelte/icons/monitor-smartphone';

	// The three compact, text-only features. The visual tiles (markup-aware,
	// customizable, style guides) are laid out by hand below so each can carry
	// its own mock.
	const plain = [
		{
			icon: ShieldCheck,
			title: 'Private by design',
			description:
				'Runs entirely offline. Your content is never sent to a remote server for processing or training.'
		},
		{
			icon: Gauge,
			title: 'Fast, single binary',
			description:
				'Built in Go with no runtime dependencies. Drop it into any editor, CI pipeline, or pre-commit hook.'
		},
		{
			icon: MonitorSmartphone,
			title: 'Runs everywhere',
			description:
				'One tool for macOS, Windows, and Linux—MIT-licensed, open source, and actively maintained.'
		}
	];

	const styles = ['Vale', 'Microsoft', 'Google', 'write-good', 'proselint', 'Red Hat'];
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
			Bento grid: three wide "mock" tiles (col-span-4) each paired with a
			compact text tile (col-span-2), zig-zagging left/right. Stacks to a
			single column below md.
		-->
		<div class="mt-14 grid grid-cols-1 gap-4 md:grid-cols-6">
			<!-- Markup-aware -->
			<div
				class="flex flex-col gap-5 rounded-2xl border border-border/60 bg-card p-6 sm:p-8 md:col-span-4"
			>
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-lime-500/20 bg-lime-500/10 text-lime-500"
					>
						<Code class="h-5 w-5" />
					</div>
					<div>
						<h3 class="text-lg font-semibold text-foreground">Markup-aware</h3>
						<p class="text-sm text-muted-foreground">
							Lints prose in Markdown, AsciiDoc, reStructuredText, HTML, and code—ignoring the syntax.
						</p>
					</div>
				</div>

				<!-- Mock: Markdown source where markup is dimmed and only prose is flagged. -->
				<div
					class="overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-4 font-mono text-[13px] leading-relaxed"
				>
					<div class="whitespace-pre">
						<span class="text-muted-foreground/50"># </span><span class="text-foreground/90"
							>Installation</span
						>
					</div>
					<div class="mt-2 text-foreground/90">
						You can <span class="text-muted-foreground/50">**</span><span
							class="decoration-amber-500 [text-decoration:underline_wavy] underline-offset-4">utilize</span
						><span class="text-muted-foreground/50">**</span> Vale to lint
						<span class="text-muted-foreground/50">[</span>prose<span class="text-muted-foreground/50"
							>](/docs)</span
						>—it ignores syntax like <span class="text-muted-foreground/50">`code`</span> and URLs.
					</div>
					<div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border/60 pt-3">
						<span class="text-amber-500">warning</span>
						<span class="text-foreground/80">Use 'use' instead of 'utilize'.</span>
						<span class="text-muted-foreground/60">Microsoft.Vocab</span>
					</div>
				</div>
			</div>

			<!-- Private by design -->
			<div
				class="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6 sm:p-8 md:col-span-2"
			>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-lg border border-lime-500/20 bg-lime-500/10 text-lime-500"
				>
					<ShieldCheck class="h-5 w-5" />
				</div>
				<h3 class="text-lg font-semibold text-foreground">{plain[0].title}</h3>
				<p class="text-sm leading-relaxed text-muted-foreground">{plain[0].description}</p>
			</div>

			<!-- Fast, single binary -->
			<div
				class="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6 sm:p-8 md:col-span-2"
			>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-lg border border-lime-500/20 bg-lime-500/10 text-lime-500"
				>
					<Gauge class="h-5 w-5" />
				</div>
				<h3 class="text-lg font-semibold text-foreground">{plain[1].title}</h3>
				<p class="text-sm leading-relaxed text-muted-foreground">{plain[1].description}</p>
			</div>

			<!-- Fully customizable -->
			<div
				class="flex flex-col gap-5 rounded-2xl border border-border/60 bg-card p-6 sm:p-8 md:col-span-4"
			>
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-lime-500/20 bg-lime-500/10 text-lime-500"
					>
						<SlidersHorizontal class="h-5 w-5" />
					</div>
					<div>
						<h3 class="text-lg font-semibold text-foreground">Fully customizable</h3>
						<p class="text-sm text-muted-foreground">
							Write your own rules in YAML—no plugins to compile. Match your brand voice, share across
							a team.
						</p>
					</div>
				</div>

				<!-- Mock: a real Vale rule. -->
				<div
					class="overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-4 font-mono text-[13px] leading-relaxed"
				>
					<div class="whitespace-pre text-muted-foreground/60"># styles/Brand/Terms.yml</div>
					<div class="mt-2 whitespace-pre">
						<span class="text-muted-foreground">extends:</span> <span class="text-foreground/90"
							>existence</span
						>
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
						<span class="text-muted-foreground/60">- </span><span class="text-amber-500">utilize</span>
					</div>
					<div class="whitespace-pre">
						<span class="text-muted-foreground/60">- </span><span class="text-amber-500">leverage</span>
					</div>
				</div>
			</div>

			<!-- Style guides included -->
			<div
				class="flex flex-col gap-5 rounded-2xl border border-border/60 bg-card p-6 sm:p-8 md:col-span-4"
			>
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-lime-500/20 bg-lime-500/10 text-lime-500"
					>
						<BookOpen class="h-5 w-5" />
					</div>
					<div>
						<h3 class="text-lg font-semibold text-foreground">Style guides included</h3>
						<p class="text-sm text-muted-foreground">
							Ready-made Microsoft, Google, and other popular guides, plus community packages.
						</p>
					</div>
				</div>

				<!-- Mock: a .vale.ini enabling several packages at once. -->
				<div
					class="overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-4 font-mono text-[13px] leading-relaxed"
				>
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

				<div class="flex flex-wrap gap-2">
					{#each styles as style}
						<span
							class="inline-flex rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border"
						>
							{style}
						</span>
					{/each}
				</div>
			</div>

			<!-- Runs everywhere -->
			<div
				class="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6 sm:p-8 md:col-span-2"
			>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-lg border border-lime-500/20 bg-lime-500/10 text-lime-500"
				>
					<MonitorSmartphone class="h-5 w-5" />
				</div>
				<h3 class="text-lg font-semibold text-foreground">{plain[2].title}</h3>
				<p class="text-sm leading-relaxed text-muted-foreground">{plain[2].description}</p>
			</div>
		</div>
	</div>
</section>
