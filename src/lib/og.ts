/**
 * Fills in what a page head leaves out: a default og:image, so every page
 * shares with a card, and a large Twitter card, so the image shows full size.
 */
export function withDefaultOgImage(html: string, image: string): string {
	if (!html.includes('</head>')) return html;
	let tags = '';
	if (!/property="og:image"/.test(html)) {
		tags +=
			`<meta property="og:image" content="${image}" />` +
			`<meta property="og:image:width" content="1200" />` +
			`<meta property="og:image:height" content="630" />`;
	}
	if (!/name="twitter:card"/.test(html)) {
		tags += `<meta name="twitter:card" content="summary_large_image" />`;
	}
	return tags ? html.replace('</head>', `${tags}</head>`) : html;
}
