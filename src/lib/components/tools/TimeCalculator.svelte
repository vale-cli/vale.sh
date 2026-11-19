<script lang="ts">
	import Editor from '$lib/components/tools/Editor.svelte';
	import CopyButton from '$lib/components/tools/CopyButton.svelte';
	import { untrack } from 'svelte';
	import { settled } from '$lib/tools/settle.svelte';
	import { duration, words } from '$lib/tools/text';

	/**
	 * How long a text takes, to read or to say. The reading time and speech
	 * time calculators are this with different paces and a different table:
	 * one starts from a text and asks for a time, the other often starts from
	 * a time and asks for a length.
	 */
	let {
		kind,
		sample,
		placeholder,
		paces,
		initial
	}: {
		kind: 'reading' | 'speaking';
		sample: string;
		placeholder: string;
		/** The named paces, in words per minute. */
		paces: { label: string; wpm: number; note: string }[];
		/** The pace selected at first. */
		initial: number;
	} = $props();

	const fmt = new Intl.NumberFormat('en-US');
	const id = $props.id();

	let text = $state('');
	let typed = $state<number | null>(null);
	let wpm = $state(untrack(() => initial));
	let limit = $state<number | null>(null);

	const input = settled(() => text);
	const counted = $derived(words(input.value).length);
	const fromText = $derived(input.value.trim() !== '');
	// A text on the page wins over a number typed beside it.
	const total = $derived(fromText ? counted : Math.max(0, Math.floor(typed ?? 0)));
	const pace = $derived(Math.min(1000, Math.max(20, wpm || initial)));

	const minutes = $derived(Math.max(1, Math.ceil(total / pace)));
	const badge = $derived(`${minutes} min read`);

	// For a talk with a time limit: the length it allows, and how far off this is.
	const allowed = $derived(limit && limit > 0 ? Math.round(limit * pace) : 0);
	const gap = $derived(total - allowed);

	const lengths = [100, 250, 500, 750, 1000, 1500, 2000, 3000, 5000, 10000];
	const times = [1, 2, 3, 5, 7, 10, 15, 20, 30, 45, 60];
</script>

<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
	<div>
		<Editor bind:value={text} {sample} minHeight="20rem" {placeholder} />
		<div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
			<label for="{id}-words" class="text-foreground/85">Or enter a word count</label>
			<input
				id="{id}-words"
				type="number"
				min="0"
				inputmode="numeric"
				bind:value={typed}
				disabled={fromText}
				placeholder={fromText ? fmt.format(counted) : '1,000'}
				class="w-28 rounded-lg border border-border bg-card px-3 py-1.5 text-base tabular-nums focus:border-lime-500/60 focus:outline-none focus:ring-2 focus:ring-lime-500/30 disabled:opacity-60"
			/>
			{#if fromText}
				<span class="text-xs text-muted-foreground">Counted from your text.</span>
			{/if}
		</div>
	</div>

	<aside class="space-y-5 lg:sticky lg:top-24 lg:self-start" aria-live="polite">
		<div class="rounded-2xl border border-border bg-card p-5 shadow-sm">
			<div class="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
				{kind === 'reading' ? 'Reading time' : 'Speaking time'}
			</div>
			<div
				class="mt-2 text-4xl font-medium tabular-nums tracking-tight {total
					? 'text-foreground'
					: 'text-muted-foreground/40'}"
			>
				{total ? duration(total, pace) : '–'}
			</div>
			<p class="mt-2 text-sm text-foreground/85">
				{#if total}
					{fmt.format(total)} word{total === 1 ? '' : 's'} at {pace} a minute
				{:else}
					Paste a text or enter a word count
				{/if}
			</p>
			{#if kind === 'reading' && total}
				<div class="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-4">
					<span class="text-sm font-medium">{badge}</span>
					<CopyButton text={badge} />
				</div>
			{/if}
		</div>

		<fieldset class="rounded-2xl border border-border bg-card p-5">
			<legend class="sr-only">Pace</legend>
			<div class="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Pace</div>
			<div class="mt-3 space-y-1.5">
				{#each paces as p (p.label)}
					<button
						type="button"
						onclick={() => (wpm = p.wpm)}
						aria-pressed={pace === p.wpm}
						class="flex w-full items-baseline justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors {pace ===
						p.wpm
							? 'border-lime-500/60 bg-lime-500/15'
							: 'border-border hover:border-lime-500/40'}"
					>
						<span>
							<span class="font-medium text-foreground">{p.label}</span>
							<span class="block text-xs text-muted-foreground">{p.note}</span>
						</span>
						<span class="shrink-0 tabular-nums text-muted-foreground">{p.wpm}</span>
					</button>
				{/each}
			</div>
			<label class="mt-3 flex items-center justify-between gap-3 text-sm text-foreground/85">
				Words per minute
				<input
					type="number"
					min="20"
					max="1000"
					inputmode="numeric"
					bind:value={wpm}
					class="w-24 rounded-lg border border-border bg-background px-3 py-1.5 text-base tabular-nums focus:border-lime-500/60 focus:outline-none focus:ring-2 focus:ring-lime-500/30"
				/>
			</label>
		</fieldset>

		{#if kind === 'speaking'}
			<div class="rounded-2xl border border-border bg-card p-5">
				<label
					for="{id}-limit"
					class="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
				>
					Time limit
				</label>
				<div class="mt-3 flex items-center gap-2 text-sm">
					<input
						id="{id}-limit"
						type="number"
						min="0"
						step="0.5"
						inputmode="decimal"
						bind:value={limit}
						placeholder="5"
						class="w-24 rounded-lg border border-border bg-background px-3 py-1.5 text-base tabular-nums focus:border-lime-500/60 focus:outline-none focus:ring-2 focus:ring-lime-500/30"
					/>
					minutes
				</div>
				<p class="mt-3 text-sm leading-6 text-foreground/85">
					{#if !allowed}
						Enter the time you have to see how many words fit.
					{:else}
						That is about <strong class="font-medium text-foreground"
							>{fmt.format(allowed)} words</strong
						>
						at this pace.
						{#if total && gap > 0}
							<span class="text-amber-700 dark:text-amber-400"
								>You are {fmt.format(gap)} over: cut about {duration(gap, pace)}.</span
							>
						{:else if total && gap < 0}
							You have room for {fmt.format(-gap)} more, about {duration(-gap, pace)}.
						{:else if total}
							You are right on it.
						{/if}
					{/if}
				</p>
			</div>
		{/if}
	</aside>
</div>

<h2 class="mt-12 text-lg font-medium">
	{kind === 'reading' ? 'Reading time by word count' : 'Words by length of speech'}
</h2>
<div class="mt-3 overflow-x-auto rounded-2xl border border-border bg-card">
	<table class="w-full text-left text-sm">
		<thead class="border-b border-border text-xs text-muted-foreground">
			<tr>
				<th scope="col" class="px-4 py-2.5 font-medium">
					{kind === 'reading' ? 'Words' : 'Speech'}
				</th>
				{#each paces as p (p.label)}
					<th
						scope="col"
						class="whitespace-nowrap px-4 py-2.5 text-right font-medium {pace === p.wpm
							? 'text-foreground'
							: ''}"
					>
						{p.label}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody class="divide-y divide-border tabular-nums">
			{#each kind === 'reading' ? lengths : times as n (n)}
				<tr>
					<th scope="row" class="whitespace-nowrap px-4 py-2.5 font-normal">
						{kind === 'reading' ? fmt.format(n) : `${n} min`}
					</th>
					{#each paces as p (p.label)}
						<td
							class="whitespace-nowrap px-4 py-2.5 text-right {pace === p.wpm
								? 'font-medium text-foreground'
								: 'text-muted-foreground'}"
						>
							{kind === 'reading' ? duration(n, p.wpm) : fmt.format(n * p.wpm)}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
