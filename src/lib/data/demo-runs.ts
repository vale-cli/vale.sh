/**
 * The hero demo: one paragraph, three style guides.
 *
 * This is the only place on the site where the prose is ours. Everywhere else
 * -- /features/speed, /adopters -- reports Vale run against real repositories
 * at pinned commits, and that is where the evidence belongs. A hero has a
 * different job: a few seconds to show what a prose linter *does*. A real
 * file's complete output is the wrong tool for that, because it is whatever
 * the file happened to contain -- in practice three near-identical
 * passive-voice alerts and a rule nobody can evaluate at a glance.
 *
 * So the paragraph is written, and the alerts are not. Each run is the genuine
 * output of `vale` against demo-sample.md with `BasedOnStyles` set to that one
 * style, captured with:
 *
 *     vale sync                      # Packages = Microsoft, Google, RedHat
 *     vale --no-wrap demo-sample.md
 *
 * Three styles on identical prose is the demonstration: Microsoft alone
 * objects to `click`, Google alone to `will`, Red Hat alone to `whitelist`,
 * `please` and `a number of`. All three flag "In order to" and the passive, at
 * different severities and in different words. That is the argument the
 * tagline makes, shown instead of claimed.
 */
export type Severity = 'error' | 'warning' | 'suggestion';

export type Alert = {
	/** line:column into demo-sample.md, as Vale prints it. */
	loc: string;
	sev: Severity;
	msg: string;
	rule: string;
	/**
	 * The exact text Vale flagged, so the demo can mark it in the sample.
	 *
	 * Vale prints where an alert starts but not how far it runs, so this comes
	 * from its JSON output. script/demo checks every one against demo-sample.md
	 * and fails if it does not sit at the stated column -- marking the wrong
	 * words would be worse than marking none.
	 */
	match: string;
};

export type StyleRun = {
	id: string;
	/** The style as a reader knows it. */
	name: string;
	/** The package name, which is also its Style Explorer page. */
	pkg: string;
	/** What the style is, in one clause. */
	blurb: string;
	alerts: Alert[];
	/** Vale's own summary line, verbatim. */
	summary: string;
};

/** The file name shown in the prompt. The prose itself is demo-sample.md. */
export const sampleFile = 'deploy.md';

export const styleRuns: StyleRun[] = [
	{
		id: 'microsoft',
		name: 'Microsoft',
		pkg: 'Microsoft',
		blurb: 'Microsoft Writing Style Guide',
		alerts: [
			{
				loc: '1:8',
				sev: 'warning',
				msg: "Use 'select' instead of the input-specific verb 'click'.",
				rule: 'Microsoft.UIVerbs',
				match: 'click'
			},
			{
				loc: '1:55',
				sev: 'suggestion',
				msg: "'be triggered' looks like passive voice.",
				rule: 'Microsoft.Passive',
				match: 'be triggered'
			},
			{
				loc: '2:16',
				sev: 'suggestion',
				msg: "Consider using 'to' instead of 'In order to'.",
				rule: 'Microsoft.Wordiness',
				match: 'In order to'
			},
			{
				loc: '4:26',
				sev: 'error',
				msg: "Use 'for example' instead of 'e.g. '.",
				rule: 'Microsoft.Foreign',
				match: 'e.g. '
			}
		],
		summary: '1 error, 1 warning and 2 suggestions in 1 file.'
	},
	{
		id: 'google',
		name: 'Google',
		pkg: 'Google',
		blurb: 'Google developer documentation style guide',
		alerts: [
			{
				loc: '1:50',
				sev: 'warning',
				msg: "Avoid using 'will'.",
				rule: 'Google.Will',
				match: 'will'
			},
			{
				loc: '1:55',
				sev: 'suggestion',
				msg: "In general, use active voice instead of passive voice ('be triggered').",
				rule: 'Google.Passive',
				match: 'be triggered'
			},
			{
				loc: '2:16',
				sev: 'warning',
				msg: "Use 'to' instead of 'In order to'.",
				rule: 'Google.WordListCase',
				match: 'In order to'
			},
			{
				loc: '4:26',
				sev: 'error',
				msg: "Use 'for example' instead of 'e.g.'.",
				rule: 'Google.Latin',
				match: 'e.g.'
			}
		],
		summary: '1 error, 2 warnings and 1 suggestion in 1 file.'
	},
	{
		id: 'redhat',
		name: 'Red Hat',
		pkg: 'RedHat',
		blurb: 'Red Hat supplementary style guide',
		alerts: [
			{
				loc: '1:55',
				sev: 'suggestion',
				msg: "'be triggered' is passive voice. In general, use active voice. Consult the style guide for acceptable use of passive voice.",
				rule: 'RedHat.PassiveVoice',
				match: 'be triggered'
			},
			{
				loc: '2:16',
				sev: 'warning',
				msg: "Consider using 'to' rather than 'In order to' unless updating existing content that uses the term.",
				rule: 'RedHat.TermsWarnings',
				match: 'In order to'
			},
			{
				loc: '2:49',
				sev: 'warning',
				msg: 'Do not use "please" in technical documentation.',
				rule: 'RedHat.DoNotUseTerms',
				match: 'please'
			},
			{
				loc: '3:1',
				sev: 'warning',
				msg: "Use 'allowlist' rather than 'whitelist'.",
				rule: 'RedHat.ConsciousLanguage',
				match: 'whitelist'
			},
			{
				loc: '3:28',
				sev: 'error',
				msg: "Use 'several' rather than 'a number of'.",
				rule: 'RedHat.TermsErrors',
				match: 'a number of'
			}
		],
		summary: '1 error, 3 warnings and 1 suggestion in 1 file.'
	}
];
