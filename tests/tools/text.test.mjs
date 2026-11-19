import { test } from 'node:test';
import assert from 'node:assert/strict';
import { count, graphemes, sentences, words } from '../../src/lib/tools/text.ts';

test('a quoted question followed by its attribution is one sentence', () => {
	const out = sentences('"Really?" she said. He left. "Stop!" The door closed.');
	assert.deepEqual(
		out.map((s) => s.text),
		['"Really?" she said.', 'He left.', '"Stop!"', 'The door closed.']
	);
});

test('abbreviations and initials do not end a sentence', () => {
	const out = sentences('Dr. Lee met J. Smith at 3 p.m. on Friday. It cost $3.50.');
	assert.equal(out.length, 2);
});

test('characters are counted as a reader sees them', () => {
	assert.equal(graphemes('plain text'), 10);
	assert.equal(graphemes('👨‍👩‍👧 🇯🇵 é'), 5);
	assert.equal(graphemes('é'), 1);
	assert.equal(count('naïve 🎉').characters, 7);
});

test('a contraction or a hyphenated compound is one word', () => {
	assert.deepEqual(words("don't stop the well-known 3rd act"), [
		"don't",
		'stop',
		'the',
		'well-known',
		'3rd',
		'act'
	]);
});
