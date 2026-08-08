# TokenIgnores

Learn how to define custom inline-level ignores in your Vale configuration.

{% hint style="warning" %}
`TokenIgnores` are supported in AsciiDoc, Markdown, MDX, MyST, Org Mode, QDoc, Quarto, reStructuredText, and Typst. MyST, QDoc, Quarto, and Typst require Vale v3.18.0 or later.

They work by wrapping each match in the format's inline code delimiter, so they need a markup format to wrap it with. In a source code file they have no effect—but associating a markup format with your comments makes them available. See [Code](../formats/code.md#associations).
{% endhint %}

```ini
StylesPath = styles

[*.rst]
BasedOnStyles = Vale

TokenIgnores = (:math:`.*`), (:ref:`.*`)
```

`TokenIgnores` allow you to exclude certain inline-level sections of text that don’t have an associated HTML tag that could be used with [`IgnoredScopes`](ignoredscopes.md).

The idea is to write a regular expression that captures the entire token in the first grouping. See this [regex101 session](https://regex101.com/r/3Raecd/1) for a more thorough explanation.

A section can be keyed on a path as well as an extension, which narrows the patterns to one part of the project:

```ini
[docs/api/*.md]
TokenIgnores = (\{\{[^}]+\}\})
```

The pattern matches the file as Vale was asked for it, so write it relative to where you run Vale. See [Globbing](../guides/globbing.md).

{% hint style="info" %}
Dollar math needs no `TokenIgnores`: `$x^2$` and `$$…$$` are ignored in Markdown, Quarto, MyST, and MDX. See [Math](../formats/markdown.md#math).
{% endhint %}

Related:

* [BlockIgnores](blockignores.md)
* [CommentDelimiters](commentdelimiters.md)
