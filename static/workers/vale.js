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
		void go.run(instance);
		for (let tries = 0; typeof self.ValeLint !== 'function'; tries++) {
			if (tries > 300) throw new Error('the engine did not start');
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
		self.postMessage({ id, error: err instanceof Error ? err.message : String(err) });
	}
};
