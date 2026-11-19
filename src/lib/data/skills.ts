/**
 * Agent skills, published from the vale-cli/agent-tools repository.
 *
 * They live there rather than here because that repository is also the Claude
 * plugin that installs them; keeping a second copy beside this page meant two
 * sources to edit and, in time, two that disagreed.
 *
 * A skill is a folder with a SKILL.md that an assistant reads while working in
 * someone's repository: it runs the Vale CLI, edits their files, opens their
 * pull request. Free, local, no account — the same tool a person runs by hand.
 *
 * `summary` is what the skill does; `guard` is the mistake it exists to stop,
 * because that is usually the reason to reach for one rather than let an agent
 * improvise.
 *
 * Each skill states its own trigger phrases, checks its prerequisites before
 * touching anything, and ends with a report — an agent that cannot run Vale
 * should say so, not improvise around it.
 */

export type Skill = {
	/** The folder in agent-tools, which is also what the plugin calls it. */
	name: string;
	/** What someone says that brings it up. */
	ask: string;
	summary: string;
	guard: string;
	/** Path within the repository, and the raw file to copy. */
	path: string;
};

export type SkillGroup = {
	title: string;
	note: string;
	skills: Skill[];
};

const base = 'https://github.com/vale-cli/agent-tools/blob/main/skills';
const at = (name: string) => `${base}/${name}/SKILL.md`;

export const skillGroups: SkillGroup[] = [
	{
		title: 'Get set up',
		note: 'From no Vale to a baseline the team can keep.',
		skills: [
			{
				name: 'onboard',
				ask: 'set up vale end to end',
				summary:
					'Try the style packages against your docs in a temp directory, draft a vocabulary, a decision per noisy rule, and the CI job, and show one proposal with before and after counts.',
				guard:
					'Nothing is written until you say yes, and the result is a pull request whose description is the proposal.',
				path: at('onboard')
			},
			{
				name: 'setup',
				ask: 'add prose linting',
				summary:
					'Install Vale, write a .vale.ini that matches the formats actually present, sync the styles, and get a first run. Covers translated docs and the comments in source code.',
				guard:
					'Points Vale at the prose rather than the whole repository, and reports the first-run count instead of hiding it behind MinAlertLevel.',
				path: at('setup')
			},
			{
				name: 'doctor',
				ask: 'why is the hook silent',
				summary:
					'Check a setup end to end: the binary, the configuration, the synced styles, the vocabulary, and a real run on a real file.',
				guard:
					'Gives the command that fixes each thing that is broken, and fixes nothing without being asked.',
				path: at('doctor')
			}
		]
	},
	{
		title: 'Make the style yours',
		note: 'House choices, your own rules, and the guide that explains them.',
		skills: [
			{
				name: 'tune',
				ask: 'use title case headings',
				summary:
					'Change one style choice in plain words: headings, contractions, “we”, passive voice, preferred terms. Ships tested templates for the choices no package covers.',
				guard:
					'Counts what the change flags before writing it, and records the reason beside the line in the configuration.',
				path: at('tune')
			},
			{
				name: 'from-guide',
				ask: 'enforce our style guide',
				summary:
					'Turn a written style guide into the project’s own rules, each linked to its section and tested against the guide’s own do and don’t examples.',
				guard:
					'Says which statements cannot be checked instead of approximating a judgment call with a word list.',
				path: at('from-guide')
			},
			{
				name: 'rule',
				ask: 'flag this phrase',
				summary:
					'Write one rule for a house convention, with test cases beside it, and prove it with vale test and a run on the real corpus.',
				guard:
					'A rule that matches nothing loads and reports success, so every rule ships with a case that fires and a case that must not.',
				path: at('rule')
			},
			{
				name: 'write-guide',
				ask: 'document our vale rules',
				summary:
					'Write a readable style guide from the configuration: what blocks a merge, the style choices and why, the vocabulary. In Markdown, MDX, AsciiDoc, reStructuredText, Org, or HTML.',
				guard:
					'Every claim about what is enforced is read from the configuration, and no reason is stated that the project did not record.',
				path: at('write-guide')
			},
			{
				name: 'vocab',
				ask: 'stop flagging our product name',
				summary:
					'Add project terms to a vocabulary, import a word list kept for another spell checker, and set up a regional or other-language dictionary.',
				guard:
					'The alternative, disabling Vale.Spelling over one product name, stops checking every other word in the repository.',
				path: at('vocab')
			},
			{
				name: 'triage',
				ask: 'where do we start',
				summary:
					'Turn a first run on an existing corpus into a decision per rule: fix, keep, downgrade, or switch off, written into .vale.ini with the reason.',
				guard:
					'Reports which few rules produce most of the output, so the answer is a plan rather than a raised alert level.',
				path: at('triage')
			},
			{
				name: 'ignore',
				ask: 'it’s flagging our shortcodes',
				summary:
					'Take text that is not prose out of Vale’s view: shortcodes, templating tags, generated blocks, one quoted passage.',
				guard:
					'Uses the narrowest tool that works, a pattern or a named-rule comment, so a false positive never costs a rule its true ones.',
				path: at('ignore')
			}
		]
	},
	{
		title: 'Keep it passing',
		note: 'Fixes, the pipeline, and the commit log.',
		skills: [
			{
				name: 'fix',
				ask: 'make vale pass',
				summary:
					'Fix alerts a file at a time, applying the replacement each rule defines, one pull request per file.',
				guard:
					'Error level by default, markup preserved, one branch per file, and never silencing a rule to make the run pass.',
				path: at('fix')
			},
			{
				name: 'ci',
				ask: 'run this on PRs',
				summary:
					'Generate the GitHub Actions workflow or the pre-commit entry from what the repository already has. Asks what it should look at, what to report, and when to fail.',
				guard:
					'Says plainly whether the job is advisory or blocking, since only error sets a non-zero exit code.',
				path: at('ci')
			},
			{
				name: 'commits',
				ask: 'lint our commit messages',
				summary:
					'Score your recent history against the common conventions, set up the one it already follows, and add the hook and the CI check.',
				guard:
					'Says how much of the history passes a convention before a hook starts rejecting commits.',
				path: at('commits')
			}
		]
	}
];

/** Every skill, in the order the groups list them. */
export const skills: Skill[] = skillGroups.flatMap((group) => group.skills);
