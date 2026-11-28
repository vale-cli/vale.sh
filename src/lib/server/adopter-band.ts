import adopters from '$lib/data/adopters.json';
import stories from '$lib/data/stories.json';
import { sectors, sectorSlug } from '$lib/data/sectors';
import type { AdopterBand } from '$lib/types/adopter-band';

/**
 * The landing page's adopter band, worked out at build time.
 *
 * The band shows four stories, twelve marks, and a count per sector. Doing
 * the selection here keeps the full adopter list out of the page's script:
 * the browser gets the sixteen entries it draws and nothing else.
 */

type Adopter = {
	name: string;
	category: string;
	context: string;
	url: string;
	github?: string;
	avatar?: string;
	logo?: string;
	icon?: string;
};

const all = adopters as Adopter[];

/*
	A logo wall asserts that a company uses the tool; this band shows where to
	go and check. Each mark's tooltip names the evidence:

	  - a .vale.ini in a public repo  -> the path and the repository
	  - a page the team wrote about   -> the host

	Both are somewhere a reader can open, which is the point.
*/
const CONFIG =
	/^https:\/\/github\.com\/([^/]+\/[^/]+)\/blob\/[^/]+\/(.*(?:\.vale\.ini|_vale\.ini|vale\.ini))$/;

const REPO = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/?$/;

function receipt(url: string): string {
	const config = CONFIG.exec(url);
	if (config) return `${config[1]} · ${config[2]}`;
	const repo = REPO.exec(url);
	if (repo) return repo[1];
	return new URL(url).hostname.replace(/^www\./, '');
}

/*
	The biggest names, gated by proof: each mark has to land on a real
	config or a CI job, since a visitor who clicks and finds a thin page
	stops believing the rest. A team with a story card above is skipped
	here, so no name appears twice; the list runs longer than twelve so
	the row stays full whichever teams the cards take.
*/
const FEATURED = [
	'Amazon Web Services',
	'Microsoft',
	'NVIDIA',
	'Epic Games',
	'GitHub',
	'Docker',
	'Red Hat',
	'GitLab',
	'Datadog',
	'MongoDB',
	'MetaMask',
	'GOV.UK',
	'Discord',
	'SAP',
	'Spotify',
	'Grafana Labs',
	'Texas Instruments'
];

export function adopterBand(): AdopterBand {
	const byName = new Map(all.map((a) => [a.name, a]));

	/*
		Four teams, one figure each, read from the team's own page: the number
		leads, the way a customer page leads with "350 million daily users"
		rather than a logo. Resolved against the data so the mark comes from
		the adopter entry, and validated in script/adopters.mjs.
	*/
	const featuredStories = stories.flatMap((st) => {
		const adopter = byName.get(st.name);
		if (!adopter) return [];
		return [{ ...st, icon: adopter.icon, avatar: adopter.avatar }];
	});

	const storied = new Set(stories.map((st) => st.name));
	const marks = FEATURED.filter((name) => !storied.has(name))
		.slice(0, 12)
		.flatMap((name) => {
			const adopter = byName.get(name);
			if (!adopter) return [];
			return [
				{
					name: adopter.name,
					url: adopter.url,
					context: adopter.context,
					avatar: adopter.avatar,
					receipt: receipt(adopter.url),
					// BrandIcon resolves a Simple Icons glyph, then the avatar, then a
					// monogram. Most entries name their glyph; fall back to the key the
					// name implies for the ones that don't.
					slug: adopter.icon ?? name.toLowerCase().replace(/[^a-z0-9]/g, '')
				}
			];
		});

	// The nine sectors, each a link to its page under /adopters/sector.
	const chips = sectors.map((s) => ({
		name: s.name,
		count: all.filter((a) => a.category === s.name).length,
		href: `/adopters/sector/${sectorSlug(s.name)}`
	}));

	return { stories: featuredStories, marks, chips, total: all.length };
}
