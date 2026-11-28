<script lang="ts" module>
	export type Mark = { from: number; to: number; severity: string };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { EditorState, StateEffect, StateField } from '@codemirror/state';
	import {
		Decoration,
		EditorView,
		drawSelection,
		keymap,
		type DecorationSet
	} from '@codemirror/view';
	import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
	import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
	import { yaml } from '@codemirror/lang-yaml';
	import { markdown } from '@codemirror/lang-markdown';
	import { tags as t } from '@lezer/highlight';

	/**
	 * A small code editor for a rule and its sample: syntax colors, and the
	 * alerts drawn into the text. `marks` replaces the drawn alerts when it
	 * changes; between lints the existing ones move with the edits.
	 */
	let {
		value = $bindable(''),
		lang,
		marks = null,
		rows = 8,
		maxRows = 22,
		label,
		oninput
	}: {
		value?: string;
		lang: 'yaml' | 'markdown';
		marks?: Mark[] | null;
		rows?: number;
		maxRows?: number;
		label: string;
		oninput?: () => void;
	} = $props();

	let host: HTMLDivElement;
	let view: EditorView | undefined;

	// Classes, not colors, so the site's light and dark themes both apply.
	const colors = HighlightStyle.define([
		{ tag: [t.propertyName, t.definition(t.propertyName)], class: 'tk-key' },
		{ tag: [t.string, t.special(t.string)], class: 'tk-string' },
		{ tag: [t.number, t.bool, t.null, t.atom], class: 'tk-atom' },
		{ tag: [t.comment, t.lineComment], class: 'tk-comment' },
		{ tag: t.heading, class: 'tk-heading' },
		{ tag: [t.monospace, t.url, t.link], class: 'tk-code' },
		{ tag: [t.emphasis], class: 'tk-em' },
		{ tag: [t.strong], class: 'tk-strong' },
		{ tag: [t.processingInstruction, t.meta, t.punctuation, t.separator], class: 'tk-mark' }
	]);

	const tone: Record<string, Decoration> = {
		error: Decoration.mark({ class: 'alert alert-error' }),
		warning: Decoration.mark({ class: 'alert alert-warning' }),
		suggestion: Decoration.mark({ class: 'alert alert-suggestion' })
	};

	const setMarks = StateEffect.define<Mark[]>();
	const drawn = StateField.define<DecorationSet>({
		create: () => Decoration.none,
		update(set, tr) {
			set = set.map(tr.changes);
			for (const e of tr.effects) {
				if (!e.is(setMarks)) continue;
				const len = tr.state.doc.length;
				set = Decoration.set(
					e.value
						.filter((m) => m.from < m.to && m.to <= len)
						.map((m) => (tone[m.severity] ?? tone.suggestion).range(m.from, m.to)),
					true
				);
			}
			return set;
		},
		provide: (f) => EditorView.decorations.from(f)
	});

	onMount(() => {
		view = new EditorView({
			parent: host,
			state: EditorState.create({
				doc: value,
				extensions: [
					history(),
					drawSelection(),
					keymap.of([...defaultKeymap, ...historyKeymap]),
					EditorView.lineWrapping,
					lang === 'yaml' ? yaml() : markdown(),
					syntaxHighlighting(colors),
					drawn,
					EditorView.contentAttributes.of({ 'aria-label': label, spellcheck: 'false' }),
					EditorView.updateListener.of((u) => {
						if (!u.docChanged) return;
						value = u.state.doc.toString();
						oninput?.();
					})
				]
			})
		});
		return () => view?.destroy();
	});

	// A value set from outside, such as Reset, replaces the text.
	$effect(() => {
		const next = value;
		if (view && next !== view.state.doc.toString()) {
			view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } });
		}
	});

	$effect(() => {
		const next = marks;
		if (view && next) view.dispatch({ effects: setMarks.of(next) });
	});
</script>

<div
	bind:this={host}
	class="editor mt-1 overflow-hidden rounded-lg border border-border focus-within:border-lime-500/60 focus-within:ring-2 focus-within:ring-lime-500/20"
	style="--rows: {rows}; --max-rows: {maxRows}"
></div>

<style>
	.editor :global(.cm-editor) {
		font-size: 0.75rem;
		line-height: 1.25rem;
		background: transparent;
	}
	.editor :global(.cm-editor.cm-focused) {
		outline: none;
	}
	.editor :global(.cm-scroller) {
		font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
		min-height: calc(var(--rows) * 1.25rem + 1.5rem);
		max-height: calc(var(--max-rows) * 1.25rem + 1.5rem);
		overflow: auto;
	}
	.editor :global(.cm-content) {
		padding: 0.75rem 0;
		caret-color: currentColor;
	}
	.editor :global(.cm-line) {
		padding: 0 0.75rem;
	}
	.editor :global(.cm-cursor) {
		border-left-color: currentColor;
	}
	.editor :global(.cm-selectionBackground),
	.editor :global(.cm-focused .cm-selectionBackground) {
		background: rgb(132 204 22 / 0.25) !important;
	}

	.editor :global(.tk-key) {
		color: #0369a1;
	}
	.editor :global(.tk-string) {
		color: #4d7c0f;
	}
	.editor :global(.tk-atom) {
		color: #b45309;
	}
	.editor :global(.tk-comment) {
		color: #78716c;
		font-style: italic;
	}
	.editor :global(.tk-heading) {
		font-weight: 600;
		color: #be123c;
	}
	.editor :global(.tk-code) {
		color: #6d28d9;
	}
	.editor :global(.tk-em) {
		font-style: italic;
	}
	.editor :global(.tk-strong) {
		font-weight: 600;
	}
	.editor :global(.tk-mark) {
		color: #a8a29e;
	}
	:global(.dark) .editor :global(.tk-key) {
		color: #7dd3fc;
	}
	:global(.dark) .editor :global(.tk-string) {
		color: #bef264;
	}
	:global(.dark) .editor :global(.tk-atom) {
		color: #fcd34d;
	}
	:global(.dark) .editor :global(.tk-comment) {
		color: #a8a29e;
	}
	:global(.dark) .editor :global(.tk-heading) {
		color: #fda4af;
	}
	:global(.dark) .editor :global(.tk-code) {
		color: #c4b5fd;
	}
	:global(.dark) .editor :global(.tk-mark) {
		color: #78716c;
	}

	.editor :global(.alert) {
		border-radius: 2px;
	}
	.editor :global(.alert-error) {
		background: rgb(244 63 94 / 0.2);
		box-shadow: inset 0 -2px 0 rgb(244 63 94);
	}
	.editor :global(.alert-warning) {
		background: rgb(245 158 11 / 0.2);
		box-shadow: inset 0 -2px 0 rgb(245 158 11);
	}
	.editor :global(.alert-suggestion) {
		background: rgb(14 165 233 / 0.2);
		box-shadow: inset 0 -2px 0 rgb(14 165 233);
	}
</style>
