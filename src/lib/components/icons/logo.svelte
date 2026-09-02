<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<SVGElement>;
</script>

<!--
	The mark, drawn on a grid: both strokes run at a 1:2 slope, and the right
	one is cut by a line parallel to the left so the gap between them is exactly
	one stroke wide. The same path ships in static/brand/vale-mark.svg.

	Painted in the primary token, which is Grass on light and its light step on
	dark, so the mark follows the theme without a class on every call site.
-->
<svg viewBox="0 0 128 120" xmlns="http://www.w3.org/2000/svg" {...$$restProps}>
	<path fill="hsl(var(--primary))" d="M0 40 32 40 72 120 40 120ZM96 0 128 0 86 84 70 52Z" />
</svg>
