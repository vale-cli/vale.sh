import { error } from '@sveltejs/kit';
import adopters from '$lib/data/adopters.json';
import { listPosts } from '$lib/posts';
import { sectors, sectorBySlug, sectorSlug } from '$lib/data/sectors';
import type { EntryGenerator, PageLoad } from './$types';

/*
	One page per sector: the deep dive behind each band on /adopters. The
	load names the sector and the case studies about its teams; the page
	reads everything else (roster, curve, usage) from the same data files
	the hub does, filtered to the sector.
*/

// The site prerenders, so every sector needs naming up front.
export const entries: EntryGenerator = () => sectors.map((s) => ({ sector: sectorSlug(s.name) }));

export const load: PageLoad = ({ params }) => {
	const sector = sectorBySlug(params.sector);
	if (!sector) error(404, `No sector at "${params.sector}".`);

	const inSector = new Map(
		adopters.filter((a) => a.category === sector.name).map((a) => [a.name, a])
	);

	// Case studies first, as on the hub; drafts only in a local build.
	const drafts = import.meta.env.DEV;
	const studies = listPosts({ drafts, tag: 'case-studies' }).filter(
		(p) => p.brand && inSector.has(p.brand)
	);

	return {
		slug: params.sector,
		name: sector.name,
		// Adopter name -> post slug, so the directory can badge these teams.
		studied: Object.fromEntries(studies.map((p) => [p.brand as string, p.slug])),
		studies: studies.map((p) => {
			const team = inSector.get(p.brand as string)!;
			return {
				slug: p.slug,
				title: p.title,
				description: p.description,
				draft: Boolean(p.draft),
				figure: p.figure ?? null,
				figureLabel: p.figureLabel ?? '',
				team: { name: team.name, icon: team.icon, avatar: team.avatar }
			};
		})
	};
};
