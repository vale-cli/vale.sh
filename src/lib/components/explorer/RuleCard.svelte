<script lang="ts">
	import { onMount } from 'svelte';
	import Check from 'lucide-svelte/icons/check';
	import Copy from 'lucide-svelte/icons/copy';
	import RotateCcw from 'lucide-svelte/icons/rotate-ccw';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import type { GalleryRule } from '$lib/data/rule-gallery';
	import type { ValeAlert } from '$lib/tools/vale';

	let {
		rule,
		lint
	}: {
		rule: GalleryRule;
		lint: (id: string, yaml: string, text: string) => Promise<ValeAlert[]>;
	} = $props();

	// svelte-ignore state_referenced_locally
	let yaml = $state(rule.yaml);
	// svelte-ignore state_referenced_locally
	let text = $state(rule.sample);
	let alerts = $state<ValeAlert[] | null>(null);
	let error = $state<string | null>(null);
	let busy = $state(false);
	let copied = $state(false);
	let seen = false;
	let card: HTMLElement;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let run = 0;

	async function check() {
		const mine = ++run;
		busy = true;
		try {
			const out = await lint(rule.id, yaml, text);
			if (mine !== run) return;
			alerts = out;
			error = null;
		} catch (e) {
			if (mine !== run) return;
			alerts = null;
			error = e instanceof Error ? e.message : String(e);
		} finally {
			if (mine === run) busy = false;
		}
	}

	// Edits relint after a pause; nothing runs until the card is on screen.
	function schedule() {
		if (!seen) return;
		clearTimeout(timer);
		timer = setTimeout(check, 400);
	}

	onMount(() => {
		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					seen = true;
					io.disconnect();
					check();
				}
			},
			{ rootMargin: '200px' }
		);
		io.observe(card);
		return () => {
			io.disconnect();
			clearTimeout(timer);
		};
	});

	function reset() {
		yaml = rule.yaml;
		text = rule.sample;
		schedule();
	}

	async function copy() {
		await navigator.clipboard.writeText(yaml);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	const edited = $derived(yaml !== rule.yaml || text !== rule.sample);

	const tone: Record<string, string> = {
		error: 'text-rose-600 dark:text-rose-400',
		warning: 'text-amber-600 dark:text-amber-400',
		suggestion: 'text-sky-600 dark:text-sky-400'
	};
</script>

<article
	bind:this={card}
	id={rule.id}
	class="scroll-mt-24 rounded-2xl border border-border bg-card p-5 sm:p-6"
>
	<header class="flex flex-wrap items-start justify-between gap-3">
		<div class="min-w-0">
			<h3 class="text-lg font-semibold tracking-tight">{rule.title}</h3>
			<p class="mt-1 text-sm text-muted-foreground">{rule.summary}</p>
		</div>
		<div class="flex items-center gap-1">
			{#if edited}
				<button
					type="button"
					onclick={reset}
					class="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
				>
					<RotateCcw class="size-3.5" /> Reset
				</button>
			{/if}
			<button
				type="button"
				onclick={copy}
				class="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
			>
				{#if copied}<Check class="size-3.5" /> Copied{:else}<Copy class="size-3.5" /> Copy rule{/if}
			</button>
		</div>
	</header>

	<div class="mt-4 grid gap-3 lg:grid-cols-2">
		<label class="block min-w-0">
			<span class="text-xs font-medium text-muted-foreground">{rule.id}.yml</span>
			<textarea
				bind:value={yaml}
				oninput={schedule}
				spellcheck="false"
				rows={Math.min(Math.max(yaml.split('\n').length, 8), 22)}
				class="mt-1 w-full resize-y rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs leading-5 outline-none focus:border-lime-500/60 focus:ring-2 focus:ring-lime-500/20"
			></textarea>
		</label>
		<div class="flex min-w-0 flex-col">
			<label class="block">
				<span class="text-xs font-medium text-muted-foreground">sample.md</span>
				<textarea
					bind:value={text}
					oninput={schedule}
					spellcheck="false"
					rows={Math.min(Math.max(text.split('\n').length, 6), 14)}
					class="mt-1 w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-xs leading-5 outline-none focus:border-lime-500/60 focus:ring-2 focus:ring-lime-500/20"
				></textarea>
			</label>
			<div
				class="mt-2 min-h-16 rounded-lg border border-dashed border-border p-3 text-xs"
				aria-live="polite"
			>
				{#if error}
					<p class="text-rose-600 dark:text-rose-400">{error}</p>
				{:else if alerts === null}
					<p class="flex items-center gap-2 text-muted-foreground">
						<LoaderCircle class="size-3.5 animate-spin" /> Loading Vale…
					</p>
				{:else if alerts.length === 0}
					<p class="text-muted-foreground">No alerts{busy ? '…' : '.'}</p>
				{:else}
					<ul class="space-y-1.5 font-mono">
						{#each alerts as a, i (i)}
							<li class="break-words">
								<span class="text-muted-foreground">{a.Line}:{a.Span[0]}</span>
								<span class={tone[a.Severity] ?? ''}>{a.Severity}</span>
								{a.Message}
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	</div>

	{#if rule.credits.length}
		<p class="mt-4 text-xs text-muted-foreground">
			Modeled on rules from
			{#each rule.credits as c, i (c.url)}<a
					href={c.url}
					target="_blank"
					rel="noreferrer"
					class="font-medium text-foreground hover:text-lime-600 hover:underline dark:hover:text-lime-400"
					>{c.name}</a
				>{i < rule.credits.length - 2
					? ', '
					: i === rule.credits.length - 2
						? ', and '
						: ''}{/each}.
		</p>
	{/if}
</article>
