import { getSponsorFunding } from '$lib/server/collective';
import { sponsors } from '$lib/data/sponsors';
import type { PageServerLoad } from './$types';

// The amount comes off Open Collective rather than out of this page, so it
// can't drift from the ledger the page links to. Prerendered, so it runs once
// per build.
export const load: PageServerLoad = async ({ fetch }) => {
	const slug = sponsors.find((s) => s.name === 'Promptless')!.collective!;
	return { funding: await getSponsorFunding(fetch, slug) };
};
