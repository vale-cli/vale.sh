# IgnoredScopes

Learn about how to ignore inline-level HTML tags.

```ini
StylesPath = styles

IgnoredScopes = code, tt

[*.md]
BasedOnStyles = Vale
```

`IgnoredScopes` specifies inline-level HTML tags to ignore. In other words, these tags may occur in an active scope (unlike `SkippedScopes`, which are skipped entirely) but their content still won’t raise any alerts.

By default, Vale ignores `code` and `tt` tags. For example, considering the following Markdown file:

```markdown
This is a sentence that contains inline `code`.
```

Vale will not raise any alerts for the content within the backticks, such as `code` in the example above.

See [Markup](../topics/scopes.md) for more information.

[MinAlertLevel](minalertlevel.md) [IgnoredClasses](ignoredclasses.md)
