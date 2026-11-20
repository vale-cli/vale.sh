#!/usr/bin/env node
/**
 * Stages the assets the pages under /tools and the /explorer demo load at
 * runtime:
 *
 *   static/wasm/vale.wasm          the engine
 *   static/wasm/vale-tools.wasm    the engine the pages under /tools load
 *   static/wasm/packages/<x>.zip   each package's StylesPath
 *   static/wasm/wasm_exec.js       Go's loader shim
 *
 *   node script/wasm.mjs
 *
 * None of it is committed. The tools' engine is built from a pinned commit of
 * Vale (VALE_REF below), or taken from VALE_TOOLS_WASM when working on the
 * engine itself; the demo's comes from a release, or from VALE_WASM.
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
// The pages under /tools lint Markdown and text only, so they load the
// smaller build `make wasm-min` produces in the Vale repository. Without it
// they keep the checks they run on their own.
const TOOLS = process.env.VALE_TOOLS_WASM;
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

/**
 * The tools' engine from the latest Vale release: `vale_<version>_wasm_min.tar.gz`
 * holds the module and the loader from the toolchain that built it, so the
 * two are taken together.
 */
async function toolsFromRelease() {
	const res = await fetch('https://api.github.com/repos/vale-cli/vale/releases/latest', {
		headers: { Accept: 'application/vnd.github+json' }
	});
	if (!res.ok) throw new Error(`${res.status} reading the latest release`);
	const release = await res.json();
	const asset = release.assets?.find((a) => a.name.endsWith('_wasm_min.tar.gz'));
	if (!asset) throw new Error(`${release.tag_name} has no minimal wasm build`);

	const { execFileSync } = await import('node:child_process');
	const { mkdtemp, rm } = await import('node:fs/promises');
	const { tmpdir } = await import('node:os');
	const dir = await mkdtemp(`${tmpdir()}/vale-wasm-`);
	try {
		await download(asset.browser_download_url, `${dir}/min.tar.gz`);
		execFileSync('tar', ['-xzf', `${dir}/min.tar.gz`, '-C', dir]);
		await writeFile(`${OUT}/vale-tools.wasm`, await readFile(`${dir}/vale-min.wasm`));
		await writeFile(SHIM, await readFile(`${dir}/wasm_exec.js`));
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
	return release.tag_name;
}

/**
 * The commit of Vale the tools' engine is built from. The site carries its
 * own engine this way: built here, from source it names, so a deploy does
 * not wait on a Vale release. Move it forward to pick up engine changes.
 */
const VALE_REF = 'c198c5dea8e5a3565f0829f02b7b64559bdb5d57';
// vale_nodict: the tools' spelling rules bring their own dictionaries.
const TOOLS_TAGS = 'vale_nocode vale_noconvert vale_noviews vale_noexpr vale_nodict';

/** Builds the tools' engine from VALE_REF. Needs git and Go. */
async function toolsFromSource() {
	const { execFileSync } = await import('node:child_process');
	const { mkdtemp, rm } = await import('node:fs/promises');
	const { tmpdir } = await import('node:os');
	const dir = await mkdtemp(`${tmpdir()}/vale-src-`);
	// Vale names the Go it needs; `auto` lets an older one fetch it, which
	// CI's Go setup otherwise switches off.
	const env = { ...process.env, GOTOOLCHAIN: 'auto', GOOS: 'js', GOARCH: 'wasm', CGO_ENABLED: '0' };
	const run = (cmd, args, options = {}) =>
		execFileSync(cmd, args, { cwd: dir, stdio: ['ignore', 'pipe', 'pipe'], ...options });
	try {
		run('git', ['init', '-q']);
		run('git', ['fetch', '-q', '--depth', '1', 'https://github.com/vale-cli/vale', VALE_REF]);
		run('git', ['checkout', '-q', 'FETCH_HEAD']);
		run(
			'go',
			[
				'build',
				'-trimpath',
				'-ldflags',
				'-s -w',
				'-tags',
				TOOLS_TAGS,
				'-o',
				'vale-min.wasm',
				'./cmd/valew'
			],
			{ env }
		);
		// The loader has to come from the toolchain that built the module.
		const goroot = run('go', ['env', 'GOROOT'], { env }).toString().trim();
		await writeFile(`${OUT}/vale-tools.wasm`, await readFile(`${dir}/vale-min.wasm`));
		await writeFile(SHIM, await readFile(`${goroot}/lib/wasm/wasm_exec.js`));
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
}

if (TOOLS) {
	await writeFile(`${OUT}/vale-tools.wasm`, await readFile(TOOLS));
	console.log(`  vale-tools.wasm from ${TOOLS}`);
} else if (await exists(`${OUT}/vale-tools.wasm`)) {
	console.log('  vale-tools.wasm already present');
} else {
	try {
		await toolsFromSource();
		console.log(`  vale-tools.wasm built from Vale ${VALE_REF.slice(0, 8)}`);
	} catch (built) {
		try {
			console.log(`  vale-tools.wasm from Vale ${await toolsFromRelease()}`);
		} catch (err) {
			// The pages under /tools keep the checks they run on their own.
			console.warn(
				`  vale-tools.wasm unavailable (build: ${String(built.message).split('\n')[0]}; release: ${err.message}); /tools runs without the engine`
			);
		}
	}
}

// The pages ask whether they have an engine at build time; see
// src/lib/server/engine.ts. The marker is not committed.
const MARKER = 'src/lib/data/tools/engine.local.json';
if (await exists(`${OUT}/vale-tools.wasm`)) {
	await writeFile(MARKER, '{}\n');
} else {
	const { rm } = await import('node:fs/promises');
	await rm(MARKER, { force: true });
}

// 2. Go's loader shim, which has to match the toolchain that built the engine.
if (!(await exists(SHIM))) {
	try {
		const { execSync } = await import('node:child_process');
		const goroot = execSync('go env GOROOT').toString().trim();
		await writeFile(SHIM, await readFile(`${goroot}/lib/wasm/wasm_exec.js`));
		console.log(`  wasm_exec.js   from ${goroot}`);
	} catch (err) {
		// Without an engine there is nothing for it to load.
		console.warn(`  wasm_exec.js   unavailable (${err.message})`);
	}
}

// 3. Each package's styles.
const packages = JSON.parse(await readFile('src/lib/data/packages.json', 'utf8'));
// Used by a tool, and not in the package library.
packages.push({
	name: 'Modelese',
	url: 'https://github.com/jdkato/Modelese/releases/download/v0.2.0/Modelese.zip',
	rules: [{}]
});
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
