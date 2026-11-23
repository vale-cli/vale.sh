import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compile, decide, existencePattern, hits, readsProse, swaps } from './decisions.mjs';

const rule = (id, body) => ({ id: `g.${id}`, level: 'warning', ...body });

test('Vale patterns compile with their flags', () => {
	assert.equal(compile('(?i)hello').flags.includes('i'), true);
	// JavaScript can't scope (?i:...), so its letters become two-case classes.
	const scoped = compile('(?i:when) X');
	assert.equal(scoped.test('WHEN X'), true);
	assert.equal(new RegExp(scoped).test('WHEN x'), false);
	// A bare (?i) mid-pattern lasts to the end of its group.
	assert.equal(new RegExp(compile('a(?:(?i)bc)d')).test('aBCd'), true);
	assert.equal(new RegExp(compile('a(?:(?i)bc)d')).test('aBCD'), false);
});

test('existence joins raw before its tokens, as Vale does', () => {
	assert.equal(
		existencePattern({ raw: ['\\d+', '\\s'], tokens: ['GB'] }),
		'\\d+\\s\\b(?:(?:GB))\\b'
	);
	assert.equal(existencePattern({ tokens: ['a', 'b'], nonword: true }), '(?:(?:a)|(?:b))');
});

test('a swap may be a map or a list of maps', () => {
	assert.deepEqual(swaps({ swap: { a: 'b' } }), [['a', 'b']]);
	assert.deepEqual(swaps({ swap: [{ a: 'b' }, { c: 1 }] }), [
		['a', 'b'],
		['c', '1']
	]);
});

test('heading-only rules do not read body text', () => {
	assert.equal(readsProse({ scope: 'heading' }), false);
	assert.equal(readsProse({ scope: ['heading', 'sentence'] }), true);
	assert.equal(readsProse({}), true);
	assert.equal(readsProse({ scope: '~heading' }), true);
});

test('a hit must take in the whole target', () => {
	const passive = rule('Passive', { extends: 'existence', tokens: ['let'], ignorecase: true });
	assert.deepEqual(hits(passive, "Let's install it.", "Let's"), []);
	const we = rule('We', { extends: 'existence', tokens: ["let's"], ignorecase: true });
	assert.equal(hits(we, "Let's install it.", "Let's").length, 1);
});

test('exceptions are honored', () => {
	const r = rule('Latin', {
		extends: 'existence',
		tokens: ['e\\.g\\.'],
		nonword: true,
		exceptions: ['e\\.g\\.']
	});
	assert.deepEqual(hits(r, 'Pick one, e.g. this.', 'e.g'), []);
});

test('heading case comes from a capitalization rule on headings', () => {
	const d = decide([
		rule('Headings', { extends: 'capitalization', scope: 'heading', match: '$title' })
	]);
	assert.equal(d.headings.value, 'title');
	assert.equal(d.headings.rule, 'g.Headings');
	const body = decide([
		rule('Caps', { extends: 'capitalization', scope: 'sentence', match: '$title' })
	]);
	assert.equal(body.headings.value, 'none');
});

test('the serial comma is required or avoided by what a rule objects to', () => {
	const oxford = rule('OxfordComma', {
		extends: 'existence',
		scope: 'sentence',
		nonword: true,
		tokens: ['(?:[^\\s,]+,){1,} \\w+ (?:and|or) \\w+[.?!]']
	});
	assert.equal(decide([oxford]).serialComma.value, 'required');
	const simple = rule('SimpleSeries', {
		extends: 'existence',
		raw: ['(?m)((\\w+,(\\s)+){2}(and|or))']
	});
	assert.equal(decide([simple]).serialComma.value, 'avoided');
});

test('contractions follow the direction of a substitution', () => {
	const use = rule('Contractions', {
		extends: 'substitution',
		ignorecase: true,
		swap: { 'do not': "don't", 'is not': "isn't" }
	});
	const d = decide([use]);
	assert.equal(d.contractions.value, 'encouraged');
	assert.equal(d.contractions.example, "do not → don't");
	const avoid = rule('Contractions', {
		extends: 'substitution',
		ignorecase: true,
		swap: { "don't": 'do not', "isn't": 'is not' }
	});
	assert.equal(decide([avoid]).contractions.value, 'discouraged');
});

test('a tense rule that flags "won\'t" says nothing about contractions', () => {
	const tense = rule('Tense', { extends: 'existence', tokens: ['will', "won't"] });
	assert.equal(decide([tense]).contractions.value, 'none');
});

test('a rule that expands only rare contractions is told apart', () => {
	const rare = rule('Contractions', {
		extends: 'substitution',
		swap: { "how[`']d": 'how did', "ain[`']t": "isn't" }
	});
	const d = decide([rare]);
	assert.equal(d.contractions.value, 'uncommon');
	assert.equal(d.contractions.example, "how'd → how did");
});

test('Latin abbreviations: English replacement avoids, punctuation fixes allow', () => {
	const avoid = rule('Latin', {
		extends: 'substitution',
		ignorecase: true,
		nonword: true,
		swap: { '\\b(?:eg|e\\.g\\.)(?=[\\s,;]|$)': 'for example' }
	});
	assert.equal(decide([avoid]).latin.value, 'avoid');
	const comma = rule('Abbreviations', {
		extends: 'substitution',
		nonword: true,
		swap: { 'e\\.g\\.(?:[^,]|$)': 'e.g.,' }
	});
	assert.equal(decide([comma]).latin.value, 'allow');
	// "eg" without its periods isn't "e.g.".
	const bare = rule('Terms', { extends: 'substitution', swap: { '\\b(?:eg)': 'for example' } });
	assert.equal(decide([bare]).latin.value, 'none');
});

test('numbers under 10: spelled out or numerals', () => {
	const words = rule('Numbers', { extends: 'substitution', swap: { 5: 'five' } });
	assert.equal(decide([words]).numbers.value, 'words');
	const numerals = rule('Numbers', { extends: 'substitution', swap: { five: '5' } });
	assert.equal(decide([numerals]).numbers.value, 'numerals');
});

test('exclamation points only count in body text', () => {
	const body = rule('Exclamation', { extends: 'existence', tokens: ['\\w+!(?:\\s|$)'] });
	assert.equal(decide([body]).exclamation.value, 'avoid');
	const heading = rule('HeadingPunctuation', {
		extends: 'existence',
		scope: 'heading',
		nonword: true,
		tokens: ['!']
	});
	assert.equal(decide([heading]).exclamation.value, 'none');
});

test('gendered and other exclusionary terms are told apart', () => {
	const gender = rule('Gender', { extends: 'substitution', swap: { chairman: 'chair' } });
	const other = rule('Bias', { extends: 'substitution', swap: { whitelist: 'allowlist' } });
	assert.equal(decide([gender]).inclusive.value, 'gendered');
	assert.equal(decide([other]).inclusive.value, 'other');
	assert.equal(decide([gender, other]).inclusive.value, 'both');
});

test('a guide with no rule on a decision says so', () => {
	const d = decide([]);
	for (const cell of Object.values(d)) assert.deepEqual(cell, { value: 'none', label: 'No rule' });
});

test('first person "we" and second person "you"', () => {
	const we = rule('We', { extends: 'existence', ignorecase: true, tokens: ['we', 'ours?'] });
	assert.equal(decide([we]).we.value, 'avoid');
	assert.equal(decide([we]).you.value, 'none');
	const you = rule('User', { extends: 'substitution', swap: { 'the user': 'you' } });
	assert.equal(decide([you]).you.value, 'prefer');
});
