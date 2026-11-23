import { cards, mostShared, sampleSize, splits, totals } from '$lib/server/guides';
import {
	decisionTable,
	guides,
	stance,
	strictnessSample,
	termPages,
	usedBy,
	type Guide
} from '$lib/server/guides';
import { decisions } from '$lib/tools/decisions';
import packages from '$lib/data/packages.json';

type Pick = { name: string; href: string; guide?: string };
type Start = { title: string; picks: Pick[]; reason: string };

const year = (date: string) => date.slice(0, 4);
const fmt = (n: number) => n.toLocaleString('en-US');

/** "a, b, and c" */
const list = (items: string[]) =>
	items.length < 3 ? items.join(' and ') : `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`;

/** What two guides decide alike, in words. */
function common(a: Guide, b: Guide) {
	return decisions
		.filter((d) => a.decisions[d.id].value !== 'none')
		.filter((d) => a.decisions[d.id].value === b.decisions[d.id].value)
		.map((d) => stance(d.id, a.decisions[d.id].value))
		.filter(Boolean);
}

/**
 * Where to start, by situation. Each reason is built from the data on this
 * page, so it changes when the data does.
 */
function starts(): Start[] {
	const g = Object.fromEntries(guides.map((x) => [x.id, x])) as Record<string, Guide>;
	const pkg = (name: string) => packages.find((p) => p.name === name);
	const guidePick = (x: Guide): Pick => ({ name: x.name, href: `/guides/${x.id}`, guide: x.id });
	// A package not built yet is named, and linked once it exists.
	const packagePick = (name: string): Pick => ({
		name,
		href: pkg(name) ? `/explorer/${name}` : ''
	});
	const total = (x: Guide) => x.strictness?.per1k.total ?? 0;

	const { google, microsoft } = g;
	const redHat = g['red-hat'];
	const asciidoc = packages.find(
		(p) => p.name === 'AsciiDoc' && redHat.repo.endsWith(String(p.repo))
	);
	const suseFormats = g.suse.install.styles.filter((s) => /asciidoc|docbook/i.test(s));
	const govUk = g['gov-uk'];
	const govSkipped = govUk.strictness?.skipped.length ?? 0;
	const topTwo = [...guides]
		.sort((a, b) => usedBy(b) - usedBy(a))
		.slice(0, 2)
		.map((x) => x.id);
	const mostUsed = topTwo.includes('google') && topTwo.includes('microsoft');

	return [
		{
			title: 'Developer product docs',
			picks: [guidePick(google), guidePick(microsoft)],
			reason: `${mostUsed ? 'The two most used guides here' : 'Used'} in public configs (${usedBy(google)} and ${usedBy(microsoft)} of ${sampleSize}). Both ask for ${list(common(google, microsoft))}. Microsoft raises more alerts on the sample: ${total(microsoft)} per 1,000 words to Google’s ${total(google)}.`
		},
		{
			title: 'AsciiDoc and enterprise docs',
			picks: [guidePick(redHat), guidePick(g.suse)],
			reason: `${redHat.official && g.suse.official ? 'Both are maintained by the companies that use them, and both' : 'Both'} changed their rules in ${list([...new Set([year(redHat.updated), year(g.suse.updated)])])}. ${asciidoc ? 'Red Hat’s repository also publishes an AsciiDoc package for markup rules' : 'Red Hat writes for large product sets'}${suseFormats.length ? `; SUSE ships rule sets for ${list(suseFormats.map((s) => (s === 'asciidoc' ? 'AsciiDoc' : 'DocBook')))}` : ''}. Red Hat asks for ${stance('contractions', redHat.decisions.contractions.value) || 'no rule on contractions'}.`
		},
		{
			title: 'Writing for the public or government',
			picks: [packagePick('PlainLanguage'), packagePick('NHS')],
			reason:
				`${pkg('PlainLanguage')?.description ?? 'Plain language rules.'} The two government guides here are community ports: GOV.UK’s rules last changed in ${year(govUk.updated)}${govSkipped ? `, and ${govSkipped} of its ${govUk.rules.length} rules don’t load in current Vale` : ''}; 18F’s last changed in ${year(g['18f'].updated)}. ${pkg('NHS') ? '' : 'An NHS package is being built.'}`.trim()
		},
		{
			title: 'An open-source project',
			picks: [packagePick('OpenSource'), guidePick(g.gitlab)],
			reason: `OpenSource checks the files a project lives by: ${
				pkg('OpenSource')
					?.description.replace(/^README and CONTRIBUTING files: /, '')
					.replace(/\.$/, '') ?? 'README and CONTRIBUTING files'
			}. GitLab is the guide an open-source project runs on its own docs: ${g.gitlab.rules.length} rules, last changed in ${year(g.gitlab.updated)}. ${pkg('Kubernetes') ? '' : 'A Kubernetes package is being built.'}`.trim()
		},
		{
			title: 'UI text',
			picks: [packagePick('Microcopy')],
			reason: `The guides here are written for documentation. Microcopy is written for interface strings: ${pkg('Microcopy')?.description.replace(/^UI text: /, '') ?? 'labels, buttons, and errors.'}`
		},
		{
			title: 'Your own house style',
			picks: [packagePick('Std')],
			reason: `Start from ${
				pkg('Std')
					?.description.replace(/^The standard library for Vale: /, '')
					.replace(/\.$/, '') ?? 'general-purpose rules'
			}, then add your product names to a vocabulary. ${fmt(guides.filter((x) => x.decisions.headings.value === 'sentence').length)} of the ${guides.length} guides here enforce sentence-case headings, if you want a default to copy.`
		}
	];
}

export const load = () => {
	const names = Object.fromEntries(guides.map((g) => [g.id, g.name]));
	return {
		cards: cards(),
		totals: totals(),
		shared: mostShared(),
		splits: splits().slice(0, 6),
		names,
		// Which terms have a page of their own.
		pages: termPages().map((t) => t.slug),
		sampleSize,
		decisions: decisionTable(),
		sample: strictnessSample(),
		starts: starts(),
		ruleCounts: Object.fromEntries(guides.map((g) => [g.id, g.rules.length]))
	};
};
