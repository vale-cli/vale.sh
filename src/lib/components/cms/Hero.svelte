<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import EditorShot from './EditorShot.svelte';
</script>

<section class="relative overflow-hidden border-b border-border/60">
	<!-- Dotted grid, matched to the OSS home page's hero so the two read as one site. -->
	<div
		class="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(hsl(var(--foreground)/0.06)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_0%,#000_55%,transparent_100%)]"
	></div>

	<div class="mx-auto max-w-6xl px-6 pb-16 pt-16 sm:pb-20 sm:pt-24 lg:px-8">
		<div class="mx-auto max-w-3xl text-center">
			<span
				class="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-sm text-muted-foreground"
			>
				<span class="inline-flex h-1.5 w-1.5 rounded-full bg-lime-500"></span>
				A Vale Labs project
			</span>

			<h1 class="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
				A style guide that doesn't compile is
				<span class="text-lime-500">just a document.</span>
			</h1>

			<p class="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
				Vale CMS is the hosted editor for your whole Vale project — config, rules, vocabularies,
				dictionaries, filters, every asset. The real engine lints as you type and proves every rule
				compiles, so a rule that silently never fires can't reach your repo.
			</p>

			<div class="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
				<a
					href="https://cms.vale.sh"
					class="group inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
				>
					Open the editor
					<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
				</a>
				<a
					href="#loop"
					class="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
				>
					See how it works
				</a>
			</div>

			<!--
				This line is load-bearing on this domain. Everyone arriving at vale.sh
				already has Vale for free; the page has to say plainly that nothing was
				taken away before it asks for money.
			-->
			<p class="mt-5 text-sm text-muted-foreground">
				Vale itself stays free, open source, and MIT licensed.
				<span class="text-foreground">Vale CMS is the authoring layer on top.</span>
			</p>

			<!--
				The adopter names belong to Vale, not to Vale CMS — they are on this
				site's own home page. The claim is carefully about the engine, and it
				must stay that way: none of these are CMS customers, and implying they
				are would be the one lie on this page.
			-->
			<p class="mt-8 text-sm text-muted-foreground">
				The engine running here is the one already linting docs at
				<span class="font-medium text-foreground"
					>AWS, NVIDIA, Microsoft, GitLab, and Red Hat</span
				>.
			</p>
		</div>

		<div class="mt-14 sm:mt-16">
			<EditorShot />
			<p class="mx-auto mt-4 max-w-2xl text-center text-sm text-muted-foreground">
				A sequence rule matching a "be" verb, an optional adverb, and a past participle — with the
				token sequence the engine resolved it to, and the alerts it produces, live.
			</p>
		</div>
	</div>
</section>
