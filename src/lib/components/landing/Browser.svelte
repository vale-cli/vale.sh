<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import Play from 'lucide-svelte/icons/play';
	import Section from './Section.svelte';

	/*
		The browser extension. `href` is each store's listing, null until it is
		live; the button then says so instead of going nowhere.
	*/
	const stores: { name: string; href: string | null }[] = [
		{ name: 'Chrome', href: null },
		{ name: 'Edge', href: null },
		{ name: 'Firefox', href: null }
	];

	const points = [
		'Marks as you type, in text areas, inputs, and rich editors, on the sites you turn on.',
		'A card on each mark with its fix, from a click or Alt+Enter.',
		'One configuration everywhere: library packages, or your house style as a .zip.',
		'Free, with no account. Vale runs inside the extension, so nothing leaves your browser.'
	];

	// The video from video/ (ExtensionPromo). Nothing loads until play.
	let video = $state<HTMLVideoElement>();
	let started = $state(false);
</script>

<Section
	editorial
	id="browser"
	eyebrow="Vale for your browser"
	accent
	title="Your style guide, in every text box."
	lede="The extension checks what you write on the web, from a pull-request description to an email, against your Vale configuration."
>
	<div class="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
		<div>
			<ul class="space-y-3">
				{#each points as point (point)}
					<li class="flex gap-3 text-sm leading-6 text-muted-foreground">
						<span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-500"></span>
						{point}
					</li>
				{/each}
			</ul>

			<ul class="mt-8 flex flex-wrap gap-3">
				{#each stores as store (store.name)}
					<li>
						{#if store.href}
							<a
								href={store.href}
								target="_blank"
								rel="noreferrer"
								class="inline-flex h-10 items-center gap-2 rounded-lg bg-lime-500 px-4 text-sm font-semibold text-[#101310] transition-colors hover:bg-lime-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2"
							>
								Add to {store.name}
								<ArrowRight class="h-4 w-4" />
							</a>
						{:else}
							<span
								class="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-muted-foreground"
							>
								{store.name}
								<span
									class="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"
									>Soon</span
								>
							</span>
						{/if}
					</li>
				{/each}
			</ul>
			<p class="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
				<a
					href="https://github.com/vale-cli/vale-web"
					target="_blank"
					rel="noreferrer"
					class="underline decoration-border underline-offset-4 hover:text-foreground"
					>Source on GitHub</a
				>
				<a
					href="/privacy/extension"
					class="underline decoration-border underline-offset-4 hover:text-foreground"
					>Privacy policy</a
				>
				<span
					>Thanks to <a
						href="https://floss.fund/blog/second-tranche-2025-anniversary/"
						target="_blank"
						rel="noreferrer"
						class="underline decoration-border underline-offset-4 hover:text-foreground"
						>FLOSS/fund</a
					> for funding Vale.</span
				>
			</p>
		</div>

		<div
			class="relative aspect-video overflow-hidden rounded-xl border border-border bg-[#101310] shadow-xl"
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
					aria-label="Play the video: the browser extension in 40 seconds"
				>
					<span
						class="flex h-14 w-14 items-center justify-center rounded-full bg-lime-500 text-[#101310] shadow-lg ring-4 ring-white/10 transition-transform group-hover:scale-105 group-focus-visible:ring-white/70"
					>
						<Play class="ml-1 h-6 w-6 fill-current" aria-hidden="true" />
					</span>
				</button>
			{/if}
		</div>
	</div>
</Section>
