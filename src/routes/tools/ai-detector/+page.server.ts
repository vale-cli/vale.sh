import aiTells from '$lib/data/tools/ai-tells.json';
import modelese from '$lib/data/tools/modelese.json';

/**
 * Runs at build time, so only the counts go into the page. The patterns themselves are a 200 KB
 * module the page imports after it has painted, so they aren't in the HTML or
 * the first script.
 */
export const load = () => ({
	rules: aiTells.rules.length,
	version: aiTells.version,
	homepage: aiTells.homepage,
	// What the overall read catches on held-out model text, at the two
	// thresholds it draws: where 5% and 1% of human writing lands.
	caught5: Math.round((modelese.thresholds.general.caught5 ?? 0) * 100),
	caught1: Math.round((modelese.thresholds.general.caught1 ?? 0) * 100)
});
