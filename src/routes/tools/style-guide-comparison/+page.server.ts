import packages from '$lib/data/packages.json';
import { topics } from '$lib/tools/guides';

/**
 * Resolves each position's Vale rule to that rule's own link.
 *
 * A rule in a package carries the URL of the section of the style guide it
 * enforces. Reading it from packages.json at build time, rather than typing it
 * into guides.ts, means a link here can't drift from the one the rule ships
 * with — and a rule that has been renamed or removed fails the build instead
 * of leaving a dead reference on the page.
 */
export const load = () => {
	const links: Record<string, string> = {};

	for (const topic of topics) {
		for (const position of Object.values(topic.positions)) {
			if (!position?.rule) continue;
			const [pkgName, ruleName] = position.rule.split('.');
			const rule = packages.find((p) => p.name === pkgName)?.rules.find((r) => r.name === ruleName);
			if (!rule) {
				throw new Error(`guides.ts names ${position.rule}, which packages.json doesn't have.`);
			}
			if (rule.link) links[position.rule] = rule.link;
		}
	}

	return { links };
};
