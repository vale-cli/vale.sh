# HTML

Learn how Vale handles HTML content.

HTML5 support is built in. The supported extensions are `.html`, `.htm`, `.shtml`, and `.xhtml`.

By default, Vale ignores `script`, `style`, `pre`, `code`, and `tt` tags, as well as URLs (see [URL handling](https://github.com/vale-cli/vale/issues/320) for more information).

## [Comments](html.md#comments)

Vale supports comment-based configuration in HTML files:

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
