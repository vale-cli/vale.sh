# Markdoc

Learn how Vale handles Markdoc content.

{% hint style="info" %}
Requires Vale v3.28.0 or later.
{% endhint %}

[Markdoc](https://markdoc.dev/) is CommonMark plus tags, annotations, variables, and functions, all written between `{%` and `%}`, which a plain Markdown parser reads as prose. Vale parses each one as the markup it is.

The supported extensions are `.mdoc` and `.markdoc`. Markdoc itself doesn't specify an extension, and many projects write it in `.md` files; those opt in through a [format association](../topics/.vale.ini.md#format-associations):

```ini
[formats]
md = mdoc

[*.{md,mdoc}]
BasedOnStyles = Vale
```

By default, Vale ignores:

* Variables: `{% $markdoc.frontmatter.title %}`.
* Functions: `{% uppercase($name) %}`, and a function in a tag's attributes.
* Annotations: `{% #overview %}`, `{% .class %}`, and `{% width="25%" %}` after a heading, a list item, or a table cell.
* Tag attributes, whatever their type (see [attributes](markdoc.md#attributes) for reaching the string ones).
* Self-closing tags, such as `{% partial file="header.md" /%}` and `{% else /%}`.
* Fenced blocks, code spans, and URLs, as in [Markdown](markdown.md). A tag inside a fence is code.

## [Tags](markdoc.md#tags)

A tag's body is Markdown, and Vale lints it:

```text
{% callout type="check" %}
This prose is linted. The `type` attribute is not.
{% /callout %}
```

A tag's name also becomes a [class scope](../topics/scopes.md#class-scopes) for everything inside it, however deeply nested:

```yaml
extends: existence
message: "Don't use '%s' in a callout."
scope: class.callout
level: error
tokens:
  - obviously
```

A tag whose content shouldn't be linted can be excluded by name:

```ini
IgnoredClasses = raw
```

The same applies inline. Here, the word "Enter" is linted as part of its sentence:

```text
Press {% kbd %}Enter{% /kbd %} to continue.
```

Tags nest by name, so a `card` inside a `card` closes with its own closing tag, and a `table` tag is linted as the lists its rows are written as.

## [Attributes](markdoc.md#attributes)

A tag's string attributes are its data rather than its prose, so no ordinary rule reads them: `type="check"` and `file="header.md"` don't raise alerts. Vale collects them under the [`meta`](../topics/scopes.md#metadata) scope and classes each with the attribute's name. A rule can then target the ones that contain prose:

```yaml
extends: existence
message: "Don't use '%s' in a title."
scope: meta.class.title
level: error
tokens:
  - obviously
```

`scope: meta` reaches every string attribute in the file. Like the rest of `meta`, attribute text isn't segmented into sentences, so `sentence`-scoped rules don't apply to it. Numbers, booleans, arrays, objects, variables, and function calls are never prose, and are always ignored.
