import generated from '$lib/data/assets.json';

/**
 * A single file to copy into a StylesPath — a view, a filter, a script —
 * rather than a package to sync. Listed in the registry's assets.json and
 * read whole by script/assets.mjs.
 */
export type Asset = {
	name: string;
	kind: 'view' | 'filter' | 'script' | 'action' | 'vocabulary' | 'template';
	description: string;
	path: string;
	/** A view's `.vale.ini` section: the files it is meant for. */
	section?: string;
	requires?: string;
	tags: string[];
	content: string;
	/** The .vale.ini lines or the command that put it to use. */
	usage: string;
};

export const assets: Asset[] = generated as Asset[];

/** Where each kind lives under a StylesPath, and the extension it keeps. */
export const kindInfo: Record<Asset['kind'], { dir: string; plural: string; blurb: string }> = {
	view: {
		dir: 'config/views',
		plural: 'Views',
		blurb: 'Pull named scopes out of a file Vale can’t otherwise parse.'
	},
	filter: {
		dir: 'config/filters',
		plural: 'Filters',
		blurb: 'Choose which rules a run applies, from the command line.'
	},
	script: {
		dir: 'config/scripts',
		plural: 'Scripts',
		blurb: 'Tengo programs a `script` rule runs over a block.'
	},
	action: {
		dir: 'config/actions',
		plural: 'Actions',
		blurb: 'Tengo programs that compute a rule’s suggested fix.'
	},
	vocabulary: {
		dir: 'config/vocabularies',
		plural: 'Vocabularies',
		blurb: 'Terms to accept or reject across every style.'
	},
	template: {
		dir: 'config/templates',
		plural: 'Templates',
		blurb: 'An output format, named with --output.'
	}
};

/** The file name an asset is saved under. */
export const fileName = (a: Asset) => a.path.split('/').pop() ?? a.name;

/** A version floor worth showing: `>=1.0.0` is the legacy “any version”. */
export const requires = (a: { requires?: string }) =>
	!a.requires || a.requires === '>=1.0.0' ? '' : a.requires.replace(/^>=\s*/, 'Vale ≥ ');
