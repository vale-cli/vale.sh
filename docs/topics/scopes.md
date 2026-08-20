# Scopes

Learn about Vale's advanced markup-specific scoping system.

Vale is “markup aware,” which means that it’s capable of both applying rules to and ignoring certain sections of text. This functionality is implemented through a scoping system.

A scope is specified through a selector such as `paragraph.rst`, which indicates that the rule applies to all paragraphs in reStructuredText files.

Here are a few examples:

* `comment` matches all source code comments;
* `comment.line` matches all source code line comments;
* `heading.md` matches all Markdown headings; and
* `text.html` matches all HTML scopes.

![One Markdown file becomes several scoped sections: the heading is text.heading.md, the paragraph text.md, the link inside it link.md, and the list item text.list.md. A selector matches when every one of its parts appears in the scope, which is why list.md matches a list item but link.text.md matches nothing.](../.gitbook/assets/scopes.svg)

Vale classifies files into one of three types—`markup`, `code`, or `text`—that determines what scopes are available.

Within each type, there can be multiple supported _formats_—such as Markdown and AsciiDoc under `markup`. Since each format has access to the same scopes, rules are compatible across all formats within a particular type.

## [Markup](scopes.md#markup)

The default behavior for markup files is to apply rules to all non-ignored sections of the file. This means that for most rules you don’t need to specify a scope.

For rules that need to target specific sections of the file, you can use the following scopes:

| Name             | Description                                                                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `heading`        | <p>Matches all <code>h{1,...}</code> tags. You can specify an exact level by<br>appending tags—for example, <code>heading.h1</code> matches all <code>h1</code> tags.</p>                                           |
| `table.header`   | Matches all `th` tags.                                                                                                                                                                                              |
| `table.cell`     | Matches all `td` tags.                                                                                                                                                                                              |
| `table.caption`  | Matches all `caption` tags.                                                                                                                                                                                         |
| `figure.caption` | Matches all `figcaption` tags.                                                                                                                                                                                      |
| `list`           | Matches all `li` tags.                                                                                                                                                                                              |
| `paragraph`      | <p>Matches all body paragraphs (segments of text separated by two newlines).<br>Headings, list items, table cells, and blockquotes are not paragraphs.</p>                                                          |
| `sentence`       | Matches all sentences.                                                                                                                                                                                              |
| `blockquote`     | Matches all `blockquote` tags.                                                                                                                                                                                      |
| `alt`            | Matches all alt attributes.                                                                                                                                                                                         |
| `summary`        | <p>Matches all body text (excluding headings, code spans, code blocks, and<br>table cells). This scope is useful for rules that need to match only<br>sentence-level text content (such as readability scores).</p> |
| `raw`            | <p>Uses the raw, unprocessed markup source instead of a specific scope. This<br>scope is useful for regex-based rules that need to match against the<br>original source text.</p>                                   |

### [Inline scopes](scopes.md#inline-scopes)

{% hint style="info" %}
Requires Vale v3.17.0 or later.
{% endhint %}

Inline elements have their own scopes, which let a rule target the text inside a link, a code span, or an emphasized phrase:

| Name       | Description                                       |
| ---------- | ------------------------------------------------- |
| `link`     | Matches the text of all `a` tags.                 |
| `code`     | Matches all `code` and `tt` tags (code spans).    |
| `strong`   | Matches all `strong` and `b` tags.                |
| `emphasis` | Matches all `em` and `i` tags.                    |

{% hint style="warning" %}
These are siblings of `text`, not children of it: the scope is `link`, **not** `text.link`.

Scopes are matched by containment, so a rule scoped to `text` would also match `text.link`—meaning every ordinary rule would run a second time over each link.
{% endhint %}

A rule that asks for one of these scopes is the only kind that runs against it:

```yaml
extends: existence
message: "Don't use '%s' as link text."
scope: link
level: error
tokens:
  - here
  - this
  - click here
```

Scoping to `code` is worth noting: the text inside code spans is skipped by default (`IgnoredScopes` defaults to `tt`, `code`, and `kbd`), so a rule has to ask for it explicitly. To exclude inline text rather than target it, see [`IgnoredScopes`](../keys/ignoredscopes.md).

### [Class scopes](scopes.md#class-scopes)

{% hint style="info" %}
Requires Vale v3.17.0 or later.
{% endhint %}

Markup that carries no distinct tag of its own can still be selected by the classes wrapping it. Any enclosing class is appended to the scope as `.class.<name>`.

An AsciiDoc block title, for example, renders as `<div class="title">`—indistinguishable from body text by tag alone:

```yaml
extends: capitalization
message: "'%s' should be in title case."
scope: text.class.title
level: warning
match: $title
```

A directive's name lands here too: a [MyST](../formats/myst.md) or [Quarto](../formats/quarto.md) `:::{note}` scopes its content as `class.note`, and a [QDoc](../formats/qdoc.md) `\note` does the same.

Classes nest, so a block inside two classed elements is reachable as `text.class.outer.class.inner`—and every block inside a classed container carries its class, however many blocks that is. To ignore classed content rather than target it, see [`IgnoredClasses`](../keys/ignoredclasses.md).

### [The meta scope](scopes.md#the-meta-scope)

{% hint style="info" %}
Requires Vale v3.18.0 or later.
{% endhint %}

A document's machine-readable content—an anchor name, an image's file name—is collected under the `meta` scope. A [QDoc](../formats/qdoc.md) file's anchors and image file names land here, as does the content of an HTML `data` element.

Like the [inline scopes](scopes.md#inline-scopes), `meta` is a sibling of `text`: an ordinary prose rule passes over it, and only a rule that asks for `meta` reaches it. Its text isn't segmented, either—an identifier has no sentences.

Each piece carries its kind as a class, so a rule can target all of a document's metadata or one kind of it:

```yaml
extends: existence
message: "Don't use spaces in a file name."
scope: meta.class.image
level: error
tokens:
  - " "
```

The supported formats for markup files are:

* [AsciiDoc](../formats/asciidoc.md)
* [DITA](../formats/dita.md)
* [HTML](../formats/html.md) Built-in
* [Markdown](../formats/markdown.md) Built-in, including [R Markdown](../formats/markdown.md#r-markdown)
* [MDX](../formats/mdx.md) Built-in
* [MyST](../formats/myst.md) Built-in
* [Org](../formats/org.md) Built-in
* [QDoc](../formats/qdoc.md) Built-in
* [Quarto](../formats/quarto.md) Built-in
* [reStructuredText](../formats/restructuredtext.md)
* [Typst](../formats/typst.md)
* [XML](../formats/xml.md)

The formats marked as `Built-in` are included with Vale by default. The other formats require a third-party dependency to be installed. See each format’s documentation for more information and installation instructions.

## [Code](scopes.md#code)

There are two `code` scopes: `comment.line` and `comment.block`.

See the [Code](../formats/code.md) documentation for more information.

## [Selectors](scopes.md#selectors)

### [How a selector matches](scopes.md#how-a-selector-matches)

Every section of text Vale finds carries a scope built from dot-separated parts. A list item in a Markdown file, for example, is `text.list.md`.

A selector matches when **all of its parts appear in that scope**. It isn't a prefix match or an exact match, and the order you write the parts in doesn't matter:

| Selector       | Matches `text.list.md`? |
| -------------- | ----------------------- |
| `list`         | Yes                     |
| `list.md`      | Yes                     |
| `md.list`      | Yes—order is irrelevant |
| `text.list`    | Yes                     |
| `list.text.md` | Yes                     |
| `heading`      | No—not one of its parts |

This is why you can qualify any selector with a file extension to make it format-specific. `paragraph` matches paragraphs everywhere; `paragraph.rst` matches them only in reStructuredText.

It's also why a selector with fewer parts is broader: `text` matches nearly everything, because nearly every scope contains it.

### [Combining selectors](scopes.md#combining-selectors)

Rules may define multiple scopes by using a YAML array. An entry matches if **any** of them does:

```yaml
scope:
  # h1 OR h2
  - heading.h1
  - heading.h2
```

Any scope prefaced with `~` is negated:

```yaml
scope:
  # all scopes != h2
  - ~heading.h2
```

You can chain multiple scopes together using `&`, which requires **all** of them:

```yaml
scope:
  # any scope that is NOT a blockquote or a heading
  - ~blockquote & ~heading
```

{% hint style="info" %}
Chains that name `paragraph`, `sentence`, or an [inline scope](scopes.md#inline-scopes) require Vale v3.18.0 or later. Earlier versions silently matched nothing for those chains.
{% endhint %}

The two combine: `&` is an AND within a single entry, and the array is an OR across entries.

```yaml
scope:
  # (a heading that isn't an h1) OR (a list item in Markdown)
  - heading & ~heading.h1
  - list.md
```

{% hint style="info" %}
Because matching is by parts rather than by prefix, a narrower-looking scope isn't always narrower. `text.list` and `list` select the same blocks—the extra `text` adds nothing, since every list item's scope already contains it.
{% endhint %}
