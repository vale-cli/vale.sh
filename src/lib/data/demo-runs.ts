/**
 * Real Vale output, captured from the projects /features/speed measures.
 *
 * Each entry is one file's COMPLETE output -- every alert Vale raised, in the
 * order it raised them, with the summary line it printed. Nothing is trimmed
 * to fit, because a trimmed list would misreport how noisy a rule set is.
 *
 * To regenerate an entry, clone the repo at `commit`, then from its root:
 *
 *     vale sync           # only if the project's .vale.ini lists Packages
 *     vale --no-wrap <file>
 *
 * Each project supplies its own .vale.ini and its own styles; none of this is
 * a configuration written to look good.
 */
export type Severity = 'error' | 'warning' | 'suggestion';

export type Alert = {
	/** line:column, as Vale prints it. */
	loc: string;
	sev: Severity;
	msg: string;
	rule: string;
	/**
	 * The exact text Vale flagged, so the demo can mark it in the source line.
	 *
	 * Vale prints where an alert starts but not how far it runs, so this is
	 * recorded by hand. script/demo checks every one against the file at
	 * `commit` and fails if it does not sit at the stated column -- marking the
	 * wrong words would be worse than marking none.
	 */
	match: string;
};

export type DemoRun = {
	id: string;
	name: string;
	/** Logo, already in static/users/avatars. */
	avatar: string;
	/** Markup Vale had to parse before it could read the prose. */
	format: string;
	/** Key into brandIcons for that markup's mark -- reStructuredText uses Sphinx's. */
	formatIcon: string;
	/** Shown in the title bar. */
	repo: string;
	commit: string;
	file: string;
	alerts: Alert[];
	/** Vale's own summary line, verbatim. */
	summary: string;
};

export const demoRuns: DemoRun[] = [
	{
		id: 'docker',
		name: 'Docker',
		avatar: '/users/avatars/docker.png',
		format: 'Markdown',
		formatIcon: 'markdown',
		repo: 'docker/docs',
		commit: 'bf47d79',
		file: 'content/manuals/engine/swarm/how-swarm-mode-works/services.md',
		alerts: [
			{
				loc: '11:70',
				sev: 'suggestion',
				msg: "Consider using 'want' instead of 'wish'",
				rule: 'Docker.RecommendedWords',
				match: 'wish'
			},
			{
				loc: '89:77',
				sev: 'warning',
				msg: "Consider removing 'very'.",
				rule: 'Docker.Avoid',
				match: 'very'
			},
			{
				loc: '91:3',
				sev: 'warning',
				msg: "Consider removing 'really'.",
				rule: 'Docker.Avoid',
				match: 'really'
			},
			{
				loc: '104:32',
				sev: 'warning',
				msg: "Use the Oxford comma in 'deployments, replicated and global.'.",
				rule: 'Docker.OxfordComma',
				match: 'deployments, replicated and global.'
			},
			{
				loc: '119:10',
				sev: 'suggestion',
				msg: "Consider using 'versus' instead of 'vs'",
				rule: 'Docker.RecommendedWords',
				match: 'vs'
			}
		],
		summary: '0 errors, 3 warnings and 2 suggestions in 1 file.'
	},
	{
		id: 'ti',
		name: 'Texas Instruments',
		avatar: '/users/avatars/TexasInstruments.png',
		format: 'reStructuredText',
		formatIcon: 'sphinx',
		repo: 'TexasInstruments/processor-sdk-doc',
		commit: 'ccab88e',
		file: 'source/devices/AM62X/debian/index.rst',
		alerts: [
			{
				loc: '4:1',
				sev: 'suggestion',
				msg: "Use sentence-style capitalization in 'Debian Developer's Guide'.",
				rule: 'RedHat.Headings',
				match: "Debian Developer's Guide"
			},
			{
				loc: '32:60',
				sev: 'suggestion',
				msg: 'Separate words by underscores in user-replaced values.',
				rule: 'RedHat.UserReplacedValues',
				match: '<technical-support>'
			},
			{
				loc: '36:58',
				sev: 'warning',
				msg: 'Do not use "please" in technical documentation.',
				rule: 'RedHat.DoNotUseTerms',
				match: 'please'
			}
		],
		summary: '0 errors, 1 warning and 2 suggestions in 1 file.'
	},
	{
		id: 'circleci',
		name: 'CircleCI',
		avatar: '/users/avatars/circleci.png',
		format: 'AsciiDoc',
		formatIcon: 'asciidoctor',
		repo: 'circleci/circleci-docs',
		commit: '6ae1fec',
		file: 'docs/guides/modules/execution-managed/pages/using-arm.adoc',
		alerts: [
			{
				loc: '96:37',
				sev: 'suggestion',
				msg: "'are supported' may be passive voice. Use active voice if you can.",
				rule: 'circleci-docs.Passive',
				match: 'are supported'
			},
			{
				loc: '97:123',
				sev: 'error',
				msg: "'This is' is an unclear antecedent. Clarify what 'this' refers to.",
				rule: 'circleci-docs.UnclearAntecedent',
				match: 'This is'
			},
			{
				loc: '103:149',
				sev: 'warning',
				msg: 'Possible future tense.',
				rule: 'circleci-docs.FutureTense',
				match: 'will'
			},
			{
				loc: '103:185',
				sev: 'warning',
				msg: 'Possible future tense.',
				rule: 'circleci-docs.FutureTense',
				match: 'will'
			}
		],
		summary: '1 error, 2 warnings and 1 suggestion in 1 file.'
	}
];
