<script lang="ts">
	import Play from 'lucide-svelte/icons/play';

	/*
		The one-minute walkthrough, rendered from video/ (Remotion) and
		committed under static/media. The band is the video's own ground, in
		both themes, so the frame reads as part of the page and not a dark
		hole in a light one. Nothing loads until the visitor presses play or
		picks a chapter: the poster is the only request, and the video has no
		sound, so the on-screen text is the whole of it.

		The chapters are the scenes in video/src/Promo.tsx; `at` is where each
		starts (its claim card), in seconds. Change them together.
	*/
	const chapters = [
		{ at: 3, title: 'Your guideline' },
		{ at: 10.2, title: 'A rule you own' },
		{ at: 17.9, title: 'Published styles' },
		{ at: 23.6, title: 'A run' },
		{ at: 29.8, title: 'The fix' },
		{ at: 36.5, title: 'What Vale sees' },
		{ at: 45.7, title: 'Wherever you write' },
		{ at: 52.9, title: 'Tested and fast' },
		{ at: 60.6, title: 'Install' }
	];
	const stamp = (s: number) =>
		`${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

	let video = $state<HTMLVideoElement>();
	let started = $state(false);
	let time = $state(0);

	// The chapter playing now: the last one whose start has passed.
	const current = $derived(started ? chapters.findLastIndex((c) => time >= c.at) : -1);

	function play(at?: number) {
		if (!video) return;
		started = true;
		if (at !== undefined) {
			video.currentTime = at;
			time = at;
		}
		video.play();
	}
</script>

<section class="promo border-b border-border" aria-labelledby="promo-title">
	<div
		class="mx-auto grid max-w-[1152px] gap-x-12 gap-y-8 px-6 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-center"
	>
		<div class="lg:col-span-2">
			<p class="font-mono text-[11px] uppercase tracking-[0.13em] text-lime-400">Watch</p>
			<h2 id="promo-title" class="mt-3 text-3xl font-medium tracking-tight text-white sm:text-4xl">
				Vale in a minute.
			</h2>
		</div>

		<div
			class="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-[#101310] shadow-2xl shadow-black/40"
		>
			<!-- svelte-ignore a11y_media_has_caption -->
			<video
				bind:this={video}
				bind:currentTime={time}
				class="h-full w-full"
				poster="/media/vale-promo-poster.jpg"
				preload="none"
				playsinline
				muted
				controls={started}
				onplay={() => (started = true)}
				aria-label="A silent walkthrough: a line from a style guide becomes a YAML rule, Vale runs over a docs folder and reports five alerts, a quick fix corrects one, and it shows what Vale checks and skips in Markdown, code comments and an API description"
			>
				<source src="/media/vale-promo.webm" type="video/webm" />
				<source src="/media/vale-promo.mp4" type="video/mp4" />
			</video>
			{#if !started}
				<button
					type="button"
					onclick={() => play()}
					class="group absolute inset-0 flex items-center justify-center bg-black/25 transition-colors hover:bg-black/10 focus-visible:outline-none"
					aria-label="Play the video: Vale in a minute"
				>
					<span
						class="flex h-16 w-16 items-center justify-center rounded-full bg-lime-500 text-[#101310] shadow-lg ring-4 ring-white/10 transition-transform group-hover:scale-105 group-focus-visible:ring-white/70 sm:h-20 sm:w-20"
					>
						<Play class="ml-1 h-7 w-7 fill-current sm:h-8 sm:w-8" aria-hidden="true" />
					</span>
				</button>
			{/if}
		</div>

		<!-- Chapters: each starts the video at its scene. A row that scrolls on
		     a phone, a column beside the frame from lg up. -->
		<ol
			class="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-l lg:border-white/10 lg:p-0"
			aria-label="Chapters"
		>
			{#each chapters as chapter, i (chapter.at)}
				<li class="shrink-0">
					<button
						type="button"
						onclick={() => play(chapter.at)}
						aria-current={i === current ? 'true' : undefined}
						class="chapter group flex w-full items-baseline gap-3 rounded-full border border-white/10 px-4 py-2 text-left transition-colors hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 lg:-ml-px lg:rounded-none lg:border-0 lg:border-l-2 lg:border-transparent lg:py-2 lg:pl-5 lg:hover:border-white/40"
					>
						<span class="font-mono text-[11px] tabular-nums text-white/45">{stamp(chapter.at)}</span
						>
						<span class="min-w-0">
							<span
								class="block whitespace-nowrap text-sm font-medium text-white/85 group-hover:text-white"
								>{chapter.title}</span
							>
						</span>
					</button>
				</li>
			{/each}
		</ol>
	</div>
</section>

<style>
	/* The video's ground and its corner wash, from video/src/Promo.tsx. */
	.promo {
		background: radial-gradient(
				ellipse 45% 60% at 12% 0%,
				rgba(144, 212, 84, 0.1),
				transparent 70%
			),
			#101310;
	}
	.chapter[aria-current='true'] {
		border-color: #a3e635;
	}
	.chapter[aria-current='true'] :global(span) {
		color: #fff;
	}
</style>
