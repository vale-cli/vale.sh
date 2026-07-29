<script lang="ts">
	import { Icons } from '../icons';
	import { Icon } from 'svelte-icons-pack';
	import { AiOutlineMenu } from 'svelte-icons-pack/ai';
	import MobileLink from './MobileLink.svelte';
	import * as Drawer from '$lib/components/ui/drawer';
	import { Button } from '$lib/components/ui/button';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { docsConfig } from '$lib/config/docs.js';
	import { siteConfig } from '$lib/config/site.js';

	let open = false;
</script>

<Drawer.Root bind:open>
	<Drawer.Trigger>
		<Button
			variant="ghost"
			class="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
		>
			<Icon src={AiOutlineMenu} className="h-5 w-5" />
			<span class="sr-only">Toggle Menu</span>
		</Button>
	</Drawer.Trigger>
	<Drawer.Content class="pr-0">
		<MobileLink href="/" class="flex items-center" bind:open>
			<Icons.logo class="mr-2 h-5 w-5" />
			<span class="font-bold">{siteConfig.name}</span>
		</MobileLink>
		<ScrollArea orientation="both" class="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
			<div class="flex flex-col space-y-3">
				{#each docsConfig.mainNav as navItem, index (navItem + index.toString())}
					{#if navItem.href}
						<MobileLink href={navItem.href} bind:open class="text-foreground">
							{navItem.title}
						</MobileLink>
					{/if}
				{/each}
			</div>
		</ScrollArea>
	</Drawer.Content>
</Drawer.Root>
