import type { NavItem } from '$lib/types/nav';
import BookOpen from 'lucide-svelte/icons/book-open';
import AppWindow from 'lucide-svelte/icons/app-window';
import WandSparkles from 'lucide-svelte/icons/wand-sparkles';
import Package from 'lucide-svelte/icons/package';
import Library from 'lucide-svelte/icons/library';
import Newspaper from 'lucide-svelte/icons/newspaper';

// The documentation itself lives on docs.vale.sh, which GitBook publishes and
// which carries its own navigation. This file is only the site's own top-level
// nav; there is deliberately no mirror of the docs tree here, because a copy
// would drift from GitBook the first time a page moved.
type DocsConfig = {
	mainNav: NavItem[];
};

export const docsConfig: DocsConfig = {
	mainNav: [
		{
			title: 'Docs',
			href: 'https://docs.vale.sh',
			external: true,
			icon: BookOpen
		},
		{
			title: 'Studio',
			href: 'https://studio.vale.sh',
			external: true,
			icon: AppWindow
		},
		{
			title: 'Generator',
			href: '/generator',
			icon: WandSparkles
		},
		{
			title: 'Explorer',
			href: '/explorer',
			icon: Package
		},
		{
			title: 'Library',
			href: '/library',
			icon: Library
		},
		{
			title: 'Blog',
			href: '/blog',
			icon: Newspaper
		}
	]
};
