/**
 * Vale itself, for the pages under /tools: the wasm build, in a worker.
 *
 * The pages already check text with ./aitells, a subset of Vale's rule types
 * that a regular expression can express, and that answer is on screen at
 * once. This is the whole engine, with every rule type, real scopes, and the
 * fix each rule defines. It is a few megabytes, so it loads once there is
 * text to check, and its findings replace the quick ones when they arrive.
 *
 * Nothing here is required: a page that can't load the engine keeps the
 * findings it had.
 */

/** An alert as `vale --output=JSON` prints it. */
export type ValeAlert = {
	Check: string;
	/** 1-based. */
	Line: number;
	/** 1-based and inclusive, counted in code points. */
	Span: [number, number];
	Match: string;
	Message: string;
	Severity: string;
	Link?: string;
	Action?: { Name: string; Params: string[] | null };
};

/** A package archive and where it unpacks in the engine's filesystem. */
export type ValePackage = { url: string; prefix: string };

export type ValeSpec = {
	packages: ValePackage[];
	/** The .vale.ini to lint under. */
	config: string;
	/** The format the text is read as. */
	format?: string;
};

/** A package from the Vale index: its archive is its StylesPath. */
export const pkg = (name: string): ValePackage => ({
	url: `/wasm/packages/${name}.zip`,
	prefix: '/styles'
});

/** A .vale.ini that applies `styles`, found under `stylesPath`, to everything. */
export const config = (styles: string[], stylesPath = '/styles') =>
	`StylesPath = ${stylesPath}\nMinAlertLevel = suggestion\n\n[*]\nBasedOnStyles = ${styles.join(', ')}\n`;

export type Placed = { from: number; to: number; alert: ValeAlert };

/**
 * Turns each alert's line and column into offsets into `text`.
 *
 * Vale counts code points and a JavaScript string counts UTF-16 units, so an
 * emoji earlier on a line would push every later span one place left.
 */
export function place(text: string, alerts: ValeAlert[]): Placed[] {
	const starts = [0];
	for (let i = text.indexOf('\n'); i >= 0; i = text.indexOf('\n', i + 1)) starts.push(i + 1);

	const out: Placed[] = [];
	for (const alert of alerts) {
		const start = starts[alert.Line - 1];
		if (start === undefined || !alert.Span) continue;
		const end = starts[alert.Line] === undefined ? text.length : starts[alert.Line] - 1;

		// Walk the line once, to the span's last code point.
		let at = start;
		let from = -1;
		for (let n = 1; at < end && n <= alert.Span[1]; n++) {
			if (n === alert.Span[0]) from = at;
			at += text.codePointAt(at)! > 0xffff ? 2 : 1;
		}
		if (from < 0 || at <= from) continue;
		out.push({ from, to: at, alert });
	}
	return out.sort((a, b) => a.from - b.from || b.to - a.to);
}

/** The edit an alert's own action makes, when it is a plain replacement. */
export function fixFor(alert: ValeAlert): { label: string; replacement: string } | undefined {
	const params = alert.Action?.Params ?? [];
	if (alert.Action?.Name === 'replace' && params.length && params[0] !== alert.Match) {
		return { label: `Use “${params[0]}”`, replacement: params[0] };
	}
	if (alert.Action?.Name === 'remove') return { label: 'Remove', replacement: '' };
	return undefined;
}

export type Engine = {
	/**
	 * Lints `text`, under `spec` if one is given. Resolves to null when a later call replaced this one
	 * before it ran: only the newest text is worth an answer.
	 */
	lint: (text: string, spec?: ValeSpec) => Promise<ValeAlert[] | null>;
	dispose: () => void;
};

type Job = {
	text: string;
	spec: ValeSpec;
	resolve: (alerts: ValeAlert[] | null) => void;
	reject: (e: Error) => void;
};

/**
 * Starts a worker for one page. One lint runs at a time; while it does, only
 * the latest request waits behind it.
 */
export function createEngine(spec: ValeSpec): Engine {
	const worker = new Worker('/workers/vale.js');
	let running: (Job & { id: number }) | null = null;
	let waiting: Job | null = null;
	let ids = 0;
	let dead: Error | null = null;

	const send = (job: Job) => {
		running = { ...job, id: ++ids };
		worker.postMessage({
			id: running.id,
			text: job.text,
			format: job.spec.format ?? 'md',
			config: job.spec.config,
			packages: job.spec.packages
		});
	};

	const fail = (error: Error) => {
		dead = error;
		running?.reject(error);
		waiting?.reject(error);
		running = waiting = null;
		worker.terminate();
	};

	worker.onmessage = (
		event: MessageEvent<{ id: number; alerts?: ValeAlert[]; error?: string }>
	) => {
		const job = running;
		if (!job || event.data.id !== job.id) return;
		running = null;

		// The engine or a package didn't load: nothing later will either.
		if (event.data.error !== undefined) return fail(new Error(event.data.error));

		job.resolve(event.data.alerts ?? []);
		if (waiting) {
			const next = waiting;
			waiting = null;
			send(next);
		}
	};
	worker.onerror = (event) => fail(new Error(event.message || 'the worker failed'));

	return {
		lint(text, override) {
			if (dead) return Promise.reject(dead);
			return new Promise((resolve, reject) => {
				const job = { text, spec: override ?? spec, resolve, reject };
				if (!running) return send(job);
				waiting?.resolve(null);
				waiting = job;
			});
		},
		dispose() {
			running?.resolve(null);
			waiting?.resolve(null);
			running = waiting = null;
			worker.terminate();
		}
	};
}
