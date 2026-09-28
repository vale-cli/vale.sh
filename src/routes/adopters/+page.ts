import { listPosts } from '$lib/posts';
import type { PageLoad } from './$types';

/*
	The posts the hero slides through: case studies first, then anything else
	filed under adopters, newest first within each. Drafts show in a local
	build so a post can be checked in its slot; a production build never sees
	them, the same rule the blog index uses.
*/
export const load: PageLoad = () => {
	const drafts = import.meta.env.DEV;
	const studies = listPosts({ drafts, tag: 'case-studies' });
	const rest = listPosts({ drafts, tag: 'adopters' }).filter(
		(p) => !studies.some((s) => s.slug === p.slug)
	);
	// Which teams have a case study, by the adopter name the post's `brand`
	// names, so the directory can badge their cards.
	const studied = Object.fromEntries(
		studies.filter((p) => p.brand).map((p) => [p.brand as string, p.slug])
	);
	return {
		studied,
		posts: [...studies, ...rest].map(
			({
				slug,
				title,
				description,
				date,
				tags,
				image,
				imageAlt,
				draft,
				figure,
				figureLabel,
				brand
			}) => ({
				slug,
				title,
				description,
				date,
				tags: tags ?? [],
				// The adopter the study is about, so a sector band can shelve it.
				brand: brand ?? null,
				// The branded card for a case study; a post without one gets no picture.
				image: image ?? null,
				imageAlt: imageAlt ?? '',
				// Only ever true in a local build, where drafts are listed for review.
				draft: Boolean(draft),
				figure: figure ?? null,
				figureLabel: figureLabel ?? ''
			})
		)
	};
};
