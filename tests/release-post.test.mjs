import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';

import { field, findReleasePost, notes, publish } from '../script/release-post.mjs';

const POST = `---
title: 'Vale 3.29: what''s new'
description: "Typst, and a faster \\"sync\\"."
date: '2026-11-20'
draft: true
release: 'v3.29.0'
tags: ['releases']
---

Body text with release: v9.9.9 in it.
`;

describe('field', () => {
	it('unquotes single- and double-quoted scalars', () => {
		assert.equal(field(POST, 'title'), "Vale 3.29: what's new");
		assert.equal(field(POST, 'description'), 'Typst, and a faster "sync".');
		assert.equal(field(POST, 'release'), 'v3.29.0');
	});

	it('reads only the front matter', () => {
		assert.equal(field('no front matter\nrelease: v1.0.0\n', 'release'), null);
		assert.equal(field(POST, 'missing'), null);
	});
});

describe('publish', () => {
	it('clears the draft flag and dates the post', () => {
		const out = publish(POST, '2026-11-26');
		assert.match(out, /^date: '2026-11-26'$/m);
		assert.match(out, /^draft: false$/m);
		assert.doesNotMatch(out, /draft: true/);
		assert.ok(out.endsWith('Body text with release: v9.9.9 in it.\n'));
	});

	it('adds a draft line when the post has none', () => {
		const out = publish(POST.replace('draft: true\n', ''), '2026-11-26');
		assert.match(out, /^date: '2026-11-26'\ndraft: false$/m);
	});
});

describe('findReleasePost', () => {
	const dir = mkdtempSync(join(tmpdir(), 'release-post-'));
	after(() => rmSync(dir, { recursive: true, force: true }));
	writeFileSync(join(dir, 'vale-3-29.md'), POST);
	writeFileSync(join(dir, 'other.md'), POST.replace("release: 'v3.29.0'\n", ''));

	it('finds the post that names the release', () => {
		const post = findReleasePost(dir, 'v3.29.0');
		assert.equal(post?.slug, 'vale-3-29');
		assert.equal(
			notes(post),
			"![Vale 3.29: what's new](https://vale.sh/blog/og/vale-3-29.png)\n\n" +
				"### [Vale 3.29: what's new](https://vale.sh/blog/vale-3-29)\n\n" +
				'Typst, and a faster "sync".'
		);
	});

	it("uses the post's own image and alt text when it sets them", () => {
		const text = POST.replace(
			'tags:',
			"image: '/blog/brand/v.png'\nimageAlt: 'The banner.'\ntags:"
		);
		assert.match(
			notes({ slug: 's', text }),
			/^!\[The banner\.\]\(https:\/\/vale\.sh\/blog\/brand\/v\.png\)/
		);
	});

	it('returns null when no post names it, even if the body does', () => {
		assert.equal(findReleasePost(dir, 'v9.9.9'), null);
	});

	it('refuses two posts for one release', () => {
		writeFileSync(join(dir, 'dupe.md'), POST);
		assert.throws(() => findReleasePost(dir, 'v3.29.0'), /all name release v3.29.0/);
	});
});
