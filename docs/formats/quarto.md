# Quarto

Learn how Vale handles Quarto content.

{% hint style="info" %}
Requires Vale v3.18.0 or later. Earlier versions can approximate support by assigning the format: `qmd = md` under `[formats]`.
{% endhint %}

[Quarto](https://quarto.org/) is Pandoc Markdown plus knitr- and Jupyter-style code cells. The cells are Markdown already. A cell fence is a fenced code block, and an inline expression is a code span. Vale parses the Pandoc layer on top of them: fenced divs, attributes, and shortcodes.

The supported extension is `.qmd`.

By default, Vale ignores:

* Code cells: ` ```{r} ` fences, including their `#|` options.
* Inline expressions: `` `r mean(x)` `` and `` `{python} 1 + 1``.
* Fenced-div lines: `::: {.callout-note}` and its closing `:::`. The content between them is linted.
* Shortcodes: `{{< video ... >}}`, inline or on a line of their own.
* Attributes: a heading's `{#sec-overview}`, and the `{.underline}` of `[text]{.underline}`. The text itself is still linted.
* Fenced blocks, code spans, and URLs, as in [Markdown](markdown.md).

## [Divs](quarto.md#divs)

A fenced div's classes become [class scopes](../topics/scopes.md#class-scopes) for everything inside it. A rule can then target a div by its class name:

```yaml
extends: existence
message: "Don't use '%s' in a callout."
scope: class.callout-note
level: error
tokens:
  - obviously
```

Divs nest, by fence length (`::::` around `:::`) or same-length fences alike, and a block deep inside gets every enclosing class.

## [Math and citations](quarto.md#math-and-citations)

Math is ignored, both `$$…$$` display blocks and `$x^2$` inline spans. See [Math](markdown.md#math) for the delimiter rules, which are what keep `It costs $5 and $10` prose.

Citations (`[@ref]`) and cross-references (`@sec-overview`) are read as prose, since a bare bracket or `@` is ordinary punctuation more often than not. To exclude them, use [`TokenIgnores`](../keys/tokenignores.md):

```ini
[*.qmd]
TokenIgnores = (\[?-?@[^\s\]]+\]?)
```
