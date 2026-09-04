<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import CodeBlock from '$lib/components/CodeBlock.svelte';

	let { data } = $props();
	const pkg = $derived(data.pkg);

	// A package's meta.json can declare the Vale version its rules need.
	// `>=1.0.0` is the legacy "any version" idiom, so only a real floor is
	// worth a reader's attention.
	const requires = $derived(
		!pkg.valeVersion || pkg.valeVersion === '>=1.0.0'
			? ''
			: pkg.valeVersion.replace(/^>=\s*/, 'Vale ≥ ')
	);

	// A rule's severity is the first thing people scan for, so the counts sit
	// above the table and the colours match the CLI's output.
	const counts = $derived(
		['error', 'warning', 'suggestion'].map((level) => ({
			level,
			n: pkg.rules.filter((r) => r.level === level).length
		}))
	);

	const levelClass: Record<string, string> = {
		error: 'text-red-500',
		warning: 'text-amber-500',
		suggestion: 'text-blue-500'
	};

	let query = $state('');
	const shown = $derived(
		pkg.rules.filter((r) => {
			const q = query.trim().toLowerCase();
			return !q || r.name.toLowerCase().includes(q) || r.message.toLowerCase().includes(q);
		})
	);

	// What a package ships under `config/` besides rules: views, vocabularies,
	// a dictionary, a template. Grouped by kind, since a kind is how a reader
	// knows what to do with one.
	type Asset = {
		kind: string;
		name: string;
		engine?: string;
		scopes?: string[];
		accept?: number;
		reject?: number;
	};
	const assetGroups = $derived(
		Object.entries(
			((pkg.assets ?? []) as Asset[]).reduce<Record<string, Asset[]>>((groups, a) => {
				(groups[a.kind] ??= []).push(a);
				return groups;
			}, {})
		)
	);
	const plural = (kind: string, n: number) =>
		n === 1
			? kind
			: kind === 'vocabulary'
				? 'vocabularies'
				: kind === 'dictionary'
					? 'dictionaries'
					: `${kind}s`;
</script>

<MetaTags
	title="{pkg.name} — Vale Package Explorer"
	description={pkg.description}
	canonical="https://vale.sh/explorer/{pkg.name}"
	openGraph={{
		url: `https://vale.sh/explorer/${pkg.name}`,
		title: `${pkg.name} — a Vale package`,
		description: pkg.description
	}}
/>

<div class="mx-auto max-w-5xl px-6 py-14 lg:px-8">
	<a
		href="/explorer"
		class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
	>
		<ArrowLeft class="h-4 w-4" />
		Package Explorer
	</a>

	<!-- Header -->
	<div class="mt-6 flex items-start gap-4">
		{#if pkg.logo}
			<img src={pkg.logo} alt="" class="h-12 w-12 rounded-lg object-contain" />
		{/if}
		<div class="min-w-0">
			<h1 class="text-3xl font-semibold tracking-tight">{pkg.name}</h1>
			<p class="mt-1 text-muted-foreground">{pkg.description}</p>
		</div>
	</div>

	<div class="mt-4 flex flex-wrap items-center gap-4 text-sm">
		<a
			href={pkg.homepage}
			target="_blank"
			rel="noreferrer"
			class="inline-flex items-center gap-1 font-medium text-lime-600 hover:underline dark:text-lime-400"
		>
			Source <ExternalLink class="h-3.5 w-3.5" />
		</a>
		{#each pkg.tags as tag}
			<span class="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground"
				>{tag}</span
			>
		{/each}
		{#if requires}
			<span
				class="rounded-full border border-lime-500/40 px-2.5 py-0.5 font-mono text-xs text-lime-600 dark:text-lime-400"
				title="This package's rules need this Vale version or later."
			>
				{requires}
			</span>
		{/if}
	</div>

	<!-- Install -->
	<section class="mt-10">
		<h2 class="text-lg font-semibold">Getting started</h2>
		<p class="mt-1 text-sm text-muted-foreground">
			Add it to your <code class="font-mono text-xs text-foreground">.vale.ini</code>, then run
			<code class="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">vale sync</code>.
		</p>
		<CodeBlock html={data.snippetHtml} code={data.snippet} class="mt-3" />
	</section>

	<!-- Assets -->
	{#if assetGroups.length}
		<section class="mt-12">
			<h2 class="text-lg font-semibold">
				Assets <span class="ml-1 text-sm font-normal text-muted-foreground"
					>{pkg.assets.length}</span
				>
			</h2>
			<p class="mt-1 text-sm text-muted-foreground">
				Files the package ships under <code class="font-mono text-xs text-foreground">config/</code
				>, installed alongside its rules by
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">vale sync</code
				>.
			</p>
			<ul class="mt-4 divide-y divide-border rounded-lg border border-border">
				{#each assetGroups as [kind, items]}
					<li class="flex flex-col gap-2 p-4">
						<span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							{items.length}
							{plural(kind, items.length)}
						</span>
						<ul class="flex flex-col gap-1.5">
							{#each items as a}
								<li class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
									<span class="font-mono font-medium">{a.name}</span>
									{#if a.engine}
										<span class="font-mono text-xs text-muted-foreground">{a.engine}</span>
									{/if}
									{#if a.scopes?.length}
										<span class="font-mono text-xs text-muted-foreground"
											>scopes: {a.scopes.join(', ')}</span
										>
									{/if}
									{#if a.kind === 'vocabulary'}
										<span class="text-xs text-muted-foreground">
											{a.accept ?? 0} accepted, {a.reject ?? 0} rejected
										</span>
									{/if}
								</li>
							{/each}
						</ul>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<!-- Rules -->
	<section class="mt-12">
		<div class="flex flex-wrap items-baseline justify-between gap-3">
			<h2 class="text-lg font-semibold">
				Rules <span class="ml-1 text-sm font-normal text-muted-foreground">{pkg.rules.length}</span>
			</h2>
			<div class="flex items-center gap-4 text-sm">
				{#each counts as c}
					{#if c.n}
						<span class={levelClass[c.level]}>{c.n} {c.level}</span>
					{/if}
				{/each}
			</div>
		</div>

		{#if pkg.rules.length === 0}
			<p class="mt-4 rounded-lg border border-border bg-muted/30 p-6 text-sm text-muted-foreground">
				This package ships configuration rather than rules — it sets up Vale for a particular format
				or workflow.
			</p>
		{:else}
			<input
				type="text"
				bind:value={query}
				placeholder="Filter rules…"
				class="mt-4 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm transition-colors placeholder:text-muted-foreground focus:border-lime-500/50 focus:outline-none focus:ring-2 focus:ring-lime-500/20"
			/>

			<ul
				class="mt-4 max-h-[60vh] divide-y divide-border overflow-y-auto rounded-lg border border-border"
			>
				{#each shown as rule}
					<li class="flex flex-col gap-1 p-4">
						<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
							<span class="font-mono text-sm font-medium">{pkg.name}.{rule.name}</span>
							<span class="text-xs {levelClass[rule.level]}">{rule.level}</span>
							<span class="font-mono text-xs text-muted-foreground">{rule.extends}</span>
							{#if rule.scope !== 'text'}
								<span class="font-mono text-xs text-muted-foreground">scope: {rule.scope}</span>
							{/if}
							{#if rule.link}
								<a
									href={rule.link}
									target="_blank"
									rel="noreferrer"
									class="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-lime-600 dark:hover:text-lime-400"
								>
									Style guide <ExternalLink class="h-3 w-3" />
								</a>
							{/if}
						</div>
						{#if rule.message}
							<p class="text-sm text-muted-foreground">{rule.message}</p>
						{/if}
					</li>
				{/each}
			</ul>

			{#if shown.length === 0}
				<p class="mt-4 text-sm text-muted-foreground">No rules match that filter.</p>
			{/if}
		{/if}
	</section>
</div>
