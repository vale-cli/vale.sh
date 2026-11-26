import { json } from '@sveltejs/kit';
import { getStats } from '$lib/server/stats';
import type { RequestHandler } from './$types';

/*
	Vale's download figures, published as one file so every site that shows
	them reads the same numbers: jdkato.io fetches this daily rather than
	counting downloads itself. Prerendered, so it's exactly what this build's
	pages show, and it refreshes with every deploy (daily; see deploy.yml).
*/
export const prerender = true;

export const GET: RequestHandler = async ({ fetch }) => {
	const stats = await getStats(fetch);
	const channel = (name: string) => stats.channels.find((c) => c.name === name)?.value ?? 0;

	// Downloads of the releases published in the past year, a day: most of
	// them are CI jobs fetching a recent version.
	const yearAgo = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10);
	const perDay = Math.round(
		stats.releases.filter((r) => r.date >= yearAgo).reduce((s, r) => s + r.downloads, 0) / 365
	);

	return json({
		$comment:
			"Vale's download figures, from vale.sh's build. downloads.total is the one figure to show: GitHub Releases, Docker Hub, and conda-forge, the channels that ship their own build.",
		updated: stats.updated,
		live: stats.lifetime.live,
		downloads: {
			total: stats.lifetime.value,
			sources: stats.lifetime.sources,
			channels: {
				github: channel('GitHub Releases'),
				docker: channel('Docker Hub'),
				conda: channel('conda-forge')
			},
			perDay
		},
		releases: stats.releases,
		ranking: { brew: stats.ranking.brew, chocolatey: stats.ranking.chocolatey },
		stars: stats.stars
	});
};
