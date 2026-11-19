# reStructuredText

Learn how Vale handles reStructuredText content.

Vale reads reStructuredText with [rstgo](https://github.com/jdkato/rstgo), a Go port of Docutils' `rst2html` whose output matches Docutils 0.23 byte for byte. Nothing needs to be installed: no Python, no `docutils`, and no `rst2html` on your `$PATH`.

The supported extensions are `.rst` and `.rest`.

A [Sphinx](sphinx.md) project is read the same way; that page covers its directives and roles.

By default, Vale ignores:

* [Literal blocks](https://docutils.sourceforge.io/docs/user/rst/quickref.html#literal-blocks).
* [Inline literals](https://docutils.sourceforge.io/docs/user/rst/quickref.html#inline-markup).
* URLs: See [URL handling](https://github.com/vale-cli/vale/issues/320) for more information.

## [Directives and roles](restructuredtext.md#directives-and-roles)

Docutils defines the standard directives and roles. A Sphinx project uses Sphinx's as well, and whatever its extensions add, and on its own Docutils drops the body of a directive it doesn't know. Vale fills the gap before parsing: the body of an unknown directive is read as prose, and the text of an unknown role as code, which is what nearly every Sphinx directive and role amounts to. So `versionadded`, `seealso`, a `tab`, or a `grid` card is linted like any paragraph, and `:func:` or `:doc:` is left alone, without Sphinx being installed.

The exceptions Vale knows are Sphinx's own: `toctree`, `literalinclude`, `math`, the `auto*` family, and the doctest blocks are not prose; `ref`, `doc`, `term`, `guilabel`, and `menuselection` carry prose. A reference written with a title, ``:ref:`the setup guide <setup>` ``, is linted as its title; a bare target is code. A project names what its extensions add in a `[sphinx]` section:

```ini
[sphinx]
# Directives whose body is code, data, or a diagram: not linted.
CodeDirectives = mermaid, plantuml
# Roles whose text is prose rather than an identifier.
ProseRoles = kbd
```

Both keys add to the built-in lists. Requires Vale v3.23.0 or later.

## [Comments](restructuredtext.md#comments)

Vale supports comment-based configuration in reStructuredText files:

* Turn Vale off entirely:

```rst
.. vale off

This text will be ignored.

.. vale on
```

* Turn off a specific rule:

```rst
.. vale Style.Redundancy = NO

This is some text ACT test

.. vale Style.Redundancy = YES
```

* Turn off specific match(es) within a rule:

```rst
.. vale Style.Redundancy["ACT test","OTHER"] = NO

This is some text ACT test

.. vale Style.Redundancy["ACT test","OTHER"] = YES
```

* Turn on or off specific styles:

```rst
.. vale StyleName1 = YES
.. vale StyleName2 = NO
```

* Set styles (enabling them and switching off any other styles):

```rst
.. vale style = StyleName1
.. vale styles = StyleName1, StyleName2
```
