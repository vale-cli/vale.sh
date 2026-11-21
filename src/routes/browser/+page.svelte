<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import Keyboard from 'lucide-svelte/icons/keyboard';
	import ListChecks from 'lucide-svelte/icons/list-checks';
	import MousePointerClick from 'lucide-svelte/icons/mouse-pointer-click';
	import PanelsTopLeft from 'lucide-svelte/icons/panels-top-left';
	import Play from 'lucide-svelte/icons/play';
	import Puzzle from 'lucide-svelte/icons/puzzle';
	import Upload from 'lucide-svelte/icons/upload';
	import Zap from 'lucide-svelte/icons/zap';
	import * as Accordion from '$lib/components/ui/accordion';
	import Section from '$lib/components/landing/Section.svelte';
	import Editor, { type Category, type Highlight } from '$lib/components/tools/Editor.svelte';
	import { settled } from '$lib/tools/settle.svelte';
	import { useVale } from '$lib/tools/engine.svelte';
	import { config, fixFor, pkg, type ValeSpec } from '$lib/tools/vale';
	import { siteConfig } from '$lib/config/site';

	const description =
		'Vale’s browser extension checks what you write in any text field against your style guide, as you type. Free for Chrome, Edge, and Firefox, and nothing leaves your browser.';

	/*
		Where each browser installs it. `href` is null until its store listing
		is live; the button then says so instead of going nowhere.
	*/
	const stores: { name: string; href: string | null }[] = [
		{ name: 'Chrome', href: null },
		{ name: 'Edge', href: null },
		{ name: 'Firefox', href: null }
	];

	// The demo: the extension's engine, here in the page, with a published style.
	const SAMPLE = `Teh new cache makes the build really fast in every enviroment. We can utilize it in order to skip the slow step, and it is very simple to turn on.

Once enabled, the cache will be shared across all of the jobs in your pipeline.`;

	const categories: Category[] = [
		{ id: 'error', label: 'Errors', tone: 'rose', mark: 'line' },
		{ id: 'warning', label: 'Warnings', tone: 'amber', mark: 'line' },
		{ id: 'suggestion', label: 'Suggestions', tone: 'sky', mark: 'line' }
	];

	let text = $state('');
	const input = settled(() => text, 120);
	const spec: ValeSpec = { packages: [pkg('Microsoft')], config: config(['Vale', 'Microsoft']) };
	const vale = useVale(() => input.value, spec);
	const highlights = $derived<Highlight[]>(
		(vale.result?.placed ?? []).map((p) => ({
			from: p.from,
			to: p.to,
			category: categories.some((c) => c.id === p.alert.Severity) ? p.alert.Severity : 'suggestion',
			message: p.alert.Message,
			source: p.alert.Check,
			href: p.alert.Link || undefined,
			fix: fixFor(p.alert)
		}))
	);

	const features = [
		{
			icon: Zap,
			title: 'Marks as you type',
			body: 'No button and no wait. Each alert is underlined the moment its word is down, in its severity’s color, and the marks move with your edits.'
		},
		{
			icon: MousePointerClick,
			title: 'A card for each mark',
			body: 'Click a mark for the rule, its message, and the fix, one click from applied. Dismiss the alert, turn the rule off, or add the word to your vocabulary.'
		},
		{
			icon: Keyboard,
			title: 'From the keyboard',
			body: 'Alt+Enter opens the card at the cursor, the arrows walk it, and Enter applies. Alt+Shift+Enter takes the first fix without opening it.'
		},
		{
			icon: Upload,
			title: 'Your own style',
			body: 'One .vale.ini for every site, with packages from the Vale library or your house style uploaded as a .zip. Vale’s built-in style works with no setup.'
		},
		{
			icon: PanelsTopLeft,
			title: 'The editors you use',
			body: 'Text areas, inputs, frames, and rich editors: ProseMirror, TipTap, Lexical, Slate, Quill, and CKEditor. Turn it on per site from the toolbar.'
		},
		{
			icon: ListChecks,
			title: 'Everything in one place',
			body: 'Words you added, rules you turned off, and alerts you dismissed are listed together on the Yours tab, and any of them can be undone.'
		}
	];

	const faq = [
		{
			q: 'What does it cost?',
			a: 'Nothing. There is no account, no trial, and no paid tier.'
		},
		{
			q: 'Is my writing sent anywhere?',
			a: 'No. Vale runs inside the extension, so your text is checked in your browser and never leaves it. The only downloads are the style packages you ask for. The privacy policy has the details.'
		},
		{
			q: 'Which sites does it work on?',
			a: 'It starts on GitHub and GitLab. Turn on any other site from the toolbar button, and pick whether its editors hold Markdown, HTML, or plain text.'
		},
		{
			q: 'Can I use my team’s style guide?',
			a: 'Yes. Paste your .vale.ini on the options page, sync the packages it names from the Vale library, and upload any house style as a .zip. The same configuration then applies on every site you turn on.'
		},
		{
			q: 'How is it different from Vale on the command line?',
			a: 'It is the same engine and the same rules. The command line checks files in a repository and in CI; the extension checks the comment, issue, or description you are writing, before you send it.'
		},
		{
			q: 'Does it work alongside another checker?',
			a: 'Yes. Turn off “Check as you type” in the toolbar popup and Vale waits until you ask: check the focused field from the popup or with Alt+Shift+V.'
		}
	];

	let video = $state<HTMLVideoElement>();
	let started = $state(false);
</script>

<MetaTags
	title="Browser extension — Vale"
	{description}
	canonical="https://vale.sh/browser"
	openGraph={{
		url: 'https://vale.sh/browser',
		title: 'Vale for your browser',
		description,
		images: [
			{
				url: 'https://vale.sh/media/vale-extension.jpg',
				width: 1280,
				height: 720,
				alt: 'A comment box with marks under four phrases and a card open on one, offering its fix'
			}
		]
	}}
/>

<main>
	<header class="border-b border-border">
		<div class="mx-auto max-w-4xl px-6 pb-14 pt-12 sm:pb-16 lg:px-8">
			<div class="flex items-center gap-3">
				<div
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-lime-500/20 bg-lime-500/10 text-lime-600 dark:text-lime-400"
				>
					<Puzzle class="h-5 w-5" />
				</div>
				<p
					class="font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-lime-600 dark:text-lime-400"
				>
					Vale for your browser
				</p>
			</div>
			<h1 class="mt-5 text-balance text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
				Your style guide, as you type.
			</h1>
			<p class="mt-6 text-pretty text-lg leading-8 text-foreground/85">
				The extension checks what you write in any text field, from a pull-request description to an
				email, against your Vale configuration. Every mark comes with its reason and its fix, and
				your writing never leaves your browser.
			</p>

			<ul class="mt-8 flex flex-wrap gap-3">
				{#each stores as store (store.name)}
					<li>
						{#if store.href}
							<a
								href={store.href}
								target="_blank"
								rel="noreferrer"
								class="inline-flex h-11 items-center gap-2 rounded-lg bg-lime-500 px-5 text-sm font-semibold text-[#101310] transition-colors hover:bg-lime-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2"
							>
								Add to {store.name}
								<ArrowRight class="h-4 w-4" />
							</a>
						{:else}
							<span
								class="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-medium text-muted-foreground"
							>
								{store.name}
								<span
									class="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"
									>Coming soon</span
								>
							</span>
						{/if}
					</li>
				{/each}
			</ul>
			<p class="mt-4 text-sm text-muted-foreground">
				Free. No account. Nothing leaves your browser.
			</p>
		</div>
	</header>

	<Section
		editorial
		id="try"
		eyebrow="Try it"
		accent
		title="This box runs the same engine."
		lede="Vale and the Microsoft style, checking as you type, right in this page. Click a mark for its card; edit the text, or paste your own."
	>
		<!-- Touching the editor starts the engine, ahead of the first text. -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div onfocusin={vale.warm} onpointerdown={vale.warm}>
			<Editor
				bind:value={text}
				{highlights}
				{categories}
				sample={SAMPLE}
				minHeight="16rem"
				placeholder="Write a comment, a description, a reply…"
			/>
		</div>
		<p class="mt-3 text-xs leading-5 text-muted-foreground" aria-live="polite">
			{#if vale.state === 'loading'}
				Loading Vale…
			{:else if vale.state === 'failed'}
				Vale couldn’t load in this browser.
			{:else if vale.state === 'ready'}
				{highlights.length}
				{highlights.length === 1 ? 'alert' : 'alerts'}, checked in your browser.
			{:else}
				Vale loads when you start typing.
			{/if}
		</p>
	</Section>

	<Section
		editorial
		id="features"
		eyebrow="What it does"
		title="A linter where you write, not after."
		lede="The checks your docs get in CI, on the comments, issues, and messages that never reach a repository."
	>
		<ul
			class="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
		>
			{#each features as f (f.title)}
				<li class="bg-background p-6">
					<span class="inline-flex rounded-lg bg-lime-500/10 p-2 text-lime-600 dark:text-lime-400">
						<f.icon class="size-4" />
					</span>
					<h3 class="mt-4 text-sm font-semibold">{f.title}</h3>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">{f.body}</p>
				</li>
			{/each}
		</ul>
	</Section>

	<section class="watch border-b border-border" aria-labelledby="watch-title">
		<div class="mx-auto max-w-4xl px-6 py-14 sm:py-20 lg:px-8">
			<p class="font-mono text-[11px] uppercase tracking-[0.13em] text-lime-400">Watch</p>
			<h2 id="watch-title" class="mt-3 text-3xl font-medium tracking-tight text-white sm:text-4xl">
				The extension in 40 seconds.
			</h2>
			<div
				class="relative mt-8 aspect-video overflow-hidden rounded-xl border border-white/10 bg-[#101310] shadow-2xl shadow-black/40"
			>
				<!-- svelte-ignore a11y_media_has_caption -->
				<video
					bind:this={video}
					class="h-full w-full"
					poster="/media/vale-extension.jpg"
					preload="none"
					playsinline
					muted
					controls={started}
					onplay={() => (started = true)}
					aria-label="A silent walkthrough: marks appear as a comment is typed, a click opens a card and applies its fix, Alt+Enter fixes a misspelling, a house style is uploaded, and nothing leaves the browser"
				>
					<source src="/media/vale-extension.mp4" type="video/mp4" />
				</video>
				{#if !started}
					<button
						type="button"
						onclick={() => {
							started = true;
							video?.play();
						}}
						class="group absolute inset-0 flex items-center justify-center bg-black/25 transition-colors hover:bg-black/10 focus-visible:outline-none"
						aria-label="Play the video: the extension in 40 seconds"
					>
						<span
							class="flex h-16 w-16 items-center justify-center rounded-full bg-lime-500 text-[#101310] shadow-lg ring-4 ring-white/10 transition-transform group-hover:scale-105 group-focus-visible:ring-white/70 sm:h-20 sm:w-20"
						>
							<Play class="ml-1 h-7 w-7 fill-current sm:h-8 sm:w-8" aria-hidden="true" />
						</span>
					</button>
				{/if}
			</div>
		</div>
	</section>

	<Section
		editorial
		id="private"
		eyebrow="Private"
		accent
		title="Nothing leaves your browser."
		lede="Vale runs inside the extension. Your text is checked where you write it and isn’t sent to a server, stored elsewhere, or read by a model."
	>
		<ul class="grid gap-4 sm:grid-cols-3">
			{#each ['No account', 'No analytics or telemetry', 'No text sent anywhere'] as point (point)}
				<li
					class="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm"
				>
					<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-lime-500"></span>
					{point}
				</li>
			{/each}
		</ul>
		<a
			href="/privacy/extension"
			class="group mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-lime-500/40 underline-offset-4 transition-colors hover:text-lime-600 dark:hover:text-lime-400"
		>
			Read the privacy policy
			<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
		</a>
	</Section>

	<Section editorial id="faq" eyebrow="Questions" title="Questions, answered.">
		<Accordion.Root type="single" class="max-w-3xl">
			{#each faq as item (item.q)}
				<Accordion.Item value={item.q}>
					<Accordion.Trigger class="text-left">{item.q}</Accordion.Trigger>
					<Accordion.Content>
						<p class="text-sm leading-6 text-muted-foreground">{item.a}</p>
					</Accordion.Content>
				</Accordion.Item>
			{/each}
		</Accordion.Root>
		<p class="mt-8 text-sm text-muted-foreground">
			Something else? Ask on
			<a
				href={siteConfig.links.discord}
				target="_blank"
				rel="noreferrer"
				class="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
				>Discord</a
			>
			or open an
			<a
				href="{siteConfig.links.github}/issues"
				target="_blank"
				rel="noreferrer"
				class="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
				>issue</a
			>.
		</p>
	</Section>
</main>

<style>
	/* The video's own ground, as on the landing page's film. */
	.watch {
		background: radial-gradient(
				ellipse 45% 60% at 12% 0%,
				rgba(144, 212, 84, 0.1),
				transparent 70%
			),
			#101310;
	}
</style>
