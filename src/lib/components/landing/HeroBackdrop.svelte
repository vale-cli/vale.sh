<!--
	Faint vertical rules, drifting. No accent color: the movement is the only
	effect, so tinting it green made two things compete at once.

	The pattern repeats every 72px and the layer travels exactly 72px per cycle,
	so the loop is seamless. Only `transform` animates.
-->
<div
	aria-hidden="true"
	class="pointer-events-none absolute inset-0 z-0 overflow-hidden [mask-image:radial-gradient(ellipse_64%_60%_at_50%_46%,transparent_32%,#000_88%)]"
>
	<div class="rules"></div>
</div>

<style>
	.rules {
		position: absolute;
		inset-block: 0;
		/* Wider than the box so the drift never exposes an edge. */
		inset-inline: -72px 0;
		background-image: repeating-linear-gradient(
			to right,
			hsl(var(--foreground) / 0.05) 0 1px,
			transparent 1px 72px
		);
		animation: drift 24s linear infinite;
		will-change: transform;
	}

	@keyframes drift {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(72px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.rules {
			animation: none;
		}
	}
</style>
