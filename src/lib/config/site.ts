export const siteConfig = {
	name: 'Vale CLI',
	url: 'https://vale.sh',
	ogImage: 'https://vale.sh/brand/vale-social.png',
	description: ' A markup-aware linter for prose built with speed and extensibility in mind.',
	links: {
		// The repo, for anything that means *this project* — starring it, its
		// releases, its contributors.
		github: 'https://github.com/errata-ai/vale',
		// The org, for the header's GitHub icon: it is a way in to everything
		// under vale-cli, not a pointer at one repository.
		org: 'https://github.com/vale-cli',
		twitter: 'https://twitter.com/jdkato',
		jdkato: 'https://github.com/jdkato',
		// Not linked anywhere yet: the channel has one video on it.
		youtube: 'https://www.youtube.com/@valecli',
		releases: 'https://github.com/errata-ai/vale/releases',
		docker: 'https://hub.docker.com/r/jdkato/vale',
		contributors: 'https://github.com/errata-ai/vale/graphs/contributors',
		sponsors: 'https://github.com/sponsors/jdkato',
		openCollective: 'https://opencollective.com/vale',
		discord: 'https://discord.gg/DM86VURrNY'
	},
	keywords: `linting,nlp,cli`
};

export type SiteConfig = typeof siteConfig;
