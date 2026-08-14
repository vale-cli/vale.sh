/**
 * Sponsors, in the order they appear on the landing page.
 *
 * Each card is painted in the sponsor's own color. `fg` is set per sponsor
 * rather than computed, because a pale brand needs dark type on it and a
 * saturated one needs white -- the same reason Thanks.svelte pairs them by
 * hand. Hexes come from the `simple-icons` package.
 *
 * Adding a sponsor is an edit here, not in the component.
 */
export type Sponsor = {
	name: string;
	/** Key into brandIcons -- see src/lib/data/brand-icons.ts. */
	icon?: string;
	/** GitHub org avatar, for a brand Simple Icons does not carry. */
	avatar?: string;
	/** Vale's own write-up, not the sponsor's homepage. */
	href: string;
	brand: string;
	fg: string;
	/**
	 * The sponsor's own home page, captured. Both themes where they have both;
	 * one is fine, and shows in either. Files live in static/sponsors/.
	 */
	shot?: { light?: string; dark?: string };
	/**
	 * What the sponsor does with Vale, in Vale's words. Sets the card's
	 * headline. That they fund it is what the section is; the line says what
	 * else they do.
	 */
	blurb: string;
};

export const sponsors: Sponsor[] = [
	{
		name: 'Mintlify',
		icon: 'mintlify',
		href: '/sponsors/mintlify',
		brand: '#18E299',
		fg: '#04231A',
		shot: {
			light: '/sponsors/mintlify/demo-light.webp',
			dark: '/sponsors/mintlify/demo-dark.webp'
		},
		blurb: 'Ships Vale as a built-in CI check.'
	},
	{
		name: 'Promptless',
		// Simple Icons doesn't carry Promptless, and its own logo is a wordmark
		// rather than a mark, so this takes the avatar path -- as Microsoft and
		// AWS do.
		avatar: '/users/avatars/Promptless.png',
		href: '/sponsors/promptless',
		// `--pl-color-accent` from promptless.ai, dark type from the same
		// palette: 8.6:1.
		brand: '#a6b0ff',
		fg: '#171a23',
		// Only a dark capture so far; Screenshot shows it in both themes.
		shot: { dark: '/sponsors/promptless/demo.webp' },
		blurb: 'Runs Vale on every doc its agents write.'
	}
];
