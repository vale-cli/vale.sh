# Scopes

Learn about Vale's advanced markup-specific scoping system.

Vale is “markup aware,” which means that it’s capable of both applying rules to and ignoring certain sections of text. This functionality is implemented through a scoping system.

A scope is specified through a selector such as `paragraph.rst`, which indicates that the rule applies to all paragraphs in reStructuredText files.

Here are a few examples:

* `comment` matches all source code comments;
* `comment.line` matches all source code line comments;
* `heading.md` matches all Markdown headings; and
* `text.html` matches all HTML scopes.

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
| `paragraph`      | Matches all paragraphs (segments of text separated by two newlines).                                                                                                                                                |
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

Classes nest, so a block inside two classed elements is reachable as `text.class.outer.class.inner`. To ignore classed content rather than target it, see [`IgnoredClasses`](../keys/ignoredclasses.md).

The supported formats for markup files are:

* [AsciiDoc](../formats/asciidoc.md)
* [Markdown](../formats/markdown.md) Built-in
* [reStructuredText](../formats/restructuredtext.md)
* [HTML](../formats/html.md) Built-in
* [XML](../formats/xml.md)
* [Org](../formats/org.md) Built-in
* [DITA](../formats/dita.md)
* [MDX](../formats/mdx.md)

The formats marked as `Built-in` are included with Vale by default. The other formats require a third-party dependency to be installed. See each format’s documentation for more information and installation instructions.

## [Code](scopes.md#code)

There are two `code` scopes: `comment.line` and `comment.block`.

See the [Code](../formats/code.md) documentation for more information.

## [Selectors](scopes.md#selectors)

Rules may define multiple scopes by using a YAML array:

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

You can chain multiple scopes together using `&`:

```yaml
scope:
  # any scope that is NOT a blockquote or a heading
  - ~blockquote & ~heading
```
