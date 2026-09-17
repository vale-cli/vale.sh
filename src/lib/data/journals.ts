// The counts behind the Journals announcement, taken from the package at
// v0.1.0: rule files per style, and the checklist items each checklist
// style has a rule for. An item is covered when a rule's message names it.
export const styles = [
	{ name: 'Journals', rules: 22, source: 'Shared conventions' },
	{ name: 'PRISMA', rules: 20, source: 'Systematic reviews' },
	{ name: 'Nature', rules: 19, source: 'Formatting guide' },
	{ name: 'PLOS', rules: 18, source: 'Submission guidelines' },
	{ name: 'CONSORT', rules: 17, source: 'Randomized trials' },
	{ name: 'STROBE', rules: 15, source: 'Observational studies' },
	{ name: 'IMRaD', rules: 10, source: 'Section structure' }
];

export const checklists = [
	{
		name: 'CONSORT 2025',
		total: 30,
		covered: [1, 2, 3, 4, 5, 6, 8, 11, 12, 13, 14, 15, 16, 18, 19, 21, 26, 27, 28]
	},
	{
		name: 'PRISMA 2020',
		total: 27,
		covered: [1, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 18, 20, 21, 22, 23, 24, 25, 26, 27]
	},
	{
		name: 'STROBE',
		total: 22,
		covered: [1, 5, 6, 7, 8, 9, 10, 12, 13, 14, 16, 19, 21, 22]
	}
];
