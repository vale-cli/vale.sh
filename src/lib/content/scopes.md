---
title: Scopes
description: Learn about Vale's advanced markup-specific scoping system.
---

<script lang="ts">
    import Alert from '$lib/components/Alert.svelte';
    import Scopes from '$lib/components/docs/Scopes.svelte';
    import { Badge } from "$lib/components/ui/badge";
</script>

Vale is "markup aware," which means that it's capable of both applying rules to
and ignoring certain sections of text. This functionality is implemented
through a scoping system.

A scope is specified through a selector such as `paragraph.rst`, which
indicates that the rule applies to all paragraphs in reStructuredText files.

Here are a few examples:

- `comment` matches all source code comments;
- `comment.line` matches all source code line comments;
- `heading.md` matches all Markdown headings; and
- `text.html` matches all HTML scopes.

Vale classifies files into one of three
types&mdash;`markup`, `code`, or `text`&mdash;that determines what scopes are
available.

Within each type, there can be multiple supported _formats_&mdash;such as
Markdown and AsciiDoc under `markup`. Since each format has access to the same
scopes, rules are compatible across all formats within a particular type.

## Markup

The default behavior for markup files is to apply rules to all non-ignored
sections of the file. This means that for most rules you don't need to specify
a scope.

For rules that need to target specific sections of the file, you can use the
following scopes:

<Scopes />

The supported formats for markup files are:

- [AsciiDoc](/docs/formats/asciidoc)
- [Markdown](/docs/formats/markdown) <Badge>Built-in</Badge>
- [reStructuredText](/docs/formats/rst)
- [HTML](/docs/formats/html) <Badge>Built-in</Badge>
- [XML](/docs/formats/xml)
- [Org](/docs/formats/org) <Badge>Built-in</Badge>
- [DITA](/docs/formats/dita)
- [MDX](/docs/formats/mdx)

The formats marked as `Built-in` are included with Vale by default. The other
formats require a third-party dependency to be installed. See each format's
documentation for more information and installation instructions.

## Code

There are two `code` scopes: `comment.line` and `comment.block`.

See the [Code](/docs/formats/code) documentation for more information.

## Selectors

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
