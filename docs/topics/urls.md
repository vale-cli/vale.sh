# URLs

Learn what Vale does with a URL, and how to change it.

A URL is never prose. Wherever one appears, Vale leaves it alone and lints the text around it. Link _text_ is prose, and is linted.

## [In markup](urls.md#in-markup)

Every markup format Vale reads becomes the same structure:

```html
<a href="url">text</a>
```

The `url` is skipped and the `text` is linted. So, in Markdown:

```markdown
[our page on Ruby](https://example.com/ruby)
```

`our page on Ruby` is linted and `https://example.com/ruby` is not. The same holds for a link whose text is its URL, a URL in angle brackets, and a bare URL:

```markdown
[https://example.com](https://example.com)

<https://example.com>

https://example.com
```

None of these raise anything, because the only text they hold is the URL.

AsciiDoc and reStructuredText read the same way. `xref:ruby.adoc[our page on Ruby]` lints `our page on Ruby`; `` `our page <https://example.com>`_ `` lints `our page`; and a bare URL in either is skipped.

## [In code](urls.md#in-code)

Vale lints the comments in source code, and a URL in a comment is skipped like one in markup:

```go
// See https://example.com/setup for the details.
```

`See` and `for the details` are linted; the URL is not.

## [Rules about links](urls.md#rules-about-links)

A rule can ask for link text alone, or refuse it. The `link` scope reaches the text of every link and nothing else:

```yaml
extends: existence
message: "Don't use '%s' as link text."
scope: link
ignorecase: true
tokens:
  - here
  - click here
```

Negating it leaves link text out of a rule that runs everywhere else. A rule that enforces a product name's casing should not fire on a heading or a link, both of which follow title case:

```yaml
extends: substitution
message: "Use '%s' instead of '%s'."
scope: ~heading & ~link
swap:
  github: GitHub
```

`~strong`, `~emphasis`, and `~code` work the same way. See [Scopes](scopes.md) for the rest of the selector syntax.

## [Rules about URLs](urls.md#rules-about-urls)

A rule that wants the URL itself has to say so, since no ordinary scope reaches it. The `raw` scope runs a rule over the file as written, markup and all:

```yaml
extends: existence
message: "Use a fully qualified URL for '%s'."
scope: raw
raw:
  - 'https://admin\.example\.com/link/[^#\s"\)\]]+'
```

A `raw` rule sees every URL, including those in code blocks, so write its pattern to stop at the character that ends a URL rather than at whitespace alone.

## [When a URL still gets through](urls.md#when-a-url-still-gets-through)

Some converters render a bare URL as a link whose text is the URL, marked with a class. AsciiDoc does this with `bare`:

```html
<a href="https://example.com" class="bare">https://example.com</a>
```

Vale skips it already, since the text is the URL. If a converter marks a URL some other way, [`IgnoredClasses`](../keys/ignoredclasses.md) skips the content of any element with that class, and [`TokenIgnores`](../keys/tokenignores.md) skips anything a regular expression can describe.

If Vale reports text inside a URL with none of that involved, that is a bug: open an issue with the file and your `.vale.ini`.
