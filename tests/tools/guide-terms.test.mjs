import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const data = JSON.parse(
	readFileSync(new URL('../../src/lib/data/guide-terms.json', import.meta.url), 'utf8')
);

test('terms and replacements carry no surrounding spaces', () => {
	// "Before " and "before" would otherwise count as two answers.
	const padded = data.rows.filter(([find, use]) => find !== find.trim() || use !== use.trim());
	assert.deepEqual(padded, []);
});
