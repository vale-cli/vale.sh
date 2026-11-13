<script lang="ts">
	import Play from 'lucide-svelte/icons/play';

	/*
		The forty-second walkthrough, rendered from video/ (Remotion) and
		committed under static/media. Nothing loads until the visitor presses
		play: the poster is the only request, and the video has no sound, so
		the on-screen text is the whole of it.
	*/
	let video = $state<HTMLVideoElement>();
	let started = $state(false);

	function play() {
		started = true;
		video?.play();
	}
</script>

<section class="border-b border-border" aria-labelledby="promo-title">
	<div class="mx-auto max-w-[1152px] px-6 py-14 sm:px-8 sm:py-16">
		<div class="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
			<h2 id="promo-title" class="text-lg font-medium tracking-tight">Vale in forty seconds</h2>
			<p class="font-mono text-[11px] uppercase tracking-[0.13em] text-muted-foreground">
				A guideline · a rule · a run
			</p>
		</div>
		<div
			class="relative aspect-video overflow-hidden rounded-xl border border-border bg-[#101310] shadow-sm"
		>
			<!-- svelte-ignore a11y_media_has_caption -->
			<video
				bind:this={video}
				class="h-full w-full"
				poster="/media/vale-promo-poster.jpg"
				preload="none"
				playsinline
				muted
				controls={started}
				onplay={() => (started = true)}
				aria-label="A silent walkthrough: a line from a style guide becomes a YAML rule, Vale runs over a docs folder and reports five alerts, then shows what it checks and skips in a Markdown file"
			>
				<source src="/media/vale-promo.webm" type="video/webm" />
				<source src="/media/vale-promo.mp4" type="video/mp4" />
			</video>
			{#if !started}
				<button
					type="button"
					onclick={play}
					class="group absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/10 focus-visible:outline-none"
					aria-label="Play the video: Vale in forty seconds"
				>
					<span
						class="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-white/10 transition-transform group-hover:scale-105 group-focus-visible:ring-white/60 sm:h-20 sm:w-20"
					>
						<Play class="ml-1 h-7 w-7 fill-current sm:h-8 sm:w-8" aria-hidden="true" />
					</span>
				</button>
			{/if}
		</div>
	</div>
</section>
