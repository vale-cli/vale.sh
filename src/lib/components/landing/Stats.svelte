<script lang="ts">
	import { siteConfig } from '$lib/config/site.js';

	// Verified July 2026 — see repo/Docker Hub.
	const stats = [
		{ value: '5.5K+', label: 'GitHub stars', href: siteConfig.links.github },
		{ value: '8M+', label: 'Downloads', href: siteConfig.links.releases },
		{ value: '2M+', label: 'Docker pulls', href: siteConfig.links.docker },
		{ value: '50+', label: 'Contributors', href: siteConfig.links.contributors }
	];
</script>

<section class="border-b border-border/60">
	<div class="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-y divide-border/60 sm:grid-cols-4 sm:divide-y-0">
		{#each stats as stat}
			<a
				href={stat.href}
				target="_blank"
				rel="noreferrer"
				class="group flex flex-col items-center gap-1 px-6 py-10 transition-colors hover:bg-muted/30"
			>
				<span class="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
					{stat.value}
				</span>
				<span class="text-sm text-muted-foreground group-hover:text-lime-500">{stat.label}</span>
			</a>
		{/each}
	</div>
</section>
