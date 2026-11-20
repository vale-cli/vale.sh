import { onDestroy, untrack } from 'svelte';
import { createEngine, place, type Engine, type Placed, type ValeSpec } from './vale';

/**
 * Vale's findings for a text that changes, for a page to show once they are
 * in.
 *
 * `result` is the last answer and the text it was for. A page keeps showing
 * it while the next one is on its way, since the editor moves the marks it
 * already has with each edit; `fresh` says whether it is for the text as it
 * stands.
 *
 * The engine isn't fetched until there is something to check, or until
 * `warm` is called: a page calls it when its editor is first touched, so the
 * download and the linter's start are under way before the first text.
 */
export function useVale(source: () => string, spec: ValeSpec | (() => ValeSpec)) {
	let state = $state<'idle' | 'loading' | 'ready' | 'failed'>('idle');
	let result = $state.raw<{ text: string; config: string; placed: Placed[] } | null>(null);
	// Why the engine failed, as the worker or the browser put it.
	let error = $state<string | null>(null);
	let engine: Engine | null = null;
	// Not reactive: the effect below must not rerun when it changes.
	let failed = false;

	$effect(() => {
		const text = source();
		// A page that switches configuration passes a function; reading it
		// here lints again when it changes.
		const current = typeof spec === 'function' ? spec() : spec;
		if (failed) return;
		if (!text.trim()) {
			result = null;
			return;
		}

		engine ??= createEngine(current);
		// A warmed engine is still idle as far as the page has been told.
		if (untrack(() => state) === 'idle') state = 'loading';
		engine
			.lint(text, current)
			.then((alerts) => {
				if (!alerts) return; // a later text replaced this one
				result = { text, config: current.config, placed: place(text, alerts) };
				state = 'ready';
			})
			.catch(fail);
	});

	const fail = (e: unknown) => {
		failed = true;
		error = e instanceof Error ? e.message : String(e);
		console.error('Vale did not load:', e);
		state = 'failed';
		result = null;
	};

	/** Starts the engine and its linter ahead of the first text. */
	function warm() {
		if (failed || engine) return;
		const current = typeof spec === 'function' ? spec() : spec;
		engine = createEngine(current);
		// A sentence, so that what the first lint sets up is set up too. Its
		// findings are nobody's.
		engine.lint('Start the engine early.', current).catch(fail);
	}

	onDestroy(() => engine?.dispose());

	return {
		get state() {
			return state;
		},
		get result() {
			return result;
		},
		get error() {
			return error;
		},
		warm,
		get fresh() {
			return result !== null && result.text === source();
		}
	};
}
