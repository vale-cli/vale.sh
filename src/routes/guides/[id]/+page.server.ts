import { error } from '@sveltejs/kit';
import {
	alternatives,
	focus,
	guides,
	monthsOld,
	overlap,
	rows,
	sampleSize,
	stance,
	strictnessRank,
	usedBy,
	type Guide
} from '$lib/server/guides';
import { highlight } from '$lib/server/highlight';
import { decisions } from '$lib/tools/decisions';
import type { EntryGenerator, PageServerLoad } from './$types';

// The site prerenders, so every guide page is named up front.
export const entries: EntryGenerator = () => guides.map((g) => ({ id: g.id }));

const month = (date: string) =>
	new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	});

/** "Pick this if…": what the guide decides, how hard it pushes, and what to check first. */
function pick(guide: Guide) {
	const wants = decisions.map((d) => stance(d.id, guide.decisions[d.id].value)).filter(Boolean);

	let strictness = '';
	const rank = strictnessRank(guide);
	if (guide.strictness && rank) {
		const n = guide.strictness.per1k.total;
		const where =
			rank.rank <= rank.of / 3
				? 'one of the strictest'
				: rank.rank > (rank.of * 2) / 3
					? 'one of the lightest'
					: 'in the middle';
		strictness = `${where}: ${n} alerts per 1,000 words on the sample, ${rank.rank} of ${rank.of}`;
	}

	const top = focus(guide);
	const focusText = top.length
		? `most of its rules are on ${top.map((t) => `${t.label.toLowerCase()} (${t.n})`).join(' and ')}`
		: '';

	const cautions: string[] = [];
	if (monthsOld(guide.updated) >= 12)
		cautions.push(`Its rules last changed in ${month(guide.updated)}.`);
	if (!guide.official) cautions.push(`Maintained by ${guide.owner}, not by ${guide.name}.`);
	if (guide.strictness && guide.strictness.per1k.total < 2) {
		cautions.push(
			'It flagged almost nothing on the sample, which can mean its rules are narrow rather than lenient.'
		);
	}
	const skipped = guide.strictness?.skipped.length ?? 0;
	if (skipped) {
		cautions.push(
			`${skipped} of its ${guide.rules.length} rules don’t load in current Vale, and weren’t counted.`
		);
	}
	if (guide.install.kind === 'repo') {
		cautions.push('It has no release to install; you copy its rules from the repository.');
	}
	return { wants, strictness, focus: focusText, cautions };
}

/** The .vale.ini lines that turn the guide on. */
function snippet(guide: Guide) {
	const based = `[*.md]\nBasedOnStyles = Vale, ${guide.install.styles.join(', ')}`;
	if (guide.install.line) return `StylesPath = styles\n${guide.install.line}\n\n${based}`;
	return `StylesPath = styles\n\n${based}`;
}

export const load: PageServerLoad = async ({ params }) => {
	const guide = guides.find((g) => g.id === params.id);
	if (!guide) error(404, `No style guide called "${params.id}".`);

	const install = snippet(guide);
	return {
		guide,
		// This guide's word list, sorted for reading.
		terms: rows
			.filter((r) => r.guide === guide.id)
			.map(({ find, use, rule, level }) => ({ find, use, rule, level }))
			.sort((a, b) => a.find.localeCompare(b.find, 'en', { sensitivity: 'base' })),
		overlap: overlap(guide).slice(0, 8),
		usedBy: usedBy(guide),
		sampleSize,
		others: guides.filter((g) => g.id !== guide.id).map((g) => ({ id: g.id, name: g.name })),
		updated: month(guide.updated),
		rank: strictnessRank(guide),
		pick: pick(guide),
		alternatives: alternatives(guide),
		decisions: decisions.map((d) => ({ id: d.id, question: d.label, ...guide.decisions[d.id] })),
		install,
		installHtml: await highlight(install, 'ini')
	};
};
