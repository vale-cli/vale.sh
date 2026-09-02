import type { NavItem } from '$lib/types/nav';

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
			external: true
		},
		{
			title: 'Studio',
			href: 'https://studio.vale.sh',
			external: true
		},
		{
			title: 'Generator',
			href: '/generator'
		},
		{
			title: 'Explorer',
			href: '/explorer'
		},
		{
			title: 'Library',
			href: '/library'
		},
		{
			title: 'Blog',
			href: '/blog'
		}
	]
};
