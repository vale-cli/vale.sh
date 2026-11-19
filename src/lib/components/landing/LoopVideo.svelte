<script lang="ts">
	/*
		A short silent loop of the product, rendered from video/ (Remotion).
		It plays only while it is on screen, and not at all for a visitor who
		asked for reduced motion: they get the poster, which is the loop's
		last beat, and controls to play it themselves.
	*/
	let {
		name,
		label,
		class: className = ''
	}: {
		/** Basename under /media/loops: `fix` is fix.webm, fix.mp4 and fix.jpg. */
		name: string;
		/** What happens in the loop, for someone who cannot see it. */
		label: string;
		class?: string;
	} = $props();

	let video = $state<HTMLVideoElement>();
	let still = $state(false);

	$effect(() => {
		if (!video) return;
		still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (still) return;
		const el = video;
		const seen = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) el.play().catch(() => {});
				else el.pause();
			},
			{ threshold: 0.4 }
		);
		seen.observe(el);
		return () => seen.disconnect();
	});
</script>

<!-- svelte-ignore a11y_media_has_caption -->
<video
	bind:this={video}
	class="aspect-video w-full rounded-xl border border-border bg-[#101310] shadow-sm {className}"
	poster="/media/loops/{name}.jpg"
	preload="none"
	muted
	loop
	playsinline
	controls={still}
	aria-label={label}
>
	<source src="/media/loops/{name}.webm" type="video/webm" />
	<source src="/media/loops/{name}.mp4" type="video/mp4" />
</video>
