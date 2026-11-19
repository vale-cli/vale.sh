<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { page } from '$app/state';
	import { cn } from '$lib/utils.js';

	let {
		href,
		open = $bindable(),
		class: className,
		children,
		...rest
	}: HTMLAnchorAttributes & {
		href: string;
		open: boolean;
		children: Snippet;
	} = $props();

	// A page under the link's path counts as the link, as in MainNav.
	const current = $derived(
		page.url.pathname === href || (href !== '/' && page.url.pathname.startsWith(`${href}/`))
	);
</script>

<a
	{href}
	class={cn(current ? 'text-foreground' : 'text-foreground/60', className)}
	onclick={() => (open = false)}
	{...rest}
>
	{@render children()}
</a>
