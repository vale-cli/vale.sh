// The Diataxis package at v0.1.0: the four kinds of documentation on the
// framework's two axes, the rules each kind has, and one page run through
// all four styles at once. The alerts are Vale's own output on that page.
export const repo = 'https://github.com/jdkato/diataxis';

export type Kind = {
	style: 'Tutorial' | 'HowTo' | 'Reference' | 'Explanation';
	label: string;
	// The framework's axes: a page serves study or work, through action or
	// cognition. Tutorials are study by action; how-to guides, work by
	// action; reference, work by cognition; explanation, study by cognition.
	when: 'study' | 'work';
	how: 'action' | 'cognition';
	purpose: string;
	rules: { name: string; checks: string }[];
	// Tailwind classes for the kind's color, in light and dark.
	tone: string;
	swatch: string;
};

export const kinds: Kind[] = [
	{
		style: 'Tutorial',
		label: 'Tutorial',
		when: 'study',
		how: 'action',
		purpose: 'Learning by doing',
		rules: [
			{ name: 'Opening', checks: 'says what the learner will build' },
			{ name: 'Steps', checks: 'has numbered steps' },
			{ name: 'Options', checks: 'offers no choices' },
			{ name: 'Explanation', checks: 'keeps the why out' },
			{ name: 'Expectations', checks: 'says what the learner will see' },
			{ name: 'We', checks: 'speaks as "we"' }
		],
		tone: 'bg-sky-500/15 text-sky-700 ring-sky-500/30 dark:text-sky-300',
		swatch: 'bg-sky-500'
	},
	{
		style: 'HowTo',
		label: 'How-to guide',
		when: 'work',
		how: 'action',
		purpose: 'Reaching a goal',
		rules: [
			{ name: 'Title', checks: 'is named for the goal' },
			{ name: 'Opening', checks: 'says what it shows the reader' },
			{ name: 'Steps', checks: 'has numbered steps' },
			{ name: 'Teaching', checks: 'does not teach' },
			{ name: 'Explanation', checks: 'keeps the why out' },
			{ name: 'Imperative', checks: 'writes steps as commands' },
			{ name: 'Reference', checks: 'leaves the full option list to reference' }
		],
		tone: 'bg-lime-500/15 text-lime-700 ring-lime-500/30 dark:text-lime-300',
		swatch: 'bg-lime-500'
	},
	{
		style: 'Reference',
		label: 'Reference',
		when: 'work',
		how: 'cognition',
		purpose: 'Looking something up',
		rules: [
			{ name: 'Instruction', checks: 'does not advise' },
			{ name: 'Opinion', checks: 'stays neutral' },
			{ name: 'Walkthrough', checks: 'states rather than narrates' },
			{ name: 'Examples', checks: 'shows at least one example' }
		],
		tone: 'bg-amber-500/15 text-amber-700 ring-amber-500/30 dark:text-amber-300',
		swatch: 'bg-amber-500'
	},
	{
		style: 'Explanation',
		label: 'Explanation',
		when: 'study',
		how: 'cognition',
		purpose: 'Understanding',
		rules: [
			{ name: 'Why', checks: 'answers why somewhere' },
			{ name: 'Instruction', checks: 'gives no steps to run' },
			{ name: 'Reference', checks: 'lists no table of every option' }
		],
		tone: 'bg-violet-500/15 text-violet-700 ring-violet-500/30 dark:text-violet-300',
		swatch: 'bg-violet-500'
	}
];

// One page that is all four kinds at once, and what each style said about
// it. A span is a run of the page's text; `rule` names the style that
// flagged it, so the page can be colored by kind.
export type Span = { text: string; rule?: string };

export const page: { line: number; spans: Span[] }[] = [
	{ line: 1, spans: [{ text: '# Caching' }] },
	{
		line: 3,
		spans: [
			{ text: 'In this guide ' },
			{ text: "you'll learn", rule: 'HowTo.Teaching' },
			{ text: ' how the cache works. ' },
			{ text: 'Under the hood', rule: 'Tutorial.Explanation' },
			{ text: ', a build is cached by layer.' }
		]
	},
	{
		line: 5,
		spans: [
			{ text: 'You should', rule: 'Reference.Instruction' },
			{ text: ' enable it in production. ' },
			{ text: 'Simply', rule: 'Reference.Opinion' },
			{ text: ' pass `--cache`; ' },
			{ text: 'alternatively', rule: 'Tutorial.Options' },
			{ text: ', set it in the config ' },
			{ text: 'if you prefer', rule: 'Tutorial.Options' },
			{ text: '.' }
		]
	},
	{ line: 7, spans: [{ text: '1. ' }, { text: 'Run', rule: 'Explanation.Instruction' }, { text: ' the build.' }] },
	{
		line: 8,
		spans: [
			{ text: '2. ' },
			{ text: 'Open', rule: 'Explanation.Instruction' },
			{ text: ' the page. Notice that the second load is faster.' }
		]
	},
	{ line: 10, spans: [{ text: '| Flag | Default |' }] },
	{ line: 11, spans: [{ text: '| ---- | ------- |' }] },
	{ line: 12, spans: [{ text: '| `--cache` | off |' }] },
	{ line: 13, spans: [{ text: '| `--cache-dir` | `.cache` |' }] }
];

export const alerts = [
	{ at: '1:1', rule: 'Reference.Examples', message: 'Reference provides examples. There is no code block on this page.' },
	{ at: '3:1', rule: 'HowTo.Opening', message: 'Open by saying what the guide shows the reader how to do.' },
	{ at: '3:1', rule: 'Explanation.Why', message: 'Explanation answers why. Nothing here says because, the reason, or in order to.' },
	{ at: '3:1', rule: 'Tutorial.We', message: "A tutorial says 'we': the tutor is beside the learner. Nothing here does." },
	{ at: '3:15', rule: 'HowTo.Teaching', message: "'you'll learn' is teaching. A how-to guide assumes the reader knows the basics; a tutorial teaches them." },
	{ at: '3:49', rule: 'HowTo.Explanation', message: "'Under the hood' opens an explanation. Keep the guide to the steps; link to the explanation." },
	{ at: '3:49', rule: 'Tutorial.Explanation', message: "'Under the hood' opens an explanation. Keep it to the step; link to the explanation instead." },
	{ at: '5:1', rule: 'Reference.Instruction', message: "'You should' instructs or advises. Reference describes; put the guidance in a how-to guide." },
	{ at: '5:37', rule: 'Reference.Opinion', message: "'Simply' is an opinion. Reference states what is." },
	{ at: '5:60', rule: 'Tutorial.Options', message: "'alternatively' offers a choice. A tutorial takes one path; alternatives belong in a how-to guide." },
	{ at: '5:96', rule: 'Tutorial.Options', message: "'if you prefer' offers a choice. A tutorial takes one path; alternatives belong in a how-to guide." },
	{ at: '7:4', rule: 'Explanation.Instruction', message: "'Run' is an instruction. Explanation discusses; put the steps in a how-to guide." },
	{ at: '8:4', rule: 'Explanation.Instruction', message: "'Open' is an instruction. Explanation discusses; put the steps in a how-to guide." }
];

export const kindOf = (rule: string) => kinds.find((k) => rule.startsWith(k.style + '.'));
