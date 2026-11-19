import { test } from 'node:test';
import assert from 'node:assert/strict';
import { alternating, capitalized, code, parts, sentenceCase } from '../../src/lib/tools/cases.ts';
import { breakdown, sms } from '../../src/lib/tools/characters.ts';

const apply = (id, text) => code.find((c) => c.id === id).apply(text);

test('sentence case undoes caps lock', () => {
	assert.equal(
		sentenceCase('THE CACHE IS COLD. WHY? I THINK I’M RIGHT.'),
		'The cache is cold. Why? I think I’m right.'
	);
});

test('sentence case keeps names and acronyms in mixed text', () => {
	assert.equal(
		sentenceCase('the iPhone Talks To NASA. it Works.\nsecond line'),
		'The iPhone talks to NASA. It works.\nSecond line'
	);
});

test('caps lock in part of a text is undone, and a lone acronym is kept', () => {
	assert.equal(
		sentenceCase('THE QUICK BROWN FOX. i left caps lock on, said NASA.'),
		'The quick brown fox. I left caps lock on, said NASA.'
	);
});

test('capitalized case capitalizes every word', () => {
	assert.equal(capitalized('a guide to the iPhone'), 'A Guide To The iPhone');
	assert.equal(capitalized('A GUIDE TO IT'), 'A Guide To It');
});

test('alternating case counts letters only', () => {
	assert.equal(alternating('so it goes'), 'sO iT gOeS');
});

test('identifiers split at separators and camel seams', () => {
	assert.deepEqual(parts('parseHTTPResponse_v2 for-users'), [
		'parse',
		'HTTP',
		'Response',
		'v2',
		'for',
		'users'
	]);
});

test('code cases convert between each other, a line at a time', () => {
	assert.equal(apply('camel', 'user account id\nMax retry count'), 'userAccountId\nmaxRetryCount');
	assert.equal(apply('pascal', 'user_account_id'), 'UserAccountId');
	assert.equal(apply('snake', 'userAccountID'), 'user_account_id');
	assert.equal(apply('constant', 'max-retry-count'), 'MAX_RETRY_COUNT');
	assert.equal(apply('kebab', "Don't Repeat Yourself"), 'dont-repeat-yourself');
	assert.equal(apply('dot', 'Server Port'), 'server.port');
});

test('a breakdown sorts characters by kind and counts bytes', () => {
	const b = breakdown('Hi, 5 é 🎉');
	assert.deepEqual(
		[b.letters, b.digits, b.spaces, b.punctuation, b.other, b.bytes],
		[3, 1, 3, 1, 1, 13]
	);
});

test('a text message is 160 places, or 70 once a character is outside GSM', () => {
	assert.deepEqual(sms('a'.repeat(160)), {
		encoding: 'gsm',
		units: 160,
		segments: 1,
		remaining: 0
	});
	assert.equal(sms('a'.repeat(161)).segments, 2);
	assert.equal(sms('cost: 5€').units, 9);
	const u = sms('see you 🎉');
	assert.deepEqual([u.encoding, u.units, u.segments, u.culprit], ['unicode', 10, 1, '🎉']);
	assert.equal(sms('é'.repeat(71)).encoding, 'gsm');
	assert.equal(sms('ê'.repeat(71)).segments, 2);
});
