# BlockIgnores

Learn define custom block-level ignores in your Vale configuration.

{% hint style="info" %}
Heads up!

`BlockIgnores` are only supported in Markdown, reStructuredText, AsciiDoc, and Org Mode.
{% endhint %}

```ini
StylesPath = styles

[*.md]
BasedOnStyles = Vale

BlockIgnores = (?s) *({< file [^>]* >}.*?{</ ?file >})
```

`BlockIgnores` allow you to exclude certain block-level sections of text that don’t have an associated HTML tag that could be used with [`SkippedScopes`](skippedscopes.md).

The idea is to write a regular expression that captures the entire block in the first grouping. See this [regex101 session](https://regex101.com/r/mFM0kZ/1/) for a more thorough explanation.

[BasedOnStyles](basedonstyles.md) [TokenIgnores](tokenignores.md)
