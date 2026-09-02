<script lang="ts">
	import { siteConfig } from '$lib/config/site.js';
	import { mode } from 'mode-watcher';
	import { onMount } from 'svelte';

	let cardColor = '';
	onMount(() => {
		mode.subscribe((value) => {
			cardColor = value == 'dark' ? 'bg-gray-400' : 'bg-gray-100';
		});
	});
</script>

<div class="px-6 py-14 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-2xl sm:text-center">
		<h2 class="text-base/7 font-semibold text-lime-600 dark:text-lime-400">Vale CLI</h2>
		<h2 class="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
			Your style, our editor
		</h2>
		<p class="mx-auto mt-6 max-w-xl text-pretty text-lg/8 text-neutral-500">
			Vale is an open-source, command-line tool that brings your editorial style guide to life.
		</p>
		<div class="mt-10 flex items-center justify-center gap-x-6">
			<a
				href="https://docs.vale.sh/topics/installation"
				class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
				>Get Started</a
			>
			<a href="https://docs.vale.sh" class="text-sm/6 font-semibold"
				>Learn more <span aria-hidden="true">→</span></a
			>
		</div>
	</div>
	<img
		src="/media/mac.png"
		alt="App screenshot"
		class="mx-auto mt-10"
		style="width:85%;max-width:700px"
	/>
	<dl
		class="grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4"
	>
		<div class="flex flex-col {cardColor} p-8 text-gray-800">
			<dt class="text-sm/6 font-semibold underline">
				<a href={siteConfig.links.github}>Stars on GitHub</a>
			</dt>
			<dd class="order-first text-3xl font-semibold tracking-tight">4.5K+</dd>
		</div>
		<div class="flex flex-col {cardColor} p-8 text-gray-800">
			<dt class="text-sm/6 font-semibold underline">
				<a href={siteConfig.links.releases}>Downloads</a>
			</dt>
			<dd class="order-first text-3xl font-semibold tracking-tight">3M+</dd>
		</div>
		<div class="flex flex-col {cardColor} p-8 text-gray-800">
			<dt class="text-sm/6 font-semibold underline">
				<a href={siteConfig.links.docker}>Docker pulls</a>
			</dt>
			<dd class="order-first text-3xl font-semibold tracking-tight">1.5M+</dd>
		</div>
		<div class="flex flex-col {cardColor} p-8 text-gray-800">
			<dt class="text-sm/6 font-semibold underline underline">
				<a href={siteConfig.links.contributors}>Contributors</a>
			</dt>
			<dd class="order-first text-3xl font-semibold tracking-tight">40+</dd>
		</div>
	</dl>
</div>
