<script lang="ts">
	import { Icons } from '../icons';
	import { page } from '$app/stores';
	import { siteConfig } from '$lib/config/site.js';
	import { docsConfig } from '$lib/config/docs.js';
	import { cn } from '$lib/utils.js';
</script>

<div class="mr-4 hidden md:flex">
	<a href="/" class="mr-6 flex items-center gap-2" aria-label={siteConfig.name}>
		<Icons.logo class="h-6 w-6" />
		<Icons.wordmark class="hidden h-[19px] w-auto lg:block" />
	</a>
	<!-- The icons show from lg up, where the wordmark does: at md the header
	     already fits the nav, the search, and the icon row with nothing to spare. -->
	<nav class="flex items-center gap-5 text-sm">
		{#each docsConfig.mainNav as item (item.href)}
			<a
				href={item.href}
				class={cn(
					'inline-flex items-center gap-1.5 transition-colors hover:text-foreground/80',
					$page.url.pathname === item.href ? 'text-foreground' : 'text-foreground/60'
				)}
			>
				{#if item.icon}
					<item.icon class="hidden h-4 w-4 shrink-0 lg:block" aria-hidden="true" />
				{/if}
				{item.title}
			</a>
		{/each}
	</nav>
</div>
