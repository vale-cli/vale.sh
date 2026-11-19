/**
 * Reads a dropped or chosen file into plain prose, in the browser.
 *
 * The tools work on text, so every format ends up as text here: markup that
 * isn't prose is taken out, and paragraphs are kept apart by a blank line.
 * Nothing is uploaded. The two formats that need a real parser, Word and
 * PDF, load theirs only when a file of that kind arrives.
 *
 * Markdown is passed through untouched, since the tools already know to skip
 * its code blocks and markup.
 */

export type Format = {
	id: string;
	/** What the status line calls it: "Word document". */
	name: string;
	extensions: string[];
};

export const formats: Format[] = [
	{ id: 'text', name: 'Plain text', extensions: ['txt', 'text'] },
	{ id: 'markdown', name: 'Markdown', extensions: ['md', 'mdx', 'markdown', 'qmd'] },
	{ id: 'docx', name: 'Word document', extensions: ['docx'] },
	{ id: 'pdf', name: 'PDF', extensions: ['pdf'] },
	{ id: 'html', name: 'HTML', extensions: ['html', 'htm', 'xhtml'] },
	{ id: 'rst', name: 'reStructuredText', extensions: ['rst'] },
	{ id: 'asciidoc', name: 'AsciiDoc', extensions: ['adoc', 'asciidoc'] },
	{ id: 'org', name: 'Org', extensions: ['org'] },
	{ id: 'latex', name: 'LaTeX', extensions: ['tex'] },
	{ id: 'subtitles', name: 'Subtitles', extensions: ['srt', 'vtt'] },
	{ id: 'notebook', name: 'Jupyter notebook', extensions: ['ipynb'] }
];

/** For a file input's `accept`. */
export const accept = formats.flatMap((f) => f.extensions.map((e) => `.${e}`)).join(',');

const MAX_BYTES = 25 * 1024 * 1024;

export type Loaded = { text: string; format: Format; name: string };

/** An error whose message is written for the person who dropped the file. */
export class FileError extends Error {}

export function formatOf(name: string): Format | undefined {
	const ext = name.toLowerCase().split('.').pop() ?? '';
	return formats.find((f) => f.extensions.includes(ext));
}

/** Collapses the gaps a conversion leaves, without touching single line breaks. */
const tidy = (text: string) =>
	text
		.replace(/\r\n?/g, '\n')
		.replace(/[ \t]+\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();

export async function readFile(file: File): Promise<Loaded> {
	const format = formatOf(file.name);
	if (!format) {
		throw new FileError(
			`“${file.name}” isn’t a format this can read. Try a Word, PDF, Markdown, HTML, or text file.`
		);
	}
	if (file.size > MAX_BYTES) {
		throw new FileError(`“${file.name}” is over 25 MB, which is too large to open here.`);
	}

	let text: string;
	try {
		switch (format.id) {
			case 'docx':
				text = await docx(file);
				break;
			case 'pdf':
				text = await pdf(file);
				break;
			case 'html':
				text = html(await file.text());
				break;
			case 'rst':
				text = rst(await file.text());
				break;
			case 'asciidoc':
				text = asciidoc(await file.text());
				break;
			case 'org':
				text = org(await file.text());
				break;
			case 'latex':
				text = latex(await file.text());
				break;
			case 'subtitles':
				text = subtitles(await file.text());
				break;
			case 'notebook':
				text = notebook(await file.text());
				break;
			default:
				text = await file.text();
		}
	} catch (e) {
		if (e instanceof FileError) throw e;
		throw new FileError(
			`“${file.name}” couldn’t be read. It may be damaged or password-protected.`
		);
	}

	// A conversion leaves gaps where code or markup was taken out.
	if (format.id !== 'text' && format.id !== 'markdown') {
		text = text.replace(/[ \t]{2,}/g, ' ').replace(/ +([.,;:!?])/g, '$1');
	}
	text = tidy(text);
	if (!text) {
		throw new FileError(
			format.id === 'pdf'
				? `“${file.name}” has no text to read. It is probably a scan, which needs OCR first.`
				: `“${file.name}” has no text in it.`
		);
	}
	return { text, format, name: file.name };
}

/* ---- Word ---------------------------------------------------------------- */

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

/**
 * A .docx is a zip, and the document is one XML file inside it. Each
 * paragraph's runs are joined, a heading gets Markdown's marker so the tools
 * treat it as one, and a table's cells are read in order.
 */
async function docx(file: File): Promise<string> {
	const { unzipSync, strFromU8 } = await import('fflate');
	const entries = unzipSync(new Uint8Array(await file.arrayBuffer()), {
		filter: (f) => f.name === 'word/document.xml'
	});
	const xml = entries['word/document.xml'];
	if (!xml) throw new FileError(`“${file.name}” isn’t a Word document this can read.`);

	const doc = new DOMParser().parseFromString(strFromU8(xml), 'application/xml');
	const out: string[] = [];

	for (const p of doc.getElementsByTagNameNS(W, 'p')) {
		let line = '';
		const walk = (node: Element) => {
			for (const child of node.children) {
				if (child.namespaceURI !== W) {
					walk(child);
					continue;
				}
				switch (child.localName) {
					case 't':
						line += child.textContent ?? '';
						break;
					case 'tab':
						line += '\t';
						break;
					case 'br':
					case 'cr':
						line += '\n';
						break;
					// Text a reviewer deleted, and field codes, aren't the document.
					case 'del':
					case 'instrText':
					case 'pPr':
					case 'rPr':
						break;
					default:
						walk(child);
				}
			}
		};
		walk(p);

		const style =
			p.getElementsByTagNameNS(W, 'pStyle')[0]?.getAttributeNS(W, 'val') ??
			p.getElementsByTagNameNS(W, 'pStyle')[0]?.getAttribute('w:val') ??
			'';
		const level = /^Heading(\d)$/i.exec(style)?.[1];
		if (line.trim()) out.push(level ? `${'#'.repeat(Number(level))} ${line.trim()}` : line);
	}
	return out.join('\n\n');
}

/* ---- PDF ----------------------------------------------------------------- */

/**
 * A PDF stores positioned fragments, not paragraphs. Fragments are joined in
 * reading order, a line that ends in a hyphen is rejoined with the next, and
 * a gap taller than a line starts a new paragraph.
 */
async function pdf(file: File): Promise<string> {
	const [pdfjs, worker] = await Promise.all([
		import('pdfjs-dist'),
		import('pdfjs-dist/build/pdf.worker.min.mjs?url')
	]);
	pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

	const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
	const doc = await task.promise;
	const pages: string[] = [];

	for (let n = 1; n <= doc.numPages; n++) {
		const page = await doc.getPage(n);
		const content = await page.getTextContent();
		let text = '';
		let lastY: number | null = null;
		let lastHeight = 0;

		for (const item of content.items) {
			if (!('str' in item)) continue;
			const y = item.transform[5] as number;
			const height = item.height || lastHeight || 12;
			// A new paragraph: a gap taller than a line, or a change of type
			// size, which is how a heading differs from the text under it.
			const gap = lastY !== null && Math.abs(lastY - y) > Math.max(height, lastHeight) * 1.6;
			const resized = lastHeight > 0 && Math.abs(height - lastHeight) > lastHeight * 0.15;
			if (item.str.trim() && (gap || resized) && text && !text.endsWith('\n\n')) {
				text = text.trimEnd() + '\n\n';
			}
			text += item.str;
			if (item.hasEOL) text += '\n';
			if (item.str.trim()) {
				lastY = y;
				lastHeight = height;
			}
		}

		pages.push(
			text
				.replace(/(\p{L})-\n(\p{Ll})/gu, '$1$2') // a word split across lines
				.replace(/([^\n])\n(?!\n)/g, '$1 ') // a wrapped line is one sentence
		);
	}
	await task.destroy();
	return pages.join('\n\n');
}

/* ---- Markup -------------------------------------------------------------- */

const BLOCKS = new Set(
	'address article aside blockquote br dd div dl dt figcaption footer h1 h2 h3 h4 h5 h6 header hr li main ol p section table td th tr ul'.split(
		' '
	)
);
const SKIP = new Set(
	'script style noscript template svg math code pre kbd samp nav head iframe'.split(' ')
);

/** The text of a page, with its code, navigation, and scripts left out. */
function html(source: string): string {
	const doc = new DOMParser().parseFromString(source, 'text/html');
	let out = '';
	const walk = (node: Node) => {
		if (node.nodeType === Node.TEXT_NODE) {
			out += (node.textContent ?? '').replace(/\s+/g, ' ');
			return;
		}
		if (node.nodeType !== Node.ELEMENT_NODE) return;
		const tag = (node as Element).tagName.toLowerCase();
		if (SKIP.has(tag)) return;
		const block = BLOCKS.has(tag);
		const heading = /^h([1-6])$/.exec(tag);
		if (block) out += '\n\n';
		if (heading) out += '#'.repeat(Number(heading[1])) + ' ';
		for (const child of node.childNodes) walk(child);
		if (block) out += '\n\n';
	};
	walk(doc.body ?? doc.documentElement);
	return out.replace(/\n[ \t]+/g, '\n');
}

function rst(source: string): string {
	return (
		source
			// A directive and its indented body: code, images, tables of contents.
			.replace(/^\.\. [^\n]*(?:\n(?:[ \t]+[^\n]*|[ \t]*))*/gm, '')
			// A literal block: the paragraph ending in "::" keeps its text.
			.replace(/::\n\n(?:[ \t]+[^\n]*\n?|\n)+/g, ':\n\n')
			// A title is a line with a row of punctuation under it.
			.replace(/^(\S[^\n]*)\n([=\-~^"'`#*+])\2{2,}[ \t]*$/gm, '# $1')
			// Section underlines and overlines.
			.replace(/^([=\-~^"'`#*+_.:])\1{2,}[ \t]*$/gm, '')
			.replace(/:(?:[a-z]+:)?[a-z-]+:`([^`<]*?)(?:\s*<[^>]*>)?`/g, '$1')
			.replace(/``[^`\n]*``/g, ' ')
			.replace(/`([^`<\n]+?)\s*<[^>]*>`__?/g, '$1')
			.replace(/[*`|]/g, '')
	);
}

function asciidoc(source: string): string {
	return (
		source
			// Delimited listing, literal, and passthrough blocks.
			.replace(/^(-{4,}|\.{4,}|\+{4,})\n[\s\S]*?^\1[ \t]*$/gm, '')
			.replace(/^:[\w-]+:.*$/gm, '') // attributes
			.replace(/^\[[^\]\n]*\][ \t]*$/gm, '') // block attributes
			.replace(/^\/\/.*$/gm, '') // comments
			.replace(/^(?:include|image|ifdef|ifndef|endif|toc)::.*$/gm, '')
			.replace(/^(={1,6})[ \t]+/gm, (_, m: string) => '#'.repeat(m.length) + ' ')
			.replace(/(?:link:|xref:|https?:\/\/)\S*?\[([^\]]*)\]/g, '$1')
			.replace(/`\+?[^`\n]*\+?`/g, ' ')
			.replace(/[*_]{1,2}(?=\S)|(?<=\S)[*_]{1,2}/g, '')
	);
}

function org(source: string): string {
	return source
		.replace(/^[ \t]*#\+BEGIN_(?:SRC|EXAMPLE|EXPORT)[\s\S]*?^[ \t]*#\+END_\w+[ \t]*$/gim, '')
		.replace(/^[ \t]*#\+.*$/gm, '') // keywords
		.replace(/^[ \t]*:[\w-]+:.*$/gm, '') // drawers and properties
		.replace(/^(\*+)[ \t]+(?:TODO|DONE)?[ \t]*/gm, (_, m: string) => '#'.repeat(m.length) + ' ')
		.replace(/\[\[[^\]]*\]\[([^\]]*)\]\]/g, '$1')
		.replace(/\[\[([^\]]*)\]\]/g, '$1')
		.replace(/[=~][^=~\n]+[=~]/g, ' ');
}

function latex(source: string): string {
	return (
		source
			.replace(/(?<!\\)%.*$/gm, '')
			.replace(/^[\s\S]*?\\begin\{document\}/, '')
			.replace(/\\end\{document\}[\s\S]*$/, '')
			.replace(
				/\\begin\{(equation|align|verbatim|lstlisting|figure|table|tabular|tikzpicture|minted|math|displaymath|eqnarray|gather)\*?\}[\s\S]*?\\end\{\1\*?\}/g,
				''
			)
			.replace(/\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^$\n]*\$|\\\([\s\S]*?\\\)/g, ' ')
			.replace(/\\(?:sub)*section\*?\{([^}]*)\}/g, '\n\n## $1\n\n')
			.replace(/\\chapter\*?\{([^}]*)\}/g, '\n\n# $1\n\n')
			.replace(
				/\\(?:cite|ref|label|eqref|pageref|includegraphics|bibliography\w*|input|include|usepackage)\w*(?:\[[^\]]*\])*\{[^}]*\}/g,
				''
			)
			// \emph{word} and its kind keep the word.
			.replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*\])*\{([^{}]*)\}/g, '$1')
			.replace(/\\(?:begin|end)\{[^}]*\}/g, '')
			.replace(/\\item\b/g, '\n')
			.replace(/\\[a-zA-Z]+\*?/g, ' ')
			.replace(/\\(.)/g, '$1')
			.replace(/[{}~]/g, ' ')
			.replace(/``|''/g, '"')
	);
}

/** Captions without their numbers, timings, and styling tags. */
function subtitles(source: string): string {
	return source
		.replace(/^WEBVTT.*$/m, '')
		.replace(/^(?:NOTE|STYLE|REGION)\b[\s\S]*?(?:\n\n|$)/gm, '')
		.replace(/^\d+[ \t]*$/gm, '')
		.replace(/^[\d:.,]+ --> [\d:.,]+.*$/gm, '')
		.replace(/<[^>]+>|\{\\[^}]*\}/g, '')
		.replace(/([^\n])\n(?=[^\n])/g, '$1 ');
}

/** The Markdown cells of a notebook, in order. Code and output are left out. */
function notebook(source: string): string {
	const data = JSON.parse(source) as {
		cells?: { cell_type?: string; source?: string | string[] }[];
	};
	return (data.cells ?? [])
		.filter((c) => c.cell_type === 'markdown')
		.map((c) => (Array.isArray(c.source) ? c.source.join('') : (c.source ?? '')))
		.join('\n\n');
}
