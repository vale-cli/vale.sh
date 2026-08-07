# Markdown

Learn how Vale handles Markdown content.

[GitHub-Flavored Markdown](https://github.github.com/gfm) support is built in. The supported extensions are `.md`, `.mdown`, `.markdown`, and `.markdn`.

By default, Vale ignores:

* Indented blocks: Blocks starting with four or more spaces.
* Fenced blocks: Blocks surrounded by three or more backticks.
* Code spans: Text surrounded by backticks.
* URLs: See [URL handling](https://github.com/vale-cli/vale/issues/320) for more information.

## [R Markdown](markdown.md#r-markdown)

{% hint style="info" %}
Requires Vale v3.18.0 or later. Earlier versions can assign the format instead: `Rmd = md` under `[formats]`.
{% endhint %}

R Markdown (`.Rmd`, `.rmd`) is linted as Markdown. Its knitr syntax is code to Vale:

* Chunks are fenced blocks—the chunk options in the `{r ...}` info string and everything inside the fence are ignored.
* Inline expressions such as `` `r nrow(df)` `` are code spans, and are ignored by default.

A configuration section still needs to match the extension:

```ini
[*.{md,Rmd}]
BasedOnStyles = Vale
```

Pandoc syntax that isn't Markdown—inline math, citations—can be excluded with [`TokenIgnores`](../keys/tokenignores.md):

```ini
[*.{md,Rmd}]
TokenIgnores = (\$[^\n$]+\$), (\[@[^\n\]]+\])
```

## [Comments](markdown.md#comments)

Vale supports comment-based configuration in Markdown files:

* Turn Vale off entirely:

```html
<!-- vale off -->

This text will be ignored.

<!-- vale on -->
```

* Turn off a specific rule:

```html
<!-- vale Style.Redundancy = NO -->

This is some text ACT test

<!-- vale Style.Redundancy = YES -->
```

* Turn off specific match(es) within a rule:

```html
<!-- vale Style.Redundancy["ACT test","OTHER"] = NO -->

This is some text ACT test

<!-- vale Style.Redundancy["ACT test","OTHER"] = YES -->
```

* Turn on or off specific styles:

```html
<!-- vale StyleName1 = YES -->
<!-- vale StyleName2 = NO -->
```

* Set styles (enabling them and switching off any other styles):

```html
<!-- vale style = StyleName1 -->
<!-- vale styles = StyleName1, StyleName2 -->
```
