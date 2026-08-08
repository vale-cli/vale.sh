/**
 * Sponsors, in the order they appear on the landing page.
 *
 * Each card is painted in the sponsor's own colour. `fg` is set per sponsor
 * rather than computed, because a pale brand needs dark type on it and a
 * saturated one needs white -- the same reason Thanks.svelte pairs them by
 * hand. Hexes come from the `simple-icons` package.
 *
 * Adding a sponsor is an edit here, not in the component.
 */
export type Sponsor = {
	name: string;
	/** Key into brandIcons -- see src/lib/data/brand-icons.ts. */
	icon: string;
	/** Vale's own write-up, not the sponsor's homepage. */
	href: string;
	brand: string;
	fg: string;
	/** What the sponsorship does, in Vale's words. Sets the card's headline. */
	blurb: string;
};

export const sponsors: Sponsor[] = [
	{
		name: 'Mintlify',
		icon: 'mintlify',
		href: '/sponsors/mintlify',
		brand: '#18E299',
		fg: '#04231A',
		blurb: "Funds Vale's development, and ships it as a built-in CI check."
	}
];
