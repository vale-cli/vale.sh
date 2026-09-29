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
	/** A one-time payment. */
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
		price: '$1,000',
		unit: '',
		note: 'one-time payment',
		who: 'For teams that run Vale in their docs pipeline.',
		features: [
			'A Sponsor Spotlight card on vale.sh',
			'A story page about how your team uses Vale',
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
		price: '$5,000',
		unit: '',
		note: 'one-time payment',
		who: 'For teams whose builds depend on Vale.',
		features: [
			'Everything in Sponsor',
			"A private channel on the Vale Discord for your team's questions and requests, open for a year",
			'Your requests triaged first',
			'A case study of your setup, reviewed by you before it is published'
		],
		links: [{ label: 'Become a Partner', href: contact.href }],
		limit: 'Limited to six Partners'
	},
	{
		id: 'custom',
		name: 'Custom',
		price: "Let's talk",
		unit: '',
		note: 'one-time payment',
		who: 'For companies that want to fund one area of work.',
		features: ['Fund Std, Voices, Journals, Harper, or agent tooling'],
		links: [{ label: contact.label, href: contact.href }]
	}
];

/** What the Partner channel is, and what it is not. */
export const partner = [
	{
		term: 'The channel',
		detail:
			'A private channel on the Vale Discord for your team and the maintainer, open for a year. Use it for questions, config help, bug reports, and requests.'
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
		term: 'The case study',
		detail:
			'A walkthrough of your public config in the case-study series, sent to you for review before it is published.'
	}
];

export const faq = [
	{
		q: 'Will Vale stay free?',
		a: 'Yes. Vale is MIT-licensed, and no feature is sponsor-only.'
	},
	{
		q: 'Does sponsoring buy features?',
		a: "No. It buys visibility and, for Partners, priority on requests. The roadmap stays the maintainer's."
	},
	{
		q: 'Is there an SLA?',
		a: 'No. The Partner channel is best effort, with no guaranteed response time.'
	},
	{
		q: 'Can we pay by invoice?',
		a: 'Yes. Open Collective sends invoices and receipts.'
	}
];
