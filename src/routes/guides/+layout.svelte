<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Search from 'lucide-svelte/icons/search';
	import GuideLogo from '$lib/components/guides/GuideLogo.svelte';

	/**
	 * The explorer's own bar: its sections, a search that lands on the term
	 * list, and every guide by its mark, so any page is one step from any
	 * other.
	 */
	let { data, children } = $props();

	const path = $derived(page.url.pathname.replace(/\/$/, ''));
	const sections = [
		{ href: '/guides', label: 'Overview' },
		{ href: '/guides/terms', label: 'Terms' },
		{ href: '/guides/disagreements', label: 'Disagreements' }
	];
	const on = (href: string) =>
		href === '/guides'
			? path === '/guides'
			: path === href || (href === '/guides/terms' && path.startsWith('/guides/term/'));
	const current = $derived(path.match(/^\/guides\/([^/]+)$/)?.[1] ?? '');

	let query = $state('');
	function search(e: SubmitEvent) {
		e.preventDefault();
		const q = query.trim();
		if (q) goto(`/guides/terms?q=${encodeURIComponent(q)}`);
	}
</script>

<nav aria-label="Style guide explorer" class="border-b border-border bg-muted/30">
	<div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-2.5 lg:px-8">
		<ul class="flex items-center gap-1 text-sm">
			{#each sections as s (s.href)}
				<li>
					<a
						href={s.href}
						aria-current={on(s.href) ? 'page' : undefined}
						class="inline-flex h-9 items-center rounded-md px-3 font-medium transition-colors {on(
							s.href
						)
							? 'bg-lime-500/15 text-foreground'
							: 'text-muted-foreground hover:bg-muted hover:text-foreground'}">{s.label}</a
					>
				</li>
			{/each}
		</ul>

		<form role="search" onsubmit={search} class="relative ml-auto w-full sm:w-64">
			<Search
				class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
				aria-hidden="true"
			/>
			<input
				type="search"
				bind:value={query}
				placeholder="Find a term…"
				aria-label="Find a term"
				class="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-base focus:border-lime-500/60 focus:outline-none focus:ring-2 focus:ring-lime-500/30 sm:text-sm"
			/>
		</form>

		<!-- Every guide by its mark: a row that scrolls on a phone, and wraps on a wide screen. -->
		<ul
			class="-mx-6 flex w-[calc(100%+3rem)] gap-1.5 overflow-x-auto px-6 pb-0.5 [scrollbar-width:none] lg:mx-0 lg:w-full lg:flex-wrap lg:overflow-visible lg:px-0"
			aria-label="Guides"
		>
			{#each data.explorer as g (g.id)}
				<li class="shrink-0">
					<a
						href="/guides/{g.id}"
						aria-current={current === g.id ? 'page' : undefined}
						title={g.name}
						class="inline-flex h-9 items-center gap-2 rounded-lg border px-2.5 text-sm transition-colors {current ===
						g.id
							? 'border-lime-500/60 bg-lime-500/15 font-medium text-foreground'
							: 'border-border bg-card text-foreground/80 hover:border-lime-500/40'}"
					>
						<GuideLogo id={g.id} name={g.name} size="h-4 w-4" />
						<span class="whitespace-nowrap">{g.name}</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</nav>

{@render children()}
