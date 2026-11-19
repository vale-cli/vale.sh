import google from '$lib/data/tools/guide-Google.json';
import microsoft from '$lib/data/tools/guide-Microsoft.json';
import redhat from '$lib/data/tools/guide-RedHat.json';
import { summarize, type RuleSummary } from '$lib/tools/topics';

/**
 * The map of each guide: every rule, its topic, and a few of the things it
 * flags. Built here, at build time, so the whole map is in the page's HTML
 * and a reader can explore a guide before any rules are downloaded. The
 * patterns themselves stay in the per-guide files the page fetches on demand.
 */
export const load = () => ({
	guides: Object.fromEntries(
		[google, microsoft, redhat].map((g) => [
			g.name,
			{
				version: g.version,
				skipped: g.skipped.map((s) => s.name),
				rules: g.rules.map((r) => summarize(r as never))
			}
		])
	) as Record<string, { version: string; skipped: string[]; rules: RuleSummary[] }>
});
