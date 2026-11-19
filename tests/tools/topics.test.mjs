import { test } from 'node:test';
import assert from 'node:assert/strict';
import { replacement, termSlug } from '../../src/lib/tools/topics.ts';

test('spellings of one term share a slug', () => {
	assert.equal(termSlug('ad hoc'), 'ad-hoc');
	assert.equal(termSlug('Ad-Hoc'), 'ad-hoc');
	assert.equal(termSlug('e.g.'), 'e-g');
	assert.equal(termSlug('and/or'), 'and-or');
});

test('advice is not counted as a replacement', () => {
	assert.equal(replacement('blocklist'), 'blocklist');
	assert.equal(
		replacement('influence or use (unless financial)'),
		'influence or use (unless financial)'
	);
	assert.equal(replacement('Do not use "please" in technical documentation.'), '');
	assert.equal(replacement("Avoid using 'key' (unless it unlocks something)."), '');
	assert.equal(replacement("Use 'please' only if we've inconvenienced the user."), '');
});
