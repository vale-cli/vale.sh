<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import { fileName, kindInfo, requires } from '$lib/data/assets';

	let { data } = $props();
	const asset = $derived(data.asset);
	const info = $derived(kindInfo[asset.kind]);
	const floor = $derived(requires(asset));
	const source = $derived(`https://github.com/vale-cli/packages/blob/master/${asset.path}`);
</script>

<MetaTags
	title="{asset.name} — Vale Asset Explorer"
	description={asset.description}
	canonical="https://vale.sh/explorer/assets/{asset.name}"
	openGraph={{
		url: `https://vale.sh/explorer/assets/${asset.name}`,
		title: `${asset.name} — a Vale ${asset.kind}`,
		description: asset.description
	}}
/>

<div class="mx-auto max-w-5xl px-6 py-14 lg:px-8">
	<a
		href="/explorer/assets"
		class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
	>
		<ArrowLeft class="h-4 w-4" />
		Asset Explorer
	</a>

	<!-- Header -->
	<div class="mt-6">
		<h1 class="text-3xl font-semibold tracking-tight">{asset.name}</h1>
		<p class="mt-1 text-muted-foreground">{asset.description}</p>
	</div>

	<div class="mt-4 flex flex-wrap items-center gap-4 text-sm">
		<span class="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
			>{asset.kind}</span
		>
		{#each asset.tags as tag}
			<span class="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground"
				>{tag}</span
			>
		{/each}
		{#if floor}
			<span
				class="rounded-full border border-lime-500/40 px-2.5 py-0.5 font-mono text-xs text-lime-600 dark:text-lime-400"
				title="This asset needs this Vale version or later."
			>
				{floor}
			</span>
		{/if}
		<a
			href={source}
			target="_blank"
			rel="noreferrer"
			class="inline-flex items-center gap-1 font-medium text-lime-600 hover:underline dark:text-lime-400"
		>
			Source <ExternalLink class="h-3.5 w-3.5" />
		</a>
	</div>

	<!-- Install -->
	<section class="mt-10">
		<h2 class="text-lg font-semibold">Getting started</h2>
		<p class="mt-1 text-sm text-muted-foreground">
			Save the file as
			<code class="font-mono text-xs text-foreground">{info.dir}/{fileName(asset)}</code>
			under your <code class="font-mono text-xs text-foreground">StylesPath</code>, then:
		</p>
		<CodeBlock html={data.usageHtml} code={asset.usage} class="mt-3" />
	</section>

	<!-- The file -->
	<section class="mt-12">
		<div class="flex flex-wrap items-baseline justify-between gap-3">
			<h2 class="text-lg font-semibold">
				{fileName(asset)}
			</h2>
			<span class="text-sm text-muted-foreground">{info.blurb}</span>
		</div>
		<CodeBlock html={data.html} code={asset.content} class="mt-3" />
	</section>
</div>
