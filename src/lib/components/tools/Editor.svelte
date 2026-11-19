<script lang="ts" module>
	import type { Highlight } from '$lib/tools/style';

	/**
	 * How a category is drawn. Sentence-level findings fill the background;
	 * word-level ones underline. The two can then overlap — an adverb
	 * inside a hard sentence — and both stay readable.
	 */
	export type Tone = 'amber' | 'rose' | 'sky' | 'violet' | 'teal' | 'orange' | 'lime';

	export type Category = {
		id: string;
		label: string;
		tone: Tone;
		/** `fill` for whole sentences, `line` for words and phrases. */
		mark: 'fill' | 'line';
		/** One line on what to do about it, shown in the legend. */
		hint?: string;
	};

	export type { Highlight };

	/** Shared with the other tools in this tab; see ProseInput for why. */
	const KEY = 'vale-tools-text';

	function recall(): string {
		try {
			return sessionStorage.getItem(KEY) ?? '';
		} catch {
			return '';
		}
	}

	function remember(text: string) {
		try {
			if (text.length <= 500_000) sessionStorage.setItem(KEY, text);
		} catch {
			// The editor works without it.
		}
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { EditorState, StateEffect, StateField, type Range } from '@codemirror/state';
	import {
		Decoration,
		EditorView,
		drawSelection,
		hoverTooltip,
		keymap,
		placeholder as placeholderExt,
		showTooltip,
		type DecorationSet,
		type Tooltip
	} from '@codemirror/view';
	import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
	import Check from 'lucide-svelte/icons/check';
	import ClipboardPaste from 'lucide-svelte/icons/clipboard-paste';
	import Copy from 'lucide-svelte/icons/copy';
	import Eraser from 'lucide-svelte/icons/eraser';
	import TextQuote from 'lucide-svelte/icons/text-quote';
	import FileText from 'lucide-svelte/icons/file-text';
	import FileUp from 'lucide-svelte/icons/file-up';
	import X from 'lucide-svelte/icons/x';
	import { accept, FileError, readFile, type Loaded } from '$lib/tools/files';

	/**
	 * The writing surface for the text tools: a plain-text editor that draws
	 * each tool's findings into the text itself.
	 *
	 * The page owns the analysis. It passes `highlights` (spans with a
	 * category, a message, and sometimes a fix) and the editor draws them,
	 * shows a card for the one under the pointer or the cursor, and applies a
	 * fix when asked. Between an edit and the next analysis the existing marks
	 * are moved with the text, so nothing flickers or lands on the wrong word.
	 */
	let {
		value = $bindable(''),
		highlights = [],
		categories = [],
		hidden = [],
		sample,
		placeholder = 'Start writing, paste your text, or drop a file here…',
		label = 'Your text',
		minHeight = '22rem'
	}: {
		value?: string;
		highlights?: Highlight[];
		categories?: Category[];
		/** Category ids switched off in the legend. */
		hidden?: string[];
		sample: string;
		placeholder?: string;
		label?: string;
		minHeight?: string;
	} = $props();

	let host: HTMLDivElement;
	let view: EditorView | undefined;
	let mounted = $state(false);
	let canPaste = $state(false);
	let copied = $state(false);

	// A file being opened, the one that is open, or why one couldn't be.
	let picker: HTMLInputElement;
	let dragging = $state(0);
	let reading = $state('');
	let opened = $state<Loaded | null>(null);
	let problem = $state('');

	/**
	 * Opens a file in place of the current text. The file is read here, in
	 * the page; see $lib/tools/files for what each format keeps.
	 */
	async function open(file: File | undefined) {
		if (!file) return;
		problem = '';
		reading = file.name;
		try {
			const loaded = await readFile(file);
			value = loaded.text;
			opened = loaded;
		} catch (e) {
			opened = null;
			problem = e instanceof FileError ? e.message : `“${file.name}” couldn’t be opened.`;
		} finally {
			reading = '';
		}
	}

	const hasFiles = (e: DragEvent) => !!e.dataTransfer?.types.includes('Files');

	const byId = $derived(new Map(categories.map((c) => [c.id, c])));
	const visible = $derived(highlights.filter((h) => !hidden.includes(h.category)));

	const setMarks = StateEffect.define<Highlight[]>();

	/** The highlights as the editor holds them: decorations, each carrying its finding. */
	const marks = StateField.define<DecorationSet>({
		create: () => Decoration.none,
		update(set, tr) {
			set = set.map(tr.changes);
			for (const e of tr.effects) {
				if (!e.is(setMarks)) continue;
				const max = tr.state.doc.length;
				const ranges: Range<Decoration>[] = [];
				for (const h of e.value) {
					const c = byId.get(h.category);
					if (!c || h.from >= h.to || h.to > max) continue;
					ranges.push(
						Decoration.mark({
							class: `vt-mark vt-${c.mark} vt-${c.tone}`,
							// Fills sit under lines, so a word mark inside a sentence
							// mark is the inner element and its underline shows.
							inclusive: false,
							finding: h
						}).range(h.from, h.to)
					);
				}
				set = Decoration.set(ranges, true);
			}
			return set;
		},
		provide: (f) => EditorView.decorations.from(f)
	});

	/** The finding at a position: the narrowest one, so a word beats its sentence. */
	function findingAt(state: EditorState, pos: number) {
		let best: { from: number; to: number; finding: Highlight } | null = null;
		state.field(marks).between(pos, pos, (from, to, deco) => {
			if (pos < from || pos > to) return;
			if (!best || to - from < best.to - best.from) {
				best = { from, to, finding: deco.spec.finding as Highlight };
			}
		});
		return best as { from: number; to: number; finding: Highlight } | null;
	}

	/** The card shown for a finding, on hover or when the cursor is inside it. */
	function card(target: EditorView, at: { from: number; to: number; finding: Highlight }): Tooltip {
		return {
			pos: at.from,
			end: at.to,
			above: true,
			arrow: false,
			create() {
				const c = byId.get(at.finding.category);
				// The editor puts its own tooltip classes on the element it is
				// given, so the card is a child of that element, not the element.
				const wrap = document.createElement('div');
				const dom = document.createElement('div');
				dom.className = 'vt-card';
				wrap.append(dom);

				const head = document.createElement('div');
				head.className = `vt-card-head vt-${c?.tone ?? 'amber'}`;
				const dot = document.createElement('span');
				dot.className = 'vt-dot';
				head.append(dot, c?.label ?? '');
				dom.append(head);

				const body = document.createElement('p');
				body.textContent = at.finding.message;
				dom.append(body);

				if (at.finding.source) {
					const source = document.createElement('p');
					source.className = 'vt-card-source';
					source.textContent = at.finding.source;
					dom.append(source);
				}

				const fix = at.finding.fix;
				if (fix) {
					const button = document.createElement('button');
					button.type = 'button';
					button.textContent = fix.label;
					// mousedown, not click: the editor would otherwise take the
					// press as a cursor move and close the card first.
					button.addEventListener('mousedown', (e) => {
						e.preventDefault();
						const doc = target.state.doc;
						const end = Math.min(doc.length, at.to + (fix.extend ?? 0));
						let text = fix.replacement;
						// Cutting the first word of a sentence: recapitalize what follows.
						if (!text && /^\p{Lu}/u.test(doc.sliceString(at.from, at.from + 1))) {
							const next = doc.sliceString(end, end + 1);
							target.dispatch({
								changes: { from: at.from, to: end + 1, insert: next.toUpperCase() },
								userEvent: 'input.fix'
							});
						} else {
							target.dispatch({
								changes: { from: at.from, to: end, insert: text },
								userEvent: 'input.fix'
							});
						}
						target.focus();
					});
					dom.append(button);
				}
				return { dom: wrap };
			}
		};
	}

	/**
	 * A card for the finding the cursor is in. This is what a touchscreen gets,
	 * since it has no hover, and what the legend's "jump" lands on.
	 */
	const atCursor = StateField.define<Tooltip | null>({
		create: () => null,
		update(current, tr) {
			if (!view) return null;
			// Any edit closes the card, a fix included: it shouldn't follow the
			// caret through every keystroke, or reopen on whatever is under it.
			if (tr.docChanged) return null;
			// A fresh analysis redraws the card only if one was already open.
			if (!tr.selection && !(current && tr.effects.some((e) => e.is(setMarks)))) return current;
			const sel = tr.state.selection.main;
			if (!sel.empty) return null;
			const at = findingAt(tr.state, sel.head);
			return at ? card(view, at) : null;
		},
		provide: (f) => showTooltip.from(f)
	});

	onMount(() => {
		if (!value) value = recall();
		canPaste = !!navigator.clipboard?.readText;

		view = new EditorView({
			parent: host,
			state: EditorState.create({
				doc: value,
				extensions: [
					history(),
					drawSelection(),
					keymap.of([...defaultKeymap, ...historyKeymap]),
					EditorView.lineWrapping,
					placeholderExt(placeholder),
					marks,
					atCursor,
					hoverTooltip(
						(v, pos) => {
							const at = findingAt(v.state, pos);
							const open = v.state.field(atCursor);
							// The cursor's card is already showing this one.
							if (!at || (open && open.pos === at.from && open.end === at.to)) return null;
							return card(v, at);
						},
						{ hoverTime: 120 }
					),
					EditorView.contentAttributes.of({
						'aria-label': label,
						spellcheck: 'false',
						autocapitalize: 'sentences'
					}),
					// Left alone, the editor inserts a dropped file's raw bytes as
					// text. Files go through `open` instead.
					EditorView.domEventHandlers({
						drop(e) {
							if (!hasFiles(e)) return false;
							e.preventDefault();
							dragging = 0;
							void open(e.dataTransfer?.files[0]);
							return true;
						}
					}),
					EditorView.updateListener.of((u) => {
						if (u.docChanged) value = u.state.doc.toString();
					})
				]
			})
		});
		mounted = true;

		return () => view?.destroy();
	});

	// The page changed the text (a sample, a paste, another tool's draft).
	$effect(() => {
		const next = value;
		if (!view || next === view.state.doc.toString()) return;
		view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } });
	});

	$effect(() => remember(value));

	// Once the text is cleared, it is no longer that file.
	$effect(() => {
		if (!value) opened = null;
	});

	// New analysis, or a category switched on or off.
	$effect(() => {
		const next = visible;
		if (!mounted || !view) return;
		view.dispatch({ effects: setMarks.of(next) });
	});

	/** Moves to the next finding in a category, wrapping at the end. */
	export function jump(category: string) {
		if (!view) return;
		const head = view.state.selection.main.head;
		const list = visible.filter((h) => h.category === category);
		if (!list.length) return;
		const next = list.find((h) => h.from > head) ?? list[0];
		view.dispatch({
			selection: { anchor: next.from },
			effects: EditorView.scrollIntoView(next.from, { y: 'center' }),
			userEvent: 'select.jump'
		});
		view.focus();
	}

	async function paste() {
		try {
			value = await navigator.clipboard.readText();
		} catch {
			canPaste = false; // permission denied; Ctrl+V still works
		}
	}

	async function copy() {
		try {
			await navigator.clipboard.writeText(value);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			// Clipboard blocked: the text can still be selected by hand.
		}
	}

	const button =
		'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40';
</script>

<div
	class="vt-editor relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow focus-within:border-lime-500/50 focus-within:shadow-md"
	role="group"
	aria-label={label}
	ondragenter={(e) => hasFiles(e) && dragging++}
	ondragleave={(e) => hasFiles(e) && (dragging = Math.max(0, dragging - 1))}
	ondragover={(e) => hasFiles(e) && e.preventDefault()}
	ondrop={(e) => {
		if (!hasFiles(e)) return;
		e.preventDefault();
		dragging = 0;
		void open(e.dataTransfer?.files[0]);
	}}
>
	<div class="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-2">
		<span class="pl-1.5 text-xs font-medium text-muted-foreground">{label}</span>
		<div class="flex items-center gap-0.5">
			<input
				bind:this={picker}
				type="file"
				{accept}
				class="hidden"
				onchange={(e) => {
					void open(e.currentTarget.files?.[0]);
					e.currentTarget.value = ''; // so the same file can be opened again
				}}
			/>
			<button type="button" class={button} onclick={() => picker.click()} aria-label="Open a file">
				<FileUp class="h-3.5 w-3.5" aria-hidden="true" />
				<span class="hidden sm:inline">Open</span>
			</button>
			{#if canPaste}
				<button type="button" class={button} onclick={paste} aria-label="Paste">
					<ClipboardPaste class="h-3.5 w-3.5" aria-hidden="true" />
					<span class="hidden sm:inline">Paste</span>
				</button>
			{/if}
			<button type="button" class={button} onclick={() => (value = sample)} aria-label="Sample">
				<TextQuote class="h-3.5 w-3.5" aria-hidden="true" />
				<span class="hidden sm:inline">Sample</span>
			</button>
			<button type="button" class={button} onclick={copy} disabled={!value} aria-label="Copy">
				{#if copied}
					<Check class="h-3.5 w-3.5 text-lime-600" aria-hidden="true" />
					<span class="hidden sm:inline">Copied</span>
				{:else}
					<Copy class="h-3.5 w-3.5" aria-hidden="true" />
					<span class="hidden sm:inline">Copy</span>
				{/if}
			</button>
			<button
				type="button"
				class={button}
				onclick={() => (value = '')}
				disabled={!value}
				aria-label="Clear"
			>
				<Eraser class="h-3.5 w-3.5" aria-hidden="true" />
				<span class="hidden sm:inline">Clear</span>
			</button>
		</div>
	</div>

	<div bind:this={host} style="--vt-min: {minHeight}">
		{#if !mounted}
			<!-- What the page shows before the editor starts, at the same size, so
			     nothing moves when it does. -->
			<div class="vt-shell text-muted-foreground/70">{placeholder}</div>
		{/if}
	</div>

	{#if reading || opened || problem}
		<div
			class="flex items-center gap-2 border-t border-border/70 px-4 py-2 text-xs {problem
				? 'text-rose-700 dark:text-rose-300'
				: 'text-muted-foreground'}"
			role="status"
		>
			<FileText class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
			<span class="min-w-0 flex-1 truncate">
				{#if reading}
					Reading {reading}…
				{:else if problem}
					{problem}
				{:else if opened}
					<span class="font-medium text-foreground">{opened.name}</span>
					· {opened.format.name}, read on your device
				{/if}
			</span>
			{#if !reading}
				<button
					type="button"
					class="rounded p-0.5 hover:bg-muted hover:text-foreground"
					aria-label="Dismiss"
					onclick={() => {
						opened = null;
						problem = '';
					}}
				>
					<X class="h-3.5 w-3.5" aria-hidden="true" />
				</button>
			{/if}
		</div>
	{/if}

	{#if dragging > 0}
		<div
			class="pointer-events-none absolute inset-1.5 z-30 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-lime-500 bg-card/90 text-center backdrop-blur-sm"
		>
			<FileUp class="h-7 w-7 text-lime-600 dark:text-lime-400" aria-hidden="true" />
			<p class="text-base font-medium text-foreground">Drop your file to open it</p>
			<p class="max-w-xs text-xs text-muted-foreground">
				Word, PDF, Markdown, HTML, LaTeX, and more. It is read here, not uploaded.
			</p>
		</div>
	{/if}
</div>

<style>
	.vt-shell {
		min-height: var(--vt-min);
		padding: 1.25rem 1.5rem;
		font-size: 1.0625rem;
		line-height: 1.85;
	}

	.vt-editor :global(.cm-editor) {
		background: transparent;
		outline: none;
	}
	.vt-editor :global(.cm-scroller) {
		font-family: inherit;
		font-size: 1.0625rem;
		line-height: 1.85;
		min-height: var(--vt-min);
	}
	.vt-editor :global(.cm-content) {
		padding: 1.25rem 1.5rem;
		caret-color: hsl(var(--primary));
	}
	.vt-editor :global(.cm-line) {
		padding: 0;
	}
	.vt-editor :global(.cm-placeholder) {
		color: hsl(var(--muted-foreground) / 0.7);
	}
	.vt-editor :global(.cm-cursor) {
		border-left: 2px solid hsl(var(--primary));
	}
	.vt-editor :global(.cm-selectionBackground),
	.vt-editor :global(.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground) {
		background: hsl(var(--primary) / 0.22);
	}

	/* One hue per tone, used at different strengths for fills, underlines,
	   the card's heading, and the legend's swatches. */
	:global(.vt-amber) {
		--vt: 38 92% 50%;
	}
	:global(.vt-rose) {
		--vt: 350 85% 58%;
	}
	:global(.vt-sky) {
		--vt: 205 90% 52%;
	}
	:global(.vt-violet) {
		--vt: 262 80% 62%;
	}
	:global(.vt-teal) {
		--vt: 172 70% 38%;
	}
	:global(.vt-orange) {
		--vt: 22 90% 54%;
	}
	:global(.vt-lime) {
		--vt: 92 62% 40%;
	}

	.vt-editor :global(.vt-mark) {
		border-radius: 3px;
		transition: background-color 120ms;
	}
	.vt-editor :global(.vt-fill) {
		background: hsl(var(--vt) / 0.16);
		box-decoration-break: clone;
		-webkit-box-decoration-break: clone;
		padding: 0.14em 0;
	}
	.vt-editor :global(.vt-fill.vt-rose) {
		background: hsl(var(--vt) / 0.2);
	}
	.vt-editor :global(.vt-line) {
		background: hsl(var(--vt) / 0.12);
		box-shadow: inset 0 -2px 0 hsl(var(--vt));
		padding: 0.08em 0.1em;
		margin: 0 -0.1em;
		cursor: pointer;
	}
	.vt-editor :global(.vt-line:hover) {
		background: hsl(var(--vt) / 0.26);
	}

	/* The card is rendered by the editor outside this component's markup. */
	.vt-editor :global(.cm-tooltip) {
		border: none;
		background: transparent;
		z-index: 40;
	}
	:global(.vt-card) {
		max-width: min(19rem, calc(100vw - 2rem));
		margin-bottom: 0.4rem;
		border: 1px solid hsl(var(--border));
		border-radius: 0.75rem;
		background: hsl(var(--popover));
		color: hsl(var(--popover-foreground));
		padding: 0.75rem 0.875rem;
		font-family: Inter, ui-sans-serif, system-ui, sans-serif;
		font-size: 0.8125rem;
		line-height: 1.5;
		box-shadow:
			0 10px 30px -10px hsl(var(--foreground) / 0.25),
			0 2px 6px -2px hsl(var(--foreground) / 0.12);
		animation: vt-in 120ms ease-out;
	}
	:global(.vt-card-head) {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		margin-bottom: 0.3rem;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: hsl(var(--muted-foreground));
	}
	:global(.vt-dot) {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 999px;
		background: hsl(var(--vt));
	}
	:global(.vt-card-source) {
		margin-top: 0.3rem;
		font-size: 0.6875rem;
		color: hsl(var(--muted-foreground));
	}
	:global(.vt-card button) {
		margin-top: 0.6rem;
		border-radius: 0.5rem;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		padding: 0.3rem 0.7rem;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
	}
	:global(.vt-card button:hover) {
		filter: brightness(1.06);
	}
	@keyframes vt-in {
		from {
			opacity: 0;
			transform: translateY(3px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		:global(.vt-card) {
			animation: none;
		}
	}
</style>
