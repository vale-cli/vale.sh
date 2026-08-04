<script lang="ts">
	import { brandIcons, brandIconViewBox } from '$lib/data/brand-icons';

	/**
	 * Resolves a mark in three steps: a Simple Icons glyph, then a GitHub org
	 * avatar checked into static/users/avatars, then a monogram. Microsoft and
	 * AWS need the avatar path — both had their marks pulled from Simple Icons
	 * over trademark policy.
	 */
	/*
		`size` is separate from `class` because the sizing classes live on the
		element itself: passing `h-3.5` through `class` leaves `h-5` in place too,
		and which one wins is decided by stylesheet order rather than by the
		caller. Overriding it has to replace the default, not sit beside it.
	*/
	let {
		name,
		slug,
		avatar,
		size = 'h-5 w-5',
		class: klass = ''
	}: {
		name: string;
		slug?: string;
		avatar?: string;
		size?: string;
		class?: string;
	} = $props();

	const path = $derived(slug ? brandIcons[slug] : undefined);
	// Marks Simple Icons does not carry are not all drawn 24x24.
	const box = $derived((slug && brandIconViewBox[slug]) || '0 0 24 24');
</script>

{#if path}
	<svg
		viewBox={box}
		role="img"
		aria-hidden="true"
		fill="currentColor"
		class="{size} shrink-0 {klass}"
	>
		<path d={path} />
	</svg>
{:else if avatar}
	<img
		src={avatar}
		alt=""
		aria-hidden="true"
		loading="lazy"
		width="20"
		height="20"
		class="{size} shrink-0 rounded-sm object-contain {klass}"
	/>
{:else}
	<span
		aria-hidden="true"
		class="inline-flex {size} shrink-0 items-center justify-center rounded bg-muted text-[10px] font-semibold text-muted-foreground {klass}"
	>
		{name
			.replace(/[^A-Za-z0-9]/g, '')
			.slice(0, 2)
			.toUpperCase()}
	</span>
{/if}
