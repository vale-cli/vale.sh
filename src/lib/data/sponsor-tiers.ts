import { siteConfig } from '$lib/config/site.js';

/*
	The sponsorship levels, in one place: the cards on /sponsor#tiers, the
	Partner details, the invoice section, and the FAQ all read from
	here, so the page and the emails that link to it say the same thing. The
	same names and wording belong on GitHub Sponsors and Open Collective.
*/

/**
 * Where Partner, Custom, and invoice requests go. Open Collective's contact
 * form until a sponsor address is chosen; swap in a `mailto:` then.
 */
export const contact = {
	href: 'https://opencollective.com/vale/contact',
	label: 'Contact us'
};

// Each level's own checkout on Open Collective.
const checkout = {
	backer: 'https://opencollective.com/vale/contribute/backer-106190/checkout',
	sponsor: 'https://opencollective.com/vale/contribute/sponsor-106191/checkout'
};

export type TierLink = { label: string; href: string };

export type Tier = {
	id: string;
	name: string;
	/** The price of a year. */
	price: string;
	unit: string;
	/** A short note under the price. */
	note: string;
	who: string;
	features: string[];
	links: TierLink[];
	badge?: string;
	/** A limit worth stating up front. */
	limit?: string;
};

export const tiers: Tier[] = [
	{
		id: 'backer',
		name: 'Backer',
		price: 'Any amount',
		unit: '',
		note: 'one-time, or recurring if you prefer',
		who: 'For anyone who uses Vale and wants to keep it going.',
		features: ['Listed on this page with your total'],
		links: [
			{ label: 'GitHub Sponsors', href: siteConfig.links.sponsors },
			{ label: 'Open Collective', href: checkout.backer }
		]
	},
	{
		id: 'sponsor',
		name: 'Sponsor',
		price: '$1,200',
		unit: 'a year',
		note: 'or $100 a month, or $1,200 once for a year',
		who: 'For teams that run Vale in their docs pipeline.',
		features: [
			'A written review of your Vale setup and styles',
			'A Sponsor Spotlight card on vale.sh',
			'A story page about how your team uses Vale',
			'Your logo on vale.sh and in the Vale README',
			'A Vale release sponsored by your team, named in its release notes',
			'A thank-you message on the Vale Discord',
			'A thank-you post in the testthedocs Slack, about 1,200 members',
			'Listed on this page with your total'
		],
		links: [{ label: 'Become a Sponsor', href: checkout.sponsor }],
		badge: 'Most common'
	},
	{
		id: 'partner',
		name: 'Partner',
		price: '$6,000',
		unit: 'a year',
		note: 'or $500 a month, or $6,000 once for a year',
		who: 'For teams whose builds depend on Vale.',
		features: [
			'Everything in Sponsor',
			"A private channel on the Vale Discord for your team's questions and requests",
			'Your requests triaged first, and a say in the roadmap',
			'Vale CMS Site for everyone at your domain'
		],
		links: [{ label: 'Become a Partner', href: contact.href }],
		limit: 'Limited to six Partners'
	},
	{
		id: 'custom',
		name: 'Custom',
		price: "Let's talk",
		unit: '',
		note: 'once, or over a year',
		who: 'For companies that want to fund one area of work.',
		features: [
			'A feature, file format, or integration your team needs',
			'Tooling for running Vale with coding agents',
			'Credited to your company when it ships'
		],
		links: [{ label: contact.label, href: contact.href }]
	}
];

/** What the Partner channel is, and what it is not. */
export const partner = [
	{
		term: 'The channel',
		detail:
			'A private channel on the Vale Discord for your team and the maintainer, for as long as you sponsor. Use it for questions, config help, bug reports, and requests. Everything happens in writing: there are no calls or meetings.'
	},
	{
		term: 'Triaged first',
		detail:
			'Partner requests are read before anything else. It is best effort, with no guaranteed response time.'
	},
	{
		term: 'Bugs stay public',
		detail: 'A real bug becomes a public issue, and the fix ships to everyone.'
	},
	{
		term: 'Vale CMS',
		detail:
			'The Site plan, for as long as you sponsor: the full editor for every address at your domain, and the MCP server for the accounts your CI and agents run as.'
	}
];

export const faq = [
	{
		q: 'Will Vale stay free?',
		a: 'Yes. Vale is MIT-licensed, and no feature is sponsor-only.'
	},
	{
		q: 'Does sponsoring buy features?',
		a: "Not exclusive ones. Partners get a say in the roadmap, and a Custom sponsorship can fund a specific feature, but everything ships to everyone and the roadmap stays the maintainer's."
	},
	{
		q: 'Is there an SLA?',
		a: 'No. The Partner channel is best effort, with no guaranteed response time.'
	},
	{
		q: 'Can we pay by invoice?',
		a: 'Yes. Open Collective sends invoices and receipts.'
	},
	{
		q: 'Can we pay once instead?',
		a: "Yes. A one-time payment of a tier's price gets that tier for a year, with no renewal commitment. Any other amount is welcome as a Backer."
	}
];
