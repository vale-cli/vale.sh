<script lang="ts">
	import Package from 'lucide-svelte/icons/package';
	import FileCode from 'lucide-svelte/icons/file-code-2';
	import Wand from 'lucide-svelte/icons/wand-sparkles';
	import packages from '$lib/data/packages.json';
	import { assets } from '$lib/data/assets';
	import { rules } from '$lib/data/rule-gallery';

	/**
	 * The explorer's catalogs: packages you sync, single-file assets you copy,
	 * and rules to adapt. Each is its own route, so these are links styled as tabs, not
	 * a tab widget -- a widget's click and key handling would swallow the
	 * navigation, and the current route is what marks the selected one. The
	 * bar sits above each page's header so it stays put between them.
	 */
	let { active }: { active: 'packages' | 'assets' | 'rules' } = $props();

	const tabs = [
		{ id: 'packages', href: '/explorer', icon: Package, title: 'Packages', count: packages.length },
		{
			id: 'assets',
			href: '/explorer/assets',
			icon: FileCode,
			title: 'Views, filters & templates',
			count: assets.length
		},
		{ id: 'rules', href: '/explorer/rules', icon: Wand, title: 'Rules', count: rules.length }
	] as const;
</script>

<nav aria-label="Explorer sections" class="flex justify-center">
	<ul class="inline-flex items-center gap-1 rounded-lg bg-muted p-1 text-sm text-muted-foreground">
		{#each tabs as tab (tab.id)}
			<li>
				<a
					href={tab.href}
					aria-current={active === tab.id ? 'page' : undefined}
					class="inline-flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 {active ===
					tab.id
						? 'bg-background text-foreground shadow'
						: ''}"
				>
					<tab.icon class="size-4" aria-hidden="true" />
					{tab.title}
					<span class="text-xs text-muted-foreground">{tab.count}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>
