<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import { copyStringToClipboard } from '$lib/utils.js';
	import { goto } from '$app/navigation';
	import TextEditor from '$lib/components/TextEditor.svelte';
	import {
		supplementaryStyles,
		baseStyles,
		configs,
		formats,
		alertLevels,
		sampleSize,
		adopterCount,
		type Option,
		type Level
	} from './config.js';
	import Check from 'lucide-svelte/icons/check';
	import Copy from 'lucide-svelte/icons/copy';
	import Download from 'lucide-svelte/icons/download';
	import RotateCcw from 'lucide-svelte/icons/rotate-ccw';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';

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
	// Markdown by default because 46 of the 55 sampled configs lint it, and a
	// config that matches nothing is the one outcome with no visible symptom.
	let selectedFormats = $state<string[]>(['md']);
	let alertLevel = $state<Level>('suggestion');

	const hasSelections = $derived(
		baseStyle !== '' ||
			selectedStyles.length > 0 ||
			selectedConfigs.length > 0 ||
			alertLevel !== 'suggestion' ||
			selectedFormats.length !== 1 ||
			selectedFormats[0] !== 'md'
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
	function toggleFormat(v: string) {
		const next = selectedFormats.includes(v)
			? selectedFormats.filter((s) => s !== v)
			: [...selectedFormats, v];
		// Never leave the section glob empty: a config that matches no file is
		// indistinguishable from a clean run.
		selectedFormats = next.length ? next : selectedFormats;
	}
	function reset() {
		baseStyle = '';
		selectedStyles = [];
		selectedConfigs = [];
		selectedFormats = ['md'];
		alertLevel = 'suggestion';
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

	/*
		The section glob follows the formats selected. MDX files are `.mdx`, and a
		`[*.{md}]` section does not match them -- the styles would install, `vale
		sync` would succeed, and nothing would ever be linted (#95). Picking the
		MDX package therefore implies the extension.
	*/
	const activeFormats = $derived(
		[...new Set(selectedConfigs.includes('MDX') ? [...selectedFormats, 'mdx'] : selectedFormats)]
			.slice()
			.sort()
	);
	const section = $derived(`*.{${activeFormats.join(',')}}`);

	function header(glob: string) {
		const names = activeFormats
			.map((f) => formats.find((o) => o.value === f)?.label ?? f)
			.join(', ');
		return `[${glob}]
# ^ This section applies to ${names} files only.
#
# You can change (or add) file extensions here
# to apply these settings to other file types.
#
# For example, to apply these settings to both
# Markdown and reStructuredText:
#
# [*.{md,rst}]`;
	}

	/*
		Composed rather than parsed and re-stringified. The editor is read-only, so
		the file is a function of the selections alone -- and rewriting a section
		name through the ini parser left the old section behind.
	*/
	$effect(() => {
		const pkgs: string[] = [];
		const styles = ['Vale'];

		const base = baseStyles.find((f) => f.value === baseStyle);
		if (base !== undefined) {
			pkgs.push(base.value);
			styles.push(base.value);
		}

		for (const s of selectedStyles) {
			const found = supplementaryStyles.find((f) => f.value === s);
			if (found !== undefined) {
				pkgs.push(found.value);
				styles.push(found.value);
			}
		}

		for (const c of selectedConfigs) {
			const found = configs.find((f) => f.value === c);
			if (found !== undefined) {
				pkgs.push(found.value);
			}
		}

		const lines = ['StylesPath = styles', '', `MinAlertLevel = ${alertLevel}`, ''];
		if (pkgs.length > 0) {
			lines.push(`Packages = ${pkgs.join(', ')}`, '');
		}
		if (selectedConfigs.includes('MDX')) {
			// Vale parses MDX through an external program; without it the run fails
			// at the first .mdx file rather than at sync. See docs/formats/mdx.
			lines.push(
				'# MDX is parsed by an external program. Install it before running Vale:',
				'#',
				'#   npm install -g mdx2vast',
				'#',
				'# https://docs.vale.sh/formats/mdx',
				''
			);
		}
		lines.push(header(section), `BasedOnStyles = ${styles.join(', ')}`);

		value = lines.join('\n');
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
		<span class="min-w-0 flex-1">
			<span class="flex flex-wrap items-baseline gap-x-2">
				<span class="text-sm font-medium text-foreground">{item.label}</span>
				{#if item.ruleCount > 0}
					<span class="font-mono text-[11px] text-muted-foreground">{item.ruleCount} rules</span>
				{/if}
			</span>
			<span class="mt-0.5 block text-xs leading-relaxed text-muted-foreground"
				>{item.description}</span
			>

			<!--
				What the option costs and who else picked it. The severity mix is the
				honest version of "how noisy is this": a style that is mostly errors
				behaves very differently on a first run from one that is mostly
				suggestions, and nothing else on the page says so.
			-->
			{#if item.ruleCount > 0}
				<span class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
					{#if item.levels.error}
						<span class="text-red-500">{item.levels.error} error</span>
					{/if}
					{#if item.levels.warning}
						<span class="text-amber-500">{item.levels.warning} warning</span>
					{/if}
					{#if item.levels.suggestion}
						<span class="text-sky-500">{item.levels.suggestion} suggestion</span>
					{/if}
				</span>
			{/if}

			<span class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
				{#if item.adoption > 0}
					<span class="font-medium text-foreground">
						Used by {item.adoption} of {sampleSize}
					</span>
					{#if item.pairedWith.length}
						<span class="text-muted-foreground">
							· often with {item.pairedWith.map((p) => p.name).join(' and ')}
						</span>
					{/if}
				{:else}
					<span class="text-muted-foreground">Not in the sampled configs</span>
				{/if}
			</span>
		</span>

		{#if item.explorer}
			<!--
				A link inside a button is invalid, so the card's own click is
				suppressed here rather than nesting one.
			-->
			<span
				role="link"
				tabindex="0"
				onclick={(e) => {
					e.stopPropagation();
					goto(item.explorer!);
				}}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						e.stopPropagation();
						goto(item.explorer!);
					}
				}}
				class="mt-0.5 inline-flex shrink-0 items-center gap-0.5 rounded px-1 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-lime-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 dark:hover:text-lime-400"
			>
				Rules
				<ArrowUpRight class="h-3 w-3" />
			</span>
		{/if}
	</button>
{/snippet}

{#snippet stepBadge(n: number)}
	<span
		class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime-500/10 text-sm font-semibold text-lime-600 ring-1 ring-inset ring-lime-500/20 dark:text-lime-400"
	>
		{n}
	</span>
{/snippet}

<div class="mx-auto max-w-6xl px-6 py-14 lg:px-8">
	<!-- Header -->
	<div class="mx-auto max-w-2xl text-center">
		<p class="text-base font-semibold text-lime-600 dark:text-lime-400">Config generator</p>
		<h1 class="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
			Build your <code class="font-mono text-lime-600 dark:text-lime-400">.vale.ini</code>
		</h1>
		<p class="mx-auto mt-4 text-pretty text-lg leading-8 text-muted-foreground">
			Pick your styles and formats—we'll assemble a ready-to-use configuration file.
		</p>
		<!--
			Where the numbers on each option come from. Without this the counts are
			just a badge; with it they are the same kind of evidence the adopters
			page trades on, and the reader can go and check them.
		-->
		<p class="mx-auto mt-3 text-sm text-muted-foreground">
			Each option shows what it contains and how often it turns up in
			<a href="/adopters" class="font-medium text-lime-600 hover:underline dark:text-lime-400">
				{sampleSize} public <code class="font-mono">.vale.ini</code> files
			</a>
			from the {adopterCount} projects we track.
		</p>
	</div>

	<!--
		`min-w-0` on both children, because a grid track is sized to its content's
		min-content by default and the editor below reports the width of its
		longest line. Under `lg` the two share one column, so that measurement
		stretched the whole page to 449px inside a 342px phone -- the options
		column overflowed even though nothing in it is wide.
	-->
	<div class="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-12">
		<!-- Options -->
		<div class="min-w-0 space-y-10">
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
				<div class="mt-4 grid gap-2">
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

			<!--
				Step 3: Formats. This was hard-coded to Markdown, which is right for
				46 of the 55 sampled configs and silently wrong for the rest: Vale
				only reads a file a section matches, so an unmatched extension looks
				exactly like a clean run.
			-->
			<section>
				<div class="flex items-center gap-3">
					{@render stepBadge(3)}
					<h2 class="text-lg font-semibold text-foreground">File formats</h2>
				</div>
				<p class="ml-10 mt-1.5 text-sm text-muted-foreground">
					What Vale reads. Anything not listed here is skipped without a word.
				</p>
				<div class="mt-4 flex flex-wrap gap-2">
					{#each formats as fmt}
						{@const checked = activeFormats.includes(fmt.value)}
						{@const forced = fmt.value === 'mdx' && selectedConfigs.includes('MDX')}
						<button
							type="button"
							onclick={() => toggleFormat(fmt.value)}
							aria-pressed={checked}
							disabled={forced}
							title={forced ? 'Required by the MDX package selected below' : undefined}
							class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 disabled:cursor-not-allowed disabled:opacity-70 {checked
								? 'border-lime-500 bg-lime-500/10 text-foreground'
								: 'border-border text-muted-foreground hover:border-lime-500/40 hover:text-foreground'}"
						>
							{fmt.label}
							<span class="font-mono text-[11px] text-muted-foreground">.{fmt.value}</span>
							{#if fmt.adoption > 0}
								<span class="text-[11px] text-muted-foreground">{fmt.adoption}</span>
							{/if}
						</button>
					{/each}
				</div>
			</section>

			<!-- Step 4: Alert level -->
			<section>
				<div class="flex items-center gap-3">
					{@render stepBadge(4)}
					<h2 class="text-lg font-semibold text-foreground">Strictness</h2>
				</div>
				<p class="ml-10 mt-1.5 text-sm text-muted-foreground">
					The lowest severity Vale reports. Everything quieter is hidden.
				</p>
				<div class="mt-4 grid gap-2">
					{#each alertLevels as level}
						{@const checked = alertLevel === level.value}
						<button
							type="button"
							onclick={() => (alertLevel = level.value)}
							aria-pressed={checked}
							class="flex items-start gap-3 rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 {checked
								? 'border-lime-500 bg-lime-500/[0.06]'
								: 'border-border hover:border-lime-500/40 hover:bg-muted/40'}"
						>
							<span
								class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border {checked
									? 'border-lime-500 bg-lime-500 text-black'
									: 'border-input'}"
							>
								{#if checked}<Check class="h-3.5 w-3.5" strokeWidth={3} />{/if}
							</span>
							<span class="min-w-0 flex-1">
								<span class="block text-sm font-medium text-foreground">{level.label}</span>
								<span class="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
									{level.description}
								</span>
								<span class="mt-1.5 block text-[11px] font-medium text-foreground">
									Used by {level.adoption} of {sampleSize}
								</span>
							</span>
						</button>
					{/each}
				</div>
			</section>

			<!-- Step 5: Configurations -->
			<section>
				<div class="flex items-center gap-3">
					{@render stepBadge(5)}
					<h2 class="text-lg font-semibold text-foreground">Markup support</h2>
				</div>
				<p class="ml-10 mt-1.5 text-sm text-muted-foreground">
					Format- and library-specific settings for handling non-standard markup.
				</p>
				<div class="mt-4 grid gap-2">
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
		<div class="min-w-0 lg:sticky lg:top-24 lg:self-start">
			<div class="overflow-hidden rounded-xl border border-border shadow-sm">
				<div
					class="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2"
				>
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
								<Check class="h-3.5 w-3.5 text-lime-600 dark:text-lime-400" /> Copied
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

			<div
				class="mt-4 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground"
			>
				<b class="text-foreground">Tip:</b> After saving your
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">.vale.ini</code
				>, run
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">vale sync</code
				>
				to install the packages. Browse everything available in the
				<a class="font-medium text-lime-600 hover:underline dark:text-lime-400" href="/explorer"
					>Package Explorer</a
				>.
			</div>
		</div>
	</div>
</div>
