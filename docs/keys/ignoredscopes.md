# IgnoredScopes

Learn about how to ignore inline-level HTML tags.

```ini
StylesPath = styles

IgnoredScopes = code, tt

[*.md]
BasedOnStyles = Vale
```

`IgnoredScopes` specifies inline-level HTML tags to ignore. In other words, these tags may occur in an active scope (unlike `SkippedScopes`, which are skipped entirely) but their content still won’t raise any alerts.

By default, Vale ignores `tt`, `code`, and `kbd` tags. Setting this key **replaces** that list rather than adding to it, so include the defaults you still want. For example, considering the following Markdown file:

```markdown
This is a sentence that contains inline `code`.
```

Vale will not raise any alerts for the content within the backticks, such as `code` in the example above.

See [Markup](../topics/scopes.md) for more information.
