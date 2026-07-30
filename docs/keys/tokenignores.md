# TokenIgnores

Learn define custom inline-level ignores in your Vale configuration.

{% hint style="warning" %}
`TokenIgnores` are only supported in Markdown, reStructuredText, AsciiDoc, and Org Mode.

They work by wrapping each match in the format's inline code delimiter, so they need a markup format to wrap it with. In a source code file they have no effect—but associating a markup format with your comments makes them available. See [Code](../formats/code.md#associations).
{% endhint %}

```ini
StylesPath = styles

[*.md]
BasedOnStyles = Vale

TokenIgnores = ($+[^\n$]+$+), (:math:`.*`)
```

`TokenIgnores` allow you to exclude certain inline-level sections of text that don’t have an associated HTML tag that could be used with [`IgnoredScopes`](ignoredscopes.md).

The idea is to write a regular expression that captures the entire token in the first grouping. See this [regex101 session](https://regex101.com/r/3Raecd/1) for a more thorough explanation.

Related:

* [BlockIgnores](blockignores.md)
* [CommentDelimiters](commentdelimiters.md)
