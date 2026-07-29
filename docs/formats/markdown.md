# Markdown

Learn how Vale handles Markdown content.

[GitHub-Flavored Markdown](https://github.github.com/gfm) support is built in. The supported extensions are `.md`, `.mdown`, `.markdown`, and `.markdn`.

By default, Vale ignores:

* Indented blocks: Blocks starting with four or more spaces.
* Fenced blocks: Blocks surrounded by three or more backticks.
* Code spans: Text surrounded by backticks.
* URLs: See [URL handling](https://github.com/vale-cli/vale/issues/320) for more information.

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
