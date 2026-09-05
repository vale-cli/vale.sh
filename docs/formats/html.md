# HTML

Learn how Vale handles HTML content.

HTML5 support is built in. The supported extensions are `.html`, `.htm`, `.shtml`, and `.xhtml`.

By default, Vale skips the `script`, `style`, `pre`, `figure`, `noscript`, and `iframe` elements, everything inside them included, and the inline `code`, `tt`, and `kbd` elements. An element carrying the class `pre`, `code`, or `problematic` is skipped too. URLs are ignored as well (see [URL handling](https://github.com/vale-cli/vale/issues/320) for more information).

The block list is replaced by [`SkippedScopes`](../keys/skippedscopes.md), the inline list by [`IgnoredScopes`](../keys/ignoredscopes.md), and the classes are added to by [`IgnoredClasses`](../keys/ignoredclasses.md).

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
