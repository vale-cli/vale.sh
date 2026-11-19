import { test } from 'node:test';
import assert from 'node:assert/strict';
import { config, fixFor, place } from '../../src/lib/tools/vale.ts';

const alert = (Line, Span, Match, extra = {}) => ({
	Check: 'T.W',
	Line,
	Span,
	Match,
	Message: '',
	Severity: 'warning',
	...extra
});

test('place turns a line and an inclusive column span into offsets', () => {
	const text = 'One line.\nThis is very good.\n';
	const [p] = place(text, [alert(2, [9, 12], 'very')]);
	assert.equal(text.slice(p.from, p.to), 'very');
});

test('place counts code points, as Vale does', () => {
	const text = 'A 🎉 party is very good — très bien.';
	const [p] = place(text, [alert(1, [14, 17], 'very')]);
	assert.equal(text.slice(p.from, p.to), 'very');
	const [q] = place(text, [alert(1, [26, 29], 'très')]);
	assert.equal(text.slice(q.from, q.to), 'très');
});

test('place drops an alert that is not in the text, and sorts the rest', () => {
	const text = 'very good\nvery bad';
	const out = place(text, [
		alert(2, [1, 4], 'very'),
		alert(9, [1, 4], 'gone'),
		alert(1, [40, 44], 'past the end'),
		alert(1, [1, 4], 'very')
	]);
	assert.deepEqual(
		out.map((p) => p.from),
		[0, 10]
	);
});

test('fixFor reads a rule’s own action', () => {
	const replace = alert(1, [1, 7], 'utilize', {
		Action: { Name: 'replace', Params: ['use', 'apply'] }
	});
	assert.deepEqual(fixFor(replace), { label: 'Use “use”', replacement: 'use' });
	assert.deepEqual(fixFor(alert(1, [1, 4], 'very', { Action: { Name: 'remove', Params: null } })), {
		label: 'Remove',
		replacement: ''
	});
	assert.equal(fixFor(alert(1, [1, 4], 'very')), undefined);
	assert.equal(
		fixFor(alert(1, [1, 3], 'use', { Action: { Name: 'replace', Params: ['use'] } })),
		undefined
	);
});
