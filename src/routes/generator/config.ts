/**
 * The generator's options, built from the two datasets the site already has
 * rather than from hand-written blurbs.
 *
 * `packages.json` is what the Style Explorer runs on: the real description,
 * the real rule list, and the severity each rule fires at. `config-stats.json`
 * is what 55 public `.vale.ini` files in the adopters list actually select.
 *
 * Between them a visitor can answer the question the tool exists for -- which
 * of these should I pick? -- instead of choosing from an alphabetical list.
 */
import packages from '$lib/data/packages.json';
import stats from '$lib/data/config-stats.json';

export type Level = 'error' | 'warning' | 'suggestion';

export type Option = {
	/** The name that goes in `BasedOnStyles`. */
	value: string;
	/** The `Packages` entry that carries it: the value itself, or a parent. */
	package: string;
	label: string;
	description: string;
	/** Rules in the package, and how many fire at each level. */
	ruleCount: number;
	levels: Record<Level, number>;
	/** How many of the sampled public configs select it. */
	adoption: number;
	/** The styles it most often appears alongside, commonest first. */
	pairedWith: { name: string; count: number }[];
	/** Its Style Explorer page, when the package is one we index. */
	explorer: string | null;
	/** Where the style comes from: the guide or the repository behind it. */
	homepage: string | null;
	/** The mark the Explorer shows for it. */
	logo: string | null;
};

type Pkg = {
	name: string;
	description: string;
	homepage: string;
	tags?: string[];
	logo?: string;
	rules?: { level?: string }[];
};

const byName = new Map((packages as Pkg[]).map((p) => [p.name.toLowerCase(), p]));

const styleCounts = stats.styles as Record<string, number>;
const pairs = stats.pairedWith as Record<string, Record<string, number>>;

/** The size of the sample every adoption count is measured against. */
export const sampleSize = stats.sampleSize;
export const adopterCount = stats.adopterCount;

function build(value: string, fallback: string, parent?: string): Option {
	const pkg = byName.get((parent ?? value).toLowerCase());
	// A style inside a package has no count of its own: the rule entries do
	// not say which style they belong to.
	const rules = parent ? [] : (pkg?.rules ?? []);

	const levels: Record<Level, number> = { error: 0, warning: 0, suggestion: 0 };
	for (const rule of rules) {
		const level = rule.level as Level | undefined;
		if (level && level in levels) levels[level] += 1;
	}

	return {
		value,
		package: parent ?? value,
		label: value,
		description: fallback,
		ruleCount: rules.length,
		levels,
		adoption: styleCounts[value] ?? 0,
		pairedWith: Object.entries(pairs[value] ?? {})
			.filter(([, count]) => count > 1)
			.slice(0, 2)
			.map(([name, count]) => ({ name, count })),
		explorer: pkg ? `/explorer/${pkg.name}` : null,
		homepage: pkg?.homepage ?? null,
		logo: pkg?.logo ?? null
	};
}

/** Most-selected first, so the ordering carries information of its own. */
const byAdoption = (a: Option, b: Option) =>
	b.adoption - a.adoption || b.ruleCount - a.ruleCount || a.label.localeCompare(b.label);

/**
 * A complete house style guide. Picking two of these is usually a mistake --
 * they disagree -- so the step takes one.
 */
export const baseStyles: Option[] = [
	build(
		'Google',
		'Google’s developer documentation style: second person, active voice, sentence-case headings, plain words.'
	),
	build(
		'Microsoft',
		'Microsoft’s writing style: warm and direct, contractions welcome, no jargon.'
	),
	build(
		'RedHat',
		'Red Hat’s documentation style: precise terminology and consistent formatting for technical content.'
	),
	build('Elastic', 'Elastic’s documentation style, written for product and reference docs.'),
	build('Salesforce', 'Salesforce’s documentation style, written for product help and reference.')
].sort(byAdoption);

/** Narrow, single-purpose styles meant to sit on top of a base. */
export const supplementaryStyles: Option[] = [
	build('write-good', 'Weasel words, passive voice, clichés, and other loose writing.'),
	build('proselint', 'Redundancy, jargon, dated phrases, and other common style slips.'),
	build('alex', 'Insensitive or inconsiderate wording, with gentler alternatives.'),
	build(
		'Readability',
		'Reading-level scores, so a hard passage is flagged rather than guessed at.'
	),
	build('neighbor', 'Exclusionary language, and the inclusive terms to use instead.'),
	build('Joblint', 'Biased or exclusionary language in job posts.')
].sort(byAdoption);

/**
 * A complete style for a manuscript. One per audience; the styles inside
 * each package are the supplementary picks for it.
 */
const fiction = build(
	'Fiction',
	'Filter words, told emotions, stock phrases, and dialogue punctuation: the checks most fiction editors agree on.'
);
const journals = build(
	'Journals',
	'The conventions every journal shares: units, numbers, statistics, figure references, and citations.'
);

const inFiction = (value: string, description: string) => build(value, description, 'Fiction');
const inJournals = (value: string, description: string) => build(value, description, 'Journals');

const harper = build(
	'Harper',
	'Grammar: agreement, articles, and the slips a spell checker misses.'
);
const aiTells = build(
	'ai-tells',
	'The fingerprints of AI-written prose, with rule messages that name the tell.'
);
const readability = supplementaryStyles.find((o) => o.value === 'Readability')!;
const proselint = supplementaryStyles.find((o) => o.value === 'proselint')!;
const writeGood = supplementaryStyles.find((o) => o.value === 'write-good')!;
const alexStyle = supplementaryStyles.find((o) => o.value === 'alex')!;

export type Audience = 'technical' | 'creative' | 'scientific';

export type Preset = {
	id: Audience;
	label: string;
	/** One line under the title, in place of the adoption note. */
	description: string;
	/** The formats selected when the audience is picked. */
	formats: string[];
	base: Option[];
	supplementary: Option[];
	baseBlurb: string;
	supplementaryBlurb: string;
	/** Adoption counts come from documentation repos, so only that audience shows them. */
	counted: boolean;
};

/**
 * What kind of writing the config is for. Each preset answers the question
 * the generator exists for -- which of these should I pick? -- with the
 * styles written for that kind, and nothing from the others.
 */
export const presets: Preset[] = [
	{
		id: 'technical',
		label: 'Technical',
		description: 'Documentation, READMEs, and the comments in code.',
		formats: ['md'],
		base: baseStyles,
		supplementary: supplementaryStyles,
		baseBlurb:
			'A published guide to build on. Vale’s own rules run either way; pick none to keep only those.',
		supplementaryBlurb:
			'Single-purpose checks that sit on top of any base. Add as many as you like.',
		counted: true
	},
	{
		id: 'creative',
		label: 'Creative',
		description: 'Fiction, essays, and anything with dialogue in it.',
		formats: ['md', 'txt'],
		base: [fiction],
		supplementary: [
			inFiction(
				'Leonard',
				'Elmore Leonard’s ten rules: no weather in the opening, only “said”, no adverb on a tag, exclamation points capped.'
			),
			inFiction(
				'Palahniuk',
				'Chuck Palahniuk’s thought verbs: thinks, knows, realizes, wants, remembers, loves, hates.'
			),
			inFiction(
				'Strunk',
				'Strunk’s 1918 Elements of Style: the active voice, positive form, needless words, and the misused words of Chapter V.'
			),
			proselint,
			writeGood,
			harper,
			aiTells,
			readability,
			alexStyle
		],
		baseBlurb: 'The core every fiction editor shares. Vale’s own rules run either way.',
		supplementaryBlurb:
			'A writer’s own rules, and general checks that sit on top. Add as many as you like.',
		counted: false
	},
	{
		id: 'scientific',
		label: 'Scientific',
		description:
			'Papers, preprints, and theses, in Markdown, Quarto, R Markdown, Typst, or a notebook.',
		formats: ['md', 'qmd'],
		base: [journals],
		supplementary: [
			inJournals(
				'IMRaD',
				'The standard sections exist, the abstract is within budget and has no citations, and the Discussion mentions limitations.'
			),
			inJournals(
				'Nature',
				'Nature’s formatting guide: title and summary limits, superscript citations, Fig. 1, 37 °C.'
			),
			inJournals(
				'PLOS',
				'PLOS ONE’s submission guidelines: [1] citations, Fig 1, exact p-values, Vancouver references, a named ethics committee.'
			),
			inJournals('CONSORT', 'Randomized trials: 19 of the checklist’s 30 items.'),
			inJournals('STROBE', 'Observational studies: 14 of the checklist’s 22 items.'),
			inJournals('PRISMA', 'Systematic reviews: 21 of the checklist’s 27 items.'),
			readability,
			harper,
			aiTells
		],
		baseBlurb: 'The conventions every journal shares. Vale’s own rules run either way.',
		supplementaryBlurb:
			'A structure, a journal, or a reporting checklist, and general checks. Add as many as you like.',
		counted: false
	}
];

/** Every option the presets offer, by the name that goes in the config. */
export const optionByValue = new Map(
	presets.flatMap((p) => [...p.base, ...p.supplementary]).map((o) => [o.value, o])
);

/** Markup support rather than prose rules: no rules of their own. */
export const configs: Option[] = [
	build('Hugo', 'Support for Hugo shortcodes and front matter.'),
	build('MDX', 'Support for MDX (Markdown with embedded JSX).')
];

export type LevelOption = { value: Level; label: string; description: string; adoption: number };

/** What Vale reports. Everything below the level chosen is hidden. */
export const alertLevels: LevelOption[] = (
	[
		{
			value: 'suggestion',
			label: 'Suggestion',
			description: 'Report everything. The loudest setting, and the usual starting point.'
		},
		{
			value: 'warning',
			label: 'Warning',
			description: 'Hide suggestions. A quieter first run on an existing corpus.'
		},
		{
			value: 'error',
			label: 'Error',
			description: 'Only what a style calls an error. Common when the run gates a build.'
		}
	] as const
).map((l) => ({
	...l,
	adoption: (stats.minAlertLevels as Record<string, number>)[l.value] ?? 0
}));
