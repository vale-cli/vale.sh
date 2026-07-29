#!/usr/bin/env node
/**
 * Not currently wired into the build: the demo it feeds is disabled, and the
 * default engine URL below 404s because libvale is private. Publish vale.wasm
 * to a public release first — nothing proprietary links into it, `go list -deps
 * ./cmd/valew` is the linting core only.
 *
 * Stages the assets the /explorer demo loads at runtime:
 *
 *   static/wasm/vale.wasm          the engine
 *   static/wasm/packages/<x>.zip   each package's StylesPath
 *   static/wasm/wasm_exec.js       Go's loader shim
 *
 *   node script/wasm.mjs
 *
 * None of it is committed — vale.wasm alone is ~34 MB. The engine comes from a
 * pinned libvale release so the site's build doesn't depend on a private
 * checkout; set VALE_WASM to a local file when working on the engine itself.
 *
 * The package archives are the same ones `vale sync` downloads, so the demo
 * lints against exactly what a reader would install.
 */

import { createWriteStream } from 'node:fs';
import { mkdir, writeFile, readFile, stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const WASM_RELEASE =
	process.env.VALE_WASM_URL ??
	'https://github.com/vale-cli/libvale/releases/latest/download/vale.wasm';
const LOCAL = process.env.VALE_WASM; // a locally built engine, for engine work
const OUT = 'static/wasm';
const SHIM = `${OUT}/wasm_exec.js`;

async function exists(p) {
	try {
		await stat(p);
		return true;
	} catch {
		return false;
	}
}

async function download(url, dest) {
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`${res.status} fetching ${url}`);
	}
	await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

await mkdir(`${OUT}/packages`, { recursive: true });

// 1. The engine.
if (LOCAL) {
	await writeFile(`${OUT}/vale.wasm`, await readFile(LOCAL));
	console.log(`  vale.wasm      from ${LOCAL}`);
} else if (await exists(`${OUT}/vale.wasm`)) {
	console.log('  vale.wasm      already present');
} else {
	try {
		await download(WASM_RELEASE, `${OUT}/vale.wasm`);
		console.log(`  vale.wasm      from ${WASM_RELEASE}`);
	} catch (err) {
		// The demo is one section of one page; the rest of the site should
		// still build without it.
		console.warn(`  vale.wasm      unavailable (${err.message}) — the demo will not load`);
	}
}

// 2. Go's loader shim, which has to match the toolchain that built the engine.
if (!(await exists(SHIM))) {
	const { execSync } = await import('node:child_process');
	const goroot = execSync('go env GOROOT').toString().trim();
	await writeFile(SHIM, await readFile(`${goroot}/lib/wasm/wasm_exec.js`));
	console.log(`  wasm_exec.js   from ${goroot}`);
}

// 3. Each package's styles.
const packages = JSON.parse(await readFile('src/lib/data/packages.json', 'utf8'));
let staged = 0;
for (const pkg of packages) {
	if (!pkg.rules?.length) {
		continue; // Config-only packages have nothing to demo.
	}
	try {
		await download(pkg.url, `${OUT}/packages/${pkg.name}.zip`);
		staged++;
	} catch (err) {
		console.warn(`  ${pkg.name}: ${err.message}`);
	}
}
console.log(`  packages/      ${staged} archives`);
