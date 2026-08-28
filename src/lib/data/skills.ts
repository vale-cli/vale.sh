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
	summary: string;
	guard: string;
	/** Path within the repository, and the raw file to copy. */
	path: string;
};

const base = 'https://github.com/vale-cli/agent-tools/blob/main/skills';

export const skills: Skill[] = [
	{
		name: 'setup',
		summary:
			'Install Vale, write a .vale.ini that matches the formats actually present, sync the styles, and get a first run.',
		guard:
			'Points Vale at the prose rather than the whole repository, and reports the first-run count instead of hiding it behind MinAlertLevel.',
		path: `${base}/setup/SKILL.md`
	},
	{
		name: 'fix',
		summary:
			'Fix alerts a file at a time, applying the replacement each rule defines, one pull request per file.',
		guard:
			'Error level by default, markup preserved, one branch per file, and never silencing a rule to make the run pass.',
		path: `${base}/fix/SKILL.md`
	},
	{
		name: 'triage',
		summary:
			'Turn a first run on an existing corpus into a decision per rule: fix, downgrade, or switch off.',
		guard:
			'Reports which few rules produce most of the output, so the answer is a plan rather than a raised alert level.',
		path: `${base}/triage/SKILL.md`
	},
	{
		name: 'vocab',
		summary:
			'Add project terms to a vocabulary so spell check accepts them, and commit it as the source it is.',
		guard:
			'The alternative — disabling Vale.Spelling over one product name — stops checking every other word in the repository.',
		path: `${base}/vocab/SKILL.md`
	},
	{
		name: 'ci',
		summary:
			'Run Vale in GitHub Actions, a pre-commit hook, or any other runner, with pinned versions.',
		guard:
			'Says plainly whether the job is advisory or blocking, since only error sets a non-zero exit code.',
		path: `${base}/ci/SKILL.md`
	}
];
