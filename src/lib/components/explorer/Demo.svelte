<!--
	Not currently rendered. To turn the demo back on, import this into
	src/routes/explorer/[name]/+page.svelte and pass a package name and some
	sample prose.

	It needs the assets that script/wasm.mjs stages into static/wasm/, which in
	turn needs vale.wasm published somewhere the build can reach anonymously —
	libvale is private, so its release assets 404 for Netlify. See the header of
	script/wasm.mjs.
-->
<script lang="ts">
	import CodeMirror from 'svelte-codemirror-editor';
	import { markdown } from '@codemirror/lang-markdown';
	import { setDiagnostics, type Diagnostic } from '@codemirror/lint';
	import { EditorView } from '@codemirror/view';
	import { bespin, tomorrow } from 'thememirror';
	import { mode as colorMode } from 'mode-watcher';
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Separator } from '$lib/components/ui/separator';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import Play from 'lucide-svelte/icons/play';
	import ExternalLink from 'lucide-svelte/icons/external-link';

	type Alert_ = {
		Check: string;
		Line: number;
		Span: [number, number];
		Message: string;
		Severity: 'error' | 'warning' | 'suggestion';
		Match: string;
		Link: string;
	};

	let { pkg, sample }: { pkg: string; sample: string } = $props();

	let text = $state(sample);
	let alerts = $state<Alert_[]>([]);
	let status = $state<'idle' | 'loading' | 'ready' | 'failed'>('idle');
	let message = $state('');
	let view: EditorView | null = null;

	// The engine is tens of megabytes, so nothing is fetched until someone asks
	// for it. Once loaded it stays for the session: the wasm instance keeps
	// itself alive, and instantiating per keystroke would be ruinous.
	let engine: Promise<void> | null = null;

	function load() {
		if (engine) return engine;

		status = 'loading';
		engine = (async () => {
			// Go's shim is a classic script that assigns globalThis.Go, not a
			// module, so it is loaded with a tag rather than imported.
			if (!('Go' in globalThis)) {
				await new Promise<void>((resolve, reject) => {
					const tag = document.createElement('script');
					tag.src = '/wasm/wasm_exec.js';
					tag.onload = () => resolve();
					tag.onerror = () => reject(new Error('failed to load wasm_exec.js'));
					document.head.append(tag);
				});
			}
			// @ts-expect-error — as above.
			const go = new globalThis.Go();
			const { instance } = await WebAssembly.instantiateStreaming(
				fetch('/wasm/vale.wasm'),
				go.importObject
			);
			// Never resolves: the module runs until the page goes away.
			void go.run(instance);
			await new Promise((r) => setTimeout(r, 50));

			// The package's own release archive is the StylesPath — a few tens
			// of kilobytes, and exactly what `vale sync` would install.
			const res = await fetch(`/wasm/packages/${pkg}.zip`);
			const zip = new Uint8Array(await res.arrayBuffer());
			// @ts-expect-error — registered by the wasm module.
			const added = globalThis.ValeAddPackage('/styles', zip);
			if (added?.error) throw new Error(added.error);
		})();

		engine
			.then(() => {
				status = 'ready';
				run();
			})
			.catch((e) => {
				status = 'failed';
				message = e instanceof Error ? e.message : String(e);
				engine = null;
			});

		return engine;
	}

	const config = $derived(
		`StylesPath = /styles\nMinAlertLevel = suggestion\n\n[*.md]\nBasedOnStyles = ${pkg}\n`
	);

	/**
	 * Turns Vale's alerts into CodeMirror diagnostics.
	 *
	 * Vale reports a 1-based line and an inclusive 1-based column span; the
	 * editor wants absolute, half-open offsets. The clamp matters because the
	 * two disagree on what a character is — Vale counts runes, CodeMirror counts
	 * UTF-16 code units — so an emoji earlier in the line pushes the span past
	 * the end of it.
	 */
	function diagnose(doc: EditorView['state']['doc'], list: Alert_[]): Diagnostic[] {
		const out: Diagnostic[] = [];
		for (const a of list) {
			if (a.Line < 1 || a.Line > doc.lines) continue;
			const line = doc.line(a.Line);
			const from = Math.min(line.from + a.Span[0] - 1, line.to);
			const to = Math.min(line.from + a.Span[1], line.to);
			out.push({
				from,
				to: Math.max(to, from + 1),
				severity: a.Severity === 'suggestion' ? 'info' : a.Severity,
				message: a.Message,
				source: a.Check
			});
		}
		return out;
	}

	function run() {
		if (status !== 'ready') return;
		try {
			// @ts-expect-error — registered by the wasm module.
			const out = globalThis.ValeLint(text, 'md', config);
			if (out?.error) {
				message = out.error;
				alerts = [];
				return;
			}
			message = '';
			const parsed = JSON.parse(out.result) as Record<string, Alert_[]>;
			alerts = Object.values(parsed).flat();
		} catch (e) {
			message = e instanceof Error ? e.message : String(e);
			alerts = [];
		}
		if (view) {
			view.dispatch(setDiagnostics(view.state, diagnose(view.state.doc, alerts)));
		}
	}

	// Linting is synchronous and blocks the main thread, so it waits for a pause
	// in typing rather than running on every keystroke.
	let debounce: ReturnType<typeof setTimeout>;
	function onChange() {
		clearTimeout(debounce);
		debounce = setTimeout(run, 300);
	}

	/** Scrolls to an alert and puts the cursor on it. */
	function reveal(a: Alert_) {
		if (!view) return;
		const [d] = diagnose(view.state.doc, [a]);
		if (!d) return;
		view.dispatch({
			selection: { anchor: d.from, head: d.to },
			effects: EditorView.scrollIntoView(d.from, { y: 'center' })
		});
		view.focus();
	}

	const editor = EditorView.theme({
		'.cm-content': { fontSize: '14px' },
		'.cm-line': { backgroundColor: 'transparent !important' },
		'.cm-scroller': { overflow: 'auto', minHeight: '11rem', maxHeight: '11rem' }
	});

	const variant = (s: Alert_['Severity']) =>
		s === 'error' ? 'destructive' : s === 'warning' ? 'default' : 'secondary';
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Try it</Card.Title>
		<Card.Description>
			Edit the text to see what {pkg} flags. Vale runs entirely in your browser—nothing is uploaded.
		</Card.Description>
	</Card.Header>

	<Card.Content class="flex flex-col gap-4">
		<div class="overflow-hidden rounded-md border">
			<CodeMirror
				bind:value={text}
				lang={markdown()}
				theme={[$colorMode === 'dark' ? bespin : tomorrow, editor]}
				lineWrapping
				on:change={onChange}
				on:ready={(e) => (view = e.detail)}
			/>
		</div>

		{#if status === 'idle'}
			<Button variant="outline" onclick={load} class="self-start">
				<Play data-icon="inline-start" />
				Run {pkg}
			</Button>
			<p class="text-xs text-muted-foreground">Downloads the Vale engine the first time.</p>
		{:else if status === 'loading'}
			<Button variant="outline" disabled class="self-start">
				<LoaderCircle data-icon="inline-start" class="animate-spin" />
				Loading the engine…
			</Button>
		{:else if status === 'failed'}
			<Alert.Root variant="destructive">
				<Alert.Title>Couldn't load the engine</Alert.Title>
				<Alert.Description>{message}</Alert.Description>
			</Alert.Root>
		{:else}
			<Separator />
			<div class="flex items-baseline justify-between">
				<p class="text-sm font-medium">
					{alerts.length}
					{alerts.length === 1 ? 'problem' : 'problems'}
				</p>
				{#if message}
					<p class="text-xs text-destructive">{message}</p>
				{/if}
			</div>

			{#if alerts.length}
				<ScrollArea class="h-64 rounded-md border">
					<ul class="divide-y">
						{#each alerts as alert}
							<li>
								<button
									type="button"
									onclick={() => reveal(alert)}
									class="flex w-full flex-col gap-1 p-3 text-left hover:bg-muted/50"
								>
									<div class="flex flex-wrap items-center gap-2">
										<Badge variant={variant(alert.Severity)}>{alert.Severity}</Badge>
										<span class="font-mono text-xs text-muted-foreground">{alert.Check}</span>
										<span class="text-xs text-muted-foreground">line {alert.Line}</span>
									</div>
									<p class="text-sm">{alert.Message}</p>
								</button>
								{#if alert.Link}
									<a
										href={alert.Link}
										target="_blank"
										rel="noreferrer"
										class="inline-flex items-center gap-1 px-3 pb-3 text-xs text-muted-foreground hover:text-foreground"
									>
										Style guide <ExternalLink class="size-3" />
									</a>
								{/if}
							</li>
						{/each}
					</ul>
				</ScrollArea>
			{:else}
				<p class="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
					No problems found.
				</p>
			{/if}
		{/if}
	</Card.Content>
</Card.Root>
