import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { band, measure, score } from '../../src/lib/tools/modelese.ts';

const data = JSON.parse(readFileSync('src/lib/data/tools/modelese.json', 'utf8'));
// Texts and the score the Modelese repository's own scorer gives each
// (script/export.py), so this one cannot drift from it.
const cases = JSON.parse(readFileSync('tests/tools/data/modelese-cases.json', 'utf8'));

test('the score matches the reference scorer on every case', () => {
	assert.ok(cases.length >= 5);
	for (const c of cases) {
		const got = score(c.text, data).score;
		assert.ok(
			Math.abs(got - c.score) < 0.01,
			`${JSON.stringify(c.text.slice(0, 40))}: got ${got.toFixed(4)}, want ${c.score}`
		);
	}
});

test('every weighted feature is one the scorer measures', () => {
	const measured = measure('One sentence here. And a second one, a little longer than it.', data);
	const missing = data.features.map((f) => f.name).filter((name) => !measured.has(name));
	assert.deepEqual(missing, []);
});

test('the parts add up to the score', () => {
	const out = score(cases[0].text, data);
	const sum = out.parts.reduce((a, p) => a + p.contribution, data.bias);
	assert.ok(Math.abs(sum - out.score) < 1e-9);
	assert.ok(Math.abs(out.parts[0].contribution) >= Math.abs(out.parts.at(-1).contribution));
});

test('a score is placed against the human range', () => {
	const t = data.thresholds.general;
	assert.equal(band(t.fp5 - 1, data).level, 0);
	assert.equal(band((t.fp5 + t.fp1) / 2, data).level, 1);
	assert.equal(band(t.fp1 + 1, data).level, 2);
	assert.equal(band(t.fp1 + 1, data, 'no-such-register').level, 2);
});
