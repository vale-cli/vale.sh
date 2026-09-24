# Plain text

Learn how Vale handles files with no markup.

The supported extension is `.txt`. A file is read as prose: blank lines separate paragraphs, and the text is segmented into sentences, so a rule scoped to `paragraph` or `sentence` works as it does in a markup file. The `text` scope is the whole file as one block, so a pattern with `\s+` in it can match across a blank line there. Nothing is ignored, since nothing marks code or links.

## [Manuscripts](text.md#manuscripts)

{% hint style="info" %}
Requires Vale v3.23.0 or later.
{% endhint %}

A plain-text file that marks its chapters is read as a document. A line of its own reading `Chapter One`, `Prologue`, `Epilogue`, `Interlude`, `Part II`, or a bare number such as `7` or `IV` is a heading, and everything after it up to the next such line is its section. A first short line followed by a chapter heading is the title. A row of asterisks, hashes, or dashes on its own line is a scene break.

Chapters and numbered headings are `heading.h2`; a part, book, or act is `heading.h1`, as is the title. With that structure, the rules a Markdown manuscript gets reach the `.txt` one: a rule scoped to `heading`, or to a selection such as `doc(section:has(> h2))`, sees the same chapters in either format. A file with no chapter line is read as it always was, one block of prose.

Any other extension Vale does not know is read as one block of text under the `text` scope, without paragraph or sentence segmentation. A [format association](../topics/.vale.ini.md#format-associations) reads such a file as one of the formats Vale knows:

```ini
[formats]
log = txt
```

Text that has structure by convention, a commit message, a transcript, a subtitle file, can be given scopes of its own through a [TextFSM View](../topics/views.md#text), so that a rule reaches the subject or one speaker's turns by name.

`--ignore-syntax` reads every file this way, line by line, whatever its extension.
