/**
 * The path segment a team's profile lives at: /adopters/<slug>.
 *
 * Lowercase letters and digits, runs of anything else folded to a hyphen, so
 * "GOV.UK" is `gov-uk` and "Red Hat" is `red-hat`. script/adopters.mjs fails
 * the build if two names fold to the same slug.
 */
export function slugOf(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}
