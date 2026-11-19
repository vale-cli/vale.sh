/**
 * Whether this build has Vale's browser engine to serve.
 *
 * script/wasm.mjs leaves a marker beside the tools' data when it stages the
 * engine. A page that only works with the engine is left out of a build
 * without it, so the site can be published before the engine is and pick it
 * up on the first build after.
 */
export const engineStaged =
	Object.keys(import.meta.glob('$lib/data/tools/engine.local.json')).length > 0;
