import Brain from 'lucide-svelte/icons/brain';
import Cloud from 'lucide-svelte/icons/cloud';
import Database from 'lucide-svelte/icons/database';
import Terminal from 'lucide-svelte/icons/terminal';
import Building2 from 'lucide-svelte/icons/building-2';
import Cpu from 'lucide-svelte/icons/cpu';
import Users from 'lucide-svelte/icons/users';
import GraduationCap from 'lucide-svelte/icons/graduation-cap';
import Blocks from 'lucide-svelte/icons/blocks';

/**
 * The nine sectors an adopter files under, in the order the directory shows
 * them. `name` is the `category` value in adopters.json; the validator in
 * script/adopters.mjs keeps the two lists in step.
 */
/**
 * A sector's hue, as the literal Tailwind classes that use it. Kept as
 * strings here rather than built from a color name, so Tailwind's scan of
 * this file finds every class it has to generate.
 */
export type SectorTheme = {
	/** The icon box: its text and its tinted ground. */
	box: string;
	/** The hover border on the band. */
	hover: string;
	/** The motif in the corner, drawn in currentColor. */
	motif: string;
	/** The hue's 500 step as hex, for the card scripts, which read this file as text. */
	hex: string;
};

export type Sector = {
	name: string;
	blurb: string;
	// Typed off one icon, the way AdopterConfigs types its kind map.
	icon: typeof Brain;
	theme: SectorTheme;
};

/*
	Nine hues that stay apart from each other and from the site's lime, each
	a step lighter in dark mode so it holds up on the dark card. The colored
	ground behind the icon is the same hue at a tenth, which reads as a tint
	on either surface.
*/
const themes: Record<string, SectorTheme> = {
	violet: {
		box: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
		hover: 'hover:border-violet-500/40',
		motif: 'text-violet-500',
		hex: '#8b5cf6'
	},
	sky: {
		box: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
		hover: 'hover:border-sky-500/40',
		motif: 'text-sky-500',
		hex: '#0ea5e9'
	},
	amber: {
		box: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
		hover: 'hover:border-amber-500/40',
		motif: 'text-amber-500',
		hex: '#f59e0b'
	},
	lime: {
		box: 'bg-lime-500/10 text-lime-600 dark:text-lime-400',
		hover: 'hover:border-lime-500/40',
		motif: 'text-lime-500',
		hex: '#84cc16'
	},
	indigo: {
		box: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
		hover: 'hover:border-indigo-500/40',
		motif: 'text-indigo-500',
		hex: '#6366f1'
	},
	orange: {
		box: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
		hover: 'hover:border-orange-500/40',
		motif: 'text-orange-500',
		hex: '#f97316'
	},
	emerald: {
		box: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
		hover: 'hover:border-emerald-500/40',
		motif: 'text-emerald-500',
		hex: '#10b981'
	},
	rose: {
		box: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
		hover: 'hover:border-rose-500/40',
		motif: 'text-rose-500',
		hex: '#f43f5e'
	},
	fuchsia: {
		box: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400',
		hover: 'hover:border-fuchsia-500/40',
		motif: 'text-fuchsia-500',
		hex: '#d946ef'
	}
};

export const sectors: Sector[] = [
	{
		name: 'AI & machine learning',
		blurb: 'Model platforms, agent frameworks, and the SDKs around them.',
		icon: Brain,
		theme: themes.violet
	},
	{
		name: 'Cloud & infrastructure',
		blurb: 'Hyperscalers, hosting, Kubernetes, and infrastructure as code.',
		icon: Cloud,
		theme: themes.sky
	},
	{
		name: 'Data & observability',
		blurb: 'Databases, pipelines, and the monitoring built on top of them.',
		icon: Database,
		theme: themes.amber
	},
	{
		name: 'Developer tools',
		blurb: 'Source control, CI, APIs, and the platforms developers build on.',
		icon: Terminal,
		theme: themes.lime
	},
	{
		name: 'Enterprise software',
		blurb: 'Banking, commerce, and low-code platforms with public docs.',
		icon: Building2,
		theme: themes.indigo
	},
	{
		name: 'Hardware & semiconductors',
		blurb: 'Chip makers and embedded SDKs whose docs ship with the silicon.',
		icon: Cpu,
		theme: themes.orange
	},
	{
		name: 'Open source & communities',
		blurb: 'Operating systems, foundations, frameworks, and writing communities.',
		icon: Users,
		theme: themes.emerald
	},
	{
		name: 'Academia & public sector',
		blurb: 'Government services, observatories, quantum computing, and research platforms.',
		icon: GraduationCap,
		theme: themes.rose
	},
	{
		name: 'Web3 & blockchain',
		blurb: 'Wallets, chains, and the developer docs around them.',
		icon: Blocks,
		theme: themes.fuchsia
	}
];

/**
 * A sector's URL segment, as in /adopters/sector/academia-public-sector. The
 * same rule the hub's band anchors use, so `#sector-<slug>` and the page agree.
 */
export const sectorSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** The sector at a URL segment, or undefined. */
export const sectorBySlug = (slug: string) => sectors.find((s) => sectorSlug(s.name) === slug);
