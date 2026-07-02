<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import { copyStringToClipboard } from '$lib/utils.js';
	import TextEditor from '$lib/components/TextEditor.svelte';
	import { ConfigIniParser } from 'config-ini-parser';
	import { supplementaryStyles, baseStyles, configs } from './config.js';
	import { clean } from './util.js';
	import Check from 'lucide-svelte/icons/check';
	import Copy from 'lucide-svelte/icons/copy';
	import Download from 'lucide-svelte/icons/download';
	import RotateCcw from 'lucide-svelte/icons/rotate-ccw';

	type Option = { value: string; label: string; description: string };

	let commentedHeader = `[*.{md}]
# ^ This section applies to only Markdown files.
#
# You can change (or add) file extensions here
# to apply these settings to other file types.
#
# For example, to apply these settings to both
# Markdown and reStructuredText:
#
# [*.{md,rst}]`;

	let value = $state(`StylesPath = styles

MinAlertLevel = suggestion

[*.{md}]
# ^ This section applies to only Markdown files.
#
# You can change (or add) file extensions here
# to apply these settings to other file types.
#
# For example, to apply these settings to both
# Markdown and reStructuredText:
#
# [*.{md,rst}]
BasedOnStyles = Vale`);

	let baseStyle = $state('');
	let selectedStyles = $state<string[]>([]);
	let selectedConfigs = $state<string[]>([]);

	const hasSelections = $derived(
		baseStyle !== '' || selectedStyles.length > 0 || selectedConfigs.length > 0
	);

	function toggleBase(v: string) {
		baseStyle = baseStyle === v ? '' : v;
	}
	function toggleStyle(v: string) {
		selectedStyles = selectedStyles.includes(v)
			? selectedStyles.filter((s) => s !== v)
			: [...selectedStyles, v];
	}
	function toggleConfig(v: string) {
		selectedConfigs = selectedConfigs.includes(v)
			? selectedConfigs.filter((s) => s !== v)
			: [...selectedConfigs, v];
	}
	function reset() {
		baseStyle = '';
		selectedStyles = [];
		selectedConfigs = [];
	}

	let copied = $state(false);
	let copyTimeout: ReturnType<typeof setTimeout>;
	function handleCopy() {
		copyStringToClipboard(value);
		copied = true;
		clearTimeout(copyTimeout);
		copyTimeout = setTimeout(() => (copied = false), 2000);
	}
	function handleDownload() {
		const blob = new Blob([value], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = '.vale.ini';
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}

	// Generate the configuration file when any of the options change:
	$effect(() => {
		let pkgs = [];
		let styles = ['Vale'];

		const parser = new ConfigIniParser();

		const base = baseStyles.find((f) => f.value === baseStyle);
		if (base !== undefined) {
			pkgs.push(base.value);
			styles.push(base.value);
		}

		const supplementary = selectedStyles.map((s) => supplementaryStyles.find((f) => f.value === s));
		for (const s of supplementary) {
			if (s !== undefined) {
				pkgs.push(s.value);
				styles.push(s.value);
			}
		}

		const cfgs = selectedConfigs.map((c) => configs.find((f) => f.value === c));
		for (const c of cfgs) {
			if (c !== undefined) {
				pkgs.push(c.value);
			}
		}

		parser.parse(value);
		if (pkgs.length == 0) {
			parser.removeOption(null, 'Packages');
		} else {
			parser.set(null, 'Packages', pkgs.join(','));
		}

		parser.set('*.{md}', 'BasedOnStyles', styles.join(','));
		value = clean(parser.stringify()).replace('[*.{md}]', commentedHeader);
	});
</script>

<MetaTags
	title="Config Generator"
	description="The Config Generator allows you to quickly generate comprehensive configuration files for Vale."
	canonical="https://vale.sh"
	openGraph={{
		url: 'https://vale.sh',
		title: 'Vale: Your style, our editor',
		description:
			'Vale is a command-line tool that brings code-like linting to prose. Vale is cross-platform (Windows, macOS, and Linux), written in Go, and available on GitHub.',
		images: [
			{
				url: '/media/mac.png',
				width: 800,
				height: 600,
				alt: 'Example Vale output'
			}
		]
	}}
/>

{#snippet optionCard(item: Option, checked: boolean, onToggle: () => void, single: boolean)}
	<button
		type="button"
		onclick={onToggle}
		aria-pressed={checked}
		class="flex items-start gap-3 rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 {checked
			? 'border-lime-500 bg-lime-500/[0.06]'
			: 'border-border hover:border-lime-500/40 hover:bg-muted/40'}"
	>
		<span
			class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border {single
				? 'rounded-full'
				: 'rounded'} {checked ? 'border-lime-500 bg-lime-500 text-black' : 'border-input'}"
		>
			{#if checked}<Check class="h-3.5 w-3.5" strokeWidth={3} />{/if}
		</span>
		<span class="min-w-0">
			<span class="block text-sm font-medium text-foreground">{item.label}</span>
			<span class="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{item.description}</span>
		</span>
	</button>
{/snippet}

{#snippet stepBadge(n: number)}
	<span
		class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime-500/10 text-sm font-semibold text-lime-600 ring-1 ring-inset ring-lime-500/20"
	>
		{n}
	</span>
{/snippet}

<div class="mx-auto max-w-6xl px-6 py-14 lg:px-8">
	<!-- Header -->
	<div class="mx-auto max-w-2xl text-center">
		<p class="text-base font-semibold text-lime-500">Config generator</p>
		<h1 class="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
			Build your <code class="font-mono text-lime-500">.vale.ini</code>
		</h1>
		<p class="mx-auto mt-4 text-pretty text-lg leading-8 text-muted-foreground">
			Pick your styles and formats—we'll assemble a ready-to-use configuration file.
		</p>
	</div>

	<div class="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-12">
		<!-- Options -->
		<div class="space-y-10">
			<!-- Step 1: Base style -->
			<section>
				<div class="flex items-center gap-3">
					{@render stepBadge(1)}
					<h2 class="text-lg font-semibold text-foreground">Base style</h2>
				</div>
				<p class="ml-10 mt-1.5 text-sm text-muted-foreground">
					A comprehensive style guide to build on. Choose one as your foundation.
				</p>
				<div class="mt-4 grid gap-2">
					{#each baseStyles as item}
						{@render optionCard(item, baseStyle === item.value, () => toggleBase(item.value), true)}
					{/each}
				</div>
			</section>

			<!-- Step 2: Supplementary styles -->
			<section>
				<div class="flex items-center gap-3">
					{@render stepBadge(2)}
					<h2 class="text-lg font-semibold text-foreground">Supplementary styles</h2>
				</div>
				<p class="ml-10 mt-1.5 text-sm text-muted-foreground">
					Smaller, focused styles you can layer on top of your base. Add as many as you like.
				</p>
				<div class="mt-4 grid gap-2 sm:grid-cols-2">
					{#each supplementaryStyles as item}
						{@render optionCard(
							item,
							selectedStyles.includes(item.value),
							() => toggleStyle(item.value),
							false
						)}
					{/each}
				</div>
			</section>

			<!-- Step 3: Configurations -->
			<section>
				<div class="flex items-center gap-3">
					{@render stepBadge(3)}
					<h2 class="text-lg font-semibold text-foreground">Configurations</h2>
				</div>
				<p class="ml-10 mt-1.5 text-sm text-muted-foreground">
					Format- and library-specific settings for handling non-standard markup.
				</p>
				<div class="mt-4 grid gap-2 sm:grid-cols-2">
					{#each configs as item}
						{@render optionCard(
							item,
							selectedConfigs.includes(item.value),
							() => toggleConfig(item.value),
							false
						)}
					{/each}
				</div>
			</section>

			{#if hasSelections}
				<button
					type="button"
					onclick={reset}
					class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					<RotateCcw class="h-3.5 w-3.5" />
					Reset selections
				</button>
			{/if}
		</div>

		<!-- Output -->
		<div class="lg:sticky lg:top-24 lg:self-start">
			<div class="overflow-hidden rounded-xl border border-border shadow-sm">
				<div class="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
					<div class="flex items-center gap-2 pl-1">
						<span class="h-2.5 w-2.5 rounded-full bg-border"></span>
						<span class="h-2.5 w-2.5 rounded-full bg-border"></span>
						<span class="h-2.5 w-2.5 rounded-full bg-border"></span>
						<span class="ml-1 font-mono text-xs text-muted-foreground">.vale.ini</span>
					</div>
					<div class="flex items-center gap-1">
						<button
							type="button"
							onclick={handleCopy}
							class="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
							aria-label="Copy configuration"
						>
							{#if copied}
								<Check class="h-3.5 w-3.5 text-lime-500" /> Copied
							{:else}
								<Copy class="h-3.5 w-3.5" /> Copy
							{/if}
						</button>
						<button
							type="button"
							onclick={handleDownload}
							class="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
							aria-label="Download .vale.ini file"
						>
							<Download class="h-3.5 w-3.5" /> Download
						</button>
					</div>
				</div>
				<TextEditor bind:value mode="ini" readonly={true} height="440px" />
			</div>

			<div class="mt-4 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
				<b class="text-foreground">Tip:</b> After saving your
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">.vale.ini</code>,
				run
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">vale sync</code>
				to install the packages. Browse everything available in the
				<a class="font-medium text-lime-500 hover:underline" href="/explorer">Package Explorer</a>.
			</div>
		</div>
	</div>
</div>
