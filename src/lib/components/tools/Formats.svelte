<script lang="ts">
	import { formats } from '$lib/tools/files';

	/**
	 * The "open a file" section of a tool's explanation: which formats, and
	 * what is kept from each. One copy, so the three editor pages list the
	 * same formats the editor actually accepts.
	 */
	let { verb }: { verb: string } = $props();

	const kept: Record<string, string> = {
		text: 'Read as it is.',
		markdown: 'Read as it is. Code blocks, URLs, and markup are skipped.',
		docx: 'Paragraphs, headings, and table cells. Tracked deletions are left out.',
		pdf: 'The text layer, with hyphenated line breaks rejoined. A scan needs OCR first.',
		html: 'The page’s text. Scripts, styles, navigation, and code are left out.',
		rst: 'Prose and titles. Directives and literal blocks are left out.',
		asciidoc: 'Prose and titles. Listing blocks and attributes are left out.',
		org: 'Prose and headings. Source blocks and keywords are left out.',
		latex: 'The document body. Math, figures, citations, and commands are left out.',
		subtitles: 'The captions, without their numbers and timings.',
		notebook: 'The Markdown cells. Code and output are left out.'
	};
</script>

<h2 id="files">{verb} a Word document, PDF, or Markdown file</h2>
<p>
	Drag a file onto the editor, or choose <strong>Open</strong>. The file is read in your browser, so
	it is never uploaded. Files up to 25 MB are accepted.
</p>
<!-- On a phone each format is a stacked block; a three-column table doesn't fit. -->
<div class="mt-5 overflow-x-auto rounded-xl border border-border">
	<table class="w-full text-left text-sm max-sm:block">
		<thead class="border-b border-border bg-muted/40 text-xs text-muted-foreground max-sm:hidden">
			<tr>
				<th scope="col" class="px-4 py-2.5 font-medium">Format</th>
				<th scope="col" class="px-4 py-2.5 font-medium">Files</th>
				<th scope="col" class="px-4 py-2.5 font-medium">What is read</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-border max-sm:block">
			{#each formats as f (f.id)}
				<tr class="max-sm:block max-sm:px-4 max-sm:py-3">
					<th scope="row" class="font-medium max-sm:block sm:whitespace-nowrap sm:px-4 sm:py-2.5">
						{f.name}
					</th>
					<td
						class="font-mono text-xs text-muted-foreground max-sm:mt-0.5 max-sm:block sm:whitespace-nowrap sm:px-4 sm:py-2.5"
					>
						{f.extensions.map((e) => `.${e}`).join(' ')}
					</td>
					<td class="text-foreground/85 max-sm:mt-1.5 max-sm:block sm:px-4 sm:py-2.5"
						>{kept[f.id]}</td
					>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
