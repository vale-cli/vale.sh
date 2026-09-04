<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import Package from 'lucide-svelte/icons/package';
	import FileCode from 'lucide-svelte/icons/file-code-2';
	import packages from '$lib/data/packages.json';
	import { assets } from '$lib/data/assets';

	/**
	 * The explorer's two catalogs, as tabs under the page header: packages you
	 * sync, and single-file assets you copy. Each is its own route, so the
	 * triggers render as links -- the tab's role, state, and arrow keys, with
	 * a real href underneath -- and the current route is the selected tab.
	 */
	let { active }: { active: 'packages' | 'assets' } = $props();

	const tabs = [
		{ id: 'packages', href: '/explorer', icon: Package, title: 'Packages', count: packages.length },
		{
			id: 'assets',
			href: '/explorer/assets',
			icon: FileCode,
			title: 'Views, filters & templates',
			count: assets.length
		}
	] as const;
</script>

<Tabs.Root value={active} class="mt-10 flex justify-center">
	<Tabs.List class="h-auto">
		{#each tabs as tab (tab.id)}
			<Tabs.Trigger value={tab.id}>
				{#snippet child({ props })}
					<a href={tab.href} {...props} class="{props.class} gap-2 py-1.5">
						<tab.icon class="size-4" aria-hidden="true" />
						{tab.title}
						<span class="text-xs text-muted-foreground">{tab.count}</span>
					</a>
				{/snippet}
			</Tabs.Trigger>
		{/each}
	</Tabs.List>
</Tabs.Root>
