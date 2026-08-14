/**
 * Vale's sponsors on GitHub, past and present, for the wall Open Collective
 * also feeds.
 *
 * GitHub publishes no lifetime total per sponsor -- only a tier. So this asks
 * for two things and reconstructs one:
 *
 *   sponsorshipsAsMaintainer   who, at what rate, since when, still active
 *   sponsorsActivities         the log, for the date a cancelled one ended
 *
 * A one-off's tier price *is* its total, exactly. A recurring one is rate x
 * whole billing cycles between start and end, which is within a single payment
 * of the truth -- a cancellation takes effect at the end of a cycle and the log
 * records when it was requested. Those carry `estimated`, and the wall marks
 * them. The reconstruction assumes the rate never changed, which holds while
 * the log has no TIER_CHANGE entries; one appearing is worth revisiting this.
 *
 * Needs a token: GitHub's GraphQL endpoint rejects anonymous requests even for
 * public data, and `tier` is null unless that token carries `read:user`. With
 * no token the whole thing returns empty and the wall is Open Collective only.
 *
 * https://docs.github.com/en/sponsors/integrating-with-github-sponsors/getting-started-with-the-sponsors-graphql-api
 */

// A namespace import, not `import { GITHUB_TOKEN }`: SvelteKit generates this
// module from whatever is actually defined, so naming a missing variable is a
// build error. This way an absent token is just `undefined`.
import * as privateEnv from '$env/static/private';
import type { Backer } from '$lib/types/backers';

const ENDPOINT = 'https://api.github.com/graphql';
const MAINTAINER = 'jdkato';

// `activeOnly: false` is the point of the whole exercise -- the default hides
// everyone who has ever stopped. `includePrivate` stays false: a sponsor who
// chose privacy isn't going on a public wall.
const QUERY = `query Sponsors($login: String!) {
  user(login: $login) {
    sponsorshipsAsMaintainer(first: 100, includePrivate: false, activeOnly: false) {
      nodes {
        createdAt
        isActive
        isOneTimePayment
        tier { monthlyPriceInDollars }
        sponsorEntity {
          __typename
          ... on User { login name avatarUrl websiteUrl }
          ... on Organization { login name avatarUrl websiteUrl }
        }
      }
    }
    sponsorsActivities(first: 100, period: ALL, includeAsSponsor: false) {
      nodes {
        action
        timestamp
        sponsor {
          __typename
          ... on User { login }
          ... on Organization { login }
        }
      }
    }
  }
}`;

type Fetch = typeof globalThis.fetch;

function token(): string | undefined {
	// The static import is the one that reads .env, and the only one readable
	// while prerendering -- `$env/dynamic/private` throws there. The fallback
	// covers CI, where the variable is genuinely exported into the environment.
	const fromEnvFile = (privateEnv as Record<string, string | undefined>).GITHUB_TOKEN;
	return (
		fromEnvFile ||
		(globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
			?.GITHUB_TOKEN
	);
}

/**
 * How many times a recurring sponsorship has been charged.
 *
 * Anniversaries passed, not days/30: a sponsor billed on the 12th pays once per
 * 12th whatever the month's length.
 *
 * The `+1` for a live sponsorship is the payment taken the day it started --
 * without it someone who signed up last week reads as having given nothing. A
 * cancelled one gets no such bump, because the date in the log is the renewal
 * that never happened: appwrite ran 2023-07-12 to 2024-06-12 and paid for July
 * through May, which is the eleven anniversaries and not twelve.
 */
function payments(from: Date, to: Date, active: boolean): number {
	let n = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
	if (to.getDate() < from.getDate()) n -= 1;
	return Math.max(n, 0) + (active ? 1 : 0);
}

async function fetchSponsors(fetch: Fetch, now: Date): Promise<Backer[]> {
	const auth = token();
	if (!auth) throw new Error('no GITHUB_TOKEN in the build env');

	const res = await fetch(ENDPOINT, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': 'vale.sh-site-build',
			Authorization: `Bearer ${auth}`
		},
		body: JSON.stringify({ query: QUERY, variables: { login: MAINTAINER } }),
		signal: AbortSignal.timeout(15_000)
	});
	if (!res.ok) throw new Error(`github -> ${res.status}`);

	const body = await res.json();
	// GraphQL answers 200 with an `errors` array; a missing scope lands here
	// rather than as a failed request.
	if (body.errors?.length) throw new Error(body.errors[0].message);

	const user = body?.data?.user;
	const nodes = user?.sponsorshipsAsMaintainer?.nodes;
	if (!Array.isArray(nodes)) throw new Error('unexpected sponsorships payload');

	// When each cancelled sponsorship ended. The log is newest-first, so the
	// first entry per login is the most recent cancellation.
	const ended = new Map<string, Date>();
	for (const a of user?.sponsorsActivities?.nodes ?? []) {
		const login = a?.sponsor?.login;
		if (a?.action !== 'CANCELLED_SPONSORSHIP' || typeof login !== 'string') continue;
		if (!ended.has(login)) ended.set(login, new Date(a.timestamp));
	}
	if (
		(user?.sponsorsActivities?.nodes ?? []).some(
			(a: { action: string }) => a?.action === 'TIER_CHANGE'
		)
	) {
		console.warn(
			'[github-sponsors] a TIER_CHANGE is in the log — reconstructed totals assume a flat rate'
		);
	}

	const sponsors: Backer[] = [];
	let priced = 0;
	for (const node of nodes) {
		const who = node?.sponsorEntity;
		if (typeof who?.login !== 'string') continue;

		const rate = node?.tier?.monthlyPriceInDollars;
		const oneTime = node?.isOneTimePayment === true;
		const active = node?.isActive === true;
		if (typeof rate === 'number') priced++;

		let total: number | undefined;
		let estimated = false;
		if (typeof rate === 'number') {
			if (oneTime) {
				// The tier price is the whole payment. Nothing to reconstruct.
				total = rate;
			} else {
				const start = new Date(node.createdAt);
				const stop = ended.get(who.login) ?? now;
				total = rate * payments(start, stop, active);
				estimated = true;
			}
		}

		sponsors.push({
			slug: who.login,
			name: typeof who.name === 'string' && who.name ? who.name : who.login,
			image: typeof who.avatarUrl === 'string' ? who.avatarUrl : undefined,
			website: typeof who.websiteUrl === 'string' && who.websiteUrl ? who.websiteUrl : undefined,
			profile: `https://github.com/${who.login}`,
			total,
			monthly: oneTime ? undefined : (rate ?? undefined),
			estimated,
			active,
			organization: who.__typename === 'Organization',
			source: 'github'
		});
	}

	// The one failure that looks like success: right sponsors, no figures.
	if (sponsors.length && !priced) {
		console.warn(
			'[github-sponsors] no tier on any sponsorship — GITHUB_TOKEN is missing the read:user scope, so amounts are omitted'
		);
	}
	return sponsors;
}

let pending: Promise<Backer[]> | undefined;

/**
 * GitHub sponsors, or an empty list.
 *
 * Empty is the normal result on a build with no token, not an error worth
 * failing over -- the wall simply shows the Open Collective side.
 */
export function getGitHubSponsors(fetch: Fetch): Promise<Backer[]> {
	pending ??= fetchSponsors(fetch, new Date()).catch((err) => {
		console.warn('[github-sponsors] lookup skipped:', err.message);
		return [];
	});
	return pending;
}
