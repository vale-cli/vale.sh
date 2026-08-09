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
	/** The name Vale installs the package under, and the `Packages` entry. */
	value: string;
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
};

type Pkg = {
	name: string;
	description: string;
	homepage: string;
	tags?: string[];
	rules?: { level?: string }[];
};

const byName = new Map((packages as Pkg[]).map((p) => [p.name.toLowerCase(), p]));

const styleCounts = stats.styles as Record<string, number>;
const pairs = stats.pairedWith as Record<string, Record<string, number>>;

/** The size of the sample every adoption count is measured against. */
export const sampleSize = stats.sampleSize;
export const adopterCount = stats.adopterCount;

/** How many sampled configs set a given key at all. */
export const keyUsage = stats.keys as Record<string, number>;

/**
 * Where Vale looks for a vocabulary, relative to StylesPath.
 *
 * `VocabDir = filepath.Join(ConfigDir, "vocabularies")` with `ConfigDir =
 * "config"`, and the loader walks that directory for `accept.txt` and
 * `reject.txt` -- see internal/core/config.go and ini.go in vale-cli/vale.
 * A vocabulary named in the config but missing on disk is a hard error
 * (`NewE100("vocab", ...)`), not a warning, so anything that writes `Vocab`
 * has to say which files to create alongside it.
 */
export const vocabPath = (stylesPath: string, name: string) =>
	`${stylesPath}/config/vocabularies/${name}`;

function build(value: string, fallback: string): Option {
	const pkg = byName.get(value.toLowerCase());
	const rules = pkg?.rules ?? [];

	const levels: Record<Level, number> = { error: 0, warning: 0, suggestion: 0 };
	for (const rule of rules) {
		const level = rule.level as Level | undefined;
		if (level && level in levels) levels[level] += 1;
	}

	return {
		value,
		label: value,
		description: pkg?.description ?? fallback,
		ruleCount: rules.length,
		levels,
		adoption: styleCounts[value] ?? 0,
		pairedWith: Object.entries(pairs[value] ?? {})
			.filter(([, count]) => count > 1)
			.slice(0, 2)
			.map(([name, count]) => ({ name, count })),
		explorer: pkg ? `/explorer/${pkg.name}` : null
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
	build('Google', 'Google Developer Documentation Style Guide.'),
	build('Microsoft', 'Microsoft Writing Style Guide.'),
	build('RedHat', 'Red Hat Documentation Style Guide.'),
	build('Elastic', 'Elastic documentation style guide.'),
	build('Salesforce', 'Salesforce documentation style guide.')
].sort(byAdoption);

/** Narrow, single-purpose styles meant to sit on top of a base. */
export const supplementaryStyles: Option[] = [
	build('write-good', 'Tightens up loose, weasel-worded writing.'),
	build('proselint', 'Checks for a wide range of common prose style errors.'),
	build('alex', 'Catches insensitive or inconsiderate writing.'),
	build('Readability', 'Scores how hard the text is to read.'),
	build('neighbor', 'Flags exclusionary language.'),
	build('Joblint', 'Flags biased or exclusionary language in job posts.')
].sort(byAdoption);

/** Markup support rather than prose rules: no rules of their own. */
export const configs: Option[] = [
	build('Hugo', 'Support for Hugo shortcodes and front matter.'),
	build('MDX', 'Support for MDX (Markdown with embedded JSX).')
];

export type FormatOption = {
	/** The extension, as it appears in a section glob. */
	value: string;
	label: string;
	adoption: number;
};

/**
 * The file types to lint. Vale only reads a file if a section matches it, so
 * this is the setting most likely to make a first run silently do nothing.
 */
export const formats: FormatOption[] = [
	{ value: 'md', label: 'Markdown' },
	{ value: 'mdx', label: 'MDX' },
	{ value: 'rst', label: 'reStructuredText' },
	{ value: 'adoc', label: 'AsciiDoc' },
	{ value: 'html', label: 'HTML' },
	{ value: 'txt', label: 'Plain text' }
]
	.map((f) => ({ ...f, adoption: (stats.formats as Record<string, number>)[f.value] ?? 0 }))
	.sort((a, b) => b.adoption - a.adoption || a.label.localeCompare(b.label));

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
