import aiTells from '$lib/data/tools/ai-tells.json';

/**
 * Runs at build time, so only the counts go into the page. The patterns themselves are a 200 KB
 * module the page imports after it has painted, so they aren't in the HTML or
 * the first script.
 */
export const load = () => ({
	rules: aiTells.rules.length,
	version: aiTells.version,
	homepage: aiTells.homepage
});
