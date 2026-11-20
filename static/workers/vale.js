/*
 * Vale, for the pages under /tools, off the main thread.
 *
 * A classic worker, served as written: Go's loader is a classic script, and
 * importScripts is how a worker runs one. The engine and the packages are
 * staged by script/wasm.mjs; see src/lib/tools/vale.ts for the other end.
 *
 *   in   { id, text, format, config, packages: [{ url, prefix }] }
 *   out  { id, alerts } or { id, error }
 */

/* global Go, ValeLint, ValeAddPackage */

let engine;
const added = new Set();

function start() {
	engine ??= (async () => {
		importScripts('/wasm/wasm_exec.js');
		const go = new Go();

		const res = await fetch('/wasm/vale-tools.wasm');
		if (!res.ok) throw new Error(`the engine is unavailable (${res.status})`);

		let instance;
		try {
			({ instance } = await WebAssembly.instantiateStreaming(res.clone(), go.importObject));
		} catch {
			// A server that doesn't send application/wasm can't be streamed.
			({ instance } = await WebAssembly.instantiate(await res.arrayBuffer(), go.importObject));
		}

		// Never resolves: the module stays resident and installs its functions.
		// A phone can take far longer than a laptop to get here, and timers in
		// a busy worker fire late, so the deadline is wall-clock time, not a
		// count of polls.
		void go.run(instance);
		const deadline = performance.now() + 30_000;
		while (typeof self.ValeLint !== 'function') {
			if (performance.now() > deadline) throw new Error('the engine did not start');
			await new Promise((r) => setTimeout(r, 10));
		}
	})();
	return engine;
}

async function add(pkg) {
	if (added.has(pkg.url)) return;
	const res = await fetch(pkg.url);
	if (!res.ok) throw new Error(`${pkg.url} is unavailable (${res.status})`);
	const out = ValeAddPackage(pkg.prefix, new Uint8Array(await res.arrayBuffer()));
	if (out.error) throw new Error(out.error);
	added.add(pkg.url);
}

self.onmessage = async (event) => {
	const { id, text, format, config, packages } = event.data;
	try {
		await start();
		for (const pkg of packages) await add(pkg);

		const out = ValeLint(text, format, config);
		if (out.error) throw new Error(out.error);

		self.postMessage({ id, alerts: Object.values(JSON.parse(out.result)).flat() });
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		// Vale colors its errors for a terminal; a page shows the text.
		// eslint-disable-next-line no-control-regex
		self.postMessage({ id, error: message.replace(/\x1b\[[0-9;]*m/g, '').trim() });
	}
};
