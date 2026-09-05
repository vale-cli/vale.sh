# View

Learn about how to lint only part of a structured file.

```ini
StylesPath = styles

[*.json]
BasedOnStyles = Vale

View = MyView
```

`View` names a View to apply to the matched files. A View is a set of steps that pull named [scopes](../topics/scopes.md) out of a file Vale can’t otherwise parse—the descriptions in an OpenAPI spec, the docstrings in a source file, the subject and body of a commit message—so that Vale lints those and ignores the rest.

The named View is loaded from `<StylesPath>/config/views/<name>.yml`, and Vale reports an error at startup if it isn't there.

`View` is set per section, so different file types can be filtered differently.

See [Views](../topics/views.md) for how to write one.
