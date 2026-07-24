#!/usr/bin/env node
/**
 * Validates src/lib/data/adopters.json and src/lib/data/press.json, and syncs
 * the GitHub org avatars they reference.
 *
 *   node script/adopters.mjs          # validate only
 *   node script/adopters.mjs --sync   # validate, then download missing avatars
 *
 * Contributors only ever hand-edit the JSON. Anything binary — the avatar PNGs
 * under static/users/avatars — is fetched here from the `github` field, so a
 * pull request never has to include an image.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as si from 'simple-icons';

const SYNC = process.argv.includes('--sync');

const ADOPTERS = 'src/lib/data/adopters.json';
const PRESS = 'src/lib/data/press.json';
const EVENTS = 'src/lib/data/events.json';
const AVATAR_DIR = 'static/users/avatars';
const LOGO_DIR = 'static/users';

const CATEGORIES = [
	'Cloud & infrastructure',
	'Community & services',
	'Data & observability',
	'Developer tools',
	'Enterprise',
	'Open source'
];

const PRESS_TYPES = ['book', 'paper', 'talk', 'article', 'video', 'newsletter'];

const ADOPTER_FIELDS = ['name', 'category', 'context', 'url', 'icon', 'github', 'avatar', 'logo'];
const PRESS_FIELDS = ['type', 'title', 'subtitle', 'outlet', 'author', 'year', 'url'];
const EVENT_FIELDS = ['title', 'host', 'date', 'endDate', 'time', 'location', 'url'];

const errors = [];
const notes = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

/** Simple Icons keys are the title, lowercased with non-alphanumerics stripped. */
const iconSlugs = new Set(
	Object.keys(si)
		.filter((k) => k.startsWith('si'))
		.map((k) => si[k].title.toLowerCase().replace(/[^a-z0-9]/g, ''))
);

const read = (path) => JSON.parse(readFileSync(path, 'utf8'));

// ---------------------------------------------------------------- adopters

const adopters = read(ADOPTERS);
const seenNames = new Map();
const seenUrls = new Map();

for (const [i, a] of adopters.entries()) {
	const where = `adopters[${i}] ${a.name ?? '(unnamed)'}`;

	for (const field of ['name', 'category', 'context', 'url']) {
		if (typeof a[field] !== 'string' || !a[field].trim()) fail(where, `missing "${field}"`);
	}
	for (const key of Object.keys(a)) {
		if (!ADOPTER_FIELDS.includes(key)) fail(where, `unknown field "${key}"`);
	}

	if (a.category && !CATEGORIES.includes(a.category)) {
		fail(where, `category "${a.category}" is not one of: ${CATEGORIES.join(', ')}`);
	}
	if (a.context && !/[.!?]$/.test(a.context.trim())) {
		fail(where, 'context should be a complete sentence ending in punctuation');
	}
	if (a.url && !a.url.startsWith('https://')) fail(where, 'url must be https');

	if (a.name) {
		if (seenNames.has(a.name)) fail(where, `duplicate name (also at index ${seenNames.get(a.name)})`);
		seenNames.set(a.name, i);
	}
	if (a.url) {
		if (seenUrls.has(a.url)) fail(where, `duplicate url (also at index ${seenUrls.get(a.url)})`);
		seenUrls.set(a.url, i);
	}

	if (a.icon && !iconSlugs.has(a.icon)) {
		fail(where, `icon "${a.icon}" is not a Simple Icons slug — see simpleicons.org`);
	}
	if (a.icon && a.github) {
		fail(where, 'set either "icon" or "github", not both');
	}
	if (!a.icon && !a.github) {
		notes.push(`${where}: no icon or github — will render a monogram`);
	}
	if (a.logo && !existsSync(join(LOGO_DIR, a.logo.replace('/users/', '')))) {
		fail(where, `logo file not found: static${a.logo}`);
	}
}

// ------------------------------------------------------------------- press

const press = read(PRESS);
const seenPressUrls = new Map();

for (const [i, p] of press.entries()) {
	const where = `press[${i}] ${p.title ?? '(untitled)'}`;

	for (const field of ['type', 'title', 'outlet', 'url']) {
		if (typeof p[field] !== 'string' || !p[field].trim()) fail(where, `missing "${field}"`);
	}
	for (const key of Object.keys(p)) {
		if (!PRESS_FIELDS.includes(key)) fail(where, `unknown field "${key}"`);
	}
	if (p.type && !PRESS_TYPES.includes(p.type)) {
		fail(where, `type "${p.type}" is not one of: ${PRESS_TYPES.join(', ')}`);
	}
	if (p.year !== undefined && !Number.isInteger(p.year)) fail(where, 'year must be an integer');
	if (p.url && !p.url.startsWith('https://')) fail(where, 'url must be https');
	if (p.url) {
		if (seenPressUrls.has(p.url)) fail(where, `duplicate url (also at index ${seenPressUrls.get(p.url)})`);
		seenPressUrls.set(p.url, i);
	}
	if (p.url && seenUrls.has(p.url)) {
		fail(where, `url already used by adopter "${adopters[seenUrls.get(p.url)].name}"`);
	}
}

// ------------------------------------------------------------------ events

const events = read(EVENTS);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const today = new Date().toISOString().slice(0, 10);

for (const [i, e] of events.entries()) {
	const where = `events[${i}] ${e.title ?? '(untitled)'}`;

	for (const field of ['title', 'host', 'date', 'location', 'url']) {
		if (typeof e[field] !== 'string' || !e[field].trim()) fail(where, `missing "${field}"`);
	}
	for (const key of Object.keys(e)) {
		if (!EVENT_FIELDS.includes(key)) fail(where, `unknown field "${key}"`);
	}
	for (const field of ['date', 'endDate']) {
		if (e[field] !== undefined && !ISO_DATE.test(e[field])) {
			fail(where, `"${field}" must be YYYY-MM-DD`);
		}
	}
	if (e.endDate && e.date && e.endDate < e.date) fail(where, 'endDate is before date');
	if (e.url && !e.url.startsWith('https://')) fail(where, 'url must be https');
	// Past events aren't an error — the section drops them — but say so.
	if (e.date && (e.endDate ?? e.date) < today) {
		notes.push(`${where}: already finished, so it won't render`);
	}
}

// ---------------------------------------------------------- avatar syncing

let wrote = 0;
if (SYNC) {
	mkdirSync(AVATAR_DIR, { recursive: true });
	for (const a of adopters) {
		if (!a.github) continue;
		const dest = join(AVATAR_DIR, `${a.github}.png`);
		if (!existsSync(dest)) {
			const res = await fetch(`https://github.com/${a.github}.png?size=128`);
			if (!res.ok) {
				fail(a.name, `github org "${a.github}" -> ${res.status}`);
				continue;
			}
			writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
			console.log(`  fetched ${dest}`);
		}
		if (a.avatar !== `/users/avatars/${a.github}.png`) {
			a.avatar = `/users/avatars/${a.github}.png`;
			wrote++;
		}
	}
	if (wrote) {
		writeFileSync(ADOPTERS, JSON.stringify(adopters, null, '\t') + '\n');
		console.log(`  updated ${wrote} avatar path(s) in ${ADOPTERS}`);
	}
} else {
	for (const a of adopters) {
		if (a.github && !existsSync(join(AVATAR_DIR, `${a.github}.png`))) {
			fail(a.name, `missing avatar for "${a.github}" — run: node script/adopters.mjs --sync`);
		}
	}
}

// ------------------------------------------------------------------ report

for (const n of notes) console.log(`note  ${n}`);
if (errors.length) {
	console.error(`\n${errors.length} problem(s):`);
	for (const e of errors) console.error(`  ✗ ${e}`);
	process.exit(1);
}
console.log(
	`\n✓ ${adopters.length} adopters, ${press.length} press entries, ${events.length} events — all valid`
);
