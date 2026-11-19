/**
 * A value that follows another after a pause.
 *
 * The textarea updates on every keystroke; the analysis under it should not.
 * Short texts settle at once, so typing a sentence feels instant, and only a
 * long paste waits for the pause.
 */
export function settled(source: () => string, delay = 160) {
	let value = $state(source());

	$effect(() => {
		const next = source();
		if (next.length < 5_000) {
			value = next;
			return;
		}
		const id = setTimeout(() => (value = next), delay);
		return () => clearTimeout(id);
	});

	return {
		get value() {
			return value;
		}
	};
}
