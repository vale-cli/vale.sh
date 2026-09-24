# Sphinx

Learn how Vale handles a Sphinx project.

{% hint style="info" %}
Requires Vale v3.23.0 or later.
{% endhint %}

A [Sphinx](https://www.sphinx-doc.org/) project is reStructuredText, or MyST, plus the directives and roles Sphinx and its extensions define: `versionadded`, `seealso`, `toctree`, `:ref:`, `:func:`, and whatever `sphinx-tabs`, `sphinx-design`, or the project's own `conf.py` adds. Vale reads it through [Docutils](restructuredtext.md), the way it reads any reStructuredText, and does not need Sphinx installed.

## [Directives and roles](sphinx.md#directives-and-roles)

Docutils knows only its own directives and roles, so Vale decides the rest by a rule that fits nearly every Sphinx construct: the body of a directive Docutils doesn't define is prose, and the text of a role it doesn't define is code. A `versionadded`, a `seealso`, a `tab`, a `grid` card, or a `py:function` description is linted like any paragraph; `:func:`, `:class:`, and `:doc:` are left alone.

The exceptions Vale knows are Sphinx's own. `toctree`, `literalinclude`, `math`, the `auto*` family, and the doctest blocks are not prose. `ref`, `doc`, `any`, `numref`, `term`, `guilabel`, `menuselection`, `abbr`, and `dfn` carry prose: a reference written with a title, ``:ref:`the setup guide <setup>` ``, is linted as its title, and a bare target such as ``:doc:`guide/setup` `` is code.

An extension's additions that don't fit the rule are named in a `[sphinx]` section. Both keys add to the built-in lists:

```ini
StylesPath = styles

[sphinx]
# Directives whose body is code, data, or a diagram: not linted.
CodeDirectives = mermaid, plantuml
# Roles whose text is prose rather than an identifier.
ProseRoles = kbd, samp

[*.rst]
BasedOnStyles = Vale
```

## [What is and isn't read](sphinx.md#what-is-and-isnt-read)

Vale lints the source as written. Substitutions such as `|release|` are not expanded, `include` and `only` are not resolved, and content autodoc generates from docstrings is not in the file, so none of it is linted. Comments still carry Vale's [directives](restructuredtext.md#comments), so `.. vale off` works inside a Sphinx project as anywhere else.

A project written in MyST goes through Vale's own [MyST](myst.md) reader, which applies the same rule and the same `[sphinx]` section to the directive and role syntax in Markdown.

## [Setting up](sphinx.md#setting-up)

Install `docutils` into the environment the project builds with, so that `rst2html` is on your `$PATH`:

```bash
$ pip install docutils
```

Vale finds the interpreter from the script and keeps one Docutils process warm per run, so a project of a few hundred pages converts in a second or two. Nothing about the project's `conf.py`, theme, or extensions has to be installed for Vale to run.
