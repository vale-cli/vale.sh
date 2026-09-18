<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import { zipSync, strToU8 } from 'fflate';
	import { cn, copyStringToClipboard } from '$lib/utils.js';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import { highlight } from '$lib/highlight-client';
	import * as Select from '$lib/components/ui/select';
	import * as Alert from '$lib/components/ui/alert';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import MultiSelect, { type Choice } from './MultiSelect.svelte';
	import StylePicker from './StylePicker.svelte';
	import {
		presets,
		optionByValue,
		alertLevels,
		sampleSize,
		adopterCount,
		type Audience,
		type Level
	} from './config.js';
	import { formats, groups, readAs, byId, type Requirement } from './formats.js';
	import Download from 'lucide-svelte/icons/download';
	import Copy from 'lucide-svelte/icons/copy';
	import Check from 'lucide-svelte/icons/check';
	import RotateCcw from 'lucide-svelte/icons/rotate-ccw';
	import Plus from 'lucide-svelte/icons/plus';
	import X from 'lucide-svelte/icons/x';
	import FileCode from 'lucide-svelte/icons/file-code';
	import Feather from 'lucide-svelte/icons/feather';
	import FlaskConical from 'lucide-svelte/icons/flask-conical';

	// What kind of writing the config is for. It decides which formats start
	// selected and which styles are offered; everything below it is shared.
	const icons: Record<Audience, typeof FileCode> = {
		technical: FileCode,
		creative: Feather,
		scientific: FlaskConical
	};
	let audience = $state<Audience>('technical');
	const preset = $derived(presets.find((p) => p.id === audience) ?? presets[0]);

	// Markdown by default because 46 of the 55 sampled configs lint it, and a
	// config that matches nothing is the one outcome with no visible symptom.
	let selectedFormats = $state<string[]>([...presets[0].formats]);
	let selectedExtras = $state<string[]>([]);
	let mappings = $state<{ ext: string; as: string }[]>([]);
	let newExt = $state('');
	let newAs = $state('md');
	// What comments are written in: a `[formats]` entry per code extension
	// has each comment parsed as that markup before it is linted.
	let commentMarkup = $state('');

	let basePick = $state<string[]>([]);
	const baseStyle = $derived(basePick[0] ?? '');
	let extraStyles = $state<string[]>([]);
	let alertLevel = $state<Level>('suggestion');

	/** Switch audiences: the formats and styles start over, the rest stays. */
	function setAudience(id: Audience) {
		if (id === audience) return;
		audience = id;
		selectedFormats = [...preset.formats];
		selectedExtras = [];
		basePick = [];
		extraStyles = [];
	}
	// A link can open the generator on its audience: /generator?for=creative.
	$effect(() => {
		try {
			const want = new URLSearchParams(location.search).get('for');
			if (presets.some((p) => p.id === want)) setAudience(want as Audience);
		} catch {
			// No location to read: leave the default.
		}
	});

	// One control per kind of file, each with its own list and chips.
	const formatChoices = (group: string): Choice[] =>
		formats
			.filter((f) => f.group === group)
			.map((f) => ({
				value: f.id,
				label: f.label,
				hint: f.glob ?? f.extensions.map((e) => `.${e}`).join(' '),
				description: f.description,
				keywords: f.extensions
			}));
	const placeholders: Record<string, string> = {
		prose: 'Search: Markdown, reStructuredText, AsciiDoc…',
		code: 'Search: Python, Go, TypeScript…',
		structured: 'Search: notebooks, OpenAPI, commit messages…'
	};

	const chosen = $derived(selectedFormats.map((id) => byId.get(id)!).filter(Boolean));
	const level = $derived(alertLevels.find((l) => l.value === alertLevel)!);

	const hasSelections = $derived(
		baseStyle !== '' ||
			extraStyles.length > 0 ||
			selectedExtras.length > 0 ||
			mappings.length > 0 ||
			commentMarkup !== '' ||
			alertLevel !== 'suggestion' ||
			selectedFormats.length !== preset.formats.length ||
			selectedFormats.some((f) => !preset.formats.includes(f))
	);

	function toggleFormat(id: string) {
		const next = selectedFormats.includes(id)
			? selectedFormats.filter((s) => s !== id)
			: [...selectedFormats, id];
		// Never leave the config matching nothing: a config that matches no
		// file is indistinguishable from a clean run.
		if (next.length === 0) return;
		selectedFormats = next;
		// An extra belongs to its format; dropping the format drops it.
		selectedExtras = selectedExtras.filter((v) =>
			next.some((f) => byId.get(f)?.extras?.some((e) => e.value === v))
		);
	}
	function toggle(list: string[], v: string) {
		return list.includes(v) ? list.filter((s) => s !== v) : [...list, v];
	}
	function addMapping() {
		const ext = newExt.trim().replace(/^\./, '');
		if (!ext || !/^[\w.+-]+$/.test(ext)) return;
		if (mappings.some((m) => m.ext === ext) || byId.has(ext)) return;
		mappings = [...mappings, { ext, as: newAs }];
		newExt = '';
	}
	function reset() {
		selectedFormats = [...preset.formats];
		selectedExtras = [];
		mappings = [];
		commentMarkup = '';
		basePick = [];
		extraStyles = [];
		alertLevel = 'suggestion';
	}

	/** External programs the chosen formats need, one line per tool. */
	const requirements = $derived.by(() => {
		const seen = new Map<string, Requirement>();
		for (const f of chosen) {
			if (f.requires && !seen.has(f.requires.tool)) seen.set(f.requires.tool, f.requires);
		}
		return [...seen.values()];
	});

	/** A `#` comment, wrapped so the file reads without a horizontal scroll. */
	function comment(text: string, width = 72): string[] {
		const out: string[] = [];
		let line = '#';
		for (const word of text.split(' ')) {
			if (line.length + 1 + word.length > width && line !== '#') {
				out.push(line);
				line = '#';
			}
			line += ` ${word}`;
		}
		out.push(line);
		return out;
	}

	function glob(exts: string[]) {
		const unique = [...new Set(exts)];
		return unique.length === 1 ? `*.${unique[0]}` : `*.{${unique.join(',')}}`;
	}

	/*
		Composed rather than parsed and re-stringified. The output is read-only,
		so every file is a function of the selections alone.
	*/
	type OutFile = { name: string; contents: string; mode: 'ini' | 'yaml' };

	const files = $derived.by((): OutFile[] => {
		const picked = [...(baseStyle ? [baseStyle] : []), ...extraStyles];
		const styles = ['Vale', ...picked];
		// A style inside a package -- IMRaD in Journals -- is enabled by name
		// and installed by its package, once.
		const pkgs = [
			...new Set([...picked.map((v) => optionByValue.get(v)?.package ?? v), ...selectedExtras])
		];

		const lines = ['StylesPath = styles', '', `MinAlertLevel = ${alertLevel}`, ''];
		if (pkgs.length) lines.push(`Packages = ${pkgs.join(', ')}`, '');

		const code = chosen.filter((f) => f.group === 'code');
		const codeExts = [...new Set(code.flatMap((f) => f.extensions))];

		if (mappings.length || (commentMarkup && codeExts.length)) {
			lines.push('[formats]');
			if (commentMarkup && codeExts.length) {
				lines.push(...comment(`Comments are ${byId.get(commentMarkup)?.label ?? commentMarkup}.`));
				for (const ext of codeExts) lines.push(`${ext} = ${commentMarkup}`);
			}
			if (mappings.length) {
				lines.push(...comment('Extensions Vale does not know, and the format each is read as.'));
				for (const m of mappings) lines.push(`${m.ext} = ${m.as}`);
			}
			lines.push('');
		}

		const based = `BasedOnStyles = ${styles.join(', ')}`;

		const prose = chosen.filter((f) => f.group === 'prose');
		const proseExts = [...prose.flatMap((f) => f.extensions), ...mappings.map((m) => m.ext)];
		if (proseExts.length) {
			const names = [...prose.map((f) => f.label), ...mappings.map((m) => `.${m.ext}`)];
			lines.push(...comment(`${names.join(', ')}.`), `[${glob(proseExts)}]`, based, '');
		}

		if (code.length) {
			lines.push(
				...comment(`Comments in ${code.map((f) => f.label).join(', ')} sources.`),
				`[${glob(codeExts)}]`,
				based,
				''
			);
		}

		const views: OutFile[] = [];
		for (const f of chosen.filter((f) => f.group === 'structured')) {
			if (!f.view) continue;
			lines.push(
				...comment(`${f.label}: ${f.description}`),
				`[${f.glob ?? glob(f.extensions)}]`,
				based,
				`View = ${f.view.name}`,
				''
			);
			views.push({
				name: `styles/config/views/${f.view.name}.yml`,
				contents: f.view.contents,
				mode: 'yaml'
			});
		}

		return [
			{ name: '.vale.ini', contents: lines.join('\n').trimEnd() + '\n', mode: 'ini' },
			...views
		];
	});

	// The blog's highlighter, run here as the files change. Until it has
	// loaded, or for a file it has not seen yet, the text shows unstyled.
	let rendered = $state<Record<string, string>>({});
	$effect(() => {
		for (const f of files) {
			const key = `${f.name}\0${f.contents}`;
			if (key in rendered) continue;
			highlight(f.contents.trimEnd(), f.mode).then((html) => {
				// Merged, then pruned to the files still on the page, so a
				// result never evicts another and the cache stays small.
				const keep = new Set(files.map((x) => `${x.name}\0${x.contents}`));
				rendered = Object.fromEntries(
					Object.entries({ ...rendered, [key]: html }).filter(([k]) => keep.has(k))
				);
			});
		}
	});
	function escape(text: string) {
		return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}
	function htmlFor(f: OutFile) {
		return (
			rendered[`${f.name}\0${f.contents}`] ??
			`<pre class="shiki"><code>${escape(f.contents.trimEnd())}</code></pre>`
		);
	}

	let activeFile = $state('.vale.ini');
	const current = $derived(files.find((f) => f.name === activeFile) ?? files[0]);
	$effect(() => {
		if (!files.some((f) => f.name === activeFile)) activeFile = files[0].name;
	});
	function basename(path: string) {
		return path.split('/').pop() ?? path;
	}

	let copied = $state(false);
	let copyTimeout: ReturnType<typeof setTimeout>;
	function handleCopy() {
		copyStringToClipboard(current.contents);
		copied = true;
		clearTimeout(copyTimeout);
		copyTimeout = setTimeout(() => (copied = false), 2000);
	}

	function save(blob: Blob, name: string) {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = name;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}
	/** One file downloads as itself; a set downloads as a zip of the tree. */
	function handleDownload() {
		if (files.length === 1) {
			save(new Blob([files[0].contents], { type: 'text/plain;charset=utf-8' }), '.vale.ini');
			return;
		}
		const tree: Record<string, Uint8Array> = {};
		for (const f of files) tree[f.name] = strToU8(f.contents);
		save(new Blob([zipSync(tree)], { type: 'application/zip' }), 'vale-config.zip');
	}
</script>

<MetaTags
	title="Config Generator"
	description="Pick what you write, technical, creative, or scientific, and get a ready-to-use Vale configuration for it."
	canonical="https://vale.sh"
	openGraph={{
		url: 'https://vale.sh',
		title: 'Vale: Your style, our editor',
		description:
			'Vale is a command-line tool that brings code-like linting to prose. Vale is cross-platform (Windows, macOS, and Linux), written in Go, and available on GitHub.',
		images: [{ url: '/media/mac.png', width: 800, height: 600, alt: 'Example Vale output' }]
	}}
/>

<!-- A chosen item, with what choosing it means and a way to undo it. -->
{#snippet chip(label: string, note: string | undefined, remove: () => void, href?: string | null)}
	<Badge variant="secondary" class="gap-1.5 py-1 pl-2.5 pr-1 font-normal">
		{#if href}
			<a {href} class="font-medium hover:underline">{label}</a>
		{:else}
			<span class="font-medium">{label}</span>
		{/if}
		{#if note}<span class="font-mono text-[11px] text-muted-foreground">{note}</span>{/if}
		<button
			type="button"
			aria-label={`Remove ${label}`}
			onclick={remove}
			class="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
		>
			<X class="size-3" />
		</button>
	</Badge>
{/snippet}

<div class="mx-auto max-w-6xl px-6 py-10 lg:px-8">
	<div class="flex flex-col gap-1">
		<p class="text-sm font-semibold text-lime-600 dark:text-lime-400">Config generator</p>
		<h1 class="text-2xl font-semibold tracking-tight">
			Build your <code class="font-mono">.vale.ini</code>
		</h1>
		<p class="text-sm text-muted-foreground">
			Pick what you write, then the styles to hold it to.
			{#if preset.counted}
				Counts are from
				<a href="/adopters" class="font-medium text-lime-600 hover:underline dark:text-lime-400">
					{sampleSize} public configs
				</a>
				across {adopterCount} projects.
			{:else}
				{preset.description}
			{/if}
		</p>
	</div>

	<!-- The kind of writing, first: it decides what the rest of the page offers. -->
	<div class="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Kind of writing">
		{#each presets as p (p.id)}
			{@const Icon = icons[p.id]}
			{@const on = p.id === audience}
			<button
				type="button"
				role="tab"
				aria-selected={on}
				onclick={() => setAudience(p.id)}
				class={cn(
					'inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors',
					on
						? 'border-primary bg-accent text-foreground'
						: 'border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground'
				)}
			>
				<Icon class={cn('size-4', on ? 'text-lime-600 dark:text-lime-400' : 'opacity-70')} />
				{p.label}
			</button>
		{/each}
	</div>

	<div class="mt-8 grid gap-8 lg:grid-cols-2">
		<div class="flex min-w-0 flex-col gap-7">
			<!--
				What you write. Vale only reads a file a section matches, so this
				is the setting everything else in the file follows from.
			-->
			<div class="flex flex-col gap-2">
				{#each groups as g (g.id)}
					{@const picked = chosen.filter((f) => f.group === g.id)}
					<div class="flex flex-col gap-2">
						<Label for={`formats-${g.id}`}>{g.label}</Label>
						<MultiSelect
							id={`formats-${g.id}`}
							choices={formatChoices(g.id)}
							selected={selectedFormats}
							onToggle={toggleFormat}
							placeholder={placeholders[g.id]}
						/>
						{#if picked.length}
							<div class="flex flex-wrap gap-1.5">
								{#each picked as f (f.id)}
									{@render chip(
										f.label,
										f.requires ? `needs ${f.requires.tool}` : f.view ? 'adds a View' : undefined,
										() => toggleFormat(f.id)
									)}
								{/each}
							</div>
						{:else}
							<p class="text-xs text-muted-foreground">{g.blurb}</p>
						{/if}
						<!--
							Comments in most languages carry markup of their own; a
							`[formats]` entry has each one parsed as that markup first.
						-->
						{#if g.id === 'code' && picked.length}
							<div class="flex items-center gap-2 text-sm">
								<Label for="comment-markup" class="whitespace-nowrap text-muted-foreground">
									Comments are written in
								</Label>
								<Select.Root
									type="single"
									value={commentMarkup || 'plain'}
									onValueChange={(v) => (commentMarkup = v === 'plain' ? '' : v)}
								>
									<Select.Trigger id="comment-markup" class="w-48">
										{commentMarkup ? byId.get(commentMarkup)?.label : 'Plain text'}
									</Select.Trigger>
									<Select.Content>
										<Select.Group>
											<Select.Item value="plain" label="Plain text" />
											{#each ['md', 'rst', 'adoc'] as id}
												<Select.Item value={id} label={byId.get(id)?.label ?? id} />
											{/each}
										</Select.Group>
									</Select.Content>
								</Select.Root>
							</div>
						{/if}
					</div>
				{/each}
				<!-- A package that only means something for one chosen format. -->
				{#each chosen.filter((f) => f.extras) as f (f.id)}
					{#each f.extras ?? [] as extra}
						{@const eid = `extra-${extra.value}`}
						<div class="flex items-center gap-2 text-sm">
							<Checkbox
								id={eid}
								checked={selectedExtras.includes(extra.value)}
								onCheckedChange={() => (selectedExtras = toggle(selectedExtras, extra.value))}
							/>
							<Label for={eid} class="cursor-pointer">{extra.label}</Label>
							<span class="truncate text-xs text-muted-foreground">{extra.description}</span>
						</div>
					{/each}
				{/each}
				<!--
					An extension Vale does not know, read as one it does. A
					`.txt.j2` template is Markdown to the reader, and a `[formats]`
					entry says so.
				-->
				<details class="group text-sm">
					<summary class="cursor-pointer list-none text-muted-foreground hover:text-foreground">
						<span class="group-open:hidden">+ An extension of your own, read as one of these</span>
						<span class="hidden group-open:inline">− An extension of your own</span>
					</summary>
					<form
						class="mt-2 flex flex-wrap items-center gap-2"
						onsubmit={(e) => {
							e.preventDefault();
							addMapping();
						}}
					>
						<Input
							bind:value={newExt}
							placeholder=".j2"
							aria-label="Extension"
							class="w-24 font-mono"
						/>
						<span class="text-muted-foreground">read as</span>
						<Select.Root type="single" value={newAs} onValueChange={(v) => (newAs = v)}>
							<Select.Trigger class="w-44" aria-label="Read as">
								{byId.get(newAs)?.label ?? newAs}
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									{#each readAs as f}
										<Select.Item value={f.extensions[0]} label={f.label} />
									{/each}
								</Select.Group>
							</Select.Content>
						</Select.Root>
						<Button type="submit" variant="outline" size="sm">
							<Plus data-icon="inline-start" /> Add
						</Button>
					</form>
					{#if mappings.length}
						<div class="mt-2 flex flex-wrap gap-1.5">
							{#each mappings as m (m.ext)}
								{@render chip(`.${m.ext}`, `as ${byId.get(m.as)?.label ?? m.as}`, () => {
									mappings = mappings.filter((x) => x.ext !== m.ext);
								})}
							{/each}
						</div>
					{/if}
				</details>
			</div>

			<!-- The base style: one complete guide, since two disagree. -->
			<div class="flex flex-col gap-2">
				<p class="text-sm font-medium">Base style</p>
				<p class="text-xs text-muted-foreground">{preset.baseBlurb}</p>
				<StylePicker
					options={preset.base}
					bind:selected={basePick}
					single
					{sampleSize}
					showAdoption={preset.counted}
				/>
			</div>

			<!-- Smaller styles that stack on the base. -->
			<div class="flex flex-col gap-2">
				<p class="text-sm font-medium">Supplementary styles</p>
				<p class="text-xs text-muted-foreground">{preset.supplementaryBlurb}</p>
				<StylePicker
					options={preset.supplementary}
					bind:selected={extraStyles}
					{sampleSize}
					showAdoption={preset.counted}
				/>
			</div>

			<!-- The lowest severity reported. -->
			<div class="flex flex-col gap-2">
				<Label for="level">Strictness</Label>
				<Select.Root
					type="single"
					value={alertLevel}
					onValueChange={(v) => (alertLevel = v as Level)}
				>
					<Select.Trigger id="level" class="w-full">{level.label}</Select.Trigger>
					<Select.Content>
						<Select.Group>
							{#each alertLevels as l}
								<Select.Item value={l.value} label={l.label}>
									<span class="flex w-full items-baseline justify-between gap-3">
										<span>{l.label}</span>
										<span class="text-xs text-muted-foreground">{l.adoption}/{sampleSize}</span>
									</span>
								</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
				<p class="text-xs text-muted-foreground">{level.description}</p>
			</div>

			{#if hasSelections}
				<div>
					<Button variant="ghost" size="sm" onclick={reset}>
						<RotateCcw data-icon="inline-start" /> Reset
					</Button>
				</div>
			{/if}
		</div>

		<!-- Output: an editor's file strip, and the file it points at. -->
		<div
			class="flex min-w-0 flex-col gap-3 lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] lg:self-start lg:overflow-y-auto"
		>
			<div class="overflow-hidden rounded-lg border">
				<div class="flex items-center justify-between gap-2 border-b bg-muted/40">
					<div class="flex min-w-0 overflow-x-auto" role="tablist" aria-label="Files">
						{#each files as f (f.name)}
							{@const on = f.name === current.name}
							<button
								type="button"
								role="tab"
								aria-selected={on}
								title={f.name}
								onclick={() => (activeFile = f.name)}
								class={cn(
									'-mb-px shrink-0 border-b-2 px-3 py-2 font-mono text-xs transition-colors',
									on
										? 'border-primary bg-background text-foreground'
										: 'border-transparent text-muted-foreground hover:text-foreground'
								)}
							>
								{basename(f.name)}
							</button>
						{/each}
					</div>
					<div class="flex shrink-0 items-center">
						<Button variant="ghost" size="sm" onclick={handleCopy} aria-label="Copy this file">
							{#if copied}<Check data-icon="inline-start" /> Copied{:else}<Copy
									data-icon="inline-start"
								/> Copy{/if}
						</Button>
						<Button variant="ghost" size="sm" onclick={handleDownload}>
							<Download data-icon="inline-start" />
							{files.length === 1 ? 'Download' : 'Download zip'}
						</Button>
					</div>
				</div>
				{#if files.length > 1}
					<p class="border-b bg-muted/20 px-3 py-1 font-mono text-[11px] text-muted-foreground">
						{current.name}
					</p>
				{/if}
				{#key current.name}
					<!--
						Not `bare`: the highlighter's own background stays, so the editor
						sits on the palette's ground rather than the page's, and the color
						the dark theme paints on each line has nothing to show against.
						Only the frame is the pane's.
					-->
					<CodeBlock
						html={htmlFor(current)}
						class="[&_pre]:rounded-none [&_pre]:border-0 [&_pre]:shadow-none"
					/>
				{/key}
			</div>

			<!--
				What has to be true before the first run. `vale sync` fetches the
				packages; an external parser is a separate install the run only
				discovers at the first file of that format.
			-->
			<Alert.Root>
				<Alert.Title>Before the first run</Alert.Title>
				<Alert.Description>
					<ol class="list-decimal pl-4">
						<li>
							Save the file{files.length > 1 ? 's' : ''} at the root of the project{#if files.length > 1},
								keeping the <code class="font-mono text-xs">styles/</code> path{/if}.
						</li>
						<li>Run <code class="font-mono text-xs">vale sync</code> to install the packages.</li>
						{#each requirements as r}
							<li>
								Install <code class="font-mono text-xs">{r.tool}</code>:
								<code class="font-mono text-xs">{r.install}</code>
								<a
									class="font-medium text-lime-600 hover:underline dark:text-lime-400"
									href={r.docs}>Details</a
								>
							</li>
						{/each}
					</ol>
				</Alert.Description>
			</Alert.Root>
		</div>
	</div>
</div>
