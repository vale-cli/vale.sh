<script lang="ts">
	// A draft, its rewrite, and the redline between them, as tabs. The diff is
	// a word-level LCS computed here rather than shipped as data, so it can
	// never disagree with the texts it compares.
	type Tab = 'before' | 'after' | 'diff';

	let {
		before,
		after,
		beforeLabel = 'Before',
		afterLabel = 'After',
		beforeHref,
		afterHref,
		initial = 'before'
	}: {
		before: string;
		after: string;
		beforeLabel?: string;
		afterLabel?: string;
		beforeHref?: string;
		afterHref?: string;
		initial?: Tab;
	} = $props();

	let tab = $state<Tab>(initial);

	// When the rewrite swaps out underneath us -- a different voice in the
	// demo -- jump to it. The draft side is shared, so staying on Before
	// would make every voice look identical.
	let prevAfter = after;
	$effect(() => {
		if (after !== prevAfter) {
			prevAfter = after;
			tab = 'after';
		}
	});

	type Seg = { text: string; kind: 'same' | 'del' | 'add' };

	// Tokens keep their whitespace (including newlines), so the redline
	// preserves the drafts' paragraph structure.
	const tokenize = (s: string) => s.split(/(\s+)/).filter(Boolean);

	const diff = (a: string, b: string): Seg[] => {
		const A = tokenize(a);
		const B = tokenize(b);
		const n = A.length;
		const m = B.length;

		const dp: Int32Array[] = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
		for (let i = n - 1; i >= 0; i--) {
			for (let j = m - 1; j >= 0; j--) {
				dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
			}
		}

		const segs: Seg[] = [];
		const push = (text: string, kind: Seg['kind']) => {
			const last = segs[segs.length - 1];
			if (last && last.kind === kind) last.text += text;
			else segs.push({ text, kind });
		};

		let i = 0;
		let j = 0;
		while (i < n && j < m) {
			if (A[i] === B[j]) {
				push(A[i], 'same');
				i++;
				j++;
			} else if (dp[i + 1][j] >= dp[i][j + 1]) {
				push(A[i], 'del');
				i++;
			} else {
				push(B[j], 'add');
				j++;
			}
		}
		while (i < n) push(A[i++], 'del');
		while (j < m) push(B[j++], 'add');
		return segs;
	};

	const segs = $derived(diff(before, after));

	const pre =
		'block whitespace-pre-wrap break-words p-4 font-mono text-[11px] leading-relaxed text-foreground/90';
	const tabBtn = (active: boolean) =>
		`rounded-t-md border-x border-t px-3 py-1.5 text-xs font-medium transition-colors ${
			active
				? 'border-border bg-card text-foreground'
				: 'border-transparent text-muted-foreground hover:text-foreground'
		}`;

	const link =
		'inline-flex items-center gap-1 text-[11px] text-muted-foreground/70 underline decoration-dotted underline-offset-4 hover:text-foreground';
</script>

<div class="not-prose my-6">
	<div class="flex items-end justify-between gap-2">
		<div class="flex" role="tablist">
			<button
				type="button"
				role="tab"
				aria-selected={tab === 'before'}
				onclick={() => (tab = 'before')}
				class={tabBtn(tab === 'before')}
			>
				{beforeLabel}
				<span class="ml-1.5 font-mono text-[10px] text-rose-400">exit 1</span>
			</button>
			<button
				type="button"
				role="tab"
				aria-selected={tab === 'after'}
				onclick={() => (tab = 'after')}
				class={tabBtn(tab === 'after')}
			>
				{afterLabel}
				<span class="ml-1.5 font-mono text-[10px] text-lime-600 dark:text-lime-400">exit 0</span>
			</button>
			<button
				type="button"
				role="tab"
				aria-selected={tab === 'diff'}
				onclick={() => (tab = 'diff')}
				class={tabBtn(tab === 'diff')}
			>
				Diff
			</button>
		</div>
		{#if tab === 'before' && beforeHref}
			<a class={link} href={beforeHref}>source</a>
		{:else if tab === 'after' && afterHref}
			<a class={link} href={afterHref}>source</a>
		{/if}
	</div>

	<div class="-mt-px overflow-hidden rounded-xl rounded-tl-none border border-border bg-card">
		{#if tab === 'before'}
			<pre class={pre}>{before}</pre>
		{:else if tab === 'after'}
			<pre class={pre}>{after}</pre>
		{:else}
			<pre
				class={pre}>{#each segs as seg, i (i)}{#if seg.kind === 'same'}{seg.text}{:else if seg.kind === 'del'}<del
							class="rounded-[2px] bg-rose-500/15 text-rose-600 no-underline dark:text-rose-400"
							>{seg.text}</del
						>{:else}<ins
							class="rounded-[2px] bg-lime-500/20 text-lime-700 no-underline dark:text-lime-300"
							>{seg.text}</ins
						>{/if}{/each}</pre>
		{/if}
	</div>
</div>
