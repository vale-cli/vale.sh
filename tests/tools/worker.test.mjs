import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { config, place } from '../../src/lib/tools/vale.ts';

/*
	The worker itself, run here against the staged engine: `self`, `fetch`, and
	`importScripts` are the three things it asks of a browser. Skipped until
	script/wasm.mjs has staged the engine.
*/
// The engine holds a timer open for as long as it lives, so the file has to
// end itself once its tests have reported.
after(() => setImmediate(() => process.exit()));

const staged =
	existsSync('static/wasm/vale-tools.wasm') && existsSync('static/wasm/packages/write-good.zip');

test('the worker lints with a staged package', { skip: !staged }, async () => {
	const require = createRequire(import.meta.url);
	const replies = [];
	let got;
	globalThis.self = globalThis;
	globalThis.importScripts = (url) => require(`${process.cwd()}/static${url}`);
	globalThis.postMessage = (data) => {
		replies.push(data);
		got?.();
	};
	const realFetch = globalThis.fetch;
	globalThis.fetch = async (url) => new Response(readFileSync(`static${url}`));
	const reply = () => new Promise((r) => (got = r));

	try {
		require(`${process.cwd()}/static/workers/vale.js`);
		const text = 'One line.\nThe report was written by the committee.\n';
		const job = {
			text,
			format: 'md',
			config: config(['write-good']),
			packages: [{ url: '/wasm/packages/write-good.zip', prefix: '/styles' }]
		};

		globalThis.onmessage({ data: { id: 1, ...job } });
		await reply();
		assert.equal(replies[0].error, undefined, replies[0].error);
		const passive = place(text, replies[0].alerts).find(
			(p) => p.alert.Check === 'write-good.Passive'
		);
		assert.equal(text.slice(passive.from, passive.to), 'was written');

		globalThis.onmessage({
			data: { id: 2, ...job, packages: [{ url: '/wasm/packages/none.zip', prefix: '/styles' }] }
		});
		await reply();
		assert.equal(replies[1].id, 2);
		assert.match(replies[1].error, /none\.zip/);
	} finally {
		globalThis.fetch = realFetch;
	}
});
