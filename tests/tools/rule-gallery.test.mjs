import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { zipSync, strToU8 } from 'fflate';
import { config } from '../../src/lib/tools/vale.ts';
import { categories, rules } from '../../src/lib/data/rule-gallery.ts';

/*
	Every rule on /explorer/rules, run by the browser engine: its sample must
	fire it and its clean text must not. Skipped until script/wasm.mjs has
	staged the engine.
*/
after(() => setImmediate(() => process.exit()));

test('every rule has a category and credits', () => {
	const ids = new Set(categories.map((c) => c.id));
	for (const r of rules) {
		assert.ok(ids.has(r.category), `${r.id}: unknown category ${r.category}`);
		assert.ok(r.credits.length, `${r.id}: no credits`);
		for (const c of r.credits) assert.match(c.url, /^https:\/\/github\.com\//, r.id);
	}
});

const staged = existsSync('static/wasm/vale-tools.wasm');

test('every rule fires on its sample and not on its clean text', { skip: !staged }, async () => {
	const require = createRequire(import.meta.url);
	const zips = new Map();
	let got;
	let reply;
	globalThis.self = globalThis;
	globalThis.importScripts = (url) => require(`${process.cwd()}/static${url}`);
	globalThis.postMessage = (data) => {
		reply = data;
		got?.();
	};
	const realFetch = globalThis.fetch;
	globalThis.fetch = async (url) => new Response(zips.get(url) ?? readFileSync(`static${url}`));

	let id = 0;
	const lint = async (rule, text) => {
		const url = `/rules/${rule.id}.zip`;
		zips.set(url, zipSync({ [`Demo/${rule.id}.yml`]: strToU8(rule.yaml) }));
		const prefix = `/rules/${rule.id}`;
		const done = new Promise((r) => (got = r));
		globalThis.onmessage({
			data: {
				id: ++id,
				text,
				format: 'md',
				config: config(['Demo'], prefix),
				packages: [{ url, prefix }]
			}
		});
		await done;
		assert.equal(reply.error, undefined, `${rule.id}: ${reply.error}`);
		return reply.alerts.filter((a) => a.Check === `Demo.${rule.id}`);
	};

	try {
		require(`${process.cwd()}/static/workers/vale.js`);
		for (const rule of rules) {
			assert.ok((await lint(rule, rule.sample)).length, `${rule.id} did not fire on its sample`);
			assert.deepEqual(await lint(rule, rule.clean), [], `${rule.id} fired on its clean text`);
		}
	} finally {
		globalThis.fetch = realFetch;
	}
});
