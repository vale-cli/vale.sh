#!/usr/bin/env node
/**
 * Publishes the blog post written for a Vale release, when there is one.
 *
 *   node script/release-post.mjs v3.29.0           # publish the post
 *   node script/release-post.mjs --notes v3.29.0   # print its release-notes header
 *
 * A post opts in with `release: 'v3.29.0'` in its front matter. Publishing
 * sets `draft: false` and dates the post today. --notes changes nothing; it
 * prints the lines Vale's release workflow puts above the changelog. With no
 * post for the release, both print nothing and exit 0.
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

/** The front matter's lines, and where they sit in the file's lines. */
function frontMatter(text) {
	const lines = text.split('\n');
	if (lines[0] !== '---') return null;
	const end = lines.indexOf('---', 1);
	return end === -1 ? null : { lines, end };
}

/** A top-level scalar from the front matter, unquoted. */
export function field(text, key) {
	const fm = frontMatter(text);
	if (!fm) return null;
	const re = new RegExp(`^${key}:\\s*(.*)$`);
	for (const line of fm.lines.slice(1, fm.end)) {
		const m = re.exec(line);
		if (!m) continue;
		const raw = m[1].trim();
		if (raw.startsWith("'") && raw.endsWith("'")) return raw.slice(1, -1).replaceAll("''", "'");
		if (raw.startsWith('"') && raw.endsWith('"')) return raw.slice(1, -1).replaceAll('\\"', '"');
		return raw;
	}
	return null;
}

/** The post whose `release` is `version`, or null. Two such posts is an error. */
export function findReleasePost(dir, version) {
	const found = [];
	for (const file of readdirSync(dir).sort()) {
		if (!file.endsWith('.md')) continue;
		const text = readFileSync(join(dir, file), 'utf8');
		if (field(text, 'release') === version) {
			found.push({ file: join(dir, file), slug: file.replace(/\.md$/, ''), text });
		}
	}
	if (found.length > 1) {
		throw new Error(`${found.map((p) => p.slug).join(', ')} all name release ${version}`);
	}
	return found[0] ?? null;
}

/** The post with `draft: false` and `date` set to `today`. */
export function publish(text, today) {
	const fm = frontMatter(text);
	if (!fm) throw new Error('the post has no front matter');
	const lines = [...fm.lines];
	const header = lines.slice(0, fm.end);
	const dateAt = header.findIndex((l) => /^date:/.test(l));
	if (dateAt === -1) throw new Error('the post has no date');
	lines[dateAt] = `date: '${today}'`;
	const draftAt = header.findIndex((l) => /^draft:/.test(l));
	if (draftAt === -1) {
		lines.splice(dateAt + 1, 0, 'draft: false');
	} else {
		lines[draftAt] = 'draft: false';
	}
	return lines.join('\n');
}

/**
 * The Markdown that leads the GitHub release: the post's banner, its title
 * linked, and its summary. The banner is the post's social card, as in the
 * RSS feed.
 */
export function notes(post) {
	const title = field(post.text, 'title');
	const description = field(post.text, 'description');
	const image = field(post.text, 'image') ?? `/blog/og/${post.slug}.png`;
	const alt = field(post.text, 'imageAlt') ?? title;
	const parts = [
		`![${alt}](https://vale.sh${image})`,
		`### [${title}](https://vale.sh/blog/${post.slug})`
	];
	if (description) parts.push(description);
	return parts.join('\n\n');
}

function main(args) {
	const notesOnly = args[0] === '--notes';
	const version = notesOnly ? args[1] : args[0];
	if (!/^v\d+\.\d+\.\d+$/.test(version ?? '')) {
		console.error('usage: node script/release-post.mjs [--notes] vX.Y.Z');
		process.exit(2);
	}

	const post = findReleasePost(join(root, 'src/posts'), version);
	if (!post) return;

	if (notesOnly) {
		console.log(notes(post));
		return;
	}

	// The build refuses a published post without its lint report.
	const report = JSON.parse(readFileSync(join(root, 'src/lib/data/lint.json'), 'utf8'));
	if (!(post.slug in report.posts)) {
		console.error(
			`src/posts/${post.slug}.md has no entry in src/lib/data/lint.json; run pnpm posts`
		);
		process.exit(1);
	}

	writeFileSync(post.file, publish(post.text, new Date().toISOString().slice(0, 10)));
	console.log(post.slug);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	main(process.argv.slice(2));
}
