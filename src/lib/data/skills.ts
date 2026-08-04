/**
 * Agent skills, published from `skills/` in this repository.
 *
 * A skill is a folder with a SKILL.md that an assistant reads while working in
 * someone's repository: it runs the Vale CLI, edits their files, opens their
 * pull request. Free, local, no account — the same tool a person runs by hand.
 *
 * `summary` is what the skill does; `guard` is the mistake it exists to stop,
 * because that is usually the reason to reach for one rather than let an agent
 * improvise.
 */

export type Skill = {
	name: string;
	summary: string;
	guard: string;
	/** Path within the repository, and the raw file to copy. */
	path: string;
};

const base = 'https://github.com/vale-cli/vale.sh/blob/svelte/skills';

export const skills: Skill[] = [
	{
		name: 'vale-setup',
		summary:
			'Install Vale, write a .vale.ini that matches the formats actually present, sync the styles, and get a first run.',
		guard:
			'Points Vale at the prose rather than the whole repository, and reports the first-run count instead of hiding it behind MinAlertLevel.',
		path: `${base}/vale-setup/SKILL.md`
	},
	{
		name: 'vale-fix',
		summary:
			'Fix alerts a file at a time, applying the replacement each rule defines, one pull request per file.',
		guard:
			'Error level by default, markup preserved, and never silencing a rule to make the run pass.',
		path: `${base}/vale-fix/SKILL.md`
	},
	{
		name: 'vale-triage',
		summary:
			'Turn a first run on an existing corpus into a decision per rule: fix, downgrade, or switch off.',
		guard:
			'Reports which few rules produce most of the output, so the answer is a plan rather than a raised alert level.',
		path: `${base}/vale-triage/SKILL.md`
	},
	{
		name: 'vale-vocab',
		summary:
			'Add project terms to a vocabulary so spell check accepts them, and commit it as the source it is.',
		guard:
			'The alternative — disabling Vale.Spelling over one product name — stops checking every other word in the repository.',
		path: `${base}/vale-vocab/SKILL.md`
	},
	{
		name: 'vale-ci',
		summary:
			'Run Vale in GitHub Actions, a pre-commit hook, or any other runner, with pinned versions.',
		guard:
			'Says plainly whether the job is advisory or blocking, since only error sets a non-zero exit code.',
		path: `${base}/vale-ci/SKILL.md`
	}
];
