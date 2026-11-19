/**
 * The landing page's adopter band, as $lib/server/adopter-band builds it.
 *
 * Kept out of $lib/server so the component can import the type without
 * pulling in server-only code.
 */
export type AdopterBand = {
	/** One figure each, from the team's own page. */
	stories: {
		name: string;
		figure: string;
		label: string;
		detail: string;
		url: string;
		icon?: string;
		avatar?: string;
	}[];
	/** The marks under the stories; `receipt` names where to check. */
	marks: {
		name: string;
		url: string;
		context: string;
		avatar?: string;
		receipt: string;
		slug: string;
	}[];
	/** A count per sector, each linking to its band on /adopters. */
	chips: { name: string; count: number; href: string }[];
	total: number;
};
