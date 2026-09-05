# reStructuredText

Learn how Vale handles reStructuredText content.

reStructuredText is supported through the external program [`rst2html`](http://docutils.sourceforge.net/docs/user/tools.html#rst2html-py). To get started, you’ll need to install the [`docutils`](https://pypi.org/project/docutils/) package:

```bash
$ pip install docutils
```

Vale looks for `rst2html`, `rst2html.py`, `rst2html-3`, or `rst2html-3.py` on your `$PATH`, which installing `docutils` normally provides. The script is asked which Python it runs under, so the interpreter `docutils` was installed into is the one used, even when it is not the `python3` on the path.

The supported extensions are `.rst` and `.rest`.

By default, Vale ignores:

* [Literal blocks](https://docutils.sourceforge.io/docs/user/rst/quickref.html#literal-blocks).
* [Inline literals](https://docutils.sourceforge.io/docs/user/rst/quickref.html#inline-markup).
* URLs: See [URL handling](https://github.com/vale-cli/vale/issues/320) for more information.

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
