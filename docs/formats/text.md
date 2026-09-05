# Plain text

Learn how Vale handles files with no markup.

The supported extension is `.txt`. A file is read as prose: blank lines separate paragraphs, and each paragraph is segmented into sentences, so a rule scoped to `paragraph` or `sentence` works as it does in a markup file. Nothing is ignored, since nothing marks code or links.

Any other extension Vale does not know is read as one block of text under the `text` scope, without paragraph or sentence segmentation. A [format association](../topics/.vale.ini.md#format-associations) reads such a file as one of the formats Vale knows:

```ini
[formats]
log = txt
```

Text that has structure by convention, a commit message, a transcript, a subtitle file, can be given scopes of its own through a [TextFSM View](../topics/views.md#text), so that a rule reaches the subject or one speaker's turns by name.

`--ignore-syntax` reads every file this way, line by line, whatever its extension.
