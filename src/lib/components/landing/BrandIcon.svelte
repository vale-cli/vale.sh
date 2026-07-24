<script lang="ts">
	import { brandIcons } from '$lib/data/brand-icons';

	/**
	 * Resolves a mark in three steps: a Simple Icons glyph, then a GitHub org
	 * avatar checked into static/users/avatars, then a monogram. Microsoft and
	 * AWS need the avatar path — both had their marks pulled from Simple Icons
	 * over trademark policy.
	 */
	let {
		name,
		slug,
		avatar,
		class: klass = ''
	}: { name: string; slug?: string; avatar?: string; class?: string } = $props();

	const path = $derived(slug ? brandIcons[slug] : undefined);
</script>

{#if path}
	<svg
		viewBox="0 0 24 24"
		role="img"
		aria-hidden="true"
		fill="currentColor"
		class="h-5 w-5 shrink-0 {klass}"
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
		class="h-5 w-5 shrink-0 rounded-sm object-contain"
	/>
{:else}
	<span
		aria-hidden="true"
		class="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-semibold text-muted-foreground {klass}"
	>
		{name
			.replace(/[^A-Za-z0-9]/g, '')
			.slice(0, 2)
			.toUpperCase()}
	</span>
{/if}
