# BlockIgnores

Learn how to define custom block-level ignores in your Vale configuration.

{% hint style="info" %}
`BlockIgnores` are supported in AsciiDoc, Markdown, MDX, MyST, Org Mode, QDoc, Quarto, reStructuredText, and Typst. MyST, QDoc, Quarto, and Typst require Vale v3.18.0 or later.

They work by wrapping each match in the format's block code delimiter, so they need a markup format to wrap it with. In a source code file they have no effect—but associating a markup format with your comments makes them available. See [Code](../formats/code.md#associations).
{% endhint %}

```ini
StylesPath = styles

[*.md]
BasedOnStyles = Vale

BlockIgnores = (?s) *({< file [^>]* >}.*?{</ ?file >})
```

`BlockIgnores` allow you to exclude certain block-level sections of text that don’t have an associated HTML tag that could be used with [`SkippedScopes`](skippedscopes.md).

The idea is to write a regular expression that captures the entire block in the first grouping. Several patterns are separated by commas, so a comma inside a pattern is written `\,`. See this [regex101 session](https://regex101.com/r/mFM0kZ/1/) for a more thorough explanation.

A section can be keyed on a path as well as an extension, which narrows the patterns to one part of the project:

```ini
[docs/api/*.md]
BlockIgnores = (?s)(<!-- generated -->.*?<!-- /generated -->)
```

The pattern matches the file as Vale was asked for it, so write it relative to where you run Vale. See [Globbing](../guides/globbing.md).
