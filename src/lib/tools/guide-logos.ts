/**
 * Each guide's mark: a Simple Icons glyph (see brand-icons.ts) or a GitHub
 * org avatar under static/users/avatars. A guide with neither gets a lettered
 * tile. 18F and GOV.UK have one on purpose: their org avatars are the GSA
 * seal and the royal arms, which aren't theirs to stand for a guide.
 */
export const guideLogos: Record<
	string,
	{ slug?: string; avatar?: string; letters?: string; mono?: boolean }
> = {
	google: { slug: 'google' },
	microsoft: { avatar: '/users/avatars/microsoft.png' },
	'red-hat': { slug: 'redhat' },
	ibm: { avatar: '/users/avatars/ibm.png' },
	gitlab: { slug: 'gitlab' },
	grafana: { slug: 'grafana' },
	// Elastic's own color is too dark to see on a dark page.
	elastic: { slug: 'elastic', mono: true },
	datadog: { slug: 'datadog' },
	// Splunk's glyph is a wordmark, too small to read at this size.
	splunk: { avatar: '/users/avatars/splunk.png' },
	salesforce: { avatar: '/users/avatars/salesforce.png' },
	docker: { slug: 'docker' },
	canonical: { slug: 'canonical' },
	apify: { avatar: '/users/avatars/apify.png' },
	'spectro-cloud': { avatar: '/users/avatars/spectrocloud.png' },
	digitalocean: { slug: 'digitalocean' },
	// SUSE's own green is too dark to see on a dark page.
	suse: { slug: 'suse', mono: true },
	'amd-rocm': { slug: 'amd' },
	foundries: { avatar: '/users/avatars/foundriesio.png' },
	'albert-heijn': { avatar: '/users/avatars/albert-heijn-technology.png' },
	'gov-uk': { letters: 'UK' }
};
