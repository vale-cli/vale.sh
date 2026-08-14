/**
 * Who backs Vale on Open Collective, and for how much.
 *
 * Two things read this. A spotlight page takes its own sponsor's total, which
 * used to be a literal in that page's script -- which is how Promptless came to
 * be credited with Mintlify's $1,000. The /sponsor wall takes the whole roster,
 * replacing Open Collective's SVG embeds.
 *
 * One GraphQL call serves both: Vale has ~38 backers, so fetching the member
 * list once and filtering it beats a query per caller. The site is fully
 * prerendered (see src/routes/+layout.ts), so this runs at build time and the
 * numbers refresh with every deploy.
 *
 * Verified 2026-08-14 — the fallbacks below are the real values on that date.
 */

import type { Backer } from '$lib/types/backers';

const ENDPOINT = 'https://api.opencollective.com/graphql/v2';
const COLLECTIVE = 'vale';

/** Comfortably past the current backer count; a bigger list needs paging. */
const LIMIT = 500;

/** Date the fallbacks below were last confirmed against the API. */
const FALLBACK_DATE = '2026-08-14';

/**
 * Whole US dollars, by Open Collective slug. Only the spotlight sponsors need
 * one, because only their pages must show a figure no matter what. The API
 * reports cents; `fetchBackers` converts on the way in so that nothing below
 * this line is in two units at once.
 */
const FALLBACKS: Record<string, number> = {
	mintlifydocs: 1_000,
	promptless: 1_200
};

const QUERY = `query SponsorTotals($slug: String!, $limit: Int!) {
  account(slug: $slug) {
    ... on Collective {
      members(role: BACKER, limit: $limit) {
        totalCount
        nodes {
          account { slug name imageUrl website type }
          totalDonations { valueInCents currency }
        }
      }
    }
  }
}`;

type Fetch = typeof globalThis.fetch;

/**
 * Whether `imageUrl` is a real upload rather than Open Collective's generated
 * initials tile.
 *
 * An uploaded image carries a content hash in its path
 * (`/algolia/d8c48b7/logo.png`); a generated one doesn't (`/foo/avatar.png`).
 * The generated tiles are pale blue on a fixed light ground, so they read as
 * holes on a dark page -- 15 of the 38 backers have one. Detecting them lets
 * the wall draw its own initials in the site's palette instead.
 */
function uploaded(url: unknown): url is string {
	if (typeof url !== 'string') return false;
	try {
		return new URL(url).pathname.split('/').filter(Boolean).length > 2;
	} catch {
		return false;
	}
}

export type SponsorFunding = {
	/** Formatted for display, e.g. `$1,200`. */
	amount: string;
	/** False when the API didn't answer and this is the hand-verified value. */
	live: boolean;
	/** Set only when `live` is false, so a page can date a stale figure. */
	asOf?: string;
};

function headers(): Record<string, string> {
	const h: Record<string, string> = {
		'Content-Type': 'application/json',
		'User-Agent': 'vale.sh-site-build'
	};
	// Optional, and the same shape stats.ts uses for GITHUB_TOKEN: reading off
	// globalThis because $env/*/private is unreadable while prerendering.
	const token = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
		?.env?.OPENCOLLECTIVE_TOKEN;
	if (token) h['Personal-Token'] = token;
	return h;
}

/** Every backer, richest first. */
async function fetchBackers(fetch: Fetch): Promise<Backer[]> {
	const res = await fetch(ENDPOINT, {
		method: 'POST',
		headers: headers(),
		body: JSON.stringify({ query: QUERY, variables: { slug: COLLECTIVE, limit: LIMIT } }),
		signal: AbortSignal.timeout(15_000)
	});
	if (!res.ok) throw new Error(`open collective -> ${res.status}`);

	const body = await res.json();
	// GraphQL answers 200 with an `errors` array, so a bad query looks like a
	// success until you check.
	if (body.errors?.length) throw new Error(body.errors[0].message);

	const members = body?.data?.account?.members;
	const nodes = members?.nodes;
	if (!Array.isArray(nodes) || nodes.length === 0) throw new Error('no backers came back');
	if (members.totalCount > nodes.length) {
		// Not fatal on its own -- a sponsor already in the first page still
		// resolves -- but it means LIMIT needs raising.
		console.warn(`[collective] ${members.totalCount} backers, only ${nodes.length} fetched`);
	}

	const backers: Backer[] = [];
	for (const node of nodes) {
		const account = node?.account;
		const cents = node?.totalDonations?.valueInCents;
		if (typeof account?.slug !== 'string' || typeof cents !== 'number') continue;
		// USD is the collective's currency, and every backer's total comes back
		// converted into it. Anything else means that stopped being true.
		if (node.totalDonations.currency !== 'USD') {
			console.warn(
				`[collective] skipping ${account.slug}: ${node.totalDonations.currency}, not USD`
			);
			continue;
		}
		backers.push({
			slug: account.slug,
			name: typeof account.name === 'string' ? account.name : account.slug,
			image: uploaded(account.imageUrl) ? account.imageUrl : undefined,
			website: typeof account.website === 'string' ? account.website : undefined,
			profile: `https://opencollective.com/${account.slug}`,
			total: cents / 100,
			organization: account.type === 'ORGANIZATION',
			source: 'opencollective'
		});
	}
	// Every entry here has a total; the field is optional only because a GitHub
	// sponsor has no lifetime figure to put in it.
	return backers.sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
}

// Every page that needs this prerenders in the same process, so the first
// request is the only one.
let pending: Promise<[Backer[], boolean]> | undefined;

function load(fetch: Fetch) {
	pending ??= fetchBackers(fetch).then(
		(b) => [b, true] as [Backer[], boolean],
		(err) => {
			console.warn('[collective] backer lookup failed:', err);
			return [[], false] as [Backer[], boolean];
		}
	);
	return pending;
}

/**
 * Vale's Open Collective backers, richest first.
 *
 * An outage yields an empty list rather than a stale hand-copied roster —
 * naming 38 people from memory is exactly the kind of claim that goes wrong
 * quietly. See backers.ts for the merge with GitHub.
 */
export async function getCollectiveBackers(
	fetch: Fetch
): Promise<{ backers: Backer[]; live: boolean }> {
	const [backers, live] = await load(fetch);
	return { backers, live };
}

const usd = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

/**
 * The lifetime total `slug` has given to Vale on Open Collective.
 *
 * Falls back to the last hand-verified figure rather than throwing: a sponsor's
 * page is worth publishing with a slightly stale number and worth nothing at
 * all if a rate-limited CI runner can fail the build.
 */
export async function getSponsorFunding(fetch: Fetch, slug: string): Promise<SponsorFunding> {
	const [backers] = await load(fetch);
	const match = backers.find((b) => b.slug === slug);
	const dollars = match?.total ?? FALLBACKS[slug];
	if (dollars === undefined) throw new Error(`no Open Collective total for '${slug}'`);

	// A slug the API answered for but didn't list is as stale as an outage.
	const found = match !== undefined;
	return {
		amount: usd.format(dollars),
		live: found,
		asOf: found ? undefined : FALLBACK_DATE
	};
}
