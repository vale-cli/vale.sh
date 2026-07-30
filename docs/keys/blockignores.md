# BlockIgnores

Learn define custom block-level ignores in your Vale configuration.

{% hint style="info" %}
`BlockIgnores` are only supported in Markdown, reStructuredText, AsciiDoc, and Org Mode.

They work by wrapping each match in the format's block code delimiter, so they need a markup format to wrap it with. In a source code file they have no effect—but associating a markup format with your comments makes them available. See [Code](../formats/code.md#associations).
{% endhint %}

```ini
StylesPath = styles

[*.md]
BasedOnStyles = Vale

BlockIgnores = (?s) *({< file [^>]* >}.*?{</ ?file >})
```

`BlockIgnores` allow you to exclude certain block-level sections of text that don’t have an associated HTML tag that could be used with [`SkippedScopes`](skippedscopes.md).

The idea is to write a regular expression that captures the entire block in the first grouping. See this [regex101 session](https://regex101.com/r/mFM0kZ/1/) for a more thorough explanation.
