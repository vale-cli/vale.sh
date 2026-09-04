import type { ComponentType, SvelteComponent } from 'svelte';
import type { IconProps } from 'lucide-svelte';

export type NavItem = {
	title: string;
	href?: string;
	disabled?: boolean;
	external?: boolean;
	/** A lucide icon, shown beside the title. */
	icon?: ComponentType<SvelteComponent<IconProps>>;
	label?: string;
	info?: string;
};

export type NavItemWithChildren = NavItem & {
	items: NavItemWithChildren[];
};
