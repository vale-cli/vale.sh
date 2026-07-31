<script lang="ts">
	import { Icons } from '../icons';
	import { Icon } from 'svelte-icons-pack';
	import { AiOutlineMenu } from 'svelte-icons-pack/ai';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import MobileLink from './MobileLink.svelte';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import { docsConfig } from '$lib/config/docs.js';
	import { siteConfig } from '$lib/config/site.js';

	let open = false;
</script>

<Sheet.Root bind:open>
	<Sheet.Trigger>
		<Button
			variant="ghost"
			class="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
		>
			<Icon src={AiOutlineMenu} className="h-5 w-5" />
			<span class="sr-only">Toggle Menu</span>
		</Button>
	</Sheet.Trigger>

	<Sheet.Content side="left" class="flex flex-col gap-6 overflow-y-auto">
		<!-- The panel is a dialog, so it needs a name. The brand below reads as
		     the heading but is a link, which is not one. -->
		<Sheet.Title class="sr-only">Navigation</Sheet.Title>

		<MobileLink href="/" class="flex items-center gap-2" bind:open>
			<Icons.logo class="h-5 w-5" />
			<span class="font-bold">{siteConfig.name}</span>
		</MobileLink>

		<nav class="flex flex-col gap-3 text-base">
			<MobileLink href="/" bind:open>Home</MobileLink>
			{#each docsConfig.mainNav as navItem, index (navItem.href ?? index)}
				{#if navItem.href}
					<MobileLink href={navItem.href} bind:open class="flex items-center gap-1.5">
						{navItem.title}
						{#if navItem.external}
							<ExternalLink class="h-3.5 w-3.5 text-muted-foreground" />
						{/if}
					</MobileLink>
				{/if}
			{/each}
		</nav>
	</Sheet.Content>
</Sheet.Root>
