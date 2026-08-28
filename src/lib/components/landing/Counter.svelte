<script lang="ts">
	// Counts up to `value` the first time the element scrolls into view. Falls back
	// to the final value immediately when the user prefers reduced motion.
	let { value, duration = 1400 }: { value: number; duration?: number } = $props();

	const formatter = new Intl.NumberFormat('en-US', {
		notation: 'compact',
		maximumFractionDigits: 1
	});

	let el: HTMLSpanElement | undefined = $state();
	// Starts at the real number so the prerendered HTML carries it: the count-up
	// is decoration, and a crawler or a reader without JS should not be told the
	// figure is zero. The effect below rewinds it once the browser takes over.
	let current = $state(value);

	function run() {
		const start = performance.now();
		function step(now: number) {
			const t = Math.min((now - start) / duration, 1);
			// easeOutExpo — fast out of the gate, settles gently on the real number.
			const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
			current = value * eased;
			if (t < 1) requestAnimationFrame(step);
			else current = value;
		}
		requestAnimationFrame(step);
	}

	$effect(() => {
		if (!el) return;

		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) {
			current = value;
			return;
		}

		current = 0;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					observer.disconnect();
					run();
				}
			},
			{ threshold: 0.4 }
		);
		observer.observe(el);
		return () => observer.disconnect();
	});
</script>

<span bind:this={el} class="tabular-nums">
	{formatter.format(Math.round(current))}
</span>
