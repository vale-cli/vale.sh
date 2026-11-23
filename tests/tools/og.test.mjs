import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withDefaultOgImage } from '../../src/lib/og.ts';

const img = 'https://vale.sh/brand/vale-social.png';

test('a head without an og:image gets the default and a large card', () => {
	const out = withDefaultOgImage('<head><title>x</title></head><body></body>', img);
	assert.match(out, /property="og:image" content="https:\/\/vale\.sh\/brand\/vale-social\.png"/);
	assert.match(out, /name="twitter:card" content="summary_large_image"/);
	assert.ok(out.indexOf('og:image') < out.indexOf('</head>'));
});

test("a page's own og:image is kept, and still gets a large card", () => {
	const html = '<head><meta property="og:image" content="https://vale.sh/a.png" /></head>';
	const out = withDefaultOgImage(html, img);
	assert.equal(out.match(/og:image"/g).length, 1);
	assert.match(out, /summary_large_image/);
});

test("a page's own twitter:card is kept", () => {
	const html =
		'<head><meta property="og:image" content="a" /><meta name="twitter:card" content="summary" /></head>';
	assert.equal(withDefaultOgImage(html, img), html);
});

test('a chunk without the end of the head is left alone', () => {
	assert.equal(withDefaultOgImage('<body>rest</body>', img), '<body>rest</body>');
});
