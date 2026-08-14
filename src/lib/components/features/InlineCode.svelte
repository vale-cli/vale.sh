<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * A literal inside body prose -- a file name, a key, a flag.
	 *
	 * One definition of what "as code" looks like. The pages that predate this
	 * each spelled the same chip out by hand, and had drifted: some carried the
	 * muted background, some were bare monospace, one was lime.
	 *
	 * For a literal inside a heading or a mock UI, style it there instead --
	 * a chip with its own background is wrong in both.
	 */
	let { children }: { children: Snippet } = $props();
</script>

<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">{@render children()}</code>
