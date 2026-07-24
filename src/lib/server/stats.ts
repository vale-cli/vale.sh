/**
 * Live project stats for the "Powered by Vale" page.
 *
 * The site is fully prerendered (see src/routes/+layout.ts), so these run at
 * build time and the numbers refresh with every deploy. Each lookup falls back
 * to the last verified value, so an API outage or a rate-limited CI runner
 * degrades to a stale number rather than a broken build.
 *
 * Three GitHub API calls are made (releases pagination + contributors). Set
 * GITHUB_TOKEN in the build env to keep them off the 60/hr per-IP budget.
 *
 * Verified 2026-07-24 — the fallbacks below are the real values on that date.
 */

import type { Availability, Channel, Stats } from '$lib/types/stats';

// The project moved from the errata-ai org; errata-ai/* still redirects here.
const REPO = 'vale-cli/vale';
const DOCKER_IMAGE = 'jdkato/vale';

/** Date the fallbacks below were last confirmed by hand. */
const FALLBACK_DATE = '2026-07-24';

const FALLBACKS = {
	releases: 9_893_086,
	docker: 2_188_606,
	pypi: 1_358_908,
	conda: 138_280,
	brew: 66_557,
	chocolatey: 19_449,
	contributors: 59,
	stars: 5_586,
	wingetVersion: '3.15.1',
	snapVersion: '3.15.1',
	repologyFamilies: 17,
	backers: 38,
	yearlyIncome: 1450
};

type Fetch = typeof globalThis.fetch;

function ghHeaders(): Record<string, string> {
	const headers: Record<string, string> = {
		Accept: 'application/vnd.github+json',
		'User-Agent': 'vale.sh-site-build'
	};
	// Optional: lifts the 60/hr unauthenticated limit if the build sets it.
	// Read off globalThis because $env/*/private is unreadable while prerendering
	// and the repo has no @types/node for a bare `process`.
	const token = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
		?.env?.GITHUB_TOKEN;
	if (token) headers.Authorization = `Bearer ${token}`;
	return headers;
}

/** Runs `fn`, returning `fallback` if it throws or times out. */
async function safely<T>(label: string, fallback: T, fn: () => Promise<T>): Promise<[T, boolean]> {
	try {
		return [await fn(), true];
	} catch (err) {
		console.warn(`[stats] ${label} lookup failed, using fallback:`, err);
		return [fallback, false];
	}
}

async function json(fetch: Fetch, url: string, headers: Record<string, string> = {}) {
	const res = await fetch(url, { headers, signal: AbortSignal.timeout(15_000) });
	if (!res.ok) throw new Error(`${url} -> ${res.status}`);
	return res.json();
}

async function text(fetch: Fetch, url: string, headers: Record<string, string> = {}) {
	const res = await fetch(url, { headers, signal: AbortSignal.timeout(20_000) });
	if (!res.ok) throw new Error(`${url} -> ${res.status}`);
	return res.text();
}

/** Total download_count across every asset of every release. */
async function fetchReleases(fetch: Fetch): Promise<number> {
	let total = 0;
	// Vale has ~200 releases; cap the walk so a pagination bug can't hang a build.
	for (let page = 1; page <= 10; page++) {
		const releases = await json(
			fetch,
			`https://api.github.com/repos/${REPO}/releases?per_page=100&page=${page}`,
			ghHeaders()
		);
		if (!Array.isArray(releases)) throw new Error('unexpected releases payload');
		for (const release of releases) {
			for (const asset of release.assets ?? []) total += asset.download_count ?? 0;
		}
		if (releases.length < 100) break;
	}
	if (total === 0) throw new Error('release downloads came back as 0');
	return total;
}

/** Stargazers on the main repo, shown in the hero. */
async function fetchStars(fetch: Fetch): Promise<number> {
	const repo = await json(fetch, `https://api.github.com/repos/${REPO}`, ghHeaders());
	if (typeof repo.stargazers_count !== 'number') throw new Error('no stargazers_count');
	return repo.stargazers_count;
}

async function fetchDockerPulls(fetch: Fetch): Promise<number> {
	const repo = await json(fetch, `https://hub.docker.com/v2/repositories/${DOCKER_IMAGE}/`);
	if (typeof repo.pull_count !== 'number') throw new Error('no pull_count');
	return repo.pull_count;
}

/**
 * PyPI downloads. pypistats only retains ~180 days, so this is a six-month
 * figure and never a lifetime one.
 */
async function fetchPypi(fetch: Fetch): Promise<number> {
	const data = await json(fetch, 'https://pypistats.org/api/packages/vale/overall?mirrors=false');
	if (!Array.isArray(data?.data)) throw new Error('unexpected pypistats payload');
	const total = data.data.reduce((sum: number, d: { downloads: number }) => sum + d.downloads, 0);
	if (total === 0) throw new Error('pypi downloads came back as 0');
	return total;
}

/** Homebrew installs over the trailing 365 days — no all-time figure exists. */
async function fetchBrew(fetch: Fetch): Promise<number> {
	const formula = await json(fetch, 'https://formulae.brew.sh/api/formula/vale.json');
	const yearly = formula?.analytics?.install?.['365d'];
	// Keyed by formula name (e.g. { vale: 66557 }), so take the first entry.
	const count = yearly && Object.values(yearly)[0];
	if (typeof count !== 'number') throw new Error('no 365d install analytics');
	return count;
}

/**
 * Lifetime Chocolatey downloads. The OData feed reports per-version counts
 * only, 40 rows per page, so this walks the pages and sums them.
 */
async function fetchChocolatey(fetch: Fetch): Promise<number> {
	let total = 0;
	for (let skip = 0; skip < 400; skip += 40) {
		const url = `https://community.chocolatey.org/api/v2/Packages()?$filter=Id%20eq%20'vale'&$skip=${skip}`;
		const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
		if (!res.ok) throw new Error(`chocolatey -> ${res.status}`);
		const counts = [
			...(await res.text()).matchAll(
				/<d:VersionDownloadCount[^>]*>(\d+)<\/d:VersionDownloadCount>/g
			)
		];
		for (const [, n] of counts) total += Number(n);
		if (counts.length < 40) break;
	}
	if (total === 0) throw new Error('chocolatey downloads came back as 0');
	return total;
}

/** Lifetime conda-forge downloads across all versions. */
async function fetchConda(fetch: Fetch): Promise<number> {
	const pkg = await json(fetch, 'https://api.anaconda.org/package/conda-forge/vale');
	if (typeof pkg.ndownloads !== 'number') throw new Error('no ndownloads');
	return pkg.ndownloads;
}

/** Latest WinGet version, from winstall's embedded Next.js payload. */
async function fetchWingetVersion(fetch: Fetch): Promise<string> {
	const html = await text(fetch, 'https://winstall.app/apps/errata-ai.Vale', {
		'User-Agent': 'vale.sh-site-build'
	});
	const payload = html.match(
		/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s
	);
	if (!payload) throw new Error('no __NEXT_DATA__ on the winstall page');
	const version = JSON.parse(payload[1])?.props?.pageProps?.app?.latestVersion;
	if (typeof version !== 'string') throw new Error('no latestVersion');
	return version;
}

/** Latest stable Snap version. The Store publishes no public install counts. */
async function fetchSnapVersion(fetch: Fetch): Promise<string> {
	const info = await json(fetch, 'https://api.snapcraft.io/v2/snaps/info/vale', {
		'Snap-Device-Series': '16'
	});
	const stable = (info?.['channel-map'] ?? []).find(
		(c: { channel: { name: string; architecture: string } }) =>
			c.channel.name === 'stable' && c.channel.architecture === 'amd64'
	);
	if (!stable?.version) throw new Error('no stable amd64 channel');
	return stable.version;
}

/**
 * Distinct repository families packaging Vale, per Repology — Alpine, Arch,
 * Nix, openSUSE, FreeBSD, MacPorts, Termux, Void and friends.
 *
 * Repology lists each branch separately (alpine_3_21, alpine_edge, …), so this
 * collapses them to families; counting raw rows would nearly double the figure.
 */
async function fetchRepology(fetch: Fetch): Promise<number> {
	const packages = await json(fetch, 'https://repology.org/api/v1/project/vale', {
		'User-Agent': 'vale.sh-site-build'
	});
	if (!Array.isArray(packages) || packages.length === 0) throw new Error('no repology packages');
	const families = new Set(packages.map((p: { repo: string }) => p.repo.split('_')[0]));
	return families.size;
}

/** Backer count and yearly income from Open Collective's public JSON. */
async function fetchOpenCollective(
	fetch: Fetch
): Promise<{ backers: number; yearlyIncome: number }> {
	const c = await json(fetch, 'https://opencollective.com/vale.json');
	if (typeof c.backersCount !== 'number') throw new Error('no backersCount');
	return {
		backers: c.backersCount,
		// Amounts come back in cents.
		yearlyIncome: Math.round((c.yearlyIncome ?? 0) / 100)
	};
}

/**
 * Contributor count, read from the pagination Link header rather than by
 * walking every page.
 */
async function fetchContributors(fetch: Fetch): Promise<number> {
	const res = await fetch(
		`https://api.github.com/repos/${REPO}/contributors?per_page=1&anon=false`,
		{ headers: ghHeaders(), signal: AbortSignal.timeout(15_000) }
	);
	if (!res.ok) throw new Error(`contributors -> ${res.status}`);
	const last = res.headers.get('link')?.match(/[?&]page=(\d+)>;\s*rel="last"/);
	if (!last) throw new Error('no last-page link');
	return Number(last[1]);
}

export async function getStats(fetch: Fetch): Promise<Stats> {
	const [
		[releases, releasesLive],
		[docker, dockerLive],
		[pypi, pypiLive],
		[conda, condaLive],
		[brew, brewLive],
		[chocolatey, chocoLive],
		[winget, wingetLive],
		[snap, snapLive],
		[repology, repologyLive],
		[collective, collectiveLive],
		[contributors, contributorsLive],
		[stars, starsLive]
	] = await Promise.all([
		safely('releases', FALLBACKS.releases, () => fetchReleases(fetch)),
		safely('docker pulls', FALLBACKS.docker, () => fetchDockerPulls(fetch)),
		safely('pypi', FALLBACKS.pypi, () => fetchPypi(fetch)),
		safely('conda-forge', FALLBACKS.conda, () => fetchConda(fetch)),
		safely('brew installs', FALLBACKS.brew, () => fetchBrew(fetch)),
		safely('chocolatey', FALLBACKS.chocolatey, () => fetchChocolatey(fetch)),
		safely('winget version', FALLBACKS.wingetVersion, () => fetchWingetVersion(fetch)),
		safely('snap version', FALLBACKS.snapVersion, () => fetchSnapVersion(fetch)),
		safely('repology', FALLBACKS.repologyFamilies, () => fetchRepology(fetch)),
		safely(
			'open collective',
			{ backers: FALLBACKS.backers, yearlyIncome: FALLBACKS.yearlyIncome },
			() => fetchOpenCollective(fetch)
		),
		safely('contributors', FALLBACKS.contributors, () => fetchContributors(fetch)),
		safely('stars', FALLBACKS.stars, () => fetchStars(fetch))
	]);

	const channels: Channel[] = [
		{
			name: 'GitHub Releases',
			icon: 'github',
			value: releases,
			window: 'lifetime',
			source: `https://github.com/${REPO}/releases`,
			live: releasesLive
		},
		{
			name: 'Docker Hub',
			icon: 'docker',
			value: docker,
			window: 'lifetime',
			source: `https://hub.docker.com/r/${DOCKER_IMAGE}`,
			live: dockerLive
		},
		{
			name: 'PyPI',
			icon: 'pypi',
			value: pypi,
			window: 'past 6 mo',
			note: 'community-maintained wrapper',
			source: 'https://pypi.org/project/vale/',
			live: pypiLive
		},
		{
			name: 'conda-forge',
			icon: 'condaforge',
			value: conda,
			window: 'lifetime',
			source: 'https://anaconda.org/conda-forge/vale',
			live: condaLive
		},
		{
			name: 'Homebrew',
			icon: 'homebrew',
			value: brew,
			window: 'past 12 mo',
			source: 'https://formulae.brew.sh/formula/vale',
			live: brewLive
		},
		{
			name: 'Chocolatey',
			icon: 'chocolatey',
			value: chocolatey,
			window: 'lifetime',
			source: 'https://community.chocolatey.org/packages/vale',
			live: chocoLive
		}
	];

	const availability: Availability[] = [
		{
			name: 'WinGet',
			detail: `v${winget}`,
			source: 'https://winstall.app/apps/errata-ai.Vale',
			live: wingetLive
		},
		{
			name: 'Snap Store',
			icon: 'snapcraft',
			detail: `v${snap}`,
			source: 'https://snapcraft.io/vale',
			live: snapLive
		},
		{
			name: 'Linux & BSD',
			detail: `${repology} repositories`,
			source: 'https://repology.org/project/vale/versions',
			live: repologyLive
		}
	];

	const allLive =
		channels.every((c) => c.live) && availability.every((a) => a.live) && contributorsLive;

	return {
		channels,
		availability,
		funding: { ...collective, live: collectiveLive },
		contributors,
		stars,
		// Only claim the build date when every lookup actually succeeded —
		// otherwise some figures are the older hand-verified fallbacks.
		updated: allLive ? new Date().toISOString().slice(0, 10) : FALLBACK_DATE
	};
}
