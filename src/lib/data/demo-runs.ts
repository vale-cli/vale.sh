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
		commit: '86dd043',
		file: 'content/manuals/engine/install/_index.md',
		alerts: [
			{
				loc: '52:1',
				sev: 'error',
				msg: "Use 'Docker Engine' instead of 'Docker CE'.",
				rule: 'Docker.Forbidden'
			},
			{
				loc: '58:1',
				sev: 'suggestion',
				msg: "Consider using 'select' instead of 'Click'",
				rule: 'Docker.RecommendedWords'
			},
			{
				loc: '131:35',
				sev: 'warning',
				msg: "Avoid using first-person plural like 'we'.",
				rule: 'Docker.We'
			},
			{
				loc: '131:67',
				sev: 'warning',
				msg: "Avoid using first-person plural like 'our'.",
				rule: 'Docker.We'
			}
		],
		summary: '1 error, 2 warnings and 1 suggestion in 1 file.'
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
				rule: 'RedHat.Headings'
			},
			{
				loc: '32:60',
				sev: 'suggestion',
				msg: 'Separate words by underscores in user-replaced values.',
				rule: 'RedHat.UserReplacedValues'
			},
			{
				loc: '36:58',
				sev: 'warning',
				msg: 'Do not use "please" in technical documentation.',
				rule: 'RedHat.DoNotUseTerms'
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
				rule: 'circleci-docs.Passive'
			},
			{
				loc: '97:123',
				sev: 'error',
				msg: "'This is' is an unclear antecedent. Clarify what 'this' refers to.",
				rule: 'circleci-docs.UnclearAntecedent'
			},
			{
				loc: '103:149',
				sev: 'warning',
				msg: 'Possible future tense.',
				rule: 'circleci-docs.FutureTense'
			},
			{
				loc: '103:185',
				sev: 'warning',
				msg: 'Possible future tense.',
				rule: 'circleci-docs.FutureTense'
			}
		],
		summary: '1 error, 2 warnings and 1 suggestion in 1 file.'
	}
];
