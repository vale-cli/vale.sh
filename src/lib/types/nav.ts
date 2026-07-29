import type { Icons } from '$lib/components/icons';

export type NavItem = {
	title: string;
	href?: string;
	disabled?: boolean;
	external?: boolean;
	icon?: keyof typeof Icons;
	label?: string;
	info?: string;
};

export type NavItemWithChildren = NavItem & {
	items: NavItemWithChildren[];
};
