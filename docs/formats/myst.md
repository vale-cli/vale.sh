# MyST

Learn how Vale handles MyST content.

{% hint style="info" %}
Requires Vale v3.18.0 or later.
{% endhint %}

[MyST](https://myst-parser.readthedocs.io/) is CommonMark plus Sphinx-style constructs—directives, roles, targets, comments, and block breaks—that a plain Markdown parser reads as prose. Vale parses each one as the markup it is.

The supported extension is `.myst`. A Markdown file opts in through a [format association](../topics/.vale.ini.md#format-associations):

```ini
[formats]
md = myst

[*.{md,myst}]
BasedOnStyles = Vale
```

By default, Vale ignores:

* Targets: `(my-label)=` lines.
* Roles: the `{name}` of `` {term}`content` ``—the span that follows is a code span, ignored like any other.
* Comments: lines beginning with `%`.
* Block breaks: `+++` lines, including any metadata they carry.
* Directive options: `:key: value` lines and `---`-delimited YAML blocks under a directive opener.
* Substitutions: `{{ variable }}`.
* Attributes: `{.class}` lines and the `{.class}` of `[text]{.class}`—the text itself is still linted.
* Fenced blocks, code spans, and URLs, as in [Markdown](markdown.md).

## [Directives](myst.md#directives)

A directive's content is Markdown, and Vale lints it—whether the directive is fenced with backticks or colons:

```text
:::{note}
This prose is linted.
:::
```

The exception is a directive whose content is literal rather than prose: `code`, `code-block`, `code-cell`, `csv-table`, `eval-rst`, `highlight`, `include`, `literalinclude`, `math`, `mermaid`, `raw`, `sourcecode`, and `toctree` are ignored in full.

A directive's name also becomes a [class scope](../topics/scopes.md#class-scopes) for everything inside it, however deeply nested:

```yaml
extends: existence
message: "Don't use '%s' in an admonition."
scope: class.note
level: error
tokens:
  - obviously
```

## [Math and citations](myst.md#math-and-citations)

Inline dollar math (`$x^2$`) and citations (`[@ref]`) are read as prose, since a bare `$` or bracket is ordinary punctuation more often than not. To exclude them, use [`TokenIgnores`](../keys/tokenignores.md):

```ini
[*.{md,myst}]
TokenIgnores = (\$[^\n$]+\$), (\[@[^\n\]]+\])
```
