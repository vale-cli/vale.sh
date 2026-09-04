# Scopes

Learn how Vale decides which parts of a file a rule applies to.

Vale is “markup aware”: it reads a file into the pieces a reader would recognize—headings, paragraphs, list items, links—and lets a rule say which of those pieces it applies to. That choice is the rule’s _scope_.

## [What a scope is](scopes.md#what-a-scope-is)

Every file Vale reads becomes a sequence of _blocks_. Each block carries a scope made of dot-separated parts that say what the block is and where it came from. A list item in a Markdown file, for example, is `text.list.md`.

A rule’s `scope` is a selector over those parts. It matches a block when **all of its parts appear in the block’s scope**. It isn’t a prefix match or an exact match, and the order you write the parts in doesn’t matter:

| Selector       | Matches `text.list.md`? |
| -------------- | ----------------------- |
| `list`         | Yes                     |
| `list.md`      | Yes                     |
| `md.list`      | Yes—order is irrelevant |
| `text.list`    | Yes                     |
| `list.text.md` | Yes                     |
| `heading`      | No—not one of its parts |

Two things follow. Any selector can be qualified with a file extension to make it format-specific: `paragraph` matches paragraphs everywhere, and `paragraph.rst` matches them only in reStructuredText. And a selector with fewer parts is broader: `text` matches nearly everything, because nearly every scope contains it.

![One Markdown file becomes several scoped sections: the heading is text.heading.md, the paragraph text.md, the link inside it link.md, and the list item text.list.md. A selector matches when every one of its parts appears in the scope, which is why list.md matches a list item but link.text.md matches nothing.](../.gitbook/assets/scopes.svg)

Vale classifies files into one of three types—`markup`, `code`, or `text`—and the type determines which parts exist. Within a type, every format shares the same parts, so a rule written for Markdown headings applies to AsciiDoc headings too.

## [Markup](scopes.md#markup)

The default behavior for markup files is to apply rules to all non-ignored text. For most rules, you don’t need a scope at all.

For rules that target a kind of element, the parser assigns these parts:

| Name             | Description                                                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `heading`        | <p>Matches all <code>h{1,...}</code> tags. You can specify an exact level by<br>appending tags—for example, <code>heading.h1</code> matches all <code>h1</code> tags.</p> |
| `table.header`   | Matches all `th` tags.                                                                                                                                                   |
| `table.cell`     | Matches all `td` tags.                                                                                                                                                   |
| `table.caption`  | Matches all `caption` tags.                                                                                                                                              |
| `figure.caption` | Matches all `figcaption` tags.                                                                                                                                           |
| `list`           | Matches all `li` tags.                                                                                                                                                   |
| `blockquote`     | Matches all `blockquote` tags.                                                                                                                                           |
| `alt`            | Matches all alt attributes.                                                                                                                                              |

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

A directive’s name lands here too: a [MyST](../formats/myst.md) or [Quarto](../formats/quarto.md) `:::{note}` scopes its content as `class.note`, and a [QDoc](../formats/qdoc.md) `\note` does the same.

Classes nest, so a block inside two classed elements is reachable as `text.class.outer.class.inner`—and every block inside a classed container carries its class, however many blocks that is. To ignore classed content rather than target it, see [`IgnoredClasses`](../keys/ignoredclasses.md).

### [Inline elements](scopes.md#inline-elements)

{% hint style="info" %}
Requires Vale v3.17.0 or later.
{% endhint %}

Inline elements have scopes of their own, which let a rule target the text inside a link, a code span, or an emphasized phrase:

| Name       | Description                                    |
| ---------- | ---------------------------------------------- |
| `link`     | Matches the text of all `a` tags.              |
| `code`     | Matches all `code` and `tt` tags (code spans). |
| `strong`   | Matches all `strong` and `b` tags.             |
| `emphasis` | Matches all `em` and `i` tags.                 |

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

The text inside code spans is skipped by default (`IgnoredScopes` defaults to `tt`, `code`, and `kbd`), so a rule has to ask for `code` explicitly. To exclude inline text rather than target it, see [`IgnoredScopes`](../keys/ignoredscopes.md).

### [Metadata](scopes.md#metadata)

{% hint style="info" %}
Requires Vale v3.18.0 or later.
{% endhint %}

A document’s machine-readable content—an anchor name, an image’s file name—is collected under the `meta` scope. A [QDoc](../formats/qdoc.md) file’s anchors and image file names land here, as does the content of an HTML `data` element.

Like the [inline elements](scopes.md#inline-elements), `meta` is a sibling of `text`: an ordinary prose rule passes over it, and only a rule that asks for `meta` reaches it. Its text isn’t segmented, either—an identifier has no sentences.

Each piece carries its kind as a class, so a rule can target all of a document’s metadata or one kind of it:

```yaml
extends: existence
message: "Don't use spaces in a file name."
scope: meta.class.image
level: error
tokens:
  - " "
```

## [Prose units](scopes.md#prose-units)

The parts above name elements of the document. These four name units of prose that Vale builds itself:

| Name        | Description                                                                                                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sentence`  | Each sentence, from every kind of prose—paragraphs, headings, list items, and table cells.                                                                                                                   |
| `paragraph` | <p>Each body paragraph (a segment of text separated by two newlines).<br>Headings, list items, table cells, and blockquotes are not paragraphs.</p>                                                          |
| `summary`   | <p>The document’s prose as one block, excluding headings, code spans, code blocks, and<br>table cells. This is what <a href="../checks/metric.md"><code>metric</code></a> and <a href="../checks/readability.md"><code>readability</code></a> measure by default.</p> |
| `raw`       | <p>The raw, unprocessed markup source as one block. This scope is useful for regex-based rules<br>that need to match against the original source text.</p>                                                   |

A scope is a request as well as a selection. Sentences exist only because some rule declared `sentence`, and paragraphs only because some rule declared `paragraph`; Vale builds each unit when a rule asks for it and skips the work when none does. The same is true of the [selections](scopes.md#selections) below.

## [Selections](scopes.md#selections)

{% hint style="info" %}
Requires Vale v3.21.0 or later.
{% endhint %}

A `doc(...)` term selects elements of the document by CSS selector. Every markup format Vale reads is parsed into the same HTML, and the selector runs against that, so a selection means the same thing in Markdown, AsciiDoc, reStructuredText, Org, and HTML.

Before the selectors run, Vale wraps each heading and everything that follows it—up to the next heading of the same or a higher level—in a `section` element. Sections nest, so an `h3` after an `h2` sits inside the `h2`’s section. That is what lets a selector name a section of a document, which no format marks up on its own.

![A Markdown file with an h1, three h2 sections, and an h3 under Decision is wrapped into nested sections. The selector doc(section:has(a direct h2 child containing Decision)) marks the Decision section, so the paragraph and the h3 inside it carry the selection in their scopes while Context and Consequences do not, and the section itself is one doc block.](../.gitbook/assets/selections.svg)

A `doc(...)` term means one of three things, depending on where it stands:

**Alone, the element is the block.** Its text is gathered as one unit and linted once, so a rule can count or measure it:

```yaml
extends: occurrence
message: "The Decision section states no decision. Write it as 'We will ...'."
level: error
scope: 'doc(section:has(> h2:contains("Decision")))'
token: '(?i)\bwe will\b'
min: 1
```

```yaml
extends: metric
message: "The Summary runs %s words. The budget is 100."
level: error
scope: 'doc(section:has(> h2:contains("Summary")))'
formula: words
condition: "> 100"
```

An alert on a selection lands on the element’s first line, which is the heading of a section.

**Beside a scope, it narrows that scope to blocks inside the element.** Any existing rule can be pointed at one part of a document:

```yaml
extends: existence
message: "'%s' hedges. A recommendation states it."
level: error
scope: 'sentence & doc(section:has(> h2:contains("Recommendation")))'
tokens:
  - may want to
  - it is worth noting
```

```yaml
extends: existence
message: "Open on the point, not on '%s'."
level: warning
# The paragraph directly after any h2.
scope: 'text & doc(h2 + p)'
tokens:
  - in this section
```

**Negated, it excludes the element.** `~doc(...)` reaches everything outside the elements the selector matches.

A selection that matches nothing in a file still produces its block, empty, on line one. That is how a rule reports that a section is missing: an `occurrence` rule with `min: 1` and a token that matches any character finds zero occurrences and reports the shortfall.

```yaml
extends: occurrence
message: "An ADR has a Decision section."
level: error
scope: 'doc(section:has(> h2:contains("Decision")))'
token: '(?s).'
min: 1
```

Selectors follow the syntax of [Selectors Level 4](https://www.w3.org/TR/selectors-4/), including `:has(> x)` for a direct child, `:not`, `:first-of-type`, `:last-of-type`, and the `nth` family. Two things to know:

* `:contains("…")` matches any part of the text, so `h2:contains("Decision")` also matches a heading that reads “Decision log.” Give it the whole heading.
* An element with no prose in it—a code block, an image—selects fine and then has nothing to lint. Selections are for elements that hold text.

The elements a selector matches carry a `data-vale-doc` attribute in Vale’s internal HTML, and blocks inside them carry the selection in their scope as `in.<id>`. Neither is something a rule writes; the rule writes the selector.

## [Combining selectors](scopes.md#combining-selectors)

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
Chains that name `paragraph`, `sentence`, or an [inline element](scopes.md#inline-elements) require Vale v3.18.0 or later. Earlier versions silently matched nothing for those chains.
{% endhint %}

The two combine: `&` is an AND within a single entry, and the array is an OR across entries. A `doc(...)` term is a term like any other, so it chains with prose units and negates the same way:

```yaml
scope:
  # (a heading that isn't an h1) OR (a list item in Markdown)
  - heading & ~heading.h1
  - list.md
  # sentences outside the Decision section
  - sentence & ~doc(section:has(> h2:contains("Decision")))
```

{% hint style="info" %}
Because matching is by parts rather than by prefix, a narrower-looking scope isn’t always narrower. `text.list` and `list` select the same blocks—the extra `text` adds nothing, since every list item’s scope already contains it.
{% endhint %}

## [Checks and scopes](scopes.md#checks-and-scopes)

Every check runs on the blocks its scope names. Three of them have a default worth knowing:

* [`metric`](../checks/metric.md) and [`readability`](../checks/readability.md) measure the whole document unless the rule declares a scope. `text` also means the whole document here, since the document’s prose is what `summary` holds. Any other scope measures each block it names on its own—a paragraph, a heading, a list item, or a selection—and a selection counts the elements it holds, so `heading.h3` inside a section is the number of subheadings in that section.
* [`sequence`](../checks/sequence.md) reads part-of-speech tags, which are assigned a sentence at a time, so it always reads sentences. Its scope says which blocks the sentences come from: `list` is the sentences of list items, and a `doc(...)` term is the sentences inside the selection.

## [Code](scopes.md#code)

There are two `code` scopes: `comment.line` and `comment.block`.

See the [Code](../formats/code.md) documentation for more information.
