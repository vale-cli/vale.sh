import { error } from '@sveltejs/kit';
import { assets, type Asset } from '$lib/data/assets';
import { highlight, type Lang } from '$lib/server/highlight';
import type { EntryGenerator, PageServerLoad } from './$types';

// The site prerenders, so every asset needs naming up front. The data comes
// from script/assets.mjs, which reads each file out of the registry.
export const entries: EntryGenerator = () => assets.map((a) => ({ name: a.name }));

/** The language an asset is written in, as far as shiki knows one. */
const langFor: Partial<Record<Asset['kind'], Lang>> = { view: 'yaml' };

/** A view's usage is .vale.ini; a filter's or a template's is a command. */
const usageLang = (kind: Asset['kind']): Lang =>
	kind === 'filter' || kind === 'template' ? 'bash' : 'ini';

export const load: PageServerLoad = async ({ params }) => {
	const asset = assets.find((a) => a.name.toLowerCase() === params.name.toLowerCase());
	if (!asset) {
		error(404, `No asset named "${params.name}".`);
	}
	return {
		asset,
		html: await highlight(asset.content, langFor[asset.kind] ?? 'plaintext'),
		usageHtml: await highlight(asset.usage, usageLang(asset.kind))
	};
};
