import google from '$lib/data/tools/guide-Google.json';
import microsoft from '$lib/data/tools/guide-Microsoft.json';
import redhat from '$lib/data/tools/guide-RedHat.json';

/**
 * What the page says about each guide before its rules are downloaded: how
 * many rules run, and which were left out. Read at build time, so the numbers
 * on the page are the ones in the data.
 */
export const load = () => ({
	guides: Object.fromEntries(
		[google, microsoft, redhat].map((g) => [
			g.name,
			{ rules: g.rules.length, version: g.version, skipped: g.skipped.map((s) => s.name) }
		])
	) as Record<string, { rules: number; version: string; skipped: string[] }>
});
