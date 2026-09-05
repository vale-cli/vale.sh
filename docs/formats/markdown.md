# Markdown

Learn how Vale handles Markdown content.

[GitHub-Flavored Markdown](https://github.github.com/gfm) support is built in. The supported extensions are `.md`, `.mdown`, `.markdown`, and `.markdn`. [R Markdown](rmarkdown.md) is read the same way.

By default, Vale ignores:

* Indented blocks: Blocks starting with four or more spaces.
* Fenced blocks: Blocks surrounded by three or more backticks.
* Code spans: Text surrounded by backticks.
* Math: `$$…$$` blocks and `$x^2$` spans. See [Math](markdown.md#math).
* URLs: See [URL handling](https://github.com/vale-cli/vale/issues/320) for more information.

## [Math](markdown.md#math)

Both `$$…$$` display math and `$x^2$` inline math are ignored. Inline math follows Pandoc's delimiter rules, which are what tell an equation from a price: the opening `$` needs a non-space character to its right, and the closing `$` needs one to its left and no digit after it. So `$g_i = g(p)_i$` is math, while `It costs $5 and $10` stays prose and is linted as such.

A span may wrap onto the next line, but not past the end of its paragraph. Write `\$` for a literal dollar sign that would otherwise open one.

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
